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
import { StaffAuth } from '../../security/auth/guards/staff-auth.decorator';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerService } from './customer.service';

@Controller('api/customers')
@StaffAuth()
export class CustomerController extends BaseController {
  constructor(
    private readonly customerService: CustomerService,
    responseBuilder: ResponseBuilder,
  ) {
    super(CustomerController.name, responseBuilder);
  }

  @Post()
  create(@Body() payload: CreateCustomerDto): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.customerService.create(data),
      payload,
      'Customer created',
    );
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.customerService.findById(data),
      { id },
      'Customer fetched',
    );
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.customerService.findAll(data),
      { ...parsePageQuery(page, limit), q },
      'Customers fetched',
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateCustomerDto,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.customerService.update(payload),
      { id, data },
      'Customer updated',
    );
  }

  @Delete(':id')
  softDelete(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.customerService.softDelete(payload),
      { id },
      'Customer deleted',
    );
  }
}
