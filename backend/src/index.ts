import "dotenv/config";
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { z, ZodError } from 'zod';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import cookieParser from 'cookie-parser';
import { prisma } from './lib/prisma';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cookie from 'cookie';
import { setupMatchmaking } from './sockets/matchmaking';

const app = express();

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://seusiteoficial.com'] 
    : ['http://localhost:5173', 'http://localhost:4173'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-seguro';

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: corsOptions
});

const cookieOptions = {
  httpOnly: true, 
  secure: process.env.NODE_ENV === 'production', 
  sameSite: 'lax' as const, 
  maxAge: 7 * 24 * 60 * 60 * 1000 
};

const pendingUsers = new Map<string, { name: string; email: string; passwordHash: string; level: string; code: string }>();
const verificationCodes = new Map<string, string>();
const matchFeedback = new Map<string, Map<string, 'positive' | 'negative' | 'skip'>>();
const sessionFeedback = new Map<string, { averageRating: number; count: number; lastUpdated: Date }>();
const conversationQuality = new Map<string, Map<string, { duration: number; messages: number; rating: number; timestamp: Date }>>();
const repeatMatchPreferences = new Map<string, Set<string>>();
const reports = new Map<string, { reporterId: string; reason: string; timestamp: Date }[]>();

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
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`[${req.method}] ${req.url} - IP: ${req.ip}`);
  next();
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: false,
  debug: false,
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

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Sessão inválida ou expirada.' });
    }
    (req as any).user = decoded;
    next();
  });
};

io.use((socket, next) => {
  try {
    const cookies = cookie.parse(socket.request.headers.cookie || '');
    const token = cookies.token;

    if (!token) return next(new Error('Autenticação não encontrada'));

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Sessão inválida'));
      (socket as any).user = decoded;
      next();
    });
  } catch (error) {
    next(new Error('Erro interno de autenticação'));
  }
});

setupMatchmaking(io);

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Nome não pode estar vazio.').optional().default('Usuário'),
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
  level: z.string().optional(),
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

app.post('/api/auth/register', authLimiter, validateRequest(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, level } = req.body;
    const normalizedName = name?.trim() || 'Usuário';
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'E-mail já cadastrado.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    pendingUsers.set(email, { name: normalizedName, email, passwordHash: hashedPassword, level: level || 'B1', code });
    await transporter.sendMail({
      from: '"SideBySide" <no-reply@sidebyside.com>',
      to: email,
      subject: 'Ative sua conta no SideBySide',
      html: `<h2>Bem-vindo!</h2><p>Seu código é: <b>${code}</b></p>`,
    });
    return res.status(201).json({ message: 'Código de verificação enviado.', email });
  } catch (error: any) { next(error); }
});

app.post('/api/auth/login', authLimiter, validateRequest(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, cookieOptions);
    return res.status(200).json({
      message: 'Login com sucesso.',
      user: { id: user.id, name: user.name, email: user.email, level: user.level, reputation: user.reputation, tag: user.tag },
    });
  } catch (error: any) { next(error); }
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logout realizado com sucesso.' });
});

app.post('/api/auth/forgot-password', passwordResetLimiter, validateRequest(emailOnlySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ message: 'Se o e-mail estiver cadastrado, um código foi enviado.' });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.set(email, code);
    await transporter.sendMail({
      from: '"SideBySide" <no-reply@sidebyside.com>',
      to: email,
      subject: 'Recuperação de Senha',
      html: `<p>Seu código é: <b>${code}</b></p>`,
    });
    return res.status(200).json({ message: 'Código enviado com sucesso.' });
  } catch (error: any) { next(error); }
});

app.post('/api/auth/verify-reset-code', passwordResetLimiter, validateRequest(verifyCodeSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body;
    const storedCode = verificationCodes.get(email);
    if (!storedCode || storedCode !== code) return res.status(400).json({ error: 'Código inválido.' });
    return res.status(200).json({ message: 'Código verificado com sucesso.' });
  } catch (error: any) { next(error); }
});

app.post('/api/auth/reset-password', passwordResetLimiter, validateRequest(resetPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code, newPassword } = req.body;
    const storedCode = verificationCodes.get(email);
    if (!storedCode || storedCode !== code) return res.status(400).json({ error: 'Código inválido.' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Usuário não encontrado.' });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
    verificationCodes.delete(email);
    return res.status(200).json({ message: 'Senha redefinida.' });
  } catch (error: any) { next(error); }
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
    pendingUsers.delete(targetEmail);
    
    const tempUser = await prisma.user.create({
      data: { name: pending.name, email: pending.email, password: pending.passwordHash, level: pending.level, reputation: 100 },
    });

    const generatedTag = `${pending.name.replace(/\s+/g, '')}#${tempUser.id.slice(0, 4)}`;
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

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, cookieOptions);
    return res.status(200).json({
      message: 'Conta criada.',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, level: newUser.level, reputation: newUser.reputation, tag: newUser.tag }
    });
  } catch (error: any) { next(error); }
});

