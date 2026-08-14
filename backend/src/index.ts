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
import { prisma } from './lib/prisma';

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-seguro';

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

const pendingUsers = new Map<string, { name: string; email: string; passwordHash: string; level: string; code: string }>();
const verificationCodes = new Map<string, string>();

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
  max: 20,
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
      return res.status(400).json({ error: 'Dados inválidos.', details: error.issues });
    }
    next(error);
  }
};

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn(`Tentativa de acesso negado sem token na rota: ${req.url}`);
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      logger.warn(`Token inválido ou expirado na rota: ${req.url}`);
      return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
    (req as any).user = decoded;
    next();
  });
};

const registerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.').regex(/^[A-Za-zÀ-ÿ\s]+$/, 'O nome deve conter apenas letras.'),
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

app.post('/api/auth/register', authLimiter, validateRequest(registerSchema), async (req: Request, res: Response) => {
  try {
    const { name, email, password, level } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      logger.info(`Falha de registro: E-mail já cadastrado (${email})`);
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    pendingUsers.set(email, {
      name,
      email,
      passwordHash: hashedPassword,
      level: level || 'B1',
      code,
    });

    await transporter.sendMail({
      from: '"SideBySide" <no-reply@sidebyside.com>',
      to: email,
      subject: 'Ative sua conta no SideBySide',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1C1917;">
          <h2>Bem-vindo ao SideBySide!</h2>
          <p>Seu código de verificação de 6 dígitos é:</p>
          <div style="font-size: 24px; font-weight: bold; background: #FAF9F6; border: 2px solid #1C1917; padding: 12px 24px; display: inline-block; border-radius: 12px; margin: 10px 0;">
            ${code}
          </div>
        </div>
      `,
    });

    logger.info(`Código de verificação enviado para registro de: ${email}`);
    return res.status(201).json({
      message: 'Código de verificação enviado para o e-mail.',
      email,
    });
  } catch (error: any) {
    logger.error('Erro no /api/auth/register:', { error: error.message, stack: error.stack });
    return res.status(500).json({ error: 'Erro interno no servidor.', details: error.message });
  }
});

app.post('/api/auth/login', authLimiter, validateRequest(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.info(`Falha de login: E-mail não encontrado (${email})`);
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.info(`Falha de login: Senha incorreta (${email})`);
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    logger.info(`Login bem-sucedido para o usuário: ${email}`);
    return res.status(200).json({
      message: 'Login realizado com sucesso.',
      token,
      user: { id: user.id, name: user.name, email: user.email, level: user.level, reputation: user.reputation },
    });
  } catch (error: any) {
    logger.error('Erro no /api/auth/login:', { error: error.message, stack: error.stack });
    return res.status(500).json({ error: 'Erro interno no servidor.', details: error.message });
  }
});

app.post('/api/auth/forgot-password', passwordResetLimiter, validateRequest(emailOnlySchema), async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.info(`Recuperação de senha: E-mail não encontrado (${email})`);
      return res.status(200).json({ message: 'Se o e-mail estiver cadastrado, um código foi enviado.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.set(email, code);

    await transporter.sendMail({
      from: '"SideBySide" <no-reply@sidebyside.com>',
      to: email,
      subject: 'Recuperação de Senha - SideBySide',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1C1917;">
          <h2>Redefinição de Senha</h2>
          <p>Seu código de verificação é:</p>
          <div style="font-size: 24px; font-weight: bold; background: #FAF9F6; border: 2px solid #1C1917; padding: 12px 24px; display: inline-block; border-radius: 12px; margin: 10px 0;">
            ${code}
          </div>
        </div>
      `,
    });

    logger.info(`Código de recuperação enviado para: ${email}`);
    return res.status(200).json({ message: 'Código de recuperação enviado com sucesso.' });
  } catch (error: any) {
    logger.error('Erro no /api/auth/forgot-password:', { error: error.message, stack: error.stack });
    return res.status(500).json({ error: 'Erro interno no servidor.', details: error.message });
  }
});

