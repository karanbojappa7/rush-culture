import { createHash } from 'crypto';
import {
  CACHE_KEY_PREFIX,
  CACHE_KEY_SEPARATOR,
} from '../../constants/cache.constants';

export type CacheKeyOptions = {
  module: string;
  action: string;
  userId?: string | bigint;
  variant?: string;
};

export class CacheKeyBuilder {
  static hashPayload(payload: unknown): string {
    return createHash('sha1')
      .update(JSON.stringify(stableSerialize(payload)))
      .digest('hex')
      .slice(0, 16);
  }

  static build(options: CacheKeyOptions): string {
    const parts = [
      CACHE_KEY_PREFIX,
      options.module,
      options.action,
      options.userId != null ? String(options.userId) : 'anonymous',
    ];
    if (options.variant) {
      parts.push(options.variant);
    }
    return parts.join(CACHE_KEY_SEPARATOR);
  }

  static buildPattern(module: string, action = '*'): string {
    return [CACHE_KEY_PREFIX, module, action, '*'].join(CACHE_KEY_SEPARATOR);
  }

  static modulePattern(module: string): string {
    return [CACHE_KEY_PREFIX, module, '*'].join(CACHE_KEY_SEPARATOR);
  }
}

function stableSerialize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableSerialize);
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(
      ([a], [b]) => a.localeCompare(b),
    );
    return Object.fromEntries(
      entries.map(([key, entry]) => [key, stableSerialize(entry)]),
    );
  }
  return value;
}
