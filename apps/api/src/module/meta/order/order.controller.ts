import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { BaseController } from '../../../common/base/base.controller';
import { parsePageQuery } from '../../../common/pagination/pagination.utility';
import { ResponseBuilder } from '../../../common/response/response.builder';
import { ResponseVm } from '../../../common/response/response.vm';
import { StaffAuth } from '../../security/auth/guards/staff-auth.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';

@Controller('api/orders')
export class OrderController extends BaseController {
  constructor(
    private readonly orderService: OrderService,
    responseBuilder: ResponseBuilder,
  ) {
    super(OrderController.name, responseBuilder);
  }

  @Post()
  create(@Body() payload: CreateOrderDto): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.orderService.create(data),
      payload,
      'Order placed',
    );
  }

  @Get()
  @StaffAuth()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.orderService.findAll(data),
      { ...parsePageQuery(page, limit), q, from, to },
      'Orders fetched',
    );
  }

  @Get('summary')
  @StaffAuth()
  summary(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.orderService.summary(data),
      { from, to },
      'Summary fetched',
    );
  }

  @Get('export')
  @StaffAuth()
  export(
    @Query('q') q?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.orderService.exportAll(data),
      { q, from, to },
      'Orders export ready',
    );
  }

  @Get(':id')
  @StaffAuth()
  findById(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.orderService.findById(data),
      { id },
      'Order fetched',
    );
  }

  @Patch(':id')
  @StaffAuth()
  update(
    @Param('id') id: string,
    @Body() data: UpdateOrderDto,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.orderService.update(payload),
      { id, data },
      'Order updated',
    );
  }

  @Delete(':id')
  @StaffAuth()
  softDelete(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.orderService.softDelete(data),
      { id },
      'Order deleted',
    );
  }
}
