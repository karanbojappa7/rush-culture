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
import {
  CustomerQueryStatus,
  CustomerQueryTopic,
} from '@prisma/client';
import { BaseController } from '../../../common/base/base.controller';
import { parsePageQuery } from '../../../common/pagination/pagination.utility';
import { ResponseBuilder } from '../../../common/response/response.builder';
import { ResponseVm } from '../../../common/response/response.vm';
import { StaffAuth } from '../../security/auth/guards/staff-auth.decorator';
import { CreateCustomerQueryDto } from './dto/create-customer-query.dto';
import { UpdateCustomerQueryDto } from './dto/update-customer-query.dto';
import { CustomerQueryService } from './customer-query.service';

@Controller('api/customer-queries')
export class CustomerQueryController extends BaseController {
  constructor(
    private readonly customerQueryService: CustomerQueryService,
    responseBuilder: ResponseBuilder,
  ) {
    super(CustomerQueryController.name, responseBuilder);
  }

  @Post()
  create(@Body() payload: CreateCustomerQueryDto): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.customerQueryService.create(data),
      payload,
      'Query submitted',
    );
  }

  @Get('summary')
  @StaffAuth()
  summary(): Promise<ResponseVm> {
    return this.executeMethod(
      () => this.customerQueryService.summary(),
      {} as never,
      'Query summary fetched',
    );
  }

  @Get()
  @StaffAuth()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: CustomerQueryStatus,
    @Query('topic') topic?: CustomerQueryTopic,
    @Query('q') q?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.customerQueryService.findAll(data),
      {
        ...parsePageQuery(page, limit),
        status,
        topic,
        q,
        from,
        to,
      },
      'Queries fetched',
    );
  }

  @Get(':id')
  @StaffAuth()
  findById(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.customerQueryService.findById(data),
      { id },
      'Query fetched',
    );
  }

  @Patch(':id')
  @StaffAuth()
  update(
    @Param('id') id: string,
    @Body() data: UpdateCustomerQueryDto,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.customerQueryService.update(payload),
      { id, data },
      'Query updated',
    );
  }

  @Delete(':id')
  @StaffAuth()
  softDelete(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.customerQueryService.softDelete(data),
      { id },
      'Query deleted',
    );
  }
}
