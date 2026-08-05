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
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { UpsertCartItemDto } from './dto/upsert-cart-item.dto';

@Controller('api/carts')
export class CartController extends BaseController {
  constructor(
    private readonly cartService: CartService,
    responseBuilder: ResponseBuilder,
  ) {
    super(CartController.name, responseBuilder);
  }

  @Post()
  create(@Body() payload: CreateCartDto): Promise<ResponseVm> {
    return this.executeMethod((data) => this.cartService.create(data), payload, 'Cart created');
  }

  @Get()
  findAll(): Promise<ResponseVm> {
    return this.executeMethod(() => this.cartService.findAll(), {}, 'Carts fetched');
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod((data) => this.cartService.findById(data), { id }, 'Cart fetched');
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateCartDto): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.cartService.update(payload),
      { id, data },
      'Cart updated',
    );
  }

  @Delete(':id')
  softDelete(@Param('id') id: string): Promise<ResponseVm> {
    return this.executeMethod((data) => this.cartService.softDelete(data), { id }, 'Cart deleted');
  }

  @Post(':id/items')
  upsertItem(@Param('id') cartId: string, @Body() data: UpsertCartItemDto): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.cartService.upsertItem(payload),
      { cartId, data },
      'Cart item added',
    );
  }

  @Patch(':id/items/:itemId')
  updateItemQuantity(
    @Param('id') cartId: string,
    @Param('itemId') itemId: string,
    @Body('quantity') quantity: number,
  ): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.cartService.updateItemQuantity(payload),
      { cartId, itemId, quantity },
      'Cart item updated',
    );
  }

  @Delete(':id/items/:itemId')
  removeItem(@Param('id') cartId: string, @Param('itemId') itemId: string): Promise<ResponseVm> {
    return this.executeMethod(
      (payload) => this.cartService.removeItem(payload),
      { cartId, itemId },
      'Cart item removed',
    );
  }
}
