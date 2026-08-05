import { Controller, Get } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { ResponseBuilder } from '../response/response.builder';

@Controller('api/crypto')
export class CryptoController {
  constructor(
    private readonly crypto: CryptoService,
    private readonly responseBuilder: ResponseBuilder,
  ) {}

  @Get('public-key')
  publicKey() {
    if (!this.crypto.enabled) {
      return this.responseBuilder.success('Encryption disabled', {
        enabled: false,
      });
    }
    return this.responseBuilder.success('Public key', {
      enabled: true,
      algorithm: 'RSA-OAEP-SHA256+AES-256-GCM',
      publicKey: this.crypto.getPublicKeySpkiBase64(),
    });
  }
}
