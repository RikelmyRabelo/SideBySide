import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => console.error('Erro no cliente Redis:', err));

export async function initRedisSession() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

export async function setActiveSession(roomId: string, data: { userA: string; userB: string; topicId: string }): Promise<void> {
  await initRedisSession();
  await redisClient.set(`session:${roomId}`, JSON.stringify(data), {
    EX: 86400, // Expira em 24 horas
  });
}

export async function getActiveSession(roomId: string): Promise<{ userA: string; userB: string; topicId: string } | null> {
  await initRedisSession();
  const data = await redisClient.get(`session:${roomId}`);
  return data ? JSON.parse(data) : null;
}

export async function removeActiveSession(roomId: string): Promise<void> {
  await initRedisSession();
  await redisClient.del(`session:${roomId}`);
}

export async function setUserSocketMapping(userId: string, socketId: string): Promise<void> {
  await initRedisSession();
  await redisClient.set(`user:socket:${userId}`, socketId, {
    EX: 86400,
  });
}

export async function getUserSocketMapping(userId: string): Promise<string | null> {
  await initRedisSession();
  return await redisClient.get(`user:socket:${userId}`);
}

export async function removeUserSocketMapping(userId: string): Promise<void> {
  await initRedisSession();
  await redisClient.del(`user:socket:${userId}`);
}