import "dotenv/config";
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { VerifyErrors, JwtPayload } from 'jsonwebtoken';
import cors from 'cors';
import { z, ZodError } from 'zod';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { prisma } from './lib/prisma.js';
import type { Prisma, UserLevel } from '@prisma/client';
import http from 'http';
import { randomUUID, randomBytes } from 'crypto';
import { createClient } from 'redis';
import { Emitter } from '@socket.io/redis-emitter';
import { cookieOptions, pendingUsers, verificationCodes, transporter, loginHandler, logoutHandler } from './controllers/authController.js';
import { assertCanMessage } from './utils/authorization.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        [key: string]: unknown;
      };
    }
  }
}

type UserUpdateData = Parameters<typeof prisma.user.update>[0]['data'];

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
}

interface CandidateUser {
  id: string;
  name: string;
  level: string;
  avatar: string | null;
  interests: string[];
  reputation: number;
  totalSessions: number;
  totalMinutes: number;
  flagStatus: string | null;
}

interface ScoredCandidate extends CandidateUser {
  sharedInterests: string[];
  score: number;
  history: null;
}

interface SessionWithRating {
  id: string;
  createdAt: Date;
  rating: {
    partnerRating: number | null;
    platformRating: number | null;
    comment: string | null;
  } | null;
}

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production'
  ? 'https://seusiteoficial.com'
  : 'http://localhost:5173,https://localhost:5173,http://localhost:4173'))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

app.use((req: Request, res: Response, next: NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Origem não autorizada.' });
  }
  next();
});

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters.');
}
const signingSecret = JWT_SECRET;

const server = http.createServer(app);

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();
const ioEmitter = new Emitter(pubClient);

if (process.env.NODE_ENV !== 'test') {
  Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    console.log(`📡 Redis conectado com sucesso em ${redisUrl} (API REST)`);
  }).catch((err: unknown) => {
    console.error('❌ Erro ao conectar o Redis:', err);
  });
}

const matchFeedback = new Map<string, Map<string, 'positive' | 'negative' | 'skip'>>();
const _sessionFeedback = new Map<string, { averageRating: number; count: number; lastUpdated: Date }>();
const _conversationQuality = new Map<string, Map<string, { duration: number; messages: number; rating: number; timestamp: Date }>>();
const _repeatMatchPreferences = new Map<string, Set<string>>();
const reports = new Map<string, { reporterId: string; reason: string; timestamp: Date }[]>();

const anonymizeIp = (ip?: string) => {
  if (!ip) return 'unknown';
  return ip.replace(/\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/, '$1.$2.$3.0');
};

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
      tailable: true
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 10485760,
      maxFiles: 7,
      tailable: true
    }),
  ],
});

const metrics = {
  requestsTotal: 0,
  requestsByStatus: new Map<string, number>(),
  latencyTotalMs: 0,
  recentLatencies: [] as number[],
};

app.use((req: Request, res: Response, next: NextFunction) => {
  const incomingRequestId = req.headers['x-request-id'];
  const requestId = typeof incomingRequestId === 'string' && /^[A-Za-z0-9._:-]{1,100}$/.test(incomingRequestId)
    ? incomingRequestId
    : randomUUID();

  const traceparent = req.headers['traceparent'] as string;
  let traceId = '';
  let parentSpanId = '';

  if (traceparent && /^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/.test(traceparent)) {
    const parts = traceparent.split('-');
    traceId = parts[1];
    parentSpanId = parts[2];
  } else {
    traceId = randomBytes(16).toString('hex');
  }

  const spanId = randomBytes(8).toString('hex');
  const newTraceparent = `00-${traceId}-${spanId}-01`;

  res.setHeader('X-Request-Id', requestId);
  res.setHeader('Traceparent', newTraceparent);

  const start = process.hrtime.bigint();
  const safeIp = anonymizeIp(req.ip);

  res.on('finish', () => {
    const durationNs = process.hrtime.bigint() - start;
    const durationMs = Number(durationNs) / 1_000_000;
    
    metrics.requestsTotal += 1;
    metrics.latencyTotalMs += durationMs;
    metrics.recentLatencies.push(durationMs);
    
    if (metrics.recentLatencies.length > 1000) {
      metrics.recentLatencies.shift();
    }

    const statusKey = String(res.statusCode);
    metrics.requestsByStatus.set(statusKey, (metrics.requestsByStatus.get(statusKey) || 0) + 1);

    logger.info(`[${req.method}] ${req.url} - IP: ${safeIp} - Status: ${res.statusCode} - Latência: ${durationMs.toFixed(2)}ms`, {
      requestId,
      traceId,
      spanId,
      parentSpanId: parentSpanId || undefined,
      method: req.method,
      url: req.url,
      ip: safeIp,
      statusCode: res.statusCode,
      latencyMs: durationMs,
    });
  });

  next();
});

