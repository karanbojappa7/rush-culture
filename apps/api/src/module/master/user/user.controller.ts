import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BaseController } from '../../../common/base/base.controller';
import { ResponseBuilder } from '../../../common/response/response.builder';
import { ResponseVm } from '../../../common/response/response.vm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('api/users')
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
  findAll(): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.userService.findAll(data),
      {},
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
  softDelete(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.userService.softDelete(payload),
      { id },
      'User deleted',
    );
  }
}
