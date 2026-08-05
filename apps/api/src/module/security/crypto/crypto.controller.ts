import { Controller, Get, Header } from '@nestjs/common';
import { BaseController } from '../../../common/base/base.controller';
import { ResponseBuilder } from '../../../common/response/response.builder';
import { ResponseVm } from '../../../common/response/response.vm';
import { CryptoService } from './crypto.service';

@Controller('api/crypto')
export class CryptoController extends BaseController {
  constructor(
    private readonly crypto: CryptoService,
    responseBuilder: ResponseBuilder,
  ) {
    super(CryptoController.name, responseBuilder);
  }

  @Get('public-key')
  @Header('Cache-Control', 'public, max-age=86400')
  publicKey(): Promise<ResponseVm> {
    return this.executeMethod(
      async () => {
        if (!this.crypto.enabled) {
          return { enabled: false as const };
        }
        return {
          enabled: true as const,
          algorithm: 'RSA-OAEP-SHA256+AES-256-GCM',
          publicKey: this.crypto.getPublicKeySpkiBase64(),
        };
      },
      undefined as never,
      'Crypto public key',
    );
  }
}
