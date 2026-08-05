import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BaseController } from '../../../../common/base/base.controller';
import { parsePageQuery } from '../../../../common/pagination/pagination.utility';
import { PermissionsAuth } from '../../../core/rbac/permissions.decorator';
import { ResponseBuilder } from '../../../../common/response/response.builder';
import { ResponseVm } from '../../../../common/response/response.vm';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RoleService } from './role.service';

@Controller('api/roles')
@PermissionsAuth('roles.manage')
export class RoleController extends BaseController {
  constructor(
    private readonly roleService: RoleService,
    responseBuilder: ResponseBuilder,
  ) {
    super(RoleController.name, responseBuilder);
  }

  @Post()
  create(@Body() payload: CreateRoleDto): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.roleService.create(data),
      payload,
      'Role created',
    );
  }

  @Get()
  @PermissionsAuth('roles.manage', 'users.manage')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.roleService.findAll(data),
      parsePageQuery(page, limit),
      'Roles fetched',
    );
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.roleService.findByCode(data.code),
      { code },
      'Role fetched',
    );
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.roleService.findById(data),
      { id },
      'Role fetched',
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateRoleDto,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.roleService.update(payload),
      { id, data },
      'Role updated',
    );
  }

  @Delete(':id')
  @PermissionsAuth('roles.delete')
  softDelete(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.roleService.softDelete(payload),
      { id },
      'Role deleted',
    );
  }
}
