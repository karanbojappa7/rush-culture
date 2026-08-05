import { Injectable } from '@nestjs/common';
import { Order, Prisma } from '@prisma/client';
import { BaseRepo } from '../../../common/base/base.repo';
import { toPageResult } from '../../../common/pagination/pagination.utility';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { buildContainsOr } from '../../../common/utility/search.utility';

const orderInclude = {
  items: { where: { isDeleted: false } },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrderRepo extends BaseRepo<
  Order,
  Prisma.OrderUncheckedCreateInput,
  Prisma.OrderUncheckedUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, OrderRepo.name);
  }

  protected get model() {
    return this.prisma.order;
  }

  async findByIdWithItems(id: string) {
    return this.prisma.order.findFirst({
      where: this.notDeletedWhere({ id }),
      include: orderInclude,
    });
  }

  async findAllWithItems(pageQuery: {
    page: number;
    limit: number;
    skip: number;
    q?: string;
  }) {
    const where = this.notDeletedWhere(
      buildContainsOr(pageQuery.q, [
        'orderNumber',
        'customerEmail',
        'shippingFullName',
        'shippingPhone',
      ] as const),
    );
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
        skip: pageQuery.skip,
        take: pageQuery.limit,
      }),
      this.prisma.order.count({ where }),
    ]);
    return toPageResult(items, total, pageQuery.page, pageQuery.limit);
  }
}
