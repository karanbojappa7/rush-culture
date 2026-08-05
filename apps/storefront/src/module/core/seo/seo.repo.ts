import { BaseRepo, type AppHttpClient, type CacheStore } from "@linq/app-layer";
import type { ApiResponse } from "@linq/secure-api";
import type { SeoSettings } from "@linq/site-config";
import { browserCache, browserHttp } from "@/base/runtime";

export class SeoRepo extends BaseRepo {
  constructor(
    http: AppHttpClient = browserHttp,
    cache: CacheStore = browserCache,
  ) {
    super({
      http,
      cache,
      scope: "storefront",
      resource: "seo-settings",
      defaultTtlMs: 60_000,
    });
  }

  get(): Promise<ApiResponse<SeoSettings>> {
    return this.getRaw("/api/seo-settings", { ttlMs: 60_000 });
  }
}