app.get('/metrics', (_req: Request, res: Response) => {
  const averageLatencyMs = metrics.requestsTotal === 0 ? 0 : metrics.latencyTotalMs / metrics.requestsTotal;
  
  let p95LatencyMs = 0;
  let p99LatencyMs = 0;

  if (metrics.recentLatencies.length > 0) {
    const sorted = [...metrics.recentLatencies].sort((a, b) => a - b);
    p95LatencyMs = sorted[Math.floor(sorted.length * 0.95)];
    p99LatencyMs = sorted[Math.floor(sorted.length * 0.99)];
  }

  return res.status(200).json({
    requestsTotal: metrics.requestsTotal,
    requestsByStatus: Object.fromEntries(metrics.requestsByStatus),
    averageLatencyMs: Number(averageLatencyMs.toFixed(2)),
    p95LatencyMs: Number(p95LatencyMs.toFixed(2)),
    p99LatencyMs: Number(p99LatencyMs.toFixed(2)),
    uptimeSeconds: Math.round(process.uptime()),
  });
});

app.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error: unknown) {
    logger.error('Falha no Healthcheck do Banco de Dados:', error);
    return res.status(503).json({ status: 'unhealthy', error: 'Database connection failed' });
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { error: 'Muitas requisições a partir deste IP, tente novamente após 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5, 
  message: { error: 'Muitas tentativas de recuperação de senha deste IP, tente novamente após 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const messageLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 30, 
  keyGenerator: (req: Request) => {
    const userId = req.user?.id;
    return userId ? `user_${userId}` : (req.ip || 'unknown');
  },
  message: { error: 'Muitas mensagens enviadas. Aguarde um minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 3, 
  keyGenerator: (req: Request) => {
    const userId = req.user?.id;
    return userId ? `user_report_${userId}` : (req.ip || 'unknown');
  },
  message: { error: 'Limite de denúncias excedido. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const matchmakingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req: Request) => {
    const userId = req.user?.id;
    return userId ? `user_match_${userId}` : (req.ip || 'unknown');
  },
  message: { error: 'Muitas solicitações de pareamento. Tente novamente em instantes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const validateRequest = (schema: z.ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      logger.warn('Falha de validação Zod:', error.issues);
      return res.status(400).json({ error: 'Dados inválidos.', details: error.issues });
    }
    next(error);
  }
};

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || (req.headers['authorization']?.split(' ')[1]);

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Sessão não encontrada.' });
  }

  jwt.verify(token, signingSecret, (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
    if (err || !decoded || typeof decoded === 'string') {
      return res.status(403).json({ error: 'Sessão inválida ou expirada.' });
    }
     
    req.user = decoded as { id: string; email: string; [key: string]: unknown };
    next();
  });
};

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Nome não pode estar vazio.').optional().default('Usuário'),
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
});
const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'Senha é obrigatória.'),
});
const emailOnlySchema = z.object({
  email: z.string().email('E-mail inválido.'),
});
const verifyCodeSchema = z.object({
  email: z.string().email('E-mail inválido.').optional().or(z.literal('')),
  code: z.string().min(1, 'Código é obrigatório.'),
});
const resetPasswordSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  code: z.string().min(1, 'Código é obrigatório.'),
  newPassword: z.string().min(6, 'A nova senha deve ter no mínimo 6 caracteres.'),
});
const profileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  birthDate: z.string().max(30).optional(),
  showAgeInProfile: z.boolean().optional(),
  gender: z.string().max(50).optional(),
  pronouns: z.string().max(50).optional(),
  cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
  bio: z.string().max(1000).optional(),
  interests: z.array(z.string().max(50)).max(20).optional(),
  avatar: z.string().url().max(2048).optional(),
});
const directMessageHttpSchema = z.object({
  recipientId: z.string().min(1),
  text: z.string().trim().min(1).max(1000),
});

app.post('/api/auth/register', authLimiter, validateRequest(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, level } = req.body;
    const normalizedName = name?.trim() || 'Usuário';
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'E-mail já cadastrado.' });
    
    pendingUsers.delete(email);
    verificationCodes.delete(`register_${email}`);

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    pendingUsers.set(email, { name: normalizedName, email, passwordHash: hashedPassword, level: level || 'B1', code });
    verificationCodes.set(`register_${email}`, code);
    await transporter.sendMail({
      from: '"SideBySide" <no-reply@sidebyside.com>',
      to: email,
      subject: 'Ative sua conta no SideBySide',
      html: `<h2>Bem-vindo!</h2><p>Seu código é: <b>${code}</b></p>`,
    });
    return res.status(201).json({ message: 'Código de verificação enviado.', email });
   
  } catch (error: unknown) { next(error); }
});

