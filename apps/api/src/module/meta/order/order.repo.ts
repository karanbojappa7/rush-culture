import { Injectable } from '@nestjs/common';
import { Order, Prisma } from '@prisma/client';
import { BaseRepo } from '../../../common/base/base.repo';
import { PrismaService } from '../../../common/prisma/prisma.service';

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
  }) {
    const where = this.notDeletedWhere();
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
    const totalPages =
      total === 0 ? 0 : Math.ceil(total / pageQuery.limit);
    return {
      items,
      page: pageQuery.page,
      limit: pageQuery.limit,
      total,
      totalPages,
    };
  }
}
