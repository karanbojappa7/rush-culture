import { Injectable } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { BaseRepo } from '../../../common/base/base.repo';
import {
  PageQuery,
  toPageResult,
} from '../../../common/pagination/pagination.utility';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ProductFilters, buildProductWhere } from './utility/product-filter.utility';

export const productInclude = {
  category: true,
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

  async findPageWithDetails(filters: ProductFilters, pageQuery: PageQuery) {
    const where = buildProductWhere(filters);
    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: { createdAt: 'desc' },
        skip: pageQuery.skip,
        take: pageQuery.limit,
      }),
      this.prisma.product.count({ where }),
    ]);
    return toPageResult(items, total, pageQuery.page, pageQuery.limit);
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
