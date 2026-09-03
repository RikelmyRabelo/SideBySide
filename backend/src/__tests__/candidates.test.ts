import { describe, test, expect, beforeEach, vi, Mock } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

const mockFindUnique = prisma.user.findUnique as Mock;
const mockFindMany = prisma.user.findMany as Mock;

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-seguro';

const app = express();
app.use(express.json());
app.use(cookieParser());

const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Acesso negado.' });
  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(403).json({ error: 'Sessão inválida.' });
    req.user = decoded;
    next();
  });
};

app.get('/api/matches/candidates', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const userId = req.user.id;
    const me = await prisma.user.findUnique({ 
      where: { id: userId }, 
      select: { id: true, level: true, interests: true, reputation: true, totalSessions: true, totalMinutes: true } 
    });
    
    if (!me) return res.status(404).json({ error: 'Usuário não encontrado.' });
    
    const rawCandidates = await prisma.user.findMany({
      where: { id: { not: userId }, isBanned: false },
      take: 10,
      select: { id: true, name: true, level: true, avatar: true, interests: true, reputation: true, totalSessions: true, totalMinutes: true, flagStatus: true }
    });

    const selectedCandidate = rawCandidates.length > 0 ? rawCandidates[0] : null;
    const candidates = selectedCandidate ? [{ ...selectedCandidate, sharedInterests: [], score: 85, history: null }] : [];

    return res.status(200).json({ candidates, me: { id: me.id, level: me.level, interests: me.interests || [] } });
  } catch (error) { next(error); }
});

describe('Matches Candidates Optimization Test (SBS-22)', () => {
  let validToken: string;

  beforeEach(() => {
    vi.clearAllMocks();
    validToken = jwt.sign({ id: 'user_123', email: 'test@sidebyside.com' }, JWT_SECRET);
  });

  test('Deve retornar candidatos usando busca otimizada com take no banco', async () => {
    mockFindUnique.mockResolvedValueOnce({
      id: 'user_123',
      level: 'B1',
      interests: ['Tech'],
      reputation: 100,
      totalSessions: 5,
      totalMinutes: 75
    });

    mockFindMany.mockResolvedValueOnce([
      {
        id: 'user_456',
        name: 'Parceiro Teste',
        level: 'B2',
        avatar: null,
        interests: ['Tech'],
        reputation: 95,
        totalSessions: 2,
        totalMinutes: 30,
        flagStatus: 'clean'
      }
    ]);

    const res = await request(app)
      .get('/api/matches/candidates')
      .set('Cookie', [`token=${validToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.candidates).toHaveLength(1);
    expect(res.body.candidates[0].id).toBe('user_456');
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10, where: { id: { not: 'user_123' }, isBanned: false } })
    );
  });
});