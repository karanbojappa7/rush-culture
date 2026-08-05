import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  constants,
  createCipheriv,
  createDecipheriv,
  createPrivateKey,
  createPublicKey,
  privateDecrypt,
  publicEncrypt,
  randomBytes,
  KeyObject,
} from 'crypto';
import { BaseService } from '../../../common/base/base.service';
import {
  EncryptedEnvelope,
  EncryptedResponse,
} from './crypto.types';

@Injectable()
export class CryptoService extends BaseService implements OnModuleInit {
  private privateKey!: KeyObject;
  private publicKey!: KeyObject;
  private publicKeyPem!: string;

  constructor() {
    super(CryptoService.name);
  }

  get enabled() {
    return process.env.ENABLE_ENCRYPTION === 'true';
  }

  onModuleInit() {
    if (!this.enabled) return;

    const privB64 = process.env.ENCRYPTION_PRIVATE_KEY_B64;
    const pubB64 = process.env.ENCRYPTION_PUBLIC_KEY_B64;

    if (!privB64 || !pubB64) {
      throw new Error(
        'ENABLE_ENCRYPTION=true requires ENCRYPTION_PRIVATE_KEY_B64 and ENCRYPTION_PUBLIC_KEY_B64',
      );
    }

    this.privateKey = createPrivateKey(
      Buffer.from(privB64, 'base64').toString('utf8'),
    );
    this.publicKeyPem = Buffer.from(pubB64, 'base64').toString('utf8');
    this.publicKey = createPublicKey(this.publicKeyPem);
  }

  getPublicKeyPem() {
    return this.publicKeyPem;
  }

  getPublicKeySpkiBase64() {
    return this.publicKey.export({ type: 'spki', format: 'der' }).toString('base64');
  }

  unwrapAesKey(ekBase64: string): Buffer {
    return privateDecrypt(
      {
        key: this.privateKey,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(ekBase64, 'base64'),
    );
  }

  wrapAesKey(aesKey: Buffer): string {
    return publicEncrypt(
      {
        key: this.publicKey,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      aesKey,
    ).toString('base64');
  }

  encryptJson(payload: unknown, aesKey: Buffer): EncryptedResponse {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', aesKey, iv);
    const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
    const ciphertext = Buffer.concat([
      cipher.update(plaintext),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return {
      enc: true,
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      data: ciphertext.toString('base64'),
    };
  }

  decryptJson<T = unknown>(
    envelope: Pick<EncryptedEnvelope, 'iv' | 'tag' | 'data'>,
    aesKey: Buffer,
  ): T {
    const decipher = createDecipheriv(
      'aes-256-gcm',
      aesKey,
      Buffer.from(envelope.iv, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(envelope.data, 'base64')),
      decipher.final(),
    ]);
    return JSON.parse(plaintext.toString('utf8')) as T;
  }

  createAesKey() {
    return randomBytes(32);
  }
}
