// backend/src/__tests__/jwt-config.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('JWT Secret Configuration', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...OLD_ENV };
  });

  it('deve lançar erro se JWT_SECRET não estiver definido', async () => {
    delete process.env.JWT_SECRET;

    await expect(async () => {
      await import('../config/jwt.js');
    }).rejects.toThrow(
      'FATAL_ERROR: A variável de ambiente JWT_SECRET é obrigatória e não foi configurada.'
    );
  });

  it('deve carregar com sucesso se JWT_SECRET estiver presente', async () => {
    process.env.JWT_SECRET = 'segredo-super-seguro';

    const jwtModule = await import('../config/jwt.js');
    expect(jwtModule.JWT_SECRET).toBe('segredo-super-seguro');
  });
});