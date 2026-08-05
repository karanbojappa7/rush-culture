import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { brand } from '@linq/site-config';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { openToken } from '../../crypto/token-seal';

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  roleCode: string;
  permissions?: string[];
};

export const AUTH_COOKIE = brand.adminAuthCookie;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();
    const sealed = this.extractToken(request);
    if (!sealed) {
      throw new UnauthorizedException('Authentication required');
    }
    const token = openToken(sealed);
    if (!token) {
      throw new UnauthorizedException('Invalid or expired session');
    }
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        name: string | null;
        roleCode: string;
      }>(token);
      const user = await this.prisma.user.findFirst({
        where: { id: payload.sub, isDeleted: false },
        include: { role: true },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      request.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        roleCode: user.role.code,
      };
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
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
