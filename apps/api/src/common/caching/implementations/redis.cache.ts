import Redis from 'ioredis';
import {
  openCachePayload,
  sealCachePayload,
} from '../../crypto/token-seal';
import { ICache } from '../cache.interface';
import {
  createCacheRedisClient,
  RedisConnectionConfig,
} from '../utils/redis-connection.util';

export class RedisCache implements ICache {
  private client: Redis;
  private isConnected = false;

  constructor(config: {
    url?: string;
    host?: string;
    port?: number;
    password?: string;
    db?: number;
  }) {
    const connection: RedisConnectionConfig = {
      url: config.url,
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db,
      source: 'cache',
    };
    this.client = createCacheRedisClient(connection);

    this.client.on('connect', () => {
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      this.isConnected = true;
    });

    this.client.on('error', () => {
      this.isConnected = false;
    });

    this.client.on('close', () => {
      this.isConnected = false;
    });
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      const plain = openCachePayload(value);
      if (!plain) return null;
      return JSON.parse(plain) as T;
    } catch {
      return null;
    }
  }

  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const sealed = sealCachePayload(JSON.stringify(value));
      if (ttl) {
        await this.client.setex(key, ttl, sealed);
      } else {
        await this.client.set(key, sealed);
      }
    } catch {
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch {
      return false;
    }
  }

  async clear(pattern?: string): Promise<number> {
    try {
      if (!pattern) {
        await this.client.flushdb();
        return 0;
      }

      const keys: string[] = [];
      let cursor = '0';

      do {
        const [newCursor, foundKeys] = await this.client.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100,
        );
        cursor = newCursor;
        keys.push(...foundKeys);
      } while (cursor !== '0');

      if (keys.length === 0) return 0;

      const pipeline = this.client.pipeline();
      keys.forEach((key) => pipeline.del(key));
      await pipeline.exec();
      return keys.length;
    } catch {
      return 0;
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      return (await this.client.exists(key)) === 1;
    } catch {
      return false;
    }
  }

  async mget<T = unknown>(keys: string[]): Promise<Map<string, T>> {
    try {
      if (keys.length === 0) return new Map();
      const values = await this.client.mget(...keys);
      const result = new Map<string, T>();
      keys.forEach((key, index) => {
        const value = values[index];
        if (!value) return;
        try {
          const plain = openCachePayload(value);
          if (!plain) return;
          result.set(key, JSON.parse(plain) as T);
        } catch {
        }
      });
      return result;
    } catch {
      return new Map();
    }
  }

  async mset<T = unknown>(
    entries: Map<string, T>,
    ttl?: number,
  ): Promise<void> {
    try {
      if (entries.size === 0) return;
      const pipeline = this.client.pipeline();
      for (const [key, value] of entries) {
        const sealed = sealCachePayload(JSON.stringify(value));
        if (ttl) {
          pipeline.setex(key, ttl, sealed);
        } else {
          pipeline.set(key, sealed);
        }
      }
      await pipeline.exec();
    } catch {
    }
  }

  async stats(): Promise<{
    hits: number;
    misses: number;
    keys: number;
  } | null> {
    try {
      const info = await this.client.info('stats');
      const dbsize = await this.client.dbsize();
      const hitsMatch = info.match(/keyspace_hits:(\d+)/);
      const missesMatch = info.match(/keyspace_misses:(\d+)/);
      return {
        hits: hitsMatch ? parseInt(hitsMatch[1], 10) : 0,
        misses: missesMatch ? parseInt(missesMatch[1], 10) : 0,
        keys: dbsize,
      };
    } catch {
      return null;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}
