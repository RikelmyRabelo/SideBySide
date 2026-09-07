import { sessionRepository } from '../repositories/sessionRepository.js';

const MATCH_TOPICS = ['general', 'business', 'technology', 'travel', 'daily'] as const;
const MAX_QUEUE_SIZE_PER_TOPIC = 100;
const SESSION_EXPIRATION = 86400; // Expira em 24 horas

export async function setActiveSession(roomId: string, data: { userA: string; userB: string; topicId: string }): Promise<void> {
  await sessionRepository.set(`session:${roomId}`, JSON.stringify(data), SESSION_EXPIRATION);
}

export async function getActiveSession(roomId: string): Promise<{ userA: string; userB: string; topicId: string } | null> {
  const data = await sessionRepository.get(`session:${roomId}`);
  return data ? JSON.parse(data) : null;
}

export async function removeActiveSession(roomId: string): Promise<void> {
  await sessionRepository.delete(`session:${roomId}`);
}

export async function setUserSocketMapping(userId: string, socketId: string): Promise<void> {
  await sessionRepository.set(`user:socket:${userId}`, socketId, SESSION_EXPIRATION);
}

export async function getUserSocketMapping(userId: string): Promise<string | null> {
  return await sessionRepository.get(`user:socket:${userId}`);
}

export async function removeUserSocketMapping(userId: string): Promise<void> {
  await sessionRepository.delete(`user:socket:${userId}`);
}

export async function enqueueMatch(topicId: string, userId: string, socketId: string): Promise<void> {
  const payload = JSON.stringify({ userId, socketId });
  const script = `
    for _, key in ipairs(KEYS) do redis.call('LREM', key, 0, ARGV[1]) end
    local size = redis.call('LLEN', KEYS[1])
    if size < tonumber(ARGV[2]) then redis.call('RPUSH', KEYS[1], ARGV[1]) end
    return size
  `;
  
  const keys = [
    topicId,
    ...MATCH_TOPICS.filter((topic) => topic !== topicId).map((topic) => `match:${topic}`)
  ].map((key) => key.startsWith('match:') ? key : `match:${key}`);

  await sessionRepository.executeScript(script, keys, [payload, String(MAX_QUEUE_SIZE_PER_TOPIC)]);
}

export async function dequeueMatchPair(topicId: string): Promise<Array<{ userId: string; socketId: string }>> {
  const script = `
    if redis.call('LLEN', KEYS[1]) < 2 then return {} end
    return { redis.call('LPOP', KEYS[1]), redis.call('LPOP', KEYS[1]) }
  `;
  
  const entries = await sessionRepository.executeScript(script, [`match:${topicId}`], []) as string[];
  return entries ? entries.map((entry) => JSON.parse(entry) as { userId: string; socketId: string }) : [];
}

export async function removeMatch(topicId: string, userId: string, socketId: string): Promise<void> {
  await sessionRepository.removeFromList(`match:${topicId}`, JSON.stringify({ userId, socketId }));
}