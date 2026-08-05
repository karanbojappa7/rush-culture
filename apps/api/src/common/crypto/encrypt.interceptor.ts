import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { CryptoService } from './crypto.service';
import {
  ENCRYPTION_SKIP_PATHS,
  isEncryptedResponseBody,
} from './crypto.types';
import { RequestWithSession } from './decrypt.middleware';

@Injectable()
export class EncryptInterceptor implements NestInterceptor {
  constructor(private readonly crypto: CryptoService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!this.crypto.enabled) {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<RequestWithSession>();
    const requestPath = (req.originalUrl || req.url || req.path || '').split(
      '?',
    )[0];
    if (
      ENCRYPTION_SKIP_PATHS.some(
        (skip) =>
          requestPath === skip ||
          requestPath.endsWith(skip) ||
          requestPath.startsWith(`${skip}/`),
      )
    ) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        const key = req.encSessionKey;
        if (!key || isEncryptedResponseBody(data)) return data;
        return this.crypto.encryptJson(data, key);
      }),
    );
  }
}
