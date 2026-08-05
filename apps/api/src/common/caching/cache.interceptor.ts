import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Optional,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { WRITE_HTTP_METHODS } from '../constants/cache.constants';
import { CryptoService } from '../../module/security/crypto/crypto.service';
import { isEncryptedResponseBody } from '../../module/security/crypto/crypto.types';
import { ResponseVm } from '../response/response.vm';
import { CacheHandler } from './cache.handler';
import {
  CacheConfigService,
  fingerprintRequest,
} from './cache-config.service';
import { CacheKeyBuilder } from './utils/cache-key.builder';
import { CacheUtils } from './utils/cache.utils';

type AuthedRequest = Request & {
  user?: { id?: string };
  encSessionKey?: Buffer;
};

const WRITE_INVALIDATE_LINKS: Record<string, string[]> = {
  access: ['role', 'user', 'auth'],
  role: ['access', 'user', 'auth'],
  user: ['access', 'role', 'auth'],
  product: ['category'],
  category: ['product'],
};

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(@Optional() private readonly crypto?: CryptoService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const cache = CacheHandler.getInstance();
    if (!cache.isEnabled()) {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<AuthedRequest>();
    const method = (req.method || 'GET').toUpperCase();
    const requestPath = (req.originalUrl || req.url || req.path || '').split(
      '?',
    )[0];
    const isWrite = WRITE_HTTP_METHODS.has(method);

    if (isInfraPath(requestPath)) {
      return next.handle();
    }

    if (isWrite && isAuthSessionWrite(requestPath)) {
      return next.handle().pipe(
        switchMap(async (body) => {
          if (this.asSuccessVm(body, req)) {
            await CacheUtils.clearModuleCache('auth');
          }
          return body;
        }),
      );
    }

    if (requestPath === '/api/auth/login' || requestPath === '/api/auth/logout') {
      return next.handle();
    }

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

    if (isWrite) {
      return next.handle().pipe(
        switchMap(async (body) => {
          if (!this.asSuccessVm(body, req)) {
            return body;
          }
          await invalidateModuleCaches(moduleName);
          return body;
        }),
      );
    }

    if (resolved?.cache.enabled !== true) {
      return next.handle();
    }

    const userId = resolveUserScopeId(moduleName, req);
    if (moduleName === 'auth' && !userId) {
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
      userId,
      variant,
    });
    const ttl = resolved.cache.ttl || cache.getDefaultTtl();

    return from(cache.get<ResponseVm>(cacheKey)).pipe(
      switchMap((cached) => {
        if (cached && isSuccessResponse(cached)) {
          return of(cached);
        }

        return next.handle().pipe(
          switchMap(async (body) => {
            const plain = this.asSuccessVm(body, req);
            if (plain) {
              await cache.set(cacheKey, plain, ttl);
            }
            return body;
          }),
        );
      }),
    );
  }

  private asSuccessVm(
    body: unknown,
    req: AuthedRequest,
  ): ResponseVm | null {
    if (isSuccessResponse(body)) return body;
    if (
      !this.crypto?.enabled ||
      !req.encSessionKey ||
      !isEncryptedResponseBody(body)
    ) {
      return null;
    }
    try {
      const plain = this.crypto.decryptJson(body, req.encSessionKey);
      return isSuccessResponse(plain) ? plain : null;
    } catch {
      return null;
    }
  }
}

function isInfraPath(requestPath: string): boolean {
  return (
    requestPath === '/api/cache' ||
    requestPath.startsWith('/api/cache/') ||
    requestPath === '/api/health' ||
    requestPath.startsWith('/api/health/')
  );
}

function isAuthSessionWrite(requestPath: string): boolean {
  return (
    requestPath === '/api/auth/login' || requestPath === '/api/auth/logout'
  );
}

function resolveUserScopeId(
  moduleName: string,
  req: AuthedRequest,
): string | undefined {
  if (moduleName !== 'auth') return undefined;
  const id = req.user?.id;
  return id != null ? String(id) : undefined;
}

async function invalidateModuleCaches(moduleName: string): Promise<void> {
  const modules = new Set<string>([moduleName]);
  for (const linked of WRITE_INVALIDATE_LINKS[moduleName] || []) {
    modules.add(linked);
  }
  await Promise.all(
    [...modules].map((name) => CacheUtils.clearModuleCache(name)),
  );
}

function isSuccessResponse(body: unknown): body is ResponseVm {
  return (
    !!body &&
    typeof body === 'object' &&
    'status_code' in body &&
    (body as ResponseVm).status_code === 200
  );
}
