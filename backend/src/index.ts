import "dotenv/config";
import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { prisma } from './lib/prisma';

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-seguro';

const pendingUsers = new Map<string, { name: string; email: string; passwordHash: string; level: string; code: string }>();
const verificationCodes = new Map<string, string>();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
  debug: true,
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, level } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
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

    return res.status(201).json({
      message: 'Código de verificação enviado para o e-mail.',
      email,
    });
  } catch (error: any) {
    console.error('Erro no /api/auth/register:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.', details: error.message });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      message: 'Login realizado com sucesso.',
      token,
      user: { id: user.id, name: user.name, email: user.email, level: user.level, reputation: user.reputation },
    });
  } catch (error: any) {
    console.error('Erro no /api/auth/login:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.', details: error.message });
  }
});

app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'E-mail é obrigatório.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
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

    return res.status(200).json({ message: 'Código de recuperação enviado com sucesso.' });
  } catch (error: any) {
    console.error('Erro no /api/auth/forgot-password:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.', details: error.message });
  }
});

app.post('/api/auth/verify-reset-code', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'E-mail e código são obrigatórios.' });
    }

    const storedCode = verificationCodes.get(email);
    if (!storedCode || storedCode !== code) {
      return res.status(400).json({ error: 'Código inválido ou expirado.' });
    }

    return res.status(200).json({ message: 'Código verificado com sucesso.' });
  } catch (error: any) {
    console.error('Erro no /api/auth/verify-reset-code:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.', details: error.message });
  }
});

app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'E-mail, código e nova senha são obrigatórios.' });
    }

    const storedCode = verificationCodes.get(email);
    if (!storedCode || storedCode !== code) {
      return res.status(400).json({ error: 'Código inválido ou expirado.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Usuário não encontrado.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    verificationCodes.delete(email);

    return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  } catch (error: any) {
    console.error('Erro no /api/auth/reset-password:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.', details: error.message });
  }
});

app.post('/api/auth/verify-code', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Código é obrigatório.' });
    }

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

    return res.status(200).json({
      message: 'Conta verificada e criada com sucesso.',
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, level: newUser.level, reputation: newUser.reputation }
    });
  } catch (error: any) {
    console.error('Erro no /api/auth/verify-code:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.', details: error.message });
  }
});

app.post('/api/auth/resend-code', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'E-mail é obrigatório.' });
    }

    const pending = pendingUsers.get(email);
    if (!pending) {
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

    return res.status(200).json({ message: 'Código reenviado com sucesso.' });
  } catch (error: any) {
    console.error('Erro no /api/auth/resend-code:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});