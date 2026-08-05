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
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { DiscountService } from './discount.service';

@Controller('api/discounts')
export class DiscountController extends BaseController {
  constructor(
    private readonly discountService: DiscountService,
    responseBuilder: ResponseBuilder,
  ) {
    super(DiscountController.name, responseBuilder);
  }

  @Post()
  create(@Body() payload: CreateDiscountDto): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.discountService.create(data),
      payload,
      'Discount created',
    );
  }

  @Get()
  findAll(): Promise<ResponseVm> {
    return this.executeMethod(
      () => this.discountService.findAll(),
      {},
      'Discounts fetched',
    );
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.discountService.findByCode(data.code),
      { code },
      'Discount fetched',
    );
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.discountService.findById(data),
      { id },
      'Discount fetched',
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateDiscountDto,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.discountService.update(payload),
      { id, data },
      'Discount updated',
    );
  }

  @Delete(':id')
  softDelete(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.discountService.softDelete(data),
      { id },
      'Discount deleted',
    );
  }
}
