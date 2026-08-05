import type { CacheEntry, CacheStore } from "../types";

type Bucket = Map<string, CacheEntry<unknown>>;

const GLOBAL_KEY = "__linq_app_layer_memory_cache__";

function bucket(): Bucket {
  const globalRef = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: Bucket;
  };
  if (!globalRef[GLOBAL_KEY]) {
    globalRef[GLOBAL_KEY] = new Map();
  }
  return globalRef[GLOBAL_KEY];
}

export class MemoryCacheStore implements CacheStore {
  constructor(private readonly store: Bucket = bucket()) {}

  get<T>(key: string): T | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (hit.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    const ttl = Math.max(0, ttlMs);
    if (ttl === 0) {
      this.store.delete(key);
      return;
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  deleteByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  clear(): void {
    this.store.clear();
  }
}
