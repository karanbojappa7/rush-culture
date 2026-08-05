import { BaseRepo, type AppHttpClient, type CacheStore } from "@linq/app-layer";
import type { ApiResponse } from "@linq/secure-api";
import { browserCache, browserHttp } from "@/base/runtime";
import type { ApiCategory } from "@/base/catalog-map";
import type { PageResult } from "@/base/pagination";

function toQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export class CategoryRepo extends BaseRepo {
  constructor(
    http: AppHttpClient = browserHttp,
    cache: CacheStore = browserCache,
  ) {
    super({
      http,
      cache,
      scope: "storefront",
      resource: "categories",
      relatedResources: ["products"],
      defaultTtlMs: 60_000,
    });
  }

  findPage(
    params: {
      page?: number;
      limit?: number;
    } = {},
  ): Promise<ApiResponse<PageResult<ApiCategory>>> {
    const path = `/api/categories${toQuery({
      page: params.page ?? 1,
      limit: params.limit ?? 100,
    })}`;
    return this.getRaw(path, { ttlMs: 60_000 });
  }

  findBySlug(slug: string): Promise<ApiResponse<ApiCategory>> {
    return this.getRaw(`/api/categories/slug/${slug}`, { ttlMs: 60_000 });
  }
}
