import type { ApiResponse } from "@linq/secure-api";
import { formatInr } from "@linq/site-config";
import { createServerCachedApi } from "@/base/runtime-server";

export type { ApiResponse };
export { formatInr };

export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  const api = await createServerCachedApi();
  return api.get<T>(path);
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  const api = await createServerCachedApi();
  return api.post<T>(path, body);
}

export async function apiPatch<T>(
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  const api = await createServerCachedApi();
  return api.patch<T>(path, body);
}

export async function apiPut<T>(
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  const api = await createServerCachedApi();
  return api.put<T>(path, body);
}

export async function apiDelete<T>(path: string): Promise<ApiResponse<T>> {
  const api = await createServerCachedApi();
  return api.delete<T>(path);
}
