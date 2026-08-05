import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import {
  buildDeviceFingerprint,
  extractClientIp,
  parseUserAgent,
} from '../../../common/utility/client-device.utility';
import { ClientDeviceService } from './client-device.service';

export type RequestWithDevice = Request & {
  clientFingerprint?: string;
  clientIp?: string;
};

@Injectable()
export class DeviceTrackingMiddleware implements NestMiddleware {
  constructor(private readonly clientDeviceService: ClientDeviceService) {}

  use(req: RequestWithDevice, _res: Response, next: NextFunction) {
    const ip = extractClientIp(
      req.headers as Record<string, unknown>,
      req.ip || req.socket.remoteAddress || '0.0.0.0',
    );
    const userAgent = req.headers['user-agent'] || '';
    const fingerprint = buildDeviceFingerprint(ip, userAgent);
    const parsed = parseUserAgent(userAgent);
    const path = (req.originalUrl || req.url || req.path || '').split('?')[0];

    req.clientFingerprint = fingerprint;
    req.clientIp = ip;

    this.clientDeviceService.track({
      fingerprint,
      ip,
      userAgent,
      deviceType: parsed.deviceType,
      os: parsed.os,
      browser: parsed.browser,
      path,
      method: (req.method || 'GET').toUpperCase(),
    });

    next();
  }
}
