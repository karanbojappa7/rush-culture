export type ModuleRouteConfig = {
  method: string;
  path: string;
  action: string;
  auth?: boolean;
  roles?: string[];
  query?: string[];
  skip_encryption?: boolean;
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