app.post('/api/auth/login', authLimiter, validateRequest(loginSchema), loginHandler);

app.post('/api/auth/logout', logoutHandler);

app.post('/api/auth/forgot-password', passwordResetLimiter, validateRequest(emailOnlySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ message: 'Se o e-mail estiver cadastrado, um código foi enviado.' });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.set(`reset_${email}`, code);
    await transporter.sendMail({
      from: '"SideBySide" <no-reply@sidebyside.com>',
      to: email,
      subject: 'Recuperação de Senha',
      html: `<p>Seu código é: <b>${code}</b></p>`,
    });
    return res.status(200).json({ message: 'Código enviado com sucesso.' });
   
  } catch (error: unknown) { next(error); }
});

app.post('/api/auth/verify-reset-code', passwordResetLimiter, validateRequest(verifyCodeSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body;
    const storedCode = verificationCodes.get(`reset_${email}`);
    if (!storedCode || storedCode !== code) return res.status(400).json({ error: 'Código inválido.' });
    return res.status(200).json({ message: 'Código verificado com sucesso.' });
   
  } catch (error: unknown) { next(error); }
});

app.post('/api/auth/reset-password', passwordResetLimiter, validateRequest(resetPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code, newPassword } = req.body;
    const storedCode = verificationCodes.get(`reset_${email}`);
    if (!storedCode || storedCode !== code) return res.status(400).json({ error: 'Código inválido.' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Usuário não encontrado.' });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
    verificationCodes.delete(`reset_${email}`);
    return res.status(200).json({ message: 'Senha redefinida.' });
   
  } catch (error: unknown) { next(error); }
});

app.post('/api/auth/verify-code', authLimiter, validateRequest(verifyCodeSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body;
    let targetEmail = email;
    if (!targetEmail) {
      for (const [pendingEmail, data] of pendingUsers.entries()) {
        if (data.code === code) { targetEmail = pendingEmail; break; }
      }
    }
    const pending = targetEmail ? pendingUsers.get(targetEmail) : null;
    if (!pending || pending.code !== code) return res.status(400).json({ error: 'Código inválido.' });
    pendingUsers.delete(targetEmail!);
    verificationCodes.delete(`register_${targetEmail}`);
    
    const tempUser = await prisma.user.create({
      data: { name: pending.name, email: pending.email, password: pending.passwordHash, level: pending.level as UserLevel, reputation: 100 },
    });

    const generatedTag = `${pending.name.replace(/\s+/g, '').toLowerCase()}#${tempUser.id.slice(0, 4)}`;
    const newUser = await prisma.user.update({
      where: { id: tempUser.id },
      data: { tag: generatedTag }
    });

    await prisma.notification.create({
      data: {
        userId: newUser.id,
        title: 'Bem-vindo ao SideBySide! 🎉',
        message: 'Estamos muito felizes em ter você aqui. Complete seu onboarding e dê o primeiro passo para destravar seu inglês!',
        read: false,
      },
    });

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, signingSecret, { expiresIn: '7d' });
    res.cookie('token', token, cookieOptions);
    return res.status(200).json({
      message: 'Conta criada.',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, level: newUser.level, reputation: newUser.reputation, tag: newUser.tag }
    });
   
  } catch (error: unknown) { next(error); }
});

app.post('/api/auth/resend-code', passwordResetLimiter, validateRequest(emailOnlySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const pending = pendingUsers.get(email);
    if (!pending) return res.status(400).json({ error: 'Nenhum cadastro pendente.' });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    pending.code = code;
    pendingUsers.set(email, pending);
    verificationCodes.set(`register_${email}`, code);
    await transporter.sendMail({
      from: '"SideBySide" <no-reply@sidebyside.com>',
      to: email,
      subject: 'Novo código de verificação',
      html: `<p>Seu novo código é: <b>${code}</b></p>`,
    });
    return res.status(200).json({ message: 'Código reenviado com sucesso.' });
   
  } catch (error: unknown) { next(error); }
});

app.get('/api/room/status', (_req: Request, res: Response) => {
  return res.status(200).json({ hasActiveSession: false, sessionId: null });
});

app.post('/api/room/join', authenticateToken, matchmakingLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { topicId } = req.body || {};
    
    const count = await prisma.user.count({ where: { id: { not: userId }, isBanned: false } });
    let partnerId = null;
    
    if (count > 0) {
      const skip = Math.floor(Math.random() * count);
      const randomUser = await prisma.user.findFirst({
        where: { id: { not: userId }, isBanned: false },
        skip,
        select: { id: true }
      });
      if (randomUser) partnerId = randomUser.id;
    }
    
    return res.status(200).json({ message: 'Entrada registrada.', topicId: topicId || null, partnerId });
   
  } catch (error: unknown) { next(error); }
});

