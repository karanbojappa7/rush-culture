import { Injectable } from '@nestjs/common';
import { Prisma, Review } from '@prisma/client';
import { BaseRepo } from '../../../common/base/base.repo';
import {
  PageQuery,
  toPageResult,
} from '../../../common/pagination/pagination.utility';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class ReviewRepo extends BaseRepo<
  Review,
  Prisma.ReviewUncheckedCreateInput,
  Prisma.ReviewUncheckedUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, ReviewRepo.name);
  }

  protected get model() {
    return this.prisma.review;
  }

  async findAllByProductId(productId?: string) {
    return this.prisma.review.findMany({
      where: this.notDeletedWhere(productId ? { productId } : {}),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPageByProductId(pageQuery: PageQuery, productId?: string) {
    const where = this.notDeletedWhere(productId ? { productId } : {});
    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pageQuery.skip,
        take: pageQuery.limit,
      }),
      this.prisma.review.count({ where }),
    ]);
    return toPageResult(items, total, pageQuery.page, pageQuery.limit);
  }
}
