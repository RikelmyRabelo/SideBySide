import { api } from '../services/api';
import { socket } from '../services/socket';

describe('Global Services Unification Tests (SBS-21)', () => {
  test('A instância do cliente HTTP (api) deve estar configurada com baseURL correta', () => {
    expect(api.defaults.baseURL).toBeDefined();
    expect(api.defaults.withCredentials).toBe(true);
  });

  test('A instância global do socket deve estar definida', () => {
    expect(socket).toBeDefined();
  });
});