app.post('/api/room/report', authenticateToken, reportLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { reportedUserId, reason, sessionDuration, messageCount, roomId } = req.body || {};
    
    if (!reportedUserId || !reason) {
      return res.status(400).json({ error: 'Dados obrigatórios ausentes.' });
    }

    if (userId === reportedUserId) {
      return res.status(400).json({ error: 'Você não pode denunciar a si mesmo.' });
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existingReport = await tx.report.findFirst({
        where: {
          reporterId: userId,
          reportedUserId: reportedUserId
        }
      });

      if (existingReport) {
        throw new Error('DUPLICATE_REPORT');
      }

      const reported = await tx.user.findUnique({ where: { id: reportedUserId } });
      if (!reported) {
        throw new Error('USER_NOT_FOUND');
      }

      const newReportCount = (reported.reportCount || 0) + 1;
      let flagStatus = reported.flagStatus || 'CLEAN';
      let bannedUntil = reported.bannedUntil;

      if (newReportCount >= 10) {
        flagStatus = 'BANNED';
      } else if (newReportCount >= 6) {
        flagStatus = 'SUSPENDED';
        bannedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      } else if (newReportCount >= 3) {
        flagStatus = 'WARNING';
      }

      await tx.user.update({
        where: { id: reportedUserId },
        data: {
          reportCount: newReportCount,
          flagStatus: flagStatus as UserUpdateData['flagStatus'],
          flagReason: reason,
          flaggedAt: new Date(),
          isBanned: flagStatus === 'BANNED',
          bannedUntil
        }
      });

      const report = await tx.report.create({
        data: {
          reporterId: userId,
          reportedUserId,
          reason: `[Contexto - Sala: ${roomId || 'N/A'}, Duração: ${sessionDuration || 0}s, Msgs: ${messageCount || 0}] ${reason}`
        }
      });

      return { reportId: report.id, flagStatus };
    });

    logger.warn(` AUDITORIA DE DENÚNCIA: Usuário ${userId} denunciou ${reportedUserId} por "${reason}" na sala ${roomId || 'N/A'}.`);

    const userReports = reports.get(reportedUserId) || [];
    userReports.push({ 
      reporterId: userId, 
      reason, 
      timestamp: new Date() 
    });
    reports.set(reportedUserId, userReports);

    return res.status(201).json({ 
      message: 'Denúncia registrada com sucesso.', 
      reportId: result.reportId, 
      userFlagStatus: result.flagStatus 
    });
   
  } catch (error: unknown) { 
    if (error instanceof Error) {
      if (error.message === 'DUPLICATE_REPORT') {
        return res.status(400).json({ error: 'Você já denunciou este usuário anteriormente.' });
      }
      if (error.message === 'USER_NOT_FOUND') {
        return res.status(404).json({ error: 'Usuário denunciado não encontrado.' });
      }
    }
    next(error); 
  }
});

app.post('/api/room/rate', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { 
      partnerId, 
      partnerRating, 
      platformRating, 
      comment, 
      partnerName, 
      partnerAvatar, 
      duration, 
      topic,
      sessionId
    } = req.body || {};

    const rawAverage = Number(partnerRating ?? platformRating ?? 0);
    const safeAverage = Number.isFinite(rawAverage) ? Math.max(1, Math.min(5, rawAverage)) : 3;
    const ratingDelta = Math.round((safeAverage - 3) * 10);
    try {
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('USER_NOT_FOUND');

        if (sessionId) {
          const existingSession = await tx.conversationSession.findUnique({
            where: { clientSessionId: sessionId },
            include: { rating: true }
          });
          if (existingSession) {
            return { alreadyRated: true, reputation: user.reputation, averageRating: existingSession.rating?.partnerRating ?? 3 };
          }
        }

        const updatedReputation = Math.max(0, Math.min(100, (user.reputation || 0) + ratingDelta));
        const newSession = await tx.conversationSession.create({
          data: {
            userId,
            partnerId: partnerId || 'desconhecido',
            partnerName: partnerName || 'Estudante',
            partnerAvatar: partnerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            duration: duration || '15 min',
            topic: topic || 'Bate-Papo Livre',
            clientSessionId: sessionId || undefined,
            rating: {
              create: {
                partnerRating: Number(partnerRating ?? 3),
                platformRating: Number(platformRating ?? 3),
                comment: comment || ''
              }
            }
          },
          include: { rating: true }
        });

        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            reputation: updatedReputation,
            totalSessions: { increment: 1 },
            totalMinutes: { increment: 15 },
            lastSession: newSession as unknown as UserUpdateData['lastSession']
          }
        });
        return { alreadyRated: false, reputation: updatedUser.reputation, averageRating: safeAverage };
      });

      return res.status(200).json({
        message: result.alreadyRated ? 'Avaliação já registrada.' : 'Avaliação salva com sucesso.',
        reputation: result.reputation,
        averageRating: result.averageRating
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: unknown }).code === 'P2002' && sessionId) {
        const existingSession = await prisma.conversationSession.findUnique({ where: { clientSessionId: sessionId }, include: { rating: true } });
        const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { reputation: true } });
        if (existingSession && currentUser) {
          return res.status(200).json({ message: 'Avaliação já registrada.', reputation: currentUser.reputation, averageRating: existingSession.rating?.partnerRating ?? 3 });
        }
      }
      throw error;
    }
   
  } catch (error: unknown) { 
    next(error); 
  }
});

