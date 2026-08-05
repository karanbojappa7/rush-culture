import { Injectable } from '@nestjs/common';
import { Order, Prisma } from '@prisma/client';
import { BaseRepo } from '../../../common/base/base.repo';
import { toPageResult } from '../../../common/pagination/pagination.utility';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { buildCreatedAtFilter } from '../../../common/utility/date-range.utility';
import { buildContainsOr } from '../../../common/utility/search.utility';

const orderInclude = {
  items: { where: { isDeleted: false } },
} satisfies Prisma.OrderInclude;

export type OrderListFilters = {
  q?: string;
  from?: string;
  to?: string;
};

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

  buildListWhere(filters: OrderListFilters = {}): Prisma.OrderWhereInput {
    return this.notDeletedWhere({
      ...buildContainsOr(filters.q, [
        'orderNumber',
        'customerEmail',
        'shippingFullName',
        'shippingPhone',
      ] as const),
      ...buildCreatedAtFilter(filters.from, filters.to),
    });
  }

  async findByIdWithItems(id: string) {
    return this.prisma.order.findFirst({
      where: this.notDeletedWhere({ id }),
      include: orderInclude,
    });
  }

  async findAllWithItems(
    pageQuery: {
      page: number;
      limit: number;
      skip: number;
    } & OrderListFilters,
  ) {
    const where = this.buildListWhere(pageQuery);
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

  async findAllForExport(filters: OrderListFilters = {}, take = 5000) {
    return this.prisma.order.findMany({
      where: this.buildListWhere(filters),
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
      take,
    });
  }
}
