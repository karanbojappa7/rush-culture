import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../security/auth/guards/auth.guard';
import { PermissionsGuard } from './permissions.guard';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export function PermissionsAuth(...permissions: string[]) {
  if (!permissions.length) {
    return applyDecorators(UseGuards(AuthGuard));
  }
  return applyDecorators(
    RequirePermissions(...permissions),
    UseGuards(AuthGuard, PermissionsGuard),
  );
}
