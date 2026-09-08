import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const mocks = vi.hoisted(() => ({
  userFindUnique: vi.fn(),
  userUpdate: vi.fn(),
  friendFindFirst: vi.fn(),
  messageCreate: vi.fn(),
}));

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: mocks.userFindUnique,
      update: mocks.userUpdate,
      create: vi.fn(),
    },
    friendRelation: { findFirst: mocks.friendFindFirst },
    directMessage: { create: mocks.messageCreate },
    $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    $disconnect: vi.fn(),
  },
}));

vi.mock('redis', () => ({
  createClient: () => ({
    isOpen: true,
    connect: vi.fn().mockResolvedValue(undefined),
    duplicate: () => ({
      isOpen: true,
      connect: vi.fn().mockResolvedValue(undefined),
      quit: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
    }),
    quit: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
  }),
}));

vi.mock('@socket.io/redis-adapter', () => ({
  createAdapter: vi.fn(() => {
    return class MockRedisAdapter {
      init() {}
      close() {}
    };
  }),
}));

vi.mock('nodemailer', () => ({
  default: { createTransport: () => ({ sendMail: vi.fn().mockResolvedValue(undefined) }) },
}));

const JWT_SECRET = process.env.JWT_SECRET || 'integration-test-secret-with-at-least-32-chars';
process.env.JWT_SECRET = JWT_SECRET;
process.env.NODE_ENV = 'test';

let app: typeof import('../index.js').app;

beforeAll(async () => {
  ({ app } = await import('../index.js'));
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.userFindUnique.mockResolvedValue({
    id: 'user-1',
    email: 'user@example.com',
    name: 'User',
    password: 'hash',
    reputation: 100,
    totalSessions: 0,
    totalMinutes: 0,
    sessionsHistory: [],
  });
  mocks.userUpdate.mockResolvedValue({
    id: 'user-1',
    email: 'user@example.com',
    name: 'User',
    reputation: 100,
  });
});

const authCookie = () => {
  const token = jwt.sign({ id: 'user-1', email: 'user@example.com' }, JWT_SECRET, { expiresIn: '1h' });
  return `token=${token}`;
};

describe('runtime HTTP security integration', () => {
  it('rejeita mass assignment e aceita apenas campos de perfil permitidos', async () => {
    const response = await request(app)
      .put('/api/user/profile')
      .set('Cookie', authCookie())
      .send({ name: 'Updated', reputation: 1, isBanned: true, password: 'changed' });

    expect(response.status).toBe(200);
    expect(mocks.userUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'user-1' },
      data: expect.objectContaining({ name: 'Updated' }),
    }));
    const updateCall = mocks.userUpdate.mock.calls[0][0];
    expect(updateCall.data).not.toHaveProperty('reputation');
    expect(updateCall.data).not.toHaveProperty('isBanned');
    expect(updateCall.data).not.toHaveProperty('password');
  });

  it('bloqueia mensagem HTTP para usuário sem amizade aceita', async () => {
    mocks.friendFindFirst.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/messages/send')
      .set('Cookie', authCookie())
      .send({ recipientId: 'user-2', text: 'unauthorized' });

    expect(response.status).toBe(403);
    expect(mocks.messageCreate).not.toHaveBeenCalled();
  });

  it('não expõe password no endpoint /api/user/me', async () => {
    const response = await request(app)
      .get('/api/user/me')
      .set('Cookie', authCookie());

    expect(response.status).toBe(200);
    expect(response.body).not.toHaveProperty('password');
  });
});