app.post('/api/friends/request', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { targetUserId, tag } = req.body || {};
    
    let resolvedTargetId = targetUserId;
    
    if (!resolvedTargetId && tag) {
      let targetUserByTag = await prisma.user.findFirst({ where: { tag } });
      
      if (!targetUserByTag && tag.includes('#')) {
        const cleanName = tag.split('#')[0].trim();
        targetUserByTag = await prisma.user.findFirst({
          where: { name: { startsWith: cleanName, mode: 'insensitive' } }
        });
      }
      
      if (targetUserByTag) {
        resolvedTargetId = targetUserByTag.id;
      }
    }

    if (!resolvedTargetId || userId === resolvedTargetId) {
      return res.status(400).json({ error: 'ID ou Tag de usuário inválida.' });
    }

    const sender = await prisma.user.findUnique({ where: { id: userId } });
    const targetUser = await prisma.user.findUnique({ where: { id: resolvedTargetId } });
    
    if (!targetUser || !sender) {
      return res.status(404).json({ error: 'Usuário não encontrado no banco de dados.' });
    }

    const existing = await prisma.friendRelation.findFirst({
      where: {
        OR: [
          { userId, friendId: resolvedTargetId },
          { userId: resolvedTargetId, friendId: userId }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Já existe uma solicitação ou amizade entre vocês.' });
    }

    const friendRelation = await prisma.friendRelation.create({
      data: {
        userId: userId,
        friendId: String(resolvedTargetId),
        status: 'PENDING'
      }
    });

    ioEmitter.to(`user_${resolvedTargetId}`).emit('friend_request_received', {
      requestId: friendRelation.id,
      senderId: userId,
      name: sender.name,
      avatar: sender.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    });

    return res.status(200).json({ message: 'Solicitação enviada com sucesso.' });
   
  } catch (error: unknown) { 
    next(error); 
  }
});

app.get('/api/friends/requests', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const pendingRelations = await prisma.friendRelation.findMany({
      where: { friendId: userId, status: 'PENDING' },
      include: { user: true }
    });

    const requests = pendingRelations.map((rel) => ({
      id: rel.id,
      senderId: rel.userId,
      name: rel.user.name,
      tag: rel.user.tag || `${rel.user.name.replace(/\s+/g, '')}#${rel.user.id.slice(0, 4)}`,
      avatar: rel.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      level: rel.user.level || 'B1',
      time: 'Pendente'
    }));

    return res.status(200).json(requests);
   
  } catch (error: unknown) {
    next(error);
  }
});

app.post('/api/friends/accept', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { requestId, senderId, action } = req.body;
    
    const relation = requestId
      ? await prisma.friendRelation.findFirst({ where: { id: String(requestId), friendId: userId, status: 'PENDING' } })
      : senderId
        ? await prisma.friendRelation.findFirst({ where: { userId: String(senderId), friendId: userId, status: 'PENDING' } })
        : null;

    if (!relation) return res.status(404).json({ error: 'Solicitação de amizade não encontrada.' });
    const targetRequesterId = relation.userId;

    if (action === 'reject') {
      await prisma.friendRelation.delete({ where: { id: relation.id } });
      return res.status(200).json({ message: 'Solicitação de amizade recusada e removida com sucesso.' });
    }

    await prisma.friendRelation.update({
      where: { id: relation.id },
      data: { status: 'ACCEPTED' }
    });

    {
      const [acceptingUser, requesterUser] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.user.findUnique({ where: { id: String(targetRequesterId) } })
      ]);

      if (acceptingUser && requesterUser) {
        await prisma.notification.createMany({
          data: [
            {
              userId: userId,
              title: 'Nova Amizade',
              message: `Você e ${requesterUser.name} agora são amigos!`,
              read: false,
            },
            {
              userId: String(targetRequesterId),
              title: 'Nova Amizade',
              message: `Você e ${acceptingUser.name} agora são amigos!`,
              read: false,
            }
          ]
        });
      }
    }

    return res.status(200).json({ message: 'Amizade aceita com sucesso.' });
   
  } catch (error: unknown) {
    next(error);
  }
});

