import { Injectable } from '@nestjs/common';
import {
  CustomerQuery,
  CustomerQueryStatus,
  CustomerQueryTopic,
  Prisma,
} from '@prisma/client';
import { BaseRepo } from '../../../common/base/base.repo';
import {
  PageQuery,
  toPageResult,
} from '../../../common/pagination/pagination.utility';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { buildContainsOr } from '../../../common/utility/search.utility';

@Injectable()
export class CustomerQueryRepo extends BaseRepo<
  CustomerQuery,
  Prisma.CustomerQueryUncheckedCreateInput,
  Prisma.CustomerQueryUncheckedUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, CustomerQueryRepo.name);
  }

  protected get model() {
    return this.prisma.customerQuery;
  }

  async findPageFiltered(
    pageQuery: PageQuery,
    filters: {
      status?: CustomerQueryStatus;
      topic?: CustomerQueryTopic;
      q?: string;
    } = {},
  ) {
    const where = this.notDeletedWhere({
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.topic ? { topic: filters.topic } : {}),
      ...buildContainsOr(filters.q, [
        'subject',
        'name',
        'email',
        'orderNumber',
        'message',
      ] as const),
    });
    const [items, total] = await Promise.all([
      this.prisma.customerQuery.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pageQuery.skip,
        take: pageQuery.limit,
      }),
      this.prisma.customerQuery.count({ where }),
    ]);
    return toPageResult(items, total, pageQuery.page, pageQuery.limit);
  }

  async countByStatus(status: CustomerQueryStatus) {
    return this.prisma.customerQuery.count({
      where: this.notDeletedWhere({ status }),
    });
  }
}
