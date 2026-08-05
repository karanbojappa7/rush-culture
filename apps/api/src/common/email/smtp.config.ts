import { brand } from '@linq/site-config';

export type SmtpRuntimeConfig = {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
  fromName: string;
};

function envBool(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  return raw === 'true' || raw === '1';
}

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function loadSmtpConfig(): SmtpRuntimeConfig {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim() || undefined;
  const pass = process.env.SMTP_PASS || undefined;
  const from =
    (process.env.SMTP_FROM || '').trim() ||
    process.env.SMTP_USER ||
    brand.supportEmail;
  const fromName =
    (process.env.SMTP_FROM_NAME || '').trim() || brand.name;
  const enabledFlag = envBool('ENABLE_EMAIL', true);
  const enabled = enabledFlag && Boolean(host);

  return {
    enabled,
    host,
    port: envInt('SMTP_PORT', 587),
    secure: envBool('SMTP_SECURE', false),
    user,
    pass,
    from: from || brand.supportEmail,
    fromName,
  };
}