app.get('/api/friends/list', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    
    const relations = await prisma.friendRelation.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ userId: userId }, { friendId: userId }]
      }
    });

    const friendIds = new Set<string>();
     
    relations.forEach((rel) => {
      if (rel.userId === userId) friendIds.add(rel.friendId);
      if (rel.friendId === userId) friendIds.add(rel.userId);
    });

    if (friendIds.size === 0) {
      return res.status(200).json([]);
    }

    const friendsData = await prisma.user.findMany({
      where: { id: { in: Array.from(friendIds) } },
      select: { id: true, name: true, level: true, avatar: true, tag: true }
    });

    const formatted = friendsData.map((f) => ({
      id: f.id,
      name: f.name,
      tag: f.tag || `${f.name.replace(/\s+/g, '')}#${f.id.slice(0, 4)}`,
      avatar: f.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      level: f.level || 'B1',
      isOnline: true
    }));

    return res.status(200).json(formatted);
   
  } catch (error: unknown) {
    next(error);
  }
});

app.delete('/api/friends/:friendId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const targetId = String(req.params.friendId);

    await prisma.friendRelation.deleteMany({
      where: {
        OR: [
          { AND: { userId: userId, friendId: targetId } },
          { AND: { userId: targetId, friendId: userId } }
        ]
      }
    });

    await prisma.directMessage.deleteMany({
      where: {
        OR: [
          { senderId: userId, recipientId: targetId },
          { senderId: targetId, recipientId: userId }
        ]
      }
    });

    return res.status(200).json({ message: 'Amizade e histórico removidos com sucesso.' });
   
  } catch (error: unknown) {
    next(error);
  }
});

app.post('/api/messages/send', authenticateToken, messageLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const senderId = req.user!.id;
    const parsedMessage = directMessageHttpSchema.safeParse(req.body);
    if (!parsedMessage.success) return res.status(400).json({ error: 'Mensagem inválida.' });
    const { recipientId, text } = parsedMessage.data;

    await assertCanMessage(senderId, recipientId);

    const message = await prisma.directMessage.create({
      data: {
        senderId,
        recipientId,
        text
      }
    });

    ioEmitter.to(`user_${recipientId}`).emit('direct_message', {
      id: message.id,
      senderId,
      text,
      timestamp: message.createdAt.getTime()
    });

    return res.status(201).json(message);
   
  } catch (error: unknown) {
    if (error instanceof Error && error.message.startsWith('UNAUTHORIZED_DIRECT_MESSAGE:')) {
      return res.status(403).json({ error: 'Você não pode enviar mensagens para este usuário.' });
    }
    next(error);
  }
});

app.post('/api/observability/frontend-error', (req: Request, res: Response) => {
  try {
    const errorData = req.body;
    logger.error(' [Frontend Error Boundary Report]', {
      ...(typeof errorData === 'object' && errorData !== null ? errorData : { data: errorData }),
      userAgent: req.headers['user-agent'],
      ip: anonymizeIp(req.ip),
    });
    return res.status(202).json({ status: 'logged' });
  } catch (_err: unknown) {
    return res.status(500).json({ error: 'Falha ao registrar log de erro.' });
  }
});

process.on('uncaughtException', (err: Error) => {
  logger.error(' UNCAUGHT EXCEPTION - Exceção síncrona não tratada:', {
    message: err.message,
    stack: err.stack,
  });
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error(' UNHANDLED REJECTION - Promise rejeitada não tratada:', {
    reason: reason instanceof Error ? { message: reason.message, stack: reason.stack } : reason,
  });
});

app.get('/api/messages/:recipientId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const senderId = req.user!.id;
    const recipientId = String(req.params.recipientId);
    await assertCanMessage(senderId, recipientId);
    
    const requestedLimit = parseInt(req.query.limit as string, 10);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;
    const cursor = req.query.cursor as string | undefined;

    const messages = await prisma.directMessage.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where: {
        OR: [
          { senderId, recipientId },
          { senderId: recipientId, recipientId: senderId }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(messages.reverse());
   
  } catch (error: unknown) {
    if (error instanceof Error && error.message.startsWith('UNAUTHORIZED_DIRECT_MESSAGE:')) {
      return res.status(403).json({ error: 'Você não pode acessar mensagens deste usuário.' });
    }
    next(error);
  }
});

