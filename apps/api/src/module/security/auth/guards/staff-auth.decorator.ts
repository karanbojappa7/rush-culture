import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { Roles, RolesGuard } from './roles.guard';

export function StaffAuth(...roles: string[]) {
  const allowed = roles.length > 0 ? roles : ['ADMIN', 'STAFF'];
  return applyDecorators(Roles(...allowed), UseGuards(AuthGuard, RolesGuard));
}
