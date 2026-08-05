import {
  BaseRepo,
  type AppHttpClient,
  type CacheStore,
} from "@linq/app-layer";
import type { ApiResponse } from "@linq/secure-api";
import type { PageResult } from "@/base/pagination";
import {
  getSharedCache,
  browserCache,
  createBrowserHttp,
} from "@/base/runtime";

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  category?: { name: string; slug: string } | null;
  variants: Array<{
    priceInPaise: number;
    stock: number;
  }>;
};

export type AdminProductListQuery = {
  page?: number | string;
  limit?: number | string;
  q?: string;
  from?: string;
  to?: string;
};

function toQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export class ProductRepo extends BaseRepo {
  constructor(
    http: AppHttpClient,
    cache: CacheStore = getSharedCache(),
    scope?: string,
  ) {
    super({
      http,
      cache,
      scope,
      resource: "products",
      relatedResources: ["categories"],
      defaultTtlMs: 10_000,
    });
  }

  findPage(
    params: AdminProductListQuery,
  ): Promise<ApiResponse<PageResult<AdminProduct>>> {
    const path = `/api/products${toQuery({
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      q: params.q,
      from: params.from,
      to: params.to,
    })}`;
    return this.getRaw(path, { ttlMs: 8_000 });
  }

  findById(id: string): Promise<ApiResponse<AdminProduct>> {
    return this.getRaw(`/api/products/id/${id}`, { ttlMs: 8_000 });
  }

  create(body: unknown): Promise<ApiResponse<AdminProduct>> {
    return this.postRaw("/api/products", body);
  }

  update(id: string, body: unknown): Promise<ApiResponse<AdminProduct>> {
    return this.patchRaw(`/api/products/${id}`, body);
  }

  updateVariants(
    id: string,
    body: unknown,
  ): Promise<ApiResponse<AdminProduct>> {
    return this.patchRaw(`/api/products/${id}/variants`, body);
  }

  updateImages(
    id: string,
    body: unknown,
  ): Promise<ApiResponse<AdminProduct>> {
    return this.patchRaw(`/api/products/${id}/images`, body);
  }

  remove(id: string): Promise<ApiResponse<AdminProduct>> {
    return this.deleteRaw(`/api/products/${id}`);
  }
}

export function createBrowserProductRepo(http?: AppHttpClient) {
  return new ProductRepo(http ?? createBrowserHttp(), browserCache, "browser");
}
