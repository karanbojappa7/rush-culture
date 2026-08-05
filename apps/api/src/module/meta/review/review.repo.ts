import { Injectable } from '@nestjs/common';
import { Prisma, Review } from '@prisma/client';
import { BaseRepo } from '../../../common/base/base.repo';
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
}
