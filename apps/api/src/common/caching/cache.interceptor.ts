import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, from, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { WRITE_HTTP_METHODS } from '../constants/cache.constants';
import { ResponseVm } from '../response/response.vm';
import { CacheHandler } from './cache.handler';
import {
  CacheConfigService,
  fingerprintRequest,
} from './cache-config.service';
import { CacheKeyBuilder } from './utils/cache-key.builder';
import { CacheUtils } from './utils/cache.utils';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const cache = CacheHandler.getInstance();
    if (!cache.isEnabled()) {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const method = (req.method || 'GET').toUpperCase();
    const requestPath = (req.originalUrl || req.url || req.path || '').split(
      '?',
    )[0];
    const action = context.getHandler().name;
    const configService = CacheConfigService.getInstance();
    const resolved = configService.resolveByHttp({
      method,
      path: requestPath,
      action,
    });
    const moduleName =
      resolved?.module ||
      configService.resolveModuleByPath(requestPath) ||
      'app';
    const isWrite = WRITE_HTTP_METHODS.has(method);

    if (isWrite) {
      return next.handle().pipe(
        tap((body) => {
          if (!isSuccessResponse(body)) return;
          void CacheUtils.clearModuleCache(moduleName);
        }),
      );
    }

    if (resolved?.cache.enabled !== true) {
      return next.handle();
    }

    const variant = fingerprintRequest({
      method,
      path: requestPath,
      query: (req.query || {}) as Record<string, unknown>,
      params: (req.params || {}) as Record<string, unknown>,
    });
    const cacheKey = CacheKeyBuilder.build({
      module: moduleName,
      action: resolved.action || action,
      variant,
    });
    const ttl = resolved.cache.ttl || cache.getDefaultTtl();

    return from(cache.get<ResponseVm>(cacheKey)).pipe(
      switchMap((cached) => {
        if (cached) {
          return of(cached);
        }

        return next.handle().pipe(
          tap((body) => {
            if (!isSuccessResponse(body)) return;
            void cache.set(cacheKey, body, ttl);
          }),
        );
      }),
    );
  }
}

function isSuccessResponse(body: unknown): body is ResponseVm {
  return (
    !!body &&
    typeof body === 'object' &&
    'status_code' in body &&
    (body as ResponseVm).status_code === 200
  );
}