app.get('/api/user/me', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: {
        id: true, name: true, email: true, tag: true, level: true, reputation: true,
        birthDate: true, showAgeInProfile: true, gender: true, pronouns: true, bio: true,
        interests: true, avatar: true, notifyEmail: true, notifyPush: true, notifyAdvance: true,
        streak: true, totalMinutes: true, totalSessions: true, weeklyGoal: true,
        reportCount: true, flagStatus: true, flaggedAt: true, bannedUntil: true,
        createdAt: true, updatedAt: true,
        sessionsHistory: { include: { rating: true }, orderBy: { createdAt: 'desc' }, take: 100 }
      }
    });
    
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    
    const feedbacks = ((user.sessionsHistory || []) as SessionWithRating[])
      .filter((s: SessionWithRating) => Boolean(s.rating?.comment))
      .map((s: SessionWithRating, idx: number) => ({
        id: idx + 1,
        author: 'Parceiro de Conversa',
        rating: s.rating?.partnerRating || s.rating?.platformRating || 5,
        date: s.createdAt.toLocaleDateString() || 'Recentemente',
        comment: s.rating?.comment
      }));

    const safeUser = { ...user } as Record<string, unknown>;
    delete safeUser.password;
    delete safeUser.passwordHash;

    return res.status(200).json({
      ...safeUser,
      reputationScore: `${user.reputation ?? 100}/100`,
      feedbacks,
    });
   
  } catch (error: unknown) { next(error); }
});

app.delete('/api/user/me', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { password } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Senha incorreta.' });
    }

    await prisma.friendRelation.deleteMany({
      where: { OR: [{ userId }, { friendId: userId }] }
    }).catch((err: unknown) => {
      logger.error('[User Deletion Error] Falha ao limpar relações de amizade:', err);
    });

    await prisma.directMessage.deleteMany({
      where: { OR: [{ senderId: userId }, { recipientId: userId }] }
    }).catch((err: unknown) => {
      logger.error('[User Deletion Error] Falha ao limpar mensagens diretas:', err);
    });

    await prisma.notification.deleteMany({
      where: { userId }
    }).catch((err: unknown) => {
      logger.error('[User Deletion Error] Falha ao limpar notificações:', err);
    });

    await prisma.user.delete({ where: { id: userId } });

    res.clearCookie('token');
    return res.status(200).json({ message: 'Conta excluída com sucesso.' });
   
  } catch (error: unknown) {
    next(error);
  }
});

app.get('/api/user/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetUserId = String(req.params.id);
    const user = await prisma.user.findUnique({ 
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: false,
        level: true,
        avatar: true,
        bio: true,
        birthDate: true,
        showAgeInProfile: true,
        gender: true,
        pronouns: true,
        reputation: true,
        streak: true,
        interests: true,
        sessionsHistory: false
      }
    });

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    return res.status(200).json(user);
   
  } catch (error: unknown) { 
    next(error); 
  }
});

app.get('/api/notifications', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const parsedLimit = Number.parseInt(String(req.query.limit || '20'), 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 20;
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
    
    // Busca "limit + 1" para verificar se existe uma próxima página de registros
    const notifications = await prisma.notification.findMany({
      where: { userId },
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    let nextCursor: string | null = null;
    if (notifications.length > limit) {
      notifications.pop(); // Remove o item extra da resposta devolvida
      nextCursor = notifications[notifications.length - 1].id;
    }

    return res.status(200).json({ items: notifications, nextCursor });
   
  } catch (error: unknown) { 
    next(error); 
  }
});

app.get('/api/matches/candidates', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const me = await prisma.user.findUnique({ 
      where: { id: userId }, 
      select: { id: true, level: true, interests: true, reputation: true, totalSessions: true, totalMinutes: true } 
    });
    
    if (!me) return res.status(404).json({ error: 'Usuário não encontrado.' });
    
    const parsedLimit = Number.parseInt(String(req.query.limit || '10'), 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 50) : 10;
    
    const rawCandidates: CandidateUser[] = await prisma.user.findMany({
      where: { 
        id: { not: userId }, 
        isBanned: false 
      },
      orderBy: [
        { reputation: 'desc' },
        { totalSessions: 'desc' }
      ],
      take: limit * 5,
      select: {
        id: true,
        name: true,
        level: true,
        avatar: true,
        interests: true,
        reputation: true,
        totalSessions: true,
        totalMinutes: true,
        flagStatus: true
      }
    });

    const levelWeight: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
    const candidates: ScoredCandidate[] = rawCandidates.map((candidate: CandidateUser) => {
      const sharedInterests = (me.interests || []).filter((interest: string) => candidate.interests.includes(interest));
      const distance = Math.abs((levelWeight[candidate.level] || 3) - (levelWeight[me.level] || 3));
      const score = Math.min(100, Math.round(
        (distance === 0 ? 50 : distance === 1 ? 25 : 0) +
        sharedInterests.length * 15 +
        Math.min(25, candidate.reputation / 10) +
        Math.min(20, candidate.totalSessions * 2 + candidate.totalMinutes / 30)
      ));
      return { ...candidate, sharedInterests, score, history: null };
    })
    .sort((left: ScoredCandidate, right: ScoredCandidate) => right.score - left.score)
    .slice(0, limit);

    return res.status(200).json({ candidates, me: { id: me.id, level: me.level, interests: me.interests || [] } });
   
  } catch (error: unknown) { next(error); }
});

