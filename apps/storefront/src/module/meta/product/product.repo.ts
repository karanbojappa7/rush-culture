import { BaseRepo, type AppHttpClient, type CacheStore } from "@linq/app-layer";
import type { ApiResponse } from "@linq/secure-api";
import { browserCache, browserHttp } from "@/base/runtime";
import type { PageResult } from "@/base/pagination";
import type { ApiProduct } from "@/base/catalog-map";

export type ProductListQuery = {
  page?: number;
  limit?: number;
  q?: string;
  categoryId?: string;
  size?: string;
  color?: string;
  maxPrice?: number;
  isActive?: boolean;
  from?: string;
  to?: string;
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

export class ProductRepo extends BaseRepo {
  constructor(
    http: AppHttpClient = browserHttp,
    cache: CacheStore = browserCache,
  ) {
    super({
      http,
      cache,
      scope: "storefront",
      resource: "products",
      relatedResources: ["categories"],
      defaultTtlMs: 20_000,
    });
  }

  findPage(
    params: ProductListQuery = {},
  ): Promise<ApiResponse<PageResult<ApiProduct>>> {
    const path = `/api/products${toQuery({
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
      from: params.from,
      to: params.to,
    })}`;
    return this.getRaw(path, { ttlMs: 15_000 });
  }

  findBySlug(slug: string): Promise<ApiResponse<ApiProduct>> {
    return this.getRaw(`/api/products/${slug}`, { ttlMs: 30_000 });
  }

  findById(id: string): Promise<ApiResponse<ApiProduct>> {
    return this.getRaw(`/api/products/id/${id}`, { ttlMs: 20_000 });
  }

  stockCheck(body: unknown): Promise<ApiResponse<unknown>> {
    return this.postRaw("/api/products/stock-check", body, []);
  }
}
