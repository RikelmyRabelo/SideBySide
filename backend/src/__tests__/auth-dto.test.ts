import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const loginDtoSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'A senha é obrigatória.'),
});

describe('Auth DTO Validation Tests (SBS-43)', () => {
  it('deve aceitar payload válido', () => {
    const validData = { email: 'teste@exemplo.com', password: 'senha123' };
    const result = loginDtoSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar e-mail malformado', () => {
    const invalidData = { email: 'email-invalido', password: 'senha123' };
    const result = loginDtoSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});