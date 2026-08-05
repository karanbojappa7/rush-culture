import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { ResponseBuilder } from '../response/response.builder';
import { ResponseVm } from '../response/response.vm';
import { AuthGuard, AuthUser } from '../../module/security/auth/guards/auth.guard';
import { PermissionsAuth } from './permissions.decorator';
import { RbacService } from './rbac.service';
import { SetRolePermissionsDto } from './dto/set-role-permissions.dto';
import { SetPermissionMatrixDto } from './dto/set-permission-matrix.dto';

@Controller('api/access')
export class AccessController extends BaseController {
  constructor(
    private readonly rbacService: RbacService,
    responseBuilder: ResponseBuilder,
  ) {
    super(AccessController.name, responseBuilder);
  }

  @Get('dashboard')
  @PermissionsAuth('access.dashboard')
  dashboard(): Promise<ResponseVm> {
    return this.executeMethod(
      () => this.rbacService.dashboard(),
      {} as never,
      'Access dashboard fetched',
    );
  }

  @Get('matrix')
  @PermissionsAuth('permissions.manage')
  matrix(): Promise<ResponseVm> {
    return this.executeMethod(
      () => this.rbacService.getPermissionMatrix(),
      {} as never,
      'Permission matrix fetched',
    );
  }

  @Patch('matrix')
  @PermissionsAuth('permissions.manage')
  setMatrix(@Body() body: SetPermissionMatrixDto): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.rbacService.setPermissionMatrix(data.grants),
      { grants: body.grants ?? [] },
      'Permission matrix updated',
    );
  }

  @Get('permissions')
  @PermissionsAuth('permissions.manage')
  listPermissions(): Promise<ResponseVm> {
    return this.executeMethod(
      () => this.rbacService.listPermissions(),
      {} as never,
      'Permissions fetched',
    );
  }

  @Get('catalog')
  @PermissionsAuth('permissions.manage')
  catalog(): Promise<ResponseVm> {
    return this.executeMethod(
      () => Promise.resolve(this.rbacService.getCatalog()),
      {} as never,
      'Permission catalog fetched',
    );
  }

  @Get('roles/:id/permissions')
  @PermissionsAuth('permissions.manage')
  getRolePermissions(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      async (data) => this.rbacService.getRolePermissions(data.id),
      { id },
      'Role permissions fetched',
    );
  }

  @Patch('roles/:id/permissions')
  @PermissionsAuth('permissions.manage')
  setRolePermissions(
    @Param('id') id: string,
    @Body() body: SetRolePermissionsDto,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (data) =>
        this.rbacService.setRolePermissions(data.id, data.permissionCodes),
      { id, permissionCodes: body.permissionCodes ?? [] },
      'Role permissions updated',
    );
  }

  @Get('me/permissions')
  @UseGuards(AuthGuard)
  myPermissions(@Req() req: { user: AuthUser }): Promise<ResponseVm> {
    return this.executeMethod(
      async (data) => {
        const permissions = await this.rbacService.getRolePermissionCodes(
          data.roleCode,
        );
        return { roleCode: data.roleCode, permissions };
      },
      req.user,
      'Permissions fetched',
    );
  }
}
