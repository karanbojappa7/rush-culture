import { ICache } from './cache.interface';
import { MemoryCache } from './implementations/memory.cache';
import { RedisCache } from './implementations/redis.cache';
import {
  CACHE_TYPES,
  CacheType,
  DEFAULT_CACHE_TTL,
} from '../constants/cache.constants';
import { getCacheRedisOptions } from './utils/redis-connection.util';

export class CacheHandler {
  private cache: ICache;
  private static instance: CacheHandler;
  private enabled: boolean;
  private defaultTtl: number;

  constructor(config?: {
    type?: CacheType;
    enabled?: boolean;
    ttl?: number;
    redis?: {
      url?: string;
      host?: string;
      port?: number;
      password?: string;
      db?: number;
    };
  }) {
    const cacheType =
      config?.type ||
      (process.env.CACHE_TYPE as CacheType) ||
      CACHE_TYPES.REDIS;

    this.enabled =
      config?.enabled !== undefined
        ? config.enabled
        : process.env.ENABLE_CACHING === 'true';

    this.defaultTtl =
      config?.ttl ||
      (process.env.CACHE_TTL
        ? parseInt(process.env.CACHE_TTL, 10)
        : DEFAULT_CACHE_TTL);

    if (!this.enabled) {
      this.cache = new MemoryCache();
      return;
    }

    this.init(cacheType, config?.redis);
  }

  static getInstance(): CacheHandler {
    if (!CacheHandler.instance) {
      CacheHandler.instance = new CacheHandler();
    }
    return CacheHandler.instance;
  }

  static resetInstance(): void {
    CacheHandler.instance = undefined as unknown as CacheHandler;
  }

  private init(
    type: CacheType,
    redisConfig?: {
      url?: string;
      host?: string;
      port?: number;
      password?: string;
      db?: number;
    },
  ): void {
    if (type === CACHE_TYPES.REDIS || type === CACHE_TYPES.DRAGON_FLY) {
      try {
        const defaults = getCacheRedisOptions();
        this.cache = new RedisCache({
          url: redisConfig?.url || defaults.url,
          host: redisConfig?.host || defaults.host,
          port: redisConfig?.port || defaults.port,
          password: redisConfig?.password || defaults.password,
          db: redisConfig?.db ?? defaults.db,
        });
        return;
      } catch {
        this.cache = new MemoryCache();
        return;
      }
    }
    this.cache = new MemoryCache();
  }

  getCache(): ICache {
    return this.cache;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getDefaultTtl(): number {
    return this.defaultTtl;
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    if (!this.enabled) return null;
    try {
      return await this.cache.get<T>(key);
    } catch {
      return null;
    }
  }

  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.enabled) return;
    try {
      await this.cache.set(key, value, ttl || this.defaultTtl);
    } catch {
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.enabled) return false;
    try {
      return await this.cache.del(key);
    } catch {
      return false;
    }
  }

  async clear(pattern?: string): Promise<number> {
    if (!this.enabled) return 0;
    try {
      return await this.cache.clear(pattern);
    } catch {
      return 0;
    }
  }

  async has(key: string): Promise<boolean> {
    if (!this.enabled) return false;
    try {
      return await this.cache.has(key);
    } catch {
      return false;
    }
  }

  async mget<T = unknown>(keys: string[]): Promise<Map<string, T>> {
    if (!this.enabled) return new Map();
    try {
      return await this.cache.mget<T>(keys);
    } catch {
      return new Map();
    }
  }

  async mset<T = unknown>(
    entries: Map<string, T>,
    ttl?: number,
  ): Promise<void> {
    if (!this.enabled) return;
    try {
      await this.cache.mset(entries, ttl || this.defaultTtl);
    } catch {
    }
  }

  async stats(): Promise<{
    hits: number;
    misses: number;
    keys: number;
  } | null> {
    if (!this.enabled) return null;
    try {
      return await this.cache.stats();
    } catch {
      return null;
    }
  }
}
