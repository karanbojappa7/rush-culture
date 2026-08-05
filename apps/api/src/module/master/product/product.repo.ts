import { Injectable } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { BaseRepo } from '../../../common/base/base.repo';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ProductFilters, buildProductWhere } from './utility/product-filter.utility';

export const productInclude = {
  variants: { where: { isDeleted: false } },
  images: { where: { isDeleted: false } },
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductRepo extends BaseRepo<
  Product,
  Prisma.ProductUncheckedCreateInput,
  Prisma.ProductUncheckedUpdateInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, ProductRepo.name);
  }

  protected get model() {
    return this.prisma.product;
  }

  async findAllWithDetails(filters: ProductFilters) {
    return this.prisma.product.findMany({
      where: buildProductWhere(filters),
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdWithDetails(id: string) {
    return this.prisma.product.findFirst({
      where: this.notDeletedWhere({ id }),
      include: productInclude,
    });
  }

  async findBySlugWithDetails(slug: string) {
    return this.prisma.product.findFirst({
      where: this.notDeletedWhere({ slug }),
      include: productInclude,
    });
  }

  async createWithDetails(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data, include: productInclude });
  }

  async updateWithDetails(id: string, data: Prisma.ProductUncheckedUpdateInput) {
    return this.prisma.product.update({
      where: { id },
      data: this.withUpdateAudit(data),
      include: productInclude,
    });
  }
}