app.post('/api/auth/resend-code', passwordResetLimiter, validateRequest(emailOnlySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const pending = pendingUsers.get(email);
    if (!pending) return res.status(400).json({ error: 'Nenhum cadastro pendente.' });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    pending.code = code;
    pendingUsers.set(email, pending);
    await transporter.sendMail({
      from: '"SideBySide" <no-reply@sidebyside.com>',
      to: email,
      subject: 'Novo código de verificação',
      html: `<p>Seu novo código é: <b>${code}</b></p>`,
    });
    return res.status(200).json({ message: 'Código reenviado com sucesso.' });
  } catch (error: any) { next(error); }
});

app.get('/api/room/status', (req: Request, res: Response) => {
  return res.status(200).json({ hasActiveSession: false, sessionId: null });
});

app.post('/api/room/join', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { topicId } = req.body || {};
    const allUsers = await prisma.user.findMany({ where: { id: { not: userId } }, select: { id: true } });
    const partnerId = allUsers.length > 0 ? allUsers[Math.floor(Math.random() * allUsers.length)].id : null;
    return res.status(200).json({ message: 'Entrada registrada.', topicId: topicId || null, partnerId: partnerId || null });
  } catch (error: any) { next(error); }
});

app.post('/api/room/report', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { reportedUserId, reason, sessionDuration, messageCount, roomId } = req.body || {};
    
    if (!reportedUserId || !reason) {
      return res.status(400).json({ error: 'Dados obrigatórios ausentes.' });
    }

    const reported = await prisma.user.findUnique({ where: { id: reportedUserId } });
    if (!reported) {
      return res.status(404).json({ error: 'Usuário denunciado não encontrado.' });
    }

    logger.warn(`🚨 AUDITORIA DE DENÚNCIA: Usuário ${userId} denunciou ${reportedUserId} por "${reason}" na sala ${roomId || 'N/A'}. Duração: ${sessionDuration || 0}s, Mensagens: ${messageCount || 0}`);

    const userReports = reports.get(reportedUserId) || [];
    userReports.push({ 
      reporterId: userId, 
      reason, 
      timestamp: new Date() 
    });
    reports.set(reportedUserId, userReports);

    const newReportCount = (reported.reportCount || 0) + 1;
    let flagStatus = reported.flagStatus || 'clean';
    let bannedUntil = reported.bannedUntil;

    if (newReportCount >= 3 && flagStatus === 'clean') {
      flagStatus = 'warning';
    } else if (newReportCount >= 6 && flagStatus === 'warning') {
      flagStatus = 'suspended';
      bannedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else if (newReportCount >= 10) {
      flagStatus = 'banned';
    }

    await prisma.user.update({
      where: { id: reportedUserId },
      data: {
        reportCount: newReportCount,
        flagStatus,
        flagReason: reason,
        flaggedAt: new Date(),
        isBanned: flagStatus === 'banned',
        bannedUntil
      }
    });

    const report = await prisma.report.create({
      data: {
        reporterId: userId,
        reportedUserId,
        reason: `[Contexto - Sala: ${roomId || 'N/A'}, Duração: ${sessionDuration || 0}s, Msgs: ${messageCount || 0}] ${reason}`
      }
    });

    return res.status(201).json({ 
      message: 'Denúncia registrada com sucesso.', 
      reportId: report.id, 
      userFlagStatus: flagStatus 
    });
  } catch (error: any) { 
    next(error); 
  }
});

