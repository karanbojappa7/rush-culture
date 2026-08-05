import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CacheConfigService } from '../caching/cache-config.service';
import { ClientDeviceService } from '../device/client-device.service';
import { RequestWithDevice } from '../device/device-tracking.middleware';
import {
  buildDeviceFingerprint,
  extractClientIp,
  parseUserAgent,
} from '../utility/client-device.utility';
import { RateLimitStore } from './rate-limit.store';

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX = 180;

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly clientDeviceService: ClientDeviceService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const req = http.getRequest<RequestWithDevice>();
    const method = (req.method || 'GET').toUpperCase();
    const requestPath = (req.originalUrl || req.url || req.path || '').split(
      '?',
    )[0];

    if (
      requestPath === '/api/health' ||
      requestPath.startsWith('/api/health/') ||
      requestPath === '/api/crypto/public-key'
    ) {
      return true;
    }

    const configService = CacheConfigService.getInstance();
    const moduleName =
      configService.resolveModuleByPath(requestPath) || 'app';
    const moduleConfig = configService.getModule(moduleName);
    const windowMs =
      moduleConfig?.security?.rate_limit?.window_ms ?? DEFAULT_WINDOW_MS;
    const max = moduleConfig?.security?.rate_limit?.max ?? DEFAULT_MAX;

    const ip =
      req.clientIp ||
      extractClientIp(
        req.headers as Record<string, unknown>,
        req.ip || '0.0.0.0',
      );
    const fingerprint =
      req.clientFingerprint ||
      buildDeviceFingerprint(ip, req.headers['user-agent'] || '');
    const key = `${moduleName}:${fingerprint}`;
    const result = await RateLimitStore.getInstance().hit(key, windowMs, max);

    if (!result.limited) {
      return true;
    }

    const userAgent = req.headers['user-agent'] || '';
    const parsed = parseUserAgent(userAgent);
    this.clientDeviceService.track({
      fingerprint,
      ip,
      userAgent,
      deviceType: parsed.deviceType,
      os: parsed.os,
      browser: parsed.browser,
      path: requestPath,
      method,
      blocked: true,
    });

    throw new HttpException(
      {
        status_code: 429,
        message: 'Too many requests. Please try again shortly.',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
