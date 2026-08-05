import { Prisma } from '@prisma/client';

export type ProductFilters = {
  q?: string;
  categoryId?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
};

export function buildProductWhere(filters: ProductFilters): Prisma.ProductWhereInput {
  const variantWhere: Prisma.ProductVariantWhereInput = {
    isDeleted: false,
    ...(filters.size ? { size: filters.size } : {}),
    ...(filters.color
      ? { color: { equals: filters.color, mode: 'insensitive' } }
      : {}),
    ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? {
          priceInPaise: {
            ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
            ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
          },
        }
      : {}),
  };

  return {
    isDeleted: false,
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
    ...(filters.q
      ? {
          OR: [
            { name: { contains: filters.q, mode: 'insensitive' } },
            { description: { contains: filters.q, mode: 'insensitive' } },
            { brand: { contains: filters.q, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(Object.keys(variantWhere).length > 1 ? { variants: { some: variantWhere } } : {}),
  };
}
