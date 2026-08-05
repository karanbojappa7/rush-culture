import { Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  createCacheRedisClient,
  describeRedisConnection,
  getCacheRedisOptions,
} from '../caching/utils/redis-connection.util';
import { CacheHandler } from '../caching/cache.handler';
import { CACHE_TYPES } from '../constants/cache.constants';

export type CheckStatus = 'up' | 'down' | 'skipped';

export type ComponentCheck = {
  status: CheckStatus;
  latencyMs?: number;
  detail?: string;
  error?: string;
};

export type HealthReport = {
  status: 'ok' | 'degraded' | 'error';
  uptimeSec: number;
  timestamp: string;
  checks: {
    api: ComponentCheck;
    postgres: ComponentCheck;
    redis: ComponentCheck;
    cache: ComponentCheck;
    encryption: ComponentCheck;
  };
};

const REQUIRED_SCHEMAS = [
  'public',
  'master',
  'core',
  'meta',
  'security',
] as const;

@Injectable()
export class HealthService extends BaseService {
  private readonly startedAt = Date.now();

  constructor(private readonly prisma: PrismaService) {
    super(HealthService.name);
  }

  async check(): Promise<HealthReport> {
    const [postgres, redis, cache, encryption] = await Promise.all([
      this.checkPostgres(),
      this.checkRedis(),
      this.checkCache(),
      this.checkEncryption(),
    ]);

    const api: ComponentCheck = {
      status: 'up',
      latencyMs: 0,
      detail: 'Nest process responding',
    };

    const checks = { api, postgres, redis, cache, encryption };
    const status = this.aggregateStatus(checks);

    return {
      status,
      uptimeSec: Math.floor((Date.now() - this.startedAt) / 1000),
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  async live(): Promise<{ status: 'ok'; uptimeSec: number }> {
    return {
      status: 'ok',
      uptimeSec: Math.floor((Date.now() - this.startedAt) / 1000),
    };
  }

  private aggregateStatus(
    checks: HealthReport['checks'],
  ): HealthReport['status'] {
    if (checks.postgres.status === 'down') return 'error';
    if (
      checks.redis.status === 'down' ||
      checks.cache.status === 'down' ||
      checks.encryption.status === 'down'
    ) {
      return 'degraded';
    }
    return 'ok';
  }

  private async checkPostgres(): Promise<ComponentCheck> {
    const started = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const rows = await this.prisma.$queryRaw<Array<{ name: string }>>`
        SELECT nspname AS name
        FROM pg_namespace
        WHERE nspname IN ('master', 'core', 'meta', 'security')
        ORDER BY nspname
      `;
      const found = new Set(rows.map((row) => row.name));
      const missing = REQUIRED_SCHEMAS.filter((name) => !found.has(name));
      if (missing.length) {
        return {
          status: 'down',
          latencyMs: Date.now() - started,
          error: `Missing schemas: ${missing.join(', ')}`,
        };
      }
      return {
        status: 'up',
        latencyMs: Date.now() - started,
        detail: `Connected; schemas ${REQUIRED_SCHEMAS.join(', ')}`,
      };
    } catch (error) {
      return {
        status: 'down',
        latencyMs: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async checkRedis(): Promise<ComponentCheck> {
    const options = getCacheRedisOptions();
    const started = Date.now();
    const client = createCacheRedisClient(options);
    try {
      const pong = await Promise.race([
        client.ping(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Redis ping timed out')), 2000);
        }),
      ]);
      return {
        status: 'up',
        latencyMs: Date.now() - started,
        detail: `${describeRedisConnection(options)}; ping=${pong}`,
      };
    } catch (error) {
      return {
        status: 'down',
        latencyMs: Date.now() - started,
        detail: describeRedisConnection(options),
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      client.disconnect();
    }
  }

  private async checkCache(): Promise<ComponentCheck> {
    const enabled = process.env.ENABLE_CACHING === 'true';
    const type = (process.env.CACHE_TYPE || CACHE_TYPES.REDIS).toLowerCase();

    if (!enabled) {
      return {
        status: 'skipped',
        detail: 'ENABLE_CACHING is false',
      };
    }

    const started = Date.now();
    try {
      const cache = CacheHandler.getInstance();
      if (!cache.isEnabled()) {
        return {
          status: 'down',
          latencyMs: Date.now() - started,
          error: 'Cache handler reports disabled',
        };
      }

      const probeKey = `rc:health:probe:${Date.now()}`;
      await cache.set(probeKey, { ok: true }, 5);
      const value = await cache.get<{ ok: boolean }>(probeKey);
      await cache.del(probeKey);

      if (!value?.ok) {
        return {
          status: 'down',
          latencyMs: Date.now() - started,
          detail: `type=${type}`,
          error: 'Cache round-trip failed',
        };
      }

      return {
        status: 'up',
        latencyMs: Date.now() - started,
        detail: `type=${type}; write/read ok`,
      };
    } catch (error) {
      return {
        status: 'down',
        latencyMs: Date.now() - started,
        detail: `type=${type}`,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async checkEncryption(): Promise<ComponentCheck> {
    const enabled = process.env.ENABLE_ENCRYPTION === 'true';
    if (!enabled) {
      return {
        status: 'skipped',
        detail: 'ENABLE_ENCRYPTION is false',
      };
    }

    const hasPrivate = Boolean(process.env.ENCRYPTION_PRIVATE_KEY_B64);
    const hasPublic = Boolean(process.env.ENCRYPTION_PUBLIC_KEY_B64);
    if (!hasPrivate || !hasPublic) {
      return {
        status: 'down',
        error: 'Encryption enabled but key env vars are missing',
      };
    }

    return {
      status: 'up',
      detail: 'Encryption keys configured',
    };
  }
}