app.post('/api/room/rate', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { partnerRating, platformRating, comment } = req.body || {};
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    const rawAverage = Number(partnerRating ?? platformRating ?? 0);
    const safeAverage = Number.isFinite(rawAverage) ? Math.max(1, Math.min(5, rawAverage)) : 3;
    const ratingDelta = Math.round((safeAverage - 3) * 10);
    const updatedReputation = Math.max(0, Math.min(100, (user.reputation || 0) + ratingDelta));
    const totalSessions = (user.totalSessions || 0) + 1;
    const totalMinutes = (user.totalMinutes || 0) + 15;
    const historyEntry = { rating: safeAverage, partnerRating: Number(partnerRating ?? 3), platformRating: Number(platformRating ?? 3), comment: comment || '', createdAt: new Date().toISOString() };
    const previousHistory = Array.isArray(user.sessionsHistory) ? user.sessionsHistory.filter((entry): entry is any => entry !== null && entry !== undefined) : [];
    const updatedUser = await prisma.user.update({ where: { id: userId }, data: { reputation: updatedReputation, totalSessions, totalMinutes, lastSession: historyEntry as any, sessionsHistory: [...previousHistory, historyEntry] as any } });
    sessionFeedback.set(userId, { averageRating: safeAverage, count: (sessionFeedback.get(userId)?.count || 0) + 1, lastUpdated: new Date() });
    return res.status(200).json({ message: 'Avaliação salva.', reputation: updatedUser.reputation, averageRating: safeAverage });
  } catch (error: any) { next(error); }
});

app.post('/api/room/quality', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { partnerId, duration, messages, rating } = req.body || {};
    if (!partnerId || !duration) return res.status(400).json({ error: 'Dados obrigatórios ausentes.' });
    const userQuality = conversationQuality.get(userId) || new Map();
    userQuality.set(partnerId, { duration: Number(duration), messages: Number(messages) || 0, rating: Math.max(1, Math.min(5, Number(rating) || 3)), timestamp: new Date() });
    conversationQuality.set(userId, userQuality);
    return res.status(200).json({ message: 'Qualidade registrada.' });
  } catch (error: any) { next(error); }
});

app.post('/api/room/want-to-talk-again', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { partnerId } = req.body || {};
    if (!partnerId) return res.status(400).json({ error: 'partnerId é obrigatório.' });
    const userPreferences = repeatMatchPreferences.get(userId) || new Set();
    userPreferences.add(partnerId);
    repeatMatchPreferences.set(userId, userPreferences);
    return res.status(200).json({ message: 'Preferência salva.' });
  } catch (error: any) { next(error); }
});

app.post('/api/friends/request', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
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

    await prisma.friendRelation.create({
      data: {
        userId: userId,
        friendId: String(resolvedTargetId),
        status: 'pending'
      }
    });

    return res.status(200).json({ message: 'Solicitação enviada com sucesso.' });
  } catch (error: any) { 
    next(error); 
  }
});

app.get('/api/friends/requests', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const pendingRelations = await prisma.friendRelation.findMany({
      where: { friendId: userId, status: 'pending' },
      include: { user: true }
    });

    const requests = pendingRelations.map((rel: any) => ({
      id: rel.id,
      senderId: rel.userId,
      name: rel.user.name,
      tag: rel.user.tag || `${rel.user.name.replace(/\s+/g, '')}#${rel.user.id.slice(0, 4)}`,
      avatar: rel.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      level: rel.user.level || 'B1',
      time: 'Pendente'
    }));

    return res.status(200).json(requests);
  } catch (error: any) {
    next(error);
  }
});

app.post('/api/friends/accept', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { requestId, senderId } = req.body;
    
    let targetRequesterId = senderId;

    if (requestId) {
      const rel = await prisma.friendRelation.findUnique({ where: { id: String(requestId) } });
      if (rel) {
        targetRequesterId = targetRequesterId || rel.userId;
      }
      await prisma.friendRelation.updateMany({
        where: { id: String(requestId) },
        data: { status: 'accepted' }
      }).catch(() => {});
    }

    if (targetRequesterId) {
      await prisma.friendRelation.updateMany({
        where: {
          OR: [
            { userId: String(targetRequesterId), friendId: userId },
            { userId: userId, friendId: String(targetRequesterId) }
          ]
        },
        data: { status: 'accepted' }
      });

      const [acceptingUser, requesterUser] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.user.findUnique({ where: { id: String(targetRequesterId) } })
      ]);

      if (acceptingUser && requesterUser) {
        await prisma.notification.createMany({
          data: [
            {
              userId: userId,
              title: 'Nova Amizade 🤝',
              message: `Você e ${requesterUser.name} agora são amigos!`,
              read: false,
            },
            {
              userId: String(targetRequesterId),
              title: 'Nova Amizade 🤝',
              message: `Você e ${acceptingUser.name} agora são amigos!`,
              read: false,
            }
          ]
        });
      }
    }

    return res.status(200).json({ message: 'Amizade aceita com sucesso.' });
  } catch (error: any) {
    next(error);
  }
});

app.get('/api/friends/list', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    
    const relations = await prisma.friendRelation.findMany({
      where: {
        status: 'accepted',
        OR: [{ userId: userId }, { friendId: userId }]
      }
    });

    const friendIds = new Set<string>();
    relations.forEach((rel: any) => {
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

    const formatted = friendsData.map((f: any) => ({
      id: f.id,
      name: f.name,
      tag: f.tag || `${f.name.replace(/\s+/g, '')}#${f.id.slice(0, 4)}`,
      avatar: f.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      level: f.level || 'B1',
      isOnline: true
    }));

    return res.status(200).json(formatted);
  } catch (error: any) {
    next(error);
  }
});

app.delete('/api/friends/:friendId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const targetId = String(req.params.friendId);

    await prisma.friendRelation.deleteMany({
      where: {
        OR: [
          { id: targetId },
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
  } catch (error: any) {
    next(error);
  }
});

app.post('/api/messages/send', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const senderId = (req as any).user.id;
    const recipientId = String(req.body.recipientId);
    const text = String(req.body.text);

    const message = await prisma.directMessage.create({
      data: {
        senderId,
        recipientId,
        text
      }
    });

    io.to(`user_${recipientId}`).emit('direct_message', {
      id: message.id,
      senderId,
      text,
      timestamp: message.createdAt.getTime()
    });

    return res.status(201).json(message);
  } catch (error: any) {
    next(error);
  }
});

app.get('/api/messages/:recipientId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const senderId = (req as any).user.id;
    const recipientId = String(req.params.recipientId);

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId, recipientId },
          { senderId: recipientId, recipientId: senderId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    return res.status(200).json(messages);
  } catch (error: any) {
    next(error);
  }
});

app.get('/api/user/me', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    return res.status(200).json(user);
  } catch (error: any) { next(error); }
});

app.get('/api/user/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetUserId = String(req.params.id);
    const user = await prisma.user.findUnique({ 
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
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
        sessionsHistory: true
      }
    });

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    return res.status(200).json(user);
  } catch (error: any) { 
    next(error); 
  }
});

app.get('/api/notifications', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(notifications);
  } catch (error: any) { 
    next(error); 
  }
});

app.get('/api/matches/candidates', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const me = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, level: true, interests: true, reputation: true, totalSessions: true, totalMinutes: true } });
    if (!me) return res.status(404).json({ error: 'Usuário não encontrado.' });
    
    const allUsers = await prisma.user.findMany({ where: { id: { not: userId }, isBanned: false }, take: 1 });
    const candidates = allUsers.map(candidate => ({
      id: candidate.id, name: candidate.name, level: candidate.level, avatar: candidate.avatar,
      interests: candidate.interests || [], sharedInterests: [], score: 85, reputation: candidate.reputation,
      totalSessions: candidate.totalSessions || 0, totalMinutes: candidate.totalMinutes || 0, history: null, flagStatus: candidate.flagStatus
    }));
    return res.status(200).json({ candidates, me: { id: me.id, level: me.level, interests: me.interests || [] } });
  } catch (error: any) { next(error); }
});

app.post('/api/matches/feedback', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { candidateId, outcome } = req.body;
    if (!candidateId || !['positive', 'negative', 'skip'].includes(outcome)) return res.status(400).json({ error: 'Dados inválidos.' });
    const userMap = matchFeedback.get(userId) || new Map();
    userMap.set(candidateId, outcome);
    matchFeedback.set(userId, userMap);
    return res.status(200).json({ message: 'Feedback salvo.' });
  } catch (error: any) { next(error); }
});

app.put('/api/user/profile', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenUser = (req as any).user;
    const { cefrLevel, ...bodyData } = req.body;
    
    const updateData = {
      ...bodyData,
      ...(cefrLevel ? { level: cefrLevel } : {})
    };

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
            level: updateData.level || 'B1',
            reputation: 100,
            tag: `${(updateData.name || 'Usuário').replace(/\s+/g, '')}#${tokenUser.id.slice(0, 4)}`,
            ...updateData
          }
        });
      }
    }

    const updatedUser = await prisma.user.update({ 
      where: { id: user.id }, 
      data: updateData 
    });

    return res.status(200).json({ message: 'Perfil atualizado com sucesso.', user: updatedUser });
  } catch (error: any) { 
    next(error); 
  }
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Erro global:', { message: err.message });
  return res.status(err.status || 500).json({ error: err.message || 'Erro interno.' });
});

server.listen(PORT, () => {
  logger.info(`Servidor HTTP/Socket rodando na porta ${PORT}`);
});