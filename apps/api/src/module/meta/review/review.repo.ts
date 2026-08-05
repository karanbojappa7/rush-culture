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

  async findByProductAndCustomer(productId: string, customerId: string) {
    return this.prisma.review.findFirst({
      where: this.notDeletedWhere({ productId, customerId }),
    });
  }

  async findPageByProductId(
    pageQuery: PageQuery,
    productId?: string,
    options: {
      approvedOnly?: boolean;
      approved?: boolean;
      q?: string;
    } = {},
  ) {
    const search = options.q?.trim();
    const where = this.notDeletedWhere({
      ...(productId ? { productId } : {}),
      ...(options.approvedOnly
        ? { isApproved: true }
        : options.approved === undefined
          ? {}
          : { isApproved: options.approved }),
      ...(search
        ? {
            OR: [
              { displayName: { contains: search, mode: 'insensitive' } },
              { title: { contains: search, mode: 'insensitive' } },
              { body: { contains: search, mode: 'insensitive' } },
              { customer: { email: { contains: search, mode: 'insensitive' } } },
              { product: { name: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    });
    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pageQuery.skip,
        take: pageQuery.limit,
        select: {
          id: true,
          productId: true,
          displayName: true,
          rating: true,
          title: true,
          body: true,
          isApproved: true,
          createdAt: true,
          customer: { select: { name: true, email: true } },
          product: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.review.count({ where }),
    ]);
    return toPageResult(items, total, pageQuery.page, pageQuery.limit);
  }

  async summaryByProductId(productId: string) {
    const where = this.notDeletedWhere({
      productId,
      isApproved: true,
    });
    const [aggregate, count] = await Promise.all([
      this.prisma.review.aggregate({
        where,
        _avg: { rating: true },
      }),
      this.prisma.review.count({ where }),
    ]);
    return {
      productId,
      count,
      average: count === 0 ? 0 : Number(aggregate._avg.rating?.toFixed(2)),
    };
  }
}
