import { describe, it, expect, vi } from 'vitest';
import { assertCanMessage } from '../utils/authorization.js';

const mFindValue = vi.fn();

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: function() {
      return {
        friendship: {
          findFirst: (...args: any[]) => mFindValue(...args),
        },
      };
    },
  };
});

describe('assertCanMessage', () => {
  it('deve permitir mensagens para si mesmo', async () => {
    await expect(assertCanMessage('user-1', 'user-1')).resolves.toBeUndefined();
  });

  it('deve lançar erro se não houver amizade aceita', async () => {
    mFindValue.mockResolvedValueOnce(null);

    await expect(assertCanMessage('user-1', 'user-2')).rejects.toThrow(
      'UNAUTHORIZED_DIRECT_MESSAGE: É necessário possuir uma amizade aceita para trocar mensagens diretas.'
    );
  });
});