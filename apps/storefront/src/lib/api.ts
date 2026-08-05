import { createSecureApi, type ApiResponse } from "@linq/secure-api";

export type { ApiResponse };

function resolveApiUrl() {
  if (typeof window === "undefined") {
    return (
      process.env.API_INTERNAL_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://localhost:3001"
    );
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
}

export const API_URL = resolveApiUrl();

export async function apiPost<T>(
  path: string,
  body: unknown,
): Promise<ApiResponse<T>> {
  return createSecureApi(resolveApiUrl()).post<T>(path, body);
}

export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  return createSecureApi(resolveApiUrl()).get<T>(path);
}
