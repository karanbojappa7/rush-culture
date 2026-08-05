import type { ApiResponse } from "@linq/secure-api";
import {
  BaseRepo,
  type BaseRepoOptions,
  type ReadThroughOptions,
} from "../base/base.repo";
import type { AppHttpClient, CacheStore } from "../types";

export type CachedApiOptions = Omit<BaseRepoOptions, "http" | "cache">;

export class CachedApi extends BaseRepo {
  constructor(
    http: AppHttpClient,
    cache: CacheStore,
    options: CachedApiOptions = {},
  ) {
    super({
      http,
      cache,
      defaultTtlMs: options.defaultTtlMs ?? 15_000,
      scope: options.scope,
      resource: options.resource,
      relatedResources: options.relatedResources,
    });
  }

  get<T>(
    path: string,
    options?: ReadThroughOptions,
  ): Promise<ApiResponse<T>> {
    return this.getRaw<T>(path, options);
  }

  post<T>(
    path: string,
    body?: unknown,
    invalidatePrefixes?: string[],
  ): Promise<ApiResponse<T>> {
    return this.postRaw<T>(path, body, invalidatePrefixes);
  }

  put<T>(
    path: string,
    body?: unknown,
    invalidatePrefixes?: string[],
  ): Promise<ApiResponse<T>> {
    return this.putRaw<T>(path, body, invalidatePrefixes);
  }

  patch<T>(
    path: string,
    body?: unknown,
    invalidatePrefixes?: string[],
  ): Promise<ApiResponse<T>> {
    return this.patchRaw<T>(path, body, invalidatePrefixes);
  }

  delete<T>(
    path: string,
    invalidatePrefixes?: string[],
  ): Promise<ApiResponse<T>> {
    return this.deleteRaw<T>(path, invalidatePrefixes);
  }
}

export function createCachedApi(
  http: AppHttpClient,
  cache: CacheStore,
  options?: CachedApiOptions,
): CachedApi {
  return new CachedApi(http, cache, options);
}
