import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-seguro';

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const pendingUsers = new Map<string, { name: string; email: string; passwordHash: string; level: string; code: string }>();
export const verificationCodes = new Map<string, string>();

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
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
  } catch (error: unknown) {
    console.error('[AuthController Error] Falha durante a operação de login:', error);
    next(error);
  }
}

export async function logoutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    res.clearCookie('token');
    return res.status(200).json({ message: 'Logout realizado com sucesso.' });
  } catch (error: unknown) {
    console.error('[AuthController Error] Falha durante a operação de logout:', error);
    next(error);
  }
}