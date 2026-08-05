import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { brand } from '@linq/site-config';

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  roleCode: string;
};

export const AUTH_COOKIE = brand.adminAuthCookie;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        name: string | null;
        roleCode: string;
      }>(token);
      request.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        roleCode: payload.roleCode,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }
  }

  private extractToken(request: Request): string | undefined {
    const cookie = request.cookies?.[AUTH_COOKIE];
    if (typeof cookie === 'string' && cookie.length > 0) return cookie;
    const header = request.headers.authorization;
    if (header?.startsWith('Bearer ')) return header.slice(7);
    return undefined;
  }
}
