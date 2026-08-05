import {
  createSecureApi,
  resolveApiBaseUrl,
  type ApiResponse,
} from "@linq/secure-api";
import { formatInr } from "@linq/site-config";

export type { ApiResponse };
export { formatInr };

function client() {
  return createSecureApi(resolveApiBaseUrl(), { credentials: "include" });
}

export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  return client().get<T>(path);
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  return client().post<T>(path, body);
}

export async function apiPatch<T>(
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  return client().patch<T>(path, body);
}

export async function apiDelete<T>(path: string): Promise<ApiResponse<T>> {
  return client().delete<T>(path);
}
