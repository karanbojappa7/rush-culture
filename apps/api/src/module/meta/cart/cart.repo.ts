import { Injectable } from '@nestjs/common';
import { Cart, CartItem, Prisma } from '@prisma/client';
import { BaseRepo } from '../../../common/base/base.repo';
import { PrismaService } from '../../../common/prisma/prisma.service';

const cartInclude = {
  items: {
    where: { isDeleted: false },
    include: { variant: true },
  },
} satisfies Prisma.CartInclude;

@Injectable()
export class CartRepo extends BaseRepo<Cart, Prisma.CartCreateInput, Prisma.CartUpdateInput> {
  constructor(prisma: PrismaService) {
    super(prisma, CartRepo.name);
  }

  protected get model() {
    return this.prisma.cart;
  }

  async findBySessionId(sessionId: string): Promise<Cart | null> {
    return this.prisma.cart.findFirst({
      where: this.notDeletedWhere({ sessionId }),
    });
  }

  async findByCustomerId(customerId: string): Promise<Cart | null> {
    return this.prisma.cart.findFirst({
      where: this.notDeletedWhere({ customerId }),
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findByIdWithItems(id: string) {
    return this.prisma.cart.findFirst({
      where: this.notDeletedWhere({ id }),
      include: cartInclude,
    });
  }

  async findAllWithItems(pageQuery: {
    page: number;
    limit: number;
    skip: number;
  }) {
    const where = this.notDeletedWhere();
    const [items, total] = await Promise.all([
      this.prisma.cart.findMany({
        where,
        include: cartInclude,
        orderBy: { updatedAt: 'desc' },
        skip: pageQuery.skip,
        take: pageQuery.limit,
      }),
      this.prisma.cart.count({ where }),
    ]);
    return {
      items,
      page: pageQuery.page,
      limit: pageQuery.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageQuery.limit),
    };
  }
}

@Injectable()
export class CartItemRepo extends BaseRepo<
  CartItem,
  Prisma.CartItemUncheckedCreateInput,
  Prisma.CartItemUncheckedUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, CartItemRepo.name);
  }

  protected get model() {
    return this.prisma.cartItem;
  }

  async findByCartAndVariant(cartId: string, variantId: string) {
    return this.prisma.cartItem.findFirst({
      where: this.notDeletedWhere({ cartId, variantId }),
    });
  }

  async findByCartAndId(cartId: string, id: string) {
    return this.prisma.cartItem.findFirst({
      where: this.notDeletedWhere({ cartId, id }),
    });
  }

  async softDeleteByCartId(cartId: string): Promise<Prisma.BatchPayload> {
    return this.prisma.cartItem.updateMany({
      where: this.notDeletedWhere({ cartId }),
      data: this.withUpdateAudit({ isDeleted: true }),
    });
  }
}
