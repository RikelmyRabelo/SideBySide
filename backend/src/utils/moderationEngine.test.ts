import { describe, it, expect } from 'vitest';
import { evaluateDirectMessageEligibility } from './moderationEngine.js';

describe('Moderation Engine Tests (SBS-45)', () => {
  it('deve permitir mensagens para o próprio usuário', () => {
    expect(() => evaluateDirectMessageEligibility('user1', 'user1', false)).not.toThrow();
  });

  it('deve permitir mensagens se houver amizade aceita', () => {
    expect(() => evaluateDirectMessageEligibility('user1', 'user2', true)).not.toThrow();
  });

  it('deve rejeitar mensagens se não houver amizade aceita', () => {
    expect(() => evaluateDirectMessageEligibility('user1', 'user2', false)).toThrowError(
      'UNAUTHORIZED_DIRECT_MESSAGE'
    );
  });
});