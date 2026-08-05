import { Injectable } from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { BaseRepo } from '../../../common/base/base.repo';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class CategoryRepo extends BaseRepo<
  Category,
  Prisma.CategoryUncheckedCreateInput,
  Prisma.CategoryUncheckedUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, CategoryRepo.name);
  }

  protected get model() {
    return this.prisma.category;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.prisma.category.findFirst({
      where: this.notDeletedWhere({ slug }),
    });
  }
}