app.post('/api/auth/verify-reset-code', passwordResetLimiter, validateRequest(verifyCodeSchema), async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    const storedCode = verificationCodes.get(email);
    if (!storedCode || storedCode !== code) {
      logger.warn(`Falha na verificação de código de reset: Inválido para o email ${email}`);
      return res.status(400).json({ error: 'Código inválido ou expirado.' });
    }

    logger.info(`Código de reset verificado com sucesso para: ${email}`);
    return res.status(200).json({ message: 'Código verificado com sucesso.' });
  } catch (error: any) {
    logger.error('Erro no /api/auth/verify-reset-code:', { error: error.message, stack: error.stack });
    return res.status(500).json({ error: 'Erro interno no servidor.', details: error.message });
  }
});

app.post('/api/auth/reset-password', passwordResetLimiter, validateRequest(resetPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    const storedCode = verificationCodes.get(email);
    if (!storedCode || storedCode !== code) {
      logger.warn(`Falha no reset de senha: Código inválido para o email ${email}`);
      return res.status(400).json({ error: 'Código inválido ou expirado.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.warn(`Falha no reset de senha: Usuário não encontrado (${email})`);
      return res.status(400).json({ error: 'Usuário não encontrado.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    verificationCodes.delete(email);

    logger.info(`Senha redefinida com sucesso para: ${email}`);
    return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (error: any) {
    logger.error('Erro no /api/auth/reset-password:', { error: error.message, stack: error.stack });
    return res.status(500).json({ error: 'Erro interno no servidor.', details: error.message });
  }
});

app.post('/api/auth/verify-code', authLimiter, validateRequest(verifyCodeSchema), async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    let targetEmail = email;
    if (!targetEmail) {
      for (const [pendingEmail, data] of pendingUsers.entries()) {
        if (data.code === code) {
          targetEmail = pendingEmail;
          break;
        }
      }
    }

    const pending = targetEmail ? pendingUsers.get(targetEmail) : null;
    if (!pending || pending.code !== code) {
      logger.warn(`Falha na verificação de código de registro: Inválido para o email ${targetEmail || 'Desconhecido'}`);
      return res.status(400).json({ error: 'Código inválido ou expirado.' });
    }

    pendingUsers.delete(targetEmail);

    const newUser = await prisma.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        password: pending.passwordHash,
        level: pending.level,
        reputation: 98,
      },
    });

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    logger.info(`Nova conta verificada e criada com sucesso para: ${newUser.email}`);
    return res.status(200).json({
      message: 'Conta verificada e criada com sucesso.',
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, level: newUser.level, reputation: newUser.reputation }
    });
  } catch (error: any) {
    logger.error('Erro no /api/auth/verify-code:', { error: error.message, stack: error.stack });
    return res.status(500).json({ error: 'Erro interno no servidor.', details: error.message });
  }
});

app.post('/api/auth/resend-code', passwordResetLimiter, validateRequest(emailOnlySchema), async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const pending = pendingUsers.get(email);
    if (!pending) {
      logger.warn(`Reenvio de código falhou: Nenhum cadastro pendente para ${email}`);
      return res.status(400).json({ error: 'Nenhum cadastro pendente encontrado para este e-mail.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    pending.code = code;
    pendingUsers.set(email, pending);

    await transporter.sendMail({
      from: '"SideBySide" <no-reply@sidebyside.com>',
      to: email,
      subject: 'Novo código de verificação - SideBySide',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1C1917;">
          <h2>Novo Código de Verificação</h2>
          <p>Seu novo código de 6 dígitos é:</p>
          <div style="font-size: 24px; font-weight: bold; background: #FAF9F6; border: 2px solid #1C1917; padding: 12px 24px; display: inline-block; border-radius: 12px; margin: 10px 0;">
            ${code}
          </div>
        </div>
      `,
    });

    logger.info(`Código de verificação reenviado para: ${email}`);
    return res.status(200).json({ message: 'Código reenviado com sucesso.' });
  } catch (error: any) {
    logger.error('Erro no /api/auth/resend-code:', { error: error.message, stack: error.stack });
    return res.status(500).json({ error: 'Erro interno no servidor.', details: error.message });
  }
});

app.get('/api/user/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, level: true, reputation: true }
    });

    if (!user) {
      logger.warn(`Requisição /api/user/me falhou: Usuário não encontrado para o ID ${userId}`);
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    logger.info(`Dados do usuário retornados com sucesso para o ID: ${userId}`);
    return res.status(200).json(user);
  } catch (error: any) {
    logger.error('Erro no /api/user/me:', { error: error.message, stack: error.stack });
    return res.status(500).json({ error: 'Erro interno no servidor.', details: error.message });
  }
});

app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});