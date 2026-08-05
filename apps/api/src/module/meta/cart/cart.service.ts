import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../../../common/base/base.service';
import { CartRepo, CartItemRepo } from './cart.repo';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { UpsertCartItemDto } from './dto/upsert-cart-item.dto';
import { buildCartItemKey, mergeQuantity } from './utility/cart-item.utility';

@Injectable()
export class CartService extends BaseService {
  constructor(
    private readonly cartRepo: CartRepo,
    private readonly cartItemRepo: CartItemRepo,
  ) {
    super(CartService.name);
  }

  async create(payload: CreateCartDto) {
    return this.cartRepo.create(payload);
  }

  async findById(payload: { id: string }) {
    const cart = await this.cartRepo.findByIdWithItems(payload.id);
    if (!cart) throw new NotFoundException(`Cart ${payload.id} not found`);
    return cart;
  }

  async findAll() {
    return this.cartRepo.findAllWithItems();
  }

  async update(payload: { id: string; data: UpdateCartDto }) {
    await this.findById({ id: payload.id });
    return this.cartRepo.update(payload.id, payload.data);
  }

  async softDelete(payload: { id: string }) {
    await this.findById(payload);
    await this.cartItemRepo.softDeleteByCartId(payload.id);
    return this.cartRepo.softDelete(payload.id);
  }

  async upsertItem(payload: { cartId: string; data: UpsertCartItemDto }) {
    await this.findById({ id: payload.cartId });
    const existing = await this.cartItemRepo.findByCartAndVariant(
      payload.cartId,
      payload.data.variantId,
    );

    if (existing) {
      return this.cartItemRepo.update(existing.id, {
        quantity: mergeQuantity(existing.quantity, payload.data.quantity),
      });
    }

    return this.cartItemRepo.create({
      cartId: payload.cartId,
      variantId: payload.data.variantId,
      quantity: payload.data.quantity,
      userId: null,
    });
  }

  async updateItemQuantity(payload: {
    cartId: string;
    itemId: string;
    quantity: number;
  }) {
    const item = await this.cartItemRepo.findByCartAndId(
      payload.cartId,
      payload.itemId,
    );
    if (!item) {
      throw new NotFoundException(
        `Cart item ${buildCartItemKey(payload.cartId, payload.itemId)} not found`,
      );
    }
    return this.cartItemRepo.update(item.id, { quantity: payload.quantity });
  }

  async removeItem(payload: { cartId: string; itemId: string }) {
    const item = await this.cartItemRepo.findByCartAndId(
      payload.cartId,
      payload.itemId,
    );
    if (!item) {
      throw new NotFoundException(
        `Cart item ${buildCartItemKey(payload.cartId, payload.itemId)} not found`,
      );
    }
    return this.cartItemRepo.softDelete(item.id);
  }
}
