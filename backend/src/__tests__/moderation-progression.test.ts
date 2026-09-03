import { describe, it, expect, vi } from 'vitest';
import { processUserReport } from '../services/moderation.js';

const mFindUnique = vi.fn();
const mUpdate = vi.fn();

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: (...args: any[]) => mFindUnique(...args),
      update: (...args: any[]) => mUpdate(...args),
    },
  },
}));

describe('processUserReport Progression', () => {
  it('deve banir o usuário permanentemente se o número de denúncias ultrapassar 10', async () => {
    mFindUnique.mockResolvedValueOnce({ reportCount: 10 });
    mUpdate.mockResolvedValueOnce({ id: 'user-123', reportCount: 11, status: 'BANNED' });

    const result = await processUserReport('user-123');

    expect(result.status).toBe('BANNED');
    expect(mUpdate).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: {
        reportCount: { increment: 1 },
        status: 'BANNED',
      },
    });
  });

  it('deve suspender o usuário se as denúncias estiverem entre 6 e 10', async () => {
    mFindUnique.mockResolvedValueOnce({ reportCount: 5 });
    mUpdate.mockResolvedValueOnce({ id: 'user-123', reportCount: 6, status: 'SUSPENDED' });

    const result = await processUserReport('user-123');

    expect(result.status).toBe('SUSPENDED');
    expect(mUpdate).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: {
        reportCount: { increment: 1 },
        status: 'SUSPENDED',
      },
    });
  });
});