import type { ApiResponse } from "@linq/secure-api";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type AppHttpClient = {
  get<T>(path: string): Promise<ApiResponse<T>>;
  post<T>(path: string, body?: unknown): Promise<ApiResponse<T>>;
  put?<T>(path: string, body?: unknown): Promise<ApiResponse<T>>;
  patch?<T>(path: string, body?: unknown): Promise<ApiResponse<T>>;
  delete?<T>(path: string): Promise<ApiResponse<T>>;
};

export type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export type CacheStore = {
  get<T>(key: string): Promise<T | undefined> | T | undefined;
  set<T>(
    key: string,
    value: T,
    ttlMs: number,
  ): Promise<void> | void;
  delete(key: string): Promise<void> | void;
  deleteByPrefix(prefix: string): Promise<void> | void;
  clear(): Promise<void> | void;
};
