import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

const mFindUnique = vi.fn();
const mUpdate = vi.fn();

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    friendship: {
      findUnique: (...args: any[]) => mFindUnique(...args),
      update: (...args: any[]) => mUpdate(...args),
    },
  },
}));

import friendshipRoutes from '../routes/friendship.js';

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  // Simulando um usuário autenticado com ID 'user-logado-123'
  (req as any).userId = 'user-logado-123';
  next();
});
app.use('/api/friendship', friendshipRoutes);

describe('POST /api/friendship/:id/accept IDOR Prevention', () => {
  it('deve retornar 404 se a amizade não for encontrada', async () => {
    mFindUnique.mockResolvedValueOnce(null);

    const response = await request(app).post('/api/friendship/req-999/accept');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Solicitação de amizade não encontrada.');
  });

  it('deve retornar 403 se o usuário tentar aceitar uma amizade de terceiros', async () => {
    mFindUnique.mockResolvedValueOnce({
      id: 'req-123',
      senderId: 'user-xyz',
      receiverId: 'outro-usuario-456', // Destinatário diferente do logado
      status: 'PENDING',
    });

    const response = await request(app).post('/api/friendship/req-123/accept');

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Acesso negado: você não é o destinatário desta solicitação.');
    expect(mUpdate).not.toHaveBeenCalled();
  });

  it('deve retornar 200 e aceitar a amizade se o usuário for o destinatário', async () => {
    mFindUnique.mockResolvedValueOnce({
      id: 'req-123',
      senderId: 'user-xyz',
      receiverId: 'user-logado-123', // Mesmo ID do mock de autenticação
      status: 'PENDING',
    });

    mUpdate.mockResolvedValueOnce({
      id: 'req-123',
      senderId: 'user-xyz',
      receiverId: 'user-logado-123',
      status: 'ACCEPTED',
    });

    const response = await request(app).post('/api/friendship/req-123/accept');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ACCEPTED');
    expect(mUpdate).toHaveBeenCalledWith({
      where: { id: 'req-123' },
      data: { status: 'ACCEPTED' },
    });
  });
});