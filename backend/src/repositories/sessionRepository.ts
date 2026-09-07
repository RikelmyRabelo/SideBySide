import { createClient, RedisClientType } from 'redis';

export class SessionRepository {
  private client: RedisClientType;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.client = createClient({ url: redisUrl }) as RedisClientType;
    this.client.on('error', (err) => console.error('Erro no cliente Redis:', err));
  }

  async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async set(key: string, value: string, expireInSeconds?: number): Promise<void> {
    await this.connect();
    if (expireInSeconds) {
      await this.client.set(key, value, { EX: expireInSeconds });
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    await this.connect();
    return await this.client.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.connect();
    await this.client.del(key);
  }

  async removeFromList(key: string, value: string): Promise<void> {
    await this.connect();
    await this.client.lRem(key, 0, value);
  }

  async executeScript(script: string, keys: string[], args: string[]): Promise<any> {
    await this.connect();
    return await this.client.eval(script, { keys, arguments: args });
  }
}

export const sessionRepository = new SessionRepository();