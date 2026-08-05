import {
  productController,
  categoryController,
} from "@/module/index";
import {
  getLowestPrice,
  type StoreCollection,
  type StoreProduct,
} from "@/base/catalog-map";
import type { PageResult } from "@/base/pagination";
import type { ProductListQuery } from "@/module/meta/product/product.repo";

export type { StoreProduct as Product, StoreCollection as Collection };
export { getLowestPrice };
export type { PageResult };

export async function fetchProductsPage(
  params: ProductListQuery = {},
): Promise<PageResult<StoreProduct>> {
  const res = await productController.listPage(params);
  if (!res.ok || !res.data) {
    return {
      items: [],
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      total: 0,
      totalPages: 0,
    };
  }
  return res.data;
}

export async function fetchProducts(limit = 20): Promise<StoreProduct[]> {
  const res = await productController.listActive(limit);
  return res.data ?? [];
}

export async function fetchProductBySlug(
  slug: string,
): Promise<StoreProduct | null> {
  const res = await productController.getBySlug(slug);
  return res.data ?? null;
}

export async function fetchCollections(
  limit = 100,
): Promise<StoreCollection[]> {
  const res = await categoryController.list(limit);
  return res.data ?? [];
}

export async function fetchCollectionBySlug(
  slug: string,
): Promise<StoreCollection | null> {
  const res = await categoryController.getBySlug(slug);
  return res.data ?? null;
}
