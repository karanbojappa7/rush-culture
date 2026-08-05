import { BaseRepo, type AppHttpClient, type CacheStore } from "@linq/app-layer";
import type { ApiResponse } from "@linq/secure-api";
import type { BrandSettings } from "@linq/site-config";
import { browserCache, browserHttp } from "@/base/runtime";

export class BrandRepo extends BaseRepo {
  constructor(
    http: AppHttpClient = browserHttp,
    cache: CacheStore = browserCache,
  ) {
    super({
      http,
      cache,
      scope: "storefront",
      resource: "brand-settings",
      defaultTtlMs: 60_000,
    });
  }

  get(): Promise<ApiResponse<BrandSettings>> {
    return this.getRaw("/api/brand-settings", { ttlMs: 60_000 });
  }
}
