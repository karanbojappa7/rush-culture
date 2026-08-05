import { createHash } from 'crypto';
import { DeviceType } from '@prisma/client';

export type ParsedUserAgent = {
  deviceType: DeviceType;
  os: string | null;
  browser: string | null;
};

export function extractClientIp(headers: Record<string, unknown>, fallback = '0.0.0.0'): string {
  const forwarded = headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0]?.trim() || fallback;
  }
  if (Array.isArray(forwarded) && typeof forwarded[0] === 'string') {
    return forwarded[0].split(',')[0]?.trim() || fallback;
  }
  const realIp = headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) return realIp.trim();
  return fallback;
}

export function parseUserAgent(userAgent: string | undefined): ParsedUserAgent {
  const ua = userAgent || '';
  const lower = ua.toLowerCase();

  let deviceType: DeviceType = DeviceType.DESKTOP;
  if (!ua) deviceType = DeviceType.UNKNOWN;
  else if (/bot|crawler|spider|slurp|bingpreview/i.test(ua)) {
    deviceType = DeviceType.BOT;
  } else if (/ipad|tablet|kindle|playbook|silk|(android(?!.*mobile))/i.test(ua)) {
    deviceType = DeviceType.TABLET;
  } else if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) {
    deviceType = DeviceType.MOBILE;
  }

  let os: string | null = null;
  if (/windows nt/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/cros/i.test(ua)) os = 'Chrome OS';

  let browser: string | null = null;
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) browser = 'Chrome';
  else if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) browser = 'Safari';
  else if (/firefox\//i.test(ua)) browser = 'Firefox';
  else if (/msie|trident/i.test(ua)) browser = 'IE';
  else if (lower.includes('bot')) browser = 'Bot';

  return { deviceType, os, browser };
}

export function buildDeviceFingerprint(ip: string, userAgent: string): string {
  return createHash('sha256')
    .update(`${ip}|${userAgent}`)
    .digest('hex')
    .slice(0, 32);
}
