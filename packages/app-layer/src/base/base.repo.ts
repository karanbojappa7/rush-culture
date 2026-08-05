import type { ApiResponse } from "@linq/secure-api";
import type { AppHttpClient, CacheStore } from "../types";

export type ReadThroughOptions = {
  ttlMs?: number;
  skipCache?: boolean;
};

export type BaseRepoOptions = {
  http: AppHttpClient;
  cache: CacheStore;
  scope?: string;
  resource?: string;
  relatedResources?: string[];
  defaultTtlMs?: number;
};

export function resourceFromPath(path: string): string {
  const clean = (path.split("?")[0] ?? path).trim();
  const parts = clean.split("/").filter(Boolean);
  if (parts[0] === "api" && parts[1]) return parts[1];
  return parts[0] ?? "root";
}

export function isEphemeralPath(path: string): boolean {
  const clean = path.split("?")[0] ?? path;
  if (clean.includes("stock-check")) return true;
  if (clean.startsWith("/api/health")) return true;
  if (clean.startsWith("/api/cache")) return true;
  if (clean.startsWith("/api/auth/")) return true;
  return false;
}

export abstract class BaseRepo {
  protected readonly http: AppHttpClient;
  protected readonly cache: CacheStore;
  protected readonly scope: string | undefined;
  protected readonly resource: string | undefined;
  protected readonly relatedResources: string[];
  protected readonly defaultTtlMs: number;

  constructor(options: BaseRepoOptions) {
    this.http = options.http;
    this.cache = options.cache;
    this.scope = options.scope;
    this.resource = options.resource;
    this.relatedResources = options.relatedResources ?? [];
    this.defaultTtlMs = options.defaultTtlMs ?? 30_000;
  }

  protected resolveResource(path: string): string {
    return this.resource ?? resourceFromPath(path);
  }

  protected entryKey(method: string, path: string): string {
    const resource = this.resolveResource(path);
    const scopePart = this.scope ? `${this.scope}:` : "";
    return `api:${resource}:${scopePart}${method}:${path}`;
  }

  protected invalidationPrefixes(path: string): string[] {
    const resources = new Set<string>([
      this.resolveResource(path),
      ...this.relatedResources,
    ]);
    return [...resources].map((resource) => `api:${resource}`);
  }

  protected async readThrough<T>(
    key: string,
    loader: () => Promise<ApiResponse<T>>,
    options: ReadThroughOptions = {},
  ): Promise<ApiResponse<T>> {
    const skipCache = options.skipCache === true;
    if (!skipCache) {
      const hit = await this.cache.get<ApiResponse<T>>(key);
      if (hit) return hit;
    }

    const response = await loader();
    if (response.status_code === 200 && !skipCache) {
      await this.cache.set(
        key,
        response,
        options.ttlMs ?? this.defaultTtlMs,
      );
    }
    return response;
  }

  protected async writeThrough<T>(
    writer: () => Promise<ApiResponse<T>>,
    path: string,
    invalidatePrefixes?: string[],
  ): Promise<ApiResponse<T>> {
    const response = await writer();
    if (response.status_code === 200 || response.status_code === 201) {
      const prefixes = invalidatePrefixes ?? this.invalidationPrefixes(path);
      for (const prefix of prefixes) {
        await this.cache.deleteByPrefix(prefix);
      }
    }
    return response;
  }

  async getRaw<T>(
    path: string,
    options: ReadThroughOptions = {},
  ): Promise<ApiResponse<T>> {
    const skipCache =
      options.skipCache === true || isEphemeralPath(path);
    return this.readThrough(
      this.entryKey("GET", path),
      () => this.http.get<T>(path),
      { ...options, skipCache },
    );
  }

  async postRaw<T>(
    path: string,
    body?: unknown,
    invalidatePrefixes?: string[],
  ): Promise<ApiResponse<T>> {
    if (!this.http.post) {
      throw new Error("HTTP client does not support POST");
    }
    return this.writeThrough(
      () => this.http.post!<T>(path, body),
      path,
      invalidatePrefixes,
    );
  }

  async putRaw<T>(
    path: string,
    body?: unknown,
    invalidatePrefixes?: string[],
  ): Promise<ApiResponse<T>> {
    if (!this.http.put) {
      throw new Error("HTTP client does not support PUT");
    }
    return this.writeThrough(
      () => this.http.put!<T>(path, body),
      path,
      invalidatePrefixes,
    );
  }

  async patchRaw<T>(
    path: string,
    body?: unknown,
    invalidatePrefixes?: string[],
  ): Promise<ApiResponse<T>> {
    if (!this.http.patch) {
      throw new Error("HTTP client does not support PATCH");
    }
    return this.writeThrough(
      () => this.http.patch!<T>(path, body),
      path,
      invalidatePrefixes,
    );
  }

  async deleteRaw<T>(
    path: string,
    invalidatePrefixes?: string[],
  ): Promise<ApiResponse<T>> {
    if (!this.http.delete) {
      throw new Error("HTTP client does not support DELETE");
    }
    return this.writeThrough(
      () => this.http.delete!<T>(path),
      path,
      invalidatePrefixes,
    );
  }

  async invalidateResource(resource?: string) {
    const name = resource ?? this.resource;
    if (!name) {
      await this.cache.clear();
      return;
    }
    await this.cache.deleteByPrefix(`api:${name}`);
  }

  async invalidateAllScoped() {
    await this.cache.clear();
  }
}
