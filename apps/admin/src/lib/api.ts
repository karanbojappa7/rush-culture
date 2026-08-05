import {
  createSecureApi,
  resolveApiBaseUrl,
  type ApiResponse,
} from "@linq/secure-api";
import { formatInr } from "@linq/site-config";

export type { ApiResponse };
export { formatInr };

const api = createSecureApi(resolveApiBaseUrl(), { credentials: "include" });

export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  return api.get<T>(path);
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  return api.post<T>(path, body);
}

export async function apiPatch<T>(
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  return api.patch<T>(path, body);
}

export async function apiDelete<T>(path: string): Promise<ApiResponse<T>> {
  return api.delete<T>(path);
}
