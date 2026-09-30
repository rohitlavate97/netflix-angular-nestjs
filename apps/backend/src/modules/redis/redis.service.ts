import { Injectable, Inject, Logger, OnApplicationShutdown } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

export interface RedisHealthResult {
  status: 'up' | 'down';
  latencyMs?: number;
  message?: string;
}

@Injectable()
export class RedisService implements OnApplicationShutdown {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      this.logger.error(`Error reading key ${key} from Redis`, err);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    try {
      const stringified = JSON.stringify(value);
      if (ttlSeconds && ttlSeconds > 0) {
        await this.client.set(key, stringified, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, stringified);
      }
    } catch (err) {
      this.logger.error(`Error writing key ${key} to Redis`, err);
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (err) {
      this.logger.error(`Error deleting key ${key} from Redis`, err);
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const count = await this.client.exists(key);
      return count > 0;
    } catch (err) {
      this.logger.error(`Error checking key existence for ${key} in Redis`, err);
      return false;
    }
  }

  async checkHealth(): Promise<RedisHealthResult> {
    const start = Date.now();
    try {
      const res = await this.client.ping();
      if (res === 'PONG') {
        return {
          status: 'up',
          latencyMs: Date.now() - start,
        };
      }
      return {
        status: 'down',
        message: `Unexpected Redis ping response: ${res}`,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown Redis error';
      this.logger.warn(`Redis health ping failed: ${message}`);
      return {
        status: 'down',
        message,
      };
    }
  }

  async flushAll(): Promise<void> {
    try {
      await this.client.flushall();
    } catch (err) {
      this.logger.error('Error flushing Redis database', err);
    }
  }

  async onApplicationShutdown(): Promise<void> {
    try {
      if (this.client.status !== 'end') {
        await this.client.quit();
      }
    } catch (err) {
      this.logger.warn('Error gracefully closing Redis client connection', err);
    }
  }
}
