import { Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { createCacheRedisClient, getCacheRedisOptions } from '../caching/utils/redis-connection.util';

export type RateLimitHit = {
  count: number;
  limited: boolean;
  remaining: number;
};

type MemoryBucket = {
  count: number;
  resetAt: number;
};

export class RateLimitStore {
  private static instance: RateLimitStore;
  private readonly logger = new Logger(RateLimitStore.name);
  private redis: Redis | null = null;
  private readonly memory = new Map<string, MemoryBucket>();
  private mode: 'redis' | 'memory' = 'memory';

  private constructor() {
    this.initRedis();
  }

  static getInstance(): RateLimitStore {
    if (!RateLimitStore.instance) {
      RateLimitStore.instance = new RateLimitStore();
    }
    return RateLimitStore.instance;
  }

  private initRedis() {
    try {
      const client = createCacheRedisClient(getCacheRedisOptions());
      client.on('error', (error) => {
        this.logger.warn(`Rate-limit Redis error: ${error.message}`);
        this.mode = 'memory';
      });
      client
        .ping()
        .then(() => {
          this.redis = client;
          this.mode = 'redis';
          this.logger.log('Rate-limit store using Redis');
        })
        .catch(() => {
          this.mode = 'memory';
          void client.quit().catch(() => undefined);
          this.logger.warn('Rate-limit store falling back to memory');
        });
    } catch {
      this.mode = 'memory';
      this.logger.warn('Rate-limit store using memory');
    }
  }

  async hit(key: string, windowMs: number, max: number): Promise<RateLimitHit> {
    if (this.mode === 'redis' && this.redis) {
      try {
        return await this.hitRedis(key, windowMs, max);
      } catch {
        return this.hitMemory(key, windowMs, max);
      }
    }
    return this.hitMemory(key, windowMs, max);
  }

  private async hitRedis(
    key: string,
    windowMs: number,
    max: number,
  ): Promise<RateLimitHit> {
    const redis = this.redis!;
    const redisKey = `rl:${key}`;
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.pexpire(redisKey, windowMs);
    }
    return {
      count,
      limited: count > max,
      remaining: Math.max(0, max - count),
    };
  }

  private hitMemory(key: string, windowMs: number, max: number): RateLimitHit {
    const now = Date.now();
    const current = this.memory.get(key);
    if (!current || current.resetAt <= now) {
      this.memory.set(key, { count: 1, resetAt: now + windowMs });
      return { count: 1, limited: false, remaining: Math.max(0, max - 1) };
    }
    current.count += 1;
    return {
      count: current.count,
      limited: current.count > max,
      remaining: Math.max(0, max - current.count),
    };
  }
}
