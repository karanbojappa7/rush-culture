import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { CACHE_KEY_PREFIX } from '../constants/cache.constants';
import { CacheConfigService } from './cache-config.service';
import { CacheHandler } from './cache.handler';
import { CacheKeyBuilder } from './utils/cache-key.builder';
import { CacheUtils } from './utils/cache.utils';

@Injectable()
export class CacheAdminService extends BaseService {
  constructor() {
    super(CacheAdminService.name);
  }

  status() {
    const cache = CacheHandler.getInstance();
    const services = CacheConfigService.getInstance().listModules();
    return {
      enabled: cache.isEnabled(),
      type: process.env.CACHE_TYPE || 'redis',
      defaultTtl: cache.getDefaultTtl(),
      prefix: CACHE_KEY_PREFIX,
      services,
    };
  }

  async flushAll() {
    this.assertEnabled();
    const deleted = await CacheHandler.getInstance().clear(
      `${CACHE_KEY_PREFIX}:*`,
    );
    return {
      scope: 'all',
      pattern: `${CACHE_KEY_PREFIX}:*`,
      deleted,
    };
  }

  async flushService(service: string) {
    this.assertEnabled();
    const name = service.trim().toLowerCase();
    if (!name) {
      throw new BadRequestException('Service name is required');
    }

    const known = CacheConfigService.getInstance()
      .listModules()
      .map((item) => item.name.toLowerCase());
    if (known.length && !known.includes(name)) {
      throw new BadRequestException(
        `Unknown service "${service}". Known: ${known.join(', ')}`,
      );
    }

    const deleted = await CacheUtils.clearModuleCache(name);
    return {
      scope: 'service',
      service: name,
      pattern: CacheKeyBuilder.modulePattern(name),
      deleted,
    };
  }

  private assertEnabled() {
    if (!CacheHandler.getInstance().isEnabled()) {
      throw new ServiceUnavailableException(
        'Caching is disabled (ENABLE_CACHING=false)',
      );
    }
  }
}
