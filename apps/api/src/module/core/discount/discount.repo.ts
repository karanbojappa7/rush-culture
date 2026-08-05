import { Injectable } from '@nestjs/common';
import { Discount, Prisma } from '@prisma/client';
import { BaseRepo } from '../../../common/base/base.repo';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class DiscountRepo extends BaseRepo<
  Discount,
  Prisma.DiscountUncheckedCreateInput,
  Prisma.DiscountUncheckedUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, DiscountRepo.name);
  }

  protected get model() {
    return this.prisma.discount;
  }

  async findByCode(code: string): Promise<Discount | null> {
    return this.prisma.discount.findFirst({
      where: this.notDeletedWhere({ code }),
    });
  }
}
