import {
  CachedApi,
  cacheScopeFromToken,
  createHttpClient,
  type AppHttpClient,
} from "@linq/app-layer";
import { resolveApiBaseUrl } from "@linq/secure-api";
import { brand } from "@linq/site-config";
import { cookies } from "next/headers";
import { getSharedCache } from "@/base/runtime";

const baseUrl = resolveApiBaseUrl();

export function createServerHttp(): AppHttpClient {
  return createHttpClient(baseUrl, {
    credentials: "include",
    getCookieHeader: async () => {
      const jar = await cookies();
      return jar.toString();
    },
  });
}

export async function createServerCachedApi(): Promise<CachedApi> {
  const jar = await cookies();
  const token = jar.get(brand.adminAuthCookie)?.value;
  return new CachedApi(createServerHttp(), getSharedCache(), {
    scope: cacheScopeFromToken(token),
    defaultTtlMs: 8_000,
  });
}
