// backend/src/__tests__/user-me-security.test.ts
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

const mFindUnique = vi.fn();

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: (...args: any[]) => mFindUnique(...args),
    },
  },
}));

import userRoutes from '../routes/user.js';

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  (req as any).userId = 'user-123';
  next();
});
app.use('/api/user', userRoutes);

describe('GET /api/user/me Security', () => {
  it('não deve expor o campo passwordHash na resposta', async () => {
    mFindUnique.mockResolvedValueOnce({
      id: 'user-123',
      name: 'Rikelmy',
      email: 'rikelmy@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app).get('/api/user/me');

    expect(response.status).toBe(200);
    expect(response.body).not.toHaveProperty('passwordHash');
    expect(response.body).not.toHaveProperty('password');
    expect(response.body.email).toBe('rikelmy@example.com');
  });
});