app.post('/api/matches/feedback', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { candidateId, outcome } = req.body;
    if (!candidateId || !['positive', 'negative', 'skip'].includes(outcome)) return res.status(400).json({ error: 'Dados inválidos.' });
    const userMap = matchFeedback.get(userId) || new Map();
    userMap.set(candidateId, outcome);
    matchFeedback.set(userId, userMap);
    return res.status(200).json({ message: 'Feedback salvo.' });
   
  } catch (error: unknown) { next(error); }
});

app.put('/api/user/profile', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenUser = req.user!;
    const parsedProfile = profileUpdateSchema.safeParse(req.body);
    if (!parsedProfile.success) {
      return res.status(400).json({ error: 'Dados de perfil inválidos.', details: parsedProfile.error.issues });
    }
    const { cefrLevel, ...profileData } = parsedProfile.data;
    const updateData = { ...profileData, ...(cefrLevel ? { level: cefrLevel as UserLevel } : {}) };

    let user = await prisma.user.findUnique({ where: { id: tokenUser.id } });

    if (!user) {
      user = await prisma.user.findUnique({ where: { email: tokenUser.email } });
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: tokenUser.id,
            email: tokenUser.email,
            name: updateData.name || 'Usuário',
            password: '$2b$10$placeholder_hash_auto_created_on_profile_update',
            level: (updateData.level as UserLevel) || ('B1' as UserLevel),
            reputation: 100,
            tag: `${(updateData.name || 'Usuário').replace(/\s+/g, '').toLowerCase()}#${tokenUser.id.slice(0, 4)}`,
            ...updateData
          }
        });
      }
    }

    const tag = updateData.name && updateData.name !== user.name
      ? `${updateData.name.replace(/\s+/g, '').toLowerCase()}#${user.id.slice(0, 4)}`
      : undefined;

    const updatedUser = await prisma.user.update({ 
      where: { id: user.id }, 
      data: { ...updateData, ...(tag ? { tag } : {}) },
      select: {
        id: true, name: true, email: true, tag: true, level: true, reputation: true,
        birthDate: true, showAgeInProfile: true, gender: true, pronouns: true, bio: true,
        interests: true, avatar: true, notifyEmail: true, notifyPush: true, notifyAdvance: true,
        streak: true, totalMinutes: true, totalSessions: true, weeklyGoal: true,
        reportCount: true, flagStatus: true, flaggedAt: true, bannedUntil: true,
        createdAt: true, updatedAt: true
      }
    });

    return res.status(200).json({ message: 'Perfil atualizado com sucesso.', user: updatedUser });
   
  } catch (error: unknown) { 
    next(error); 
  }
});

app.use((err: HttpError, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Erro global:', { message: err.message, path: req.url });
  return res.status(err.status || err.statusCode || 500).json({ error: err.message || 'Erro interno.' });
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`Recebido sinal ${signal}. Iniciando encerramento gracioso...`);
  
  server.close(async () => {
    logger.info('Servidor HTTP encerrado.');
    try {
      await pubClient.quit();
      await subClient.quit();
      await prisma.$disconnect();
      logger.info('Conexões com Redis e Banco de Dados encerradas com sucesso.');
      process.exit(0);
    } catch (err: unknown) {
      logger.error('Erro ao desconectar serviços durante o shutdown:', err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error('Forçando encerramento devido ao estouro de tempo limite.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export { app, server, ioEmitter as io };

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    logger.info(`Servidor HTTP rodando na porta ${PORT}`);
  });
}

app.get('/health/live', (_req: Request, res: Response) => {
  return res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
});

app.get('/health/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    if (!pubClient.isOpen || !subClient.isOpen) {
      return res.status(503).json({ status: 'not_ready', dependencies: { database: 'ready', redis: 'not_ready' } });
    }
    return res.status(200).json({ status: 'ready', dependencies: { database: 'ready', redis: 'ready' } });
  } catch (_error: unknown) {
    return res.status(503).json({ status: 'not_ready' });
  }
}); 