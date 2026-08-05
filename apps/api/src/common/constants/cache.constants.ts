export const CACHE_TYPES = {
  MEMORY: 'memory',
  REDIS: 'redis',
  DRAGON_FLY: 'dragonfly',
} as const;

export type CacheType = (typeof CACHE_TYPES)[keyof typeof CACHE_TYPES];

export const CACHE_KEY_PREFIX = 'rc';
export const CACHE_KEY_SEPARATOR = ':';
export const DEFAULT_CACHE_TTL = 300;

export const WRITE_HTTP_METHODS = new Set([
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
]);
