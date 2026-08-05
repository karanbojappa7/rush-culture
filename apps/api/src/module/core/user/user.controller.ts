import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { BaseController } from '../../../common/base/base.controller';
import { parsePageQuery } from '../../../common/pagination/pagination.utility';
import { ResponseBuilder } from '../../../common/response/response.builder';
import { ResponseVm } from '../../../common/response/response.vm';
import { PermissionsAuth } from '../../../common/rbac/permissions.decorator';
import { AuthUser } from '../../security/auth/guards/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('api/users')
@PermissionsAuth('users.manage')
export class UserController extends BaseController {
  constructor(
    private readonly userService: UserService,
    responseBuilder: ResponseBuilder,
  ) {
    super(UserController.name, responseBuilder);
  }

  @Post()
  create(@Body() payload: CreateUserDto): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.userService.create(data),
      payload,
      'User created',
    );
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.userService.findById(data),
      { id },
      'User fetched',
    );
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.userService.findAll(data),
      parsePageQuery(page, limit),
      'Users fetched',
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.userService.update(payload),
      { id, data },
      'User updated',
    );
  }

  @Delete(':id')
  @PermissionsAuth('users.delete')
  softDelete(
    @Param('id') id: string,
    @Req() req: { user: AuthUser },
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.userService.softDelete(payload),
      { id, actorUserId: req.user.id },
      'User deleted',
    );
  }
}
