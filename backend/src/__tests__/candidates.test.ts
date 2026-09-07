import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
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

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  }
}));

describe('GET /api/matches/candidates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar candidatos ordenados corretamente aplicando a nova heurística de streak e experiência', async () => {
    const mockUserId = 'user-1';
    
    (jwt.verify as any).mockImplementation((token: string, secret: string, cb: any) => {
      cb(null, { id: mockUserId, email: 'test@sidebyside.com' });
    });

    (prisma.user.findUnique as any).mockResolvedValue({
      id: mockUserId,
      level: 'B1',
      interests: ['music', 'tech'],
      reputation: 100,
      totalSessions: 10,
      totalMinutes: 150,
      streak: 5
    });

    (prisma.user.findMany as any).mockResolvedValue([
      {
        id: 'user-2',
        name: 'Alice',
        level: 'B1', 
        interests: ['music', 'tech'],
        reputation: 100,
        totalSessions: 20,
        totalMinutes: 300,
        streak: 10,
        flagStatus: 'CLEAN'
      },
      {
        id: 'user-3',
        name: 'Bob',
        level: 'C2', 
        interests: ['sports'],
        reputation: 50,
        totalSessions: 1,
        totalMinutes: 15,
        streak: 0,
        flagStatus: 'CLEAN'
      }
    ]);

    const response = await request(app)
      .get('/api/matches/candidates')
      .set('Cookie', ['token=valid-token']);

    expect(response.status).toBe(200);
    expect(response.body.candidates).toHaveLength(2);
    
    const aliceScore = response.body.candidates.find((c: any) => c.id === 'user-2').score;
    const bobScore = response.body.candidates.find((c: any) => c.id === 'user-3').score;

    expect(aliceScore).toBeGreaterThan(bobScore);
    expect(aliceScore).toBeLessThanOrEqual(100);
  });
});