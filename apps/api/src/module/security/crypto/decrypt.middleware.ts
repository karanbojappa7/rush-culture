import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { CryptoService } from './crypto.service';
import {
  ENCRYPTION_HEADER,
  ENCRYPTION_SKIP_PATHS,
  isEncryptedEnvelope,
} from './crypto.types';

export type RequestWithSession = Request & {
  encSessionKey?: Buffer;
};

@Injectable()
export class DecryptMiddleware implements NestMiddleware {
  constructor(private readonly crypto: CryptoService) {}

  use(req: RequestWithSession, _res: Response, next: NextFunction) {
    if (!this.crypto.enabled) {
      return next();
    }

    const requestPath = (req.originalUrl || req.url || req.path || '').split('?')[0];
    if (
      ENCRYPTION_SKIP_PATHS.some(
        (skip) => requestPath === skip || requestPath.endsWith(skip),
      )
    ) {
      return next();
    }

    try {
      const headerKey = req.header(ENCRYPTION_HEADER);
      if (headerKey) {
        req.encSessionKey = this.crypto.unwrapAesKey(headerKey);
      }

      if (isEncryptedEnvelope(req.body)) {
        const aesKey = this.crypto.unwrapAesKey(req.body.ek);
        req.encSessionKey = aesKey;
        req.body = this.crypto.decryptJson(req.body, aesKey);
      } else if (
        ['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase()) &&
        req.body &&
        Object.keys(req.body as object).length > 0
      ) {
        return next(
          new BadRequestException(
            'Encrypted envelope required when ENABLE_ENCRYPTION=true',
          ),
        );
      }

      if (!req.encSessionKey && req.method.toUpperCase() === 'GET') {
        return next(
          new BadRequestException(
            `${ENCRYPTION_HEADER} header required when ENABLE_ENCRYPTION=true`,
          ),
        );
      }

      return next();
    } catch (error) {
      return next(
        new BadRequestException(
          error instanceof Error ? error.message : 'Decryption failed',
        ),
      );
    }
  }
}
