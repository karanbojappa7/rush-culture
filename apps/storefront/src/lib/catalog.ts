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

export type PageResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

function toQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === "all") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchProductsPage(params: {
  page?: number;
  limit?: number;
  q?: string;
  categoryId?: string;
  size?: string;
  color?: string;
  maxPrice?: number;
  isActive?: boolean;
} = {}): Promise<PageResult<StoreProduct>> {
  const res = await apiGet<PageResult<ApiProduct>>(
    `/api/products${toQuery({
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      q: params.q,
      categoryId: params.categoryId,
      size: params.size,
      color: params.color,
      maxPrice: params.maxPrice,
      isActive:
        params.isActive === undefined
          ? undefined
          : params.isActive
            ? "true"
            : "false",
    })}`,
  );
  const data = res.data;
  if (!data) {
    return { items: [], page: 1, limit: params.limit ?? 20, total: 0, totalPages: 0 };
  }
  return {
    ...data,
    items: (data.items ?? []).map(mapApiProduct),
  };
}

export async function fetchProducts(limit = 20): Promise<StoreProduct[]> {
  const page = await fetchProductsPage({ page: 1, limit, isActive: true });
  return page.items;
}

export async function fetchProductBySlug(
  slug: string,
): Promise<StoreProduct | null> {
  const res = await apiGet<ApiProduct>(`/api/products/${slug}`);
  if (res.status_code !== 200 || !res.data) return null;
  return mapApiProduct(res.data);
}

export async function fetchCollections(
  limit = 100,
): Promise<StoreCollection[]> {
  const res = await apiGet<PageResult<ApiCategory>>(
    `/api/categories${toQuery({ page: 1, limit })}`,
  );
  return (res.data?.items ?? []).map(mapApiCategory);
}

export async function fetchCollectionBySlug(
  slug: string,
): Promise<StoreCollection | null> {
  const res = await apiGet<ApiCategory>(`/api/categories/slug/${slug}`);
  if (res.status_code !== 200 || !res.data) return null;
  return mapApiCategory(res.data);
}
