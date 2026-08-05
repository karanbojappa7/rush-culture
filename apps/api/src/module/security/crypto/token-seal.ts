import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

const SEAL_PREFIX = 'rc1.';

function sealKey(scope: string): Buffer {
  const secret =
    process.env.JWT_SECRET ||
    process.env.ENCRYPTION_PRIVATE_KEY_B64 ||
    'dev-insecure-secret';
  return createHash('sha256').update(`${scope}:${secret}`).digest();
}

export function sealToken(token: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', sealKey('cookie'), iv);
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(token, 'utf8')),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return (
    SEAL_PREFIX +
    [
      iv.toString('base64url'),
      encrypted.toString('base64url'),
      tag.toString('base64url'),
    ].join('.')
  );
}

export function openToken(value: string): string | null {
  if (!value) return null;
  if (!value.startsWith(SEAL_PREFIX)) {
    const parts = value.split('.');
    if (parts.length === 3) return value;
    return null;
  }

  try {
    const raw = value.slice(SEAL_PREFIX.length);
    const [ivB64, dataB64, tagB64] = raw.split('.');
    if (!ivB64 || !dataB64 || !tagB64) return null;
    const decipher = createDecipheriv(
      'aes-256-gcm',
      sealKey('cookie'),
      Buffer.from(ivB64, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(tagB64, 'base64url'));
    const plain = Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64url')),
      decipher.final(),
    ]);
    return plain.toString('utf8');
  } catch {
    return null;
  }
}

export function sealCachePayload(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', sealKey('cache'), iv);
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(value, 'utf8')),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return (
    SEAL_PREFIX +
    [
      iv.toString('base64url'),
      encrypted.toString('base64url'),
      tag.toString('base64url'),
    ].join('.')
  );
}

export function openCachePayload(value: string): string | null {
  if (!value) return null;
  if (!value.startsWith(SEAL_PREFIX)) {
    return value;
  }
  try {
    const raw = value.slice(SEAL_PREFIX.length);
    const [ivB64, dataB64, tagB64] = raw.split('.');
    if (!ivB64 || !dataB64 || !tagB64) return null;
    const decipher = createDecipheriv(
      'aes-256-gcm',
      sealKey('cache'),
      Buffer.from(ivB64, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(tagB64, 'base64url'));
    const plain = Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64url')),
      decipher.final(),
    ]);
    return plain.toString('utf8');
  } catch {
    return null;
  }
}
