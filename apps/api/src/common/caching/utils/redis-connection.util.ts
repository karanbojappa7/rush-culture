import Redis, { RedisOptions } from 'ioredis';

export type RedisConnectionSource = 'cache' | 'import_queue';

export type RedisConnectionConfig = {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  source: RedisConnectionSource;
};

function parsePort(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseDb(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getCacheRedisOptions(): RedisConnectionConfig {
  if (process.env.CACHE_URL) {
    return {
      url: process.env.CACHE_URL,
      source: 'cache',
    };
  }

  return {
    host: process.env.CACHE_HOST || 'localhost',
    port: parsePort(process.env.CACHE_PORT, 6379),
    password: process.env.CACHE_PASSWORD || undefined,
    db: parseDb(process.env.CACHE_DB, 0),
    source: 'cache',
  };
}

export function getQueueRedisOptions(): RedisConnectionConfig {
  if (process.env.IMPORT_QUEUE_URL) {
    return {
      url: process.env.IMPORT_QUEUE_URL,
      source: 'import_queue',
    };
  }

  return getCacheRedisOptions();
}

export function createCacheRedisClient(
  config: RedisConnectionConfig = getCacheRedisOptions(),
): Redis {
  if (config.url) {
    return new Redis(config.url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
    });
  }

  return new Redis({
    host: config.host || 'localhost',
    port: config.port || 6379,
    password: config.password,
    db: config.db || 0,
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => Math.min(times * 50, 2000),
  });
}

export function createBullmqConnection(
  config: RedisConnectionConfig = getQueueRedisOptions(),
): Redis | RedisOptions {
  if (config.url) {
    return new Redis(config.url, {
      maxRetriesPerRequest: null,
    });
  }

  return {
    host: config.host || 'localhost',
    port: config.port || 6379,
    password: config.password,
    db: config.db || 0,
    maxRetriesPerRequest: null,
  };
}

export function describeRedisConnection(config: RedisConnectionConfig): string {
  if (config.url) {
    return `source=${config.source} url=${config.url}`;
  }
  const hasPassword = config.password ? 'yes' : 'no';
  return `source=${config.source} host=${config.host}:${config.port} db=${config.db ?? 0} password=${hasPassword}`;
}
