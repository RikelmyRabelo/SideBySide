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

import profileRoutes from '../routes/profile.js';

const app = express();
app.use(express.json());
app.use('/api/profile', profileRoutes);

describe('GET /api/profile/:id Privacy', () => {
  it('não deve expor email nem sessionsHistory na busca pública de perfil', async () => {
    mFindUnique.mockResolvedValueOnce({
      id: 'user-456',
      name: 'Perfil Público',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app).get('/api/profile/user-456');

    expect(response.status).toBe(200);
    expect(response.body).not.toHaveProperty('email');
    expect(response.body).not.toHaveProperty('sessionsHistory');
    expect(response.body.name).toBe('Perfil Público');
  });
});