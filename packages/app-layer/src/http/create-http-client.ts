import type { ApiResponse } from "@linq/secure-api";
import { createSecureApi, type SecureApiOptions } from "@linq/secure-api";
import type { AppHttpClient } from "../types";

export function createHttpClient(
  baseUrl: string,
  options: SecureApiOptions = {},
): AppHttpClient {
  const api = createSecureApi(baseUrl, options);
  return {
    get: <T>(path: string) => api.get<T>(path),
    post: <T>(path: string, body?: unknown) => api.post<T>(path, body),
    put: <T>(path: string, body?: unknown) => api.put<T>(path, body),
    patch: <T>(path: string, body?: unknown) => api.patch<T>(path, body),
    delete: <T>(path: string) => api.delete<T>(path),
  };
}

export function isSuccessResponse<T>(
  res: ApiResponse<T> | null | undefined,
): res is ApiResponse<T> & { data: T } {
  return Boolean(res && res.status_code === 200 && res.data !== undefined);
}
