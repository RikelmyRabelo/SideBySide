// backend/src/__tests__/session-redis.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const redisMockStore = new Map<string, string>();

vi.mock('redis', () => ({
  createClient: () => ({
    isOpen: true,
    connect: vi.fn().mockResolvedValue(undefined),
    set: vi.fn(async (key: string, value: string) => {
      redisMockStore.set(key, value);
      return 'OK';
    }),
    get: vi.fn(async (key: string) => {
      return redisMockStore.get(key) || null;
    }),
    del: vi.fn(async (key: string) => {
      const exists = redisMockStore.has(key);
      redisMockStore.delete(key);
      return exists ? 1 : 0;
    }),
    on: vi.fn(),
  }),
}));

import { 
  setActiveSession, 
  getActiveSession, 
  removeActiveSession, 
  setUserSocketMapping, 
  getUserSocketMapping, 
  removeUserSocketMapping 
} from '../services/sessionRedis.js';

describe('Session Redis External Storage', () => {
  beforeEach(() => {
    redisMockStore.clear();
  });

  it('deve armazenar e recuperar uma sessão ativa corretamente', async () => {
    const roomId = 'room-123';
    const sessionData = { userA: 'user-1', userB: 'user-2', topicId: 'topic-99' };

    await setActiveSession(roomId, sessionData);
    const retrieved = await getActiveSession(roomId);

    expect(retrieved).toEqual(sessionData);
  });

  it('deve remover uma sessão ativa corretamente', async () => {
    const roomId = 'room-456';
    const sessionData = { userA: 'user-3', userB: 'user-4', topicId: 'topic-10' };

    await setActiveSession(roomId, sessionData);
    await removeActiveSession(roomId);
    const retrieved = await getActiveSession(roomId);

    expect(retrieved).toBeNull();
  });

  it('deve gerenciar o mapeamento de socket do usuário no Redis', async () => {
    const userId = 'user-999';
    const socketId = 'socket-xyz-789';

    await setUserSocketMapping(userId, socketId);
    const mappedSocket = await getUserSocketMapping(userId);
    expect(mappedSocket).toBe(socketId);

    await removeUserSocketMapping(userId);
    const removedSocket = await getUserSocketMapping(userId);
    expect(removedSocket).toBeNull();
  });
});