import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import {
  ModuleConfig,
  ModuleRouteCacheConfig,
  ModuleRouteConfig,
  normalizeRouteCache,
} from '../config/module-config.types';

export type ResolvedRouteCache = {
  module: string;
  action: string;
  route: ModuleRouteConfig;
  cache: ModuleRouteCacheConfig;
};

export class CacheConfigService {
  private static instance: CacheConfigService;
  private modules: ModuleConfig[] = [];
  private loaded = false;

  private constructor() {}

  static getInstance(): CacheConfigService {
    if (!CacheConfigService.instance) {
      CacheConfigService.instance = new CacheConfigService();
    }
    return CacheConfigService.instance;
  }

  reload(): void {
    this.loaded = false;
    this.modules = [];
    this.ensureLoaded();
  }

  isCacheEnabled(functionName: string): { enabled: boolean; ttl?: number } {
    this.ensureLoaded();
    for (const module of this.modules) {
      const route = module.routes?.find(
        (item) =>
          item.action === functionName ||
          item.action.toLowerCase() === functionName.toLowerCase(),
      );
      const cache = normalizeRouteCache(route?.cache, route?.ttl);
      if (cache) return cache;
    }
    return { enabled: false };
  }

  resolveByHttp(input: {
    method: string;
    path: string;
    action?: string;
  }): ResolvedRouteCache | null {
    this.ensureLoaded();
    const method = input.method.toUpperCase();
    const requestPath = normalizePath(input.path);

    for (const module of this.modules) {
      const prefix = normalizePath(module.prefix || '');
      if (prefix && !requestPath.startsWith(prefix)) {
        continue;
      }

      for (const route of module.routes || []) {
        if (route.method.toUpperCase() !== method) continue;

        const fullRoutePath = joinPaths(prefix, route.path);
        if (!pathMatches(fullRoutePath, requestPath)) continue;

        if (
          input.action &&
          route.action !== input.action &&
          route.action.toLowerCase() !== input.action.toLowerCase()
        ) {
          continue;
        }

        return {
          module: module.name,
          action: route.action,
          route,
          cache:
            normalizeRouteCache(route.cache, route.ttl) ?? { enabled: false },
        };
      }
    }

    if (input.action) {
      for (const module of this.modules) {
        const route = (module.routes || []).find(
          (item) => item.action === input.action,
        );
        if (!route) continue;
        return {
          module: module.name,
          action: route.action,
          route,
          cache:
            normalizeRouteCache(route.cache, route.ttl) ?? { enabled: false },
        };
      }
    }

    return null;
  }

  resolveModuleByPath(requestPath: string): string | null {
    this.ensureLoaded();
    const normalized = normalizePath(requestPath);
    let best: { name: string; len: number } | null = null;
    for (const module of this.modules) {
      const prefix = normalizePath(module.prefix || '');
      if (!prefix) continue;
      if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
        if (!best || prefix.length > best.len) {
          best = { name: module.name, len: prefix.length };
        }
      }
    }
    return best?.name ?? null;
  }

  listModules(): Array<{
    name: string;
    prefix: string;
    cachedActions: string[];
  }> {
    this.ensureLoaded();
    return this.modules.map((module) => ({
      name: module.name,
      prefix: module.prefix,
      cachedActions: (module.routes || [])
        .filter((route) => normalizeRouteCache(route.cache, route.ttl)?.enabled)
        .map((route) => route.action),
    }));
  }

  private ensureLoaded(): void {
    if (this.loaded) return;
    this.modules = this.findModuleConfigs();
    this.loaded = true;
  }

  private findModuleConfigs(): ModuleConfig[] {
    const roots = [
      path.join(process.cwd(), 'src'),
      path.join(process.cwd(), 'dist'),
    ];
    const configs: ModuleConfig[] = [];
    const seen = new Set<string>();

    const searchDir = (dir: string) => {
      let entries: fs.Dirent[];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          searchDir(fullPath);
          continue;
        }
        if (entry.name !== 'module.yml' && entry.name !== 'module.yaml') {
          continue;
        }
        try {
          const parsed = yaml.load(
            fs.readFileSync(fullPath, 'utf8'),
          ) as ModuleConfig;
          if (!parsed?.name || seen.has(parsed.name)) continue;
          seen.add(parsed.name);
          configs.push(parsed);
        } catch {
        }
      }
    };

    for (const root of roots) {
      searchDir(root);
    }
    return configs;
  }
}

function normalizePath(value: string): string {
  if (!value) return '/';
  const withoutQuery = value.split('?')[0] || '/';
  const withSlash = withoutQuery.startsWith('/')
    ? withoutQuery
    : `/${withoutQuery}`;
  return withSlash.replace(/\/+$/, '') || '/';
}

function joinPaths(prefix: string, routePath: string): string {
  const left = normalizePath(prefix);
  const right = routePath === '/' ? '' : routePath.replace(/^\//, '');
  if (!right) return left;
  return normalizePath(`${left}/${right}`);
}

function pathMatches(routePath: string, requestPath: string): boolean {
  const routeParts = normalizePath(routePath).split('/').filter(Boolean);
  const requestParts = normalizePath(requestPath).split('/').filter(Boolean);
  if (routeParts.length !== requestParts.length) return false;
  return routeParts.every((part, index) => {
    if (part.startsWith(':')) return true;
    return part === requestParts[index];
  });
}

export function fingerprintRequest(parts: {
  method: string;
  path: string;
  query: Record<string, unknown>;
  params: Record<string, unknown>;
}): string {
  return createHash('sha1')
    .update(
      JSON.stringify({
        method: parts.method.toUpperCase(),
        path: normalizePath(parts.path),
        query: parts.query,
        params: parts.params,
      }),
    )
    .digest('hex')
    .slice(0, 16);
}
