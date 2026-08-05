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

export const browserHttp = createBrowserHttp();
export const browserCache = sharedCache;

export function createBrowserCachedApi(): CachedApi {
  return new CachedApi(browserHttp, browserCache, {
    scope: "browser",
    defaultTtlMs: 12_000,
  });
}

const browserApi = createBrowserCachedApi();

export function getBrowserCachedApi(): CachedApi {
  return browserApi;
}
