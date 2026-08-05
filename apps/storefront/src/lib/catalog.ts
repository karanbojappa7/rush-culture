import { apiGet } from "@/lib/api";
import {
  getLowestPrice,
  mapApiCategory,
  mapApiProduct,
  type ApiCategory,
  type ApiProduct,
  type StoreCollection,
  type StoreProduct,
} from "@/lib/catalog-map";

export type { StoreProduct as Product, StoreCollection as Collection };
export { getLowestPrice };

export async function fetchProducts(query = ""): Promise<StoreProduct[]> {
  const res = await apiGet<ApiProduct[]>(`/api/products${query}`);
  return (res.data ?? []).map(mapApiProduct);
}

export async function fetchProductBySlug(
  slug: string,
): Promise<StoreProduct | null> {
  const res = await apiGet<ApiProduct>(`/api/products/${slug}`);
  if (res.status_code !== 200 || !res.data) return null;
  return mapApiProduct(res.data);
}

export async function fetchCollections(): Promise<StoreCollection[]> {
  const res = await apiGet<ApiCategory[]>("/api/categories");
  return (res.data ?? []).map(mapApiCategory);
}

export async function fetchCollectionBySlug(
  slug: string,
): Promise<StoreCollection | null> {
  const res = await apiGet<ApiCategory>(`/api/categories/slug/${slug}`);
  if (res.status_code !== 200 || !res.data) return null;
  return mapApiCategory(res.data);
}
