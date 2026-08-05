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
import { ResponseBuilder } from '../../../../common/response/response.builder';
import { ResponseVm } from '../../../../common/response/response.vm';
import { CreateUserTypeDto } from '../dto/create-user-type.dto';
import { UpdateUserTypeDto } from '../dto/update-user-type.dto';
import { UserTypeService } from './user-type.service';

@Controller('api/user-types')
export class UserTypeController extends BaseController {
  constructor(
    private readonly userTypeService: UserTypeService,
    responseBuilder: ResponseBuilder,
  ) {
    super(UserTypeController.name, responseBuilder);
  }

  @Post()
  create(@Body() payload: CreateUserTypeDto): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.userTypeService.create(data),
      payload,
      'User type created',
    );
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.userTypeService.findAll(data),
      parsePageQuery(page, limit),
      'User types fetched',
    );
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.userTypeService.findByCode(data.code),
      { code },
      'User type fetched',
    );
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.userTypeService.findById(data),
      { id },
      'User type fetched',
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateUserTypeDto,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.userTypeService.update(payload),
      { id, data },
      'User type updated',
    );
  }

  @Delete(':id')
  softDelete(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.userTypeService.softDelete(payload),
      { id },
      'User type deleted',
    );
  }
}
