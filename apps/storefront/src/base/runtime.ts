import {
  CachedApi,
  MemoryCacheStore,
  createHttpClient,
  type AppHttpClient,
  type CacheStore,
} from "@linq/app-layer";
import { resolveApiBaseUrl } from "@linq/secure-api";

const baseUrl = resolveApiBaseUrl();
const sharedCache = new MemoryCacheStore();

export function getSharedCache(): CacheStore {
  return sharedCache;
}

export function createBrowserHttp(): AppHttpClient {
  return createHttpClient(baseUrl, { credentials: "include" });
}

export function createAppHttp(): AppHttpClient {
  return createHttpClient(baseUrl, { credentials: "include" });
}

export const browserHttp = createBrowserHttp();
export const browserCache = sharedCache;

export function createCachedApi(
  http: AppHttpClient = browserHttp,
  cache: CacheStore = browserCache,
): CachedApi {
  return new CachedApi(http, cache, {
    scope: "storefront",
    defaultTtlMs: 20_000,
  });
}

const appApi = createCachedApi();

export function getCachedApi(): CachedApi {
  return appApi;
}
