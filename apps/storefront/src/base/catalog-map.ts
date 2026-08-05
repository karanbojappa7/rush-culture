export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

export type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  categoryId: string | null;
  category?: ApiCategory | null;
  images: Array<{ url: string; alt: string | null; sortOrder: number }>;
  variants: Array<{
    id: string;
    sku: string;
    size: string;
    color: string;
    colorHex: string | null;
    priceInPaise: number;
    compareAtPriceInPaise: number | null;
    stock: number;
  }>;
};

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  collection: string;
  images: string[];
  variants: Array<{
    id: string;
    sku: string;
    size: string;
    color: string;
    colorHex: string;
    priceInPaise: number;
    compareAtPriceInPaise?: number;
    stock: number;
  }>;
};

export type StoreCollection = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  image: string;
};

export function mapApiProduct(product: ApiProduct): StoreProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    brand: product.brand ?? "",
    collection: product.category?.slug ?? "all",
    images: product.images
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => image.url),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      colorHex: variant.colorHex ?? "#111111",
      priceInPaise: variant.priceInPaise,
      compareAtPriceInPaise: variant.compareAtPriceInPaise ?? undefined,
      stock: variant.stock,
    })),
  };
}

export function mapApiCategory(category: ApiCategory): StoreCollection {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    tagline: category.description ?? "",
    image:
      category.imageUrl ??
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
  };
}

export function getLowestPrice(product: StoreProduct) {
  return Math.min(...product.variants.map((variant) => variant.priceInPaise));
}
