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
import { BaseController } from '../../../common/base/base.controller';
import { parsePageQuery } from '../../../common/pagination/pagination.utility';
import { ResponseBuilder } from '../../../common/response/response.builder';
import { ResponseVm } from '../../../common/response/response.vm';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('api/addresses')
export class AddressController extends BaseController {
  constructor(
    private readonly addressService: AddressService,
    responseBuilder: ResponseBuilder,
  ) {
    super(AddressController.name, responseBuilder);
  }

  @Post()
  create(@Body() payload: CreateAddressDto): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.addressService.create(data),
      payload,
      'Address created',
    );
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('customerId') customerId?: string,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.addressService.findAll(data),
      { ...parsePageQuery(page, limit), customerId },
      'Addresses fetched',
    );
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.addressService.findById(data),
      { id },
      'Address fetched',
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateAddressDto,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.addressService.update(payload),
      { id, data },
      'Address updated',
    );
  }

  @Delete(':id')
  softDelete(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.addressService.softDelete(data),
      { id },
      'Address deleted',
    );
  }
}
