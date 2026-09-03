import { describe, it, expect } from 'vitest';
import api from '../services/api';

describe('Frontend API Client Configuration', () => {
  it('deve estar configurado com withCredentials ativado', () => {
    expect(api.defaults.withCredentials).toBe(true);
  });

  it('deve possuir uma baseURL definida', () => {
    expect(api.defaults.baseURL).toBeDefined();
  });
});