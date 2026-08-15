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

// Importações do Socket.io
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cookie from 'cookie';

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

// Criação do Servidor HTTP acoplado ao Express e ao Socket.io
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
  max: 10, 
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

/* =========================================
   LÓGICA DO SOCKET.IO (MATCHMAKING)
========================================= */

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

interface WaitingUser {
  socketId: string;
  userId: string;
  email: string;
}
const waitingQueue: WaitingUser[] = [];

io.on('connection', (socket) => {
  const user = (socket as any).user;
  logger.info(`🔌 Usuário conectado via Socket: ${user.email} (${socket.id})`);

  socket.on('find_match', () => {
    logger.info(`🔍 ${user.email} entrou na fila de busca.`);

    const alreadyInQueue = waitingQueue.find(u => u.userId === user.id);
    if (alreadyInQueue) return;

    if (waitingQueue.length > 0) {
      const partner = waitingQueue.shift()!;
      const roomId = `room_${Date.now()}`;
      
      socket.join(roomId);
      const partnerSocket = io.sockets.sockets.get(partner.socketId);
      if (partnerSocket) partnerSocket.join(roomId);

      logger.info(`🤝 MATCH ENCONTRADO: ${user.email} <> ${partner.email} na sala ${roomId}`);
      io.to(roomId).emit('match_found', { 
        roomId, 
        partnerId: partner.userId 
      });
    } else {
      waitingQueue.push({ socketId: socket.id, userId: user.id, email: user.email });
    }
  });

  socket.on('cancel_match', () => {
    const index = waitingQueue.findIndex(u => u.socketId === socket.id);
    if (index !== -1) {
      waitingQueue.splice(index, 1);
      logger.info(`🚫 ${user.email} saiu da fila de busca.`);
    }
  });

  socket.on('disconnect', () => {
    const index = waitingQueue.findIndex(u => u.socketId === socket.id);
    if (index !== -1) {
      waitingQueue.splice(index, 1);
    }
    logger.info(`❌ Usuário desconectado via Socket: ${user.email}`);
  });
});

/* =========================================
   ROTAS EXPRESS PADRÃO
========================================= */

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
      user: { id: user.id, name: user.name, email: user.email, level: user.level, reputation: user.reputation },
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
    const newUser = await prisma.user.create({
      data: { name: pending.name, email: pending.email, password: pending.passwordHash, level: pending.level, reputation: 100 },
    });
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, cookieOptions);
    return res.status(200).json({
      message: 'Conta criada.',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, level: newUser.level, reputation: newUser.reputation }
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
    const { reportedUserId, reason } = req.body || {};
    if (!reportedUserId || !reason) return res.status(400).json({ error: 'Dados obrigatórios ausentes.' });
    const reported = await prisma.user.findUnique({ where: { id: reportedUserId } });
    if (!reported) return res.status(404).json({ error: 'Usuário não encontrado.' });
    const userReports = reports.get(reportedUserId) || [];
    userReports.push({ reporterId: userId, reason, timestamp: new Date() });
    reports.set(reportedUserId, userReports);
    const newReportCount = (reported.reportCount || 0) + 1;
    let flagStatus = reported.flagStatus || 'clean';
    let bannedUntil = reported.bannedUntil;
    if (newReportCount >= 3 && flagStatus === 'clean') flagStatus = 'warning';
    else if (newReportCount >= 6 && flagStatus === 'warning') { flagStatus = 'suspended'; bannedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); }
    else if (newReportCount >= 10) flagStatus = 'banned';
    await prisma.user.update({ where: { id: reportedUserId }, data: { reportCount: newReportCount, flagStatus, flagReason: reason, flaggedAt: new Date(), isBanned: flagStatus === 'banned', bannedUntil } });
    const report = await prisma.report.create({ data: { reporterId: userId, reportedUserId, reason } });
    return res.status(201).json({ message: 'Denúncia registrada.', reportId: report.id, userFlagStatus: flagStatus });
  } catch (error: any) { next(error); }
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

app.get('/api/user/me', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    return res.status(200).json(user);
  } catch (error: any) { next(error); }
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
    const userId = (req as any).user.id;
    const updateData = { ...req.body };
    const updatedUser = await prisma.user.update({ where: { id: userId }, data: updateData });
    return res.status(200).json({ message: 'Perfil atualizado.', user: updatedUser });
  } catch (error: any) { next(error); }
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Erro global:', { message: err.message });
  return res.status(err.status || 500).json({ error: err.message || 'Erro interno.' });
});

server.listen(PORT, () => {
  logger.info(`Servidor HTTP/Socket rodando na porta ${PORT}`);
});