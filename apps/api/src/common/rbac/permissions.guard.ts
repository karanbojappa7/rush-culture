import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthUser } from '../../module/security/auth/guards/auth.guard';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { RbacService } from './rbac.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required?.length) return true;

    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;
    if (!user?.roleCode) {
      throw new ForbiddenException('Insufficient permission');
    }
    const allowed = await this.rbacService.roleHasPermission(
      user.roleCode,
      required,
    );
    if (!allowed) {
      throw new ForbiddenException('Insufficient permission');
    }
    return true;
  }
}
