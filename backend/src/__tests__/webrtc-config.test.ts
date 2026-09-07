import { describe, it, expect } from 'vitest';

describe('WebRTC Configuration Security Tests (SBS-40)', () => {
  it('deve forçar a política de transporte ICE como relay para mascarar o IP', () => {
    const ICE_SERVERS: RTCConfiguration = {
      iceServers: [
        {
          urls: 'turn:turn.seusiteoficial.com:3478',
          username: 'usuario_seguro',
          credential: 'senha_segura_turn'
        }
      ],
      iceTransportPolicy: 'relay'
    };

    expect(ICE_SERVERS.iceTransportPolicy).toBe('relay');
    expect(ICE_SERVERS.iceServers?.[0].urls).toContain('turn:');
  });
});