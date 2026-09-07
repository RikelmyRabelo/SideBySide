import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    notification: {
      findMany: vi.fn(),
    },
  },
}));

describe('GET /api/notifications', () => {
  const mockToken = 'mock-token';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(jwt, 'verify').mockImplementation((token, secret, cb) => {
      (cb as unknown as Function)(null, { id: 'user-123', email: 'test@test.com' });
    });
  });

  it('deve retornar nextCursor quando há mais itens que o limite', async () => {
    const mockItems = Array.from({ length: 21 }, (_, i) => ({
      id: `notif-${i}`,
      userId: 'user-123',
      title: 'Teste',
      message: 'Mensagem',
      read: false,
      createdAt: new Date(),
    }));

    (prisma.notification.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockItems);

    const response = await request(app)
      .get('/api/notifications?limit=20')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(20);
    expect(response.body.nextCursor).toBe('notif-19');
    expect(prisma.notification.findMany).toHaveBeenCalledWith(expect.objectContaining({
      take: 21,
    }));
  });

  it('deve retornar nextCursor nulo quando não há mais itens', async () => {
    const mockItems = Array.from({ length: 10 }, (_, i) => ({
      id: `notif-${i}`,
      userId: 'user-123',
      title: 'Teste',
      message: 'Mensagem',
      read: false,
      createdAt: new Date(),
    }));

    (prisma.notification.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockItems);

    const response = await request(app)
      .get('/api/notifications?limit=20')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(10);
    expect(response.body.nextCursor).toBeNull();
  });
});