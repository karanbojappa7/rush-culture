import { GlobalContext } from '../../context/global-context';
import { CacheHandler } from '../cache.handler';
import { CacheConfigService } from '../cache-config.service';
import { CacheKeyBuilder } from './cache-key.builder';

export class CacheUtils {
  private static getUserIdForCache(): string | null {
    try {
      const user = GlobalContext.getUser();
      return user?.id ? String(user.id) : null;
    } catch {
      return null;
    }
  }

  static buildCacheKey(
    module: string,
    action: string,
    payload?: unknown,
  ): string {
    return CacheKeyBuilder.build({
      module,
      action,
      userId: this.getUserIdForCache() || undefined,
      variant: payload ? CacheKeyBuilder.hashPayload(payload) : undefined,
    });
  }

  static async getCachedResult<T>(
    funcName: string,
    payload: unknown,
    module = 'app',
  ): Promise<T | null> {
    const cache = CacheHandler.getInstance();
    const cacheConfig = CacheConfigService.getInstance();
    const cacheSettings = cacheConfig.isCacheEnabled(funcName);
    if (!(cache.isEnabled() && cacheSettings.enabled)) {
      return null;
    }
    return cache.get<T>(this.buildCacheKey(module, funcName, payload));
  }

  static async setCachedResult<T>(
    funcName: string,
    payload: unknown,
    result: T,
    module = 'app',
  ): Promise<void> {
    const cache = CacheHandler.getInstance();
    const cacheConfig = CacheConfigService.getInstance();
    const cacheSettings = cacheConfig.isCacheEnabled(funcName);
    if (!(cache.isEnabled() && cacheSettings.enabled)) {
      return;
    }
    const ttl = cacheSettings.ttl || cache.getDefaultTtl();
    await cache.set(
      this.buildCacheKey(module, funcName, payload),
      result,
      ttl,
    );
  }

  static async clearModuleCache(module: string): Promise<number> {
    const cache = CacheHandler.getInstance();
    return cache.clear(CacheKeyBuilder.modulePattern(module));
  }

  static async clearCache(
    funcName: string,
    module = 'app',
  ): Promise<number> {
    const cache = CacheHandler.getInstance();
    return cache.clear(CacheKeyBuilder.buildPattern(module, funcName));
  }

  static async clearUserCache(): Promise<number> {
    const cache = CacheHandler.getInstance();
    const userId = this.getUserIdForCache();
    if (!userId) return 0;
    return cache.clear(`*:${userId}:*`);
  }
}
