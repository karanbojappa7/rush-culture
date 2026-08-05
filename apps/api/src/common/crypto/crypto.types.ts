export const ENCRYPTION_HEADER = 'x-enc-session';
export const ENCRYPTION_SKIP_PATHS = [
  '/api/crypto/public-key',
  '/api/health',
  '/api/health/live',
  '/api/cache',
];

export type EncryptedEnvelope = {
  enc: true;
  ek: string;
  iv: string;
  tag: string;
  data: string;
};

export type EncryptedResponse = {
  enc: true;
  iv: string;
  tag: string;
  data: string;
};

export function isEncryptedEnvelope(body: unknown): body is EncryptedEnvelope {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    b.enc === true &&
    typeof b.ek === 'string' &&
    typeof b.iv === 'string' &&
    typeof b.tag === 'string' &&
    typeof b.data === 'string'
  );
}
