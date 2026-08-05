export type ModuleRouteCacheConfig = {
  enabled: boolean;
  ttl?: number;
};

export type ModuleRouteCacheFlag = boolean | ModuleRouteCacheConfig;

export type ModuleRouteConfig = {
  method: string;
  path: string;
  action: string;
  auth?: boolean;
  roles?: string[];
  query?: string[];
  skip_encryption?: boolean;
  cache?: ModuleRouteCacheFlag;
  ttl?: number;
};

export type ModuleSecurityConfig = {
  encrypt?: boolean;
  idempotency?: boolean;
  algorithm?: string;
  env_flag?: string;
  require_keys?: string[];
  rate_limit?: {
    window_ms: number;
    max: number;
  };
};

export type ModuleConfig = {
  name: string;
  version: string;
  enabled: boolean;
  prefix: string;
  description?: string;
  routes: ModuleRouteConfig[];
  security?: ModuleSecurityConfig;
  features?: Record<string, unknown>;
};

export const MODULE_CONFIG = Symbol('MODULE_CONFIG');

export function normalizeRouteCache(
  cache?: ModuleRouteCacheFlag,
  ttlFallback?: number,
): ModuleRouteCacheConfig | null {
  if (cache === undefined || cache === null) {
    return null;
  }
  if (typeof cache === 'boolean') {
    return {
      enabled: cache,
      ...(ttlFallback !== undefined ? { ttl: ttlFallback } : {}),
    };
  }
  return {
    enabled: Boolean(cache.enabled),
    ttl: cache.ttl ?? ttlFallback,
  };
}
