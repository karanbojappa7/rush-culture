import { BaseRepo, type AppHttpClient, type CacheStore } from "@linq/app-layer";
import type { ApiResponse } from "@linq/secure-api";
import type { PoliciesSettings } from "@linq/site-config";
import { browserCache, browserHttp } from "@/base/runtime";

export class PoliciesRepo extends BaseRepo {
  constructor(
    http: AppHttpClient = browserHttp,
    cache: CacheStore = browserCache,
  ) {
    super({
      http,
      cache,
      scope: "storefront",
      resource: "policy-settings",
      defaultTtlMs: 60_000,
    });
  }

  get(): Promise<ApiResponse<PoliciesSettings>> {
    return this.getRaw("/api/policy-settings", { ttlMs: 60_000 });
  }
}
