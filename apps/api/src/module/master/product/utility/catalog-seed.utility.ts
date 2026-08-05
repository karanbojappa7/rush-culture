import { brand, collections, products } from '@linq/site-config';
import { Prisma } from '@prisma/client';
import { BASE_ENTITY_DEFAULTS } from '../../../../common/entities/base.entity';
import { utcNow } from '../../../../common/utility/date.utility';

export function mapCatalogCategoryToCreateInput(
  collection: (typeof collections)[number],
): Prisma.CategoryCreateInput {
  const stamp = utcNow();
  return {
    name: collection.name,
    slug: collection.slug,
    description: collection.tagline,
    imageUrl: collection.image,
    ...BASE_ENTITY_DEFAULTS,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export function mapCatalogProductToCreateInput(
  product: (typeof products)[number],
  categoryId?: string,
): Prisma.ProductCreateInput {
  const stamp = utcNow();
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    brand: product.brand || brand.name,
    ...(categoryId
      ? { category: { connect: { id: categoryId } } }
      : {}),
    ...BASE_ENTITY_DEFAULTS,
    createdAt: stamp,
    updatedAt: stamp,
    variants: {
      create: product.variants.map((variant) => ({
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        colorHex: variant.colorHex,
        priceInPaise: variant.priceInPaise,
        compareAtPriceInPaise: variant.compareAtPriceInPaise,
        stock: variant.stock,
        ...BASE_ENTITY_DEFAULTS,
        createdAt: stamp,
        updatedAt: stamp,
      })),
    },
    images: {
      create: product.images.map((url, sortOrder) => ({
        url,
        alt: product.name,
        sortOrder,
        isPrimary: sortOrder === 0,
        ...BASE_ENTITY_DEFAULTS,
        createdAt: stamp,
        updatedAt: stamp,
      })),
    },
  };
}
