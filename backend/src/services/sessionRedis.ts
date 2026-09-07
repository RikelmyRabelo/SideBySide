import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = createClient({ url: redisUrl });
const MATCH_TOPICS = ['general', 'business', 'technology', 'travel', 'daily'] as const;
const MAX_QUEUE_SIZE_PER_TOPIC = 100;

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

export async function enqueueMatch(topicId: string, userId: string, socketId: string): Promise<void> {
  await initRedisSession();
  const payload = JSON.stringify({ userId, socketId });
  await redisClient.eval(`
    for _, key in ipairs(KEYS) do redis.call('LREM', key, 0, ARGV[1]) end
    local size = redis.call('LLEN', KEYS[1])
    if size < tonumber(ARGV[2]) then redis.call('RPUSH', KEYS[1], ARGV[1]) end
    return size
  `, {
    keys: [topicId, ...MATCH_TOPICS.filter((topic) => topic !== topicId).map((topic) => `match:${topic}`)].map((key) => key.startsWith('match:') ? key : `match:${key}`),
    arguments: [payload, String(MAX_QUEUE_SIZE_PER_TOPIC)]
  });
}

export async function dequeueMatchPair(topicId: string): Promise<Array<{ userId: string; socketId: string }>> {
  await initRedisSession();
  const entries = await redisClient.eval(`
    if redis.call('LLEN', KEYS[1]) < 2 then return {} end
    return { redis.call('LPOP', KEYS[1]), redis.call('LPOP', KEYS[1]) }
  `, { keys: [`match:${topicId}`], arguments: [] }) as string[];
  return entries.map((entry) => JSON.parse(entry) as { userId: string; socketId: string });
}

export async function removeMatch(topicId: string, userId: string, socketId: string): Promise<void> {
  await initRedisSession();
  await redisClient.lRem(`match:${topicId}`, 0, JSON.stringify({ userId, socketId }));
}