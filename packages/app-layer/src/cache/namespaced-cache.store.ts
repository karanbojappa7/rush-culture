import type { CacheStore } from "../types";

export class NamespacedCacheStore implements CacheStore {
  constructor(
    private readonly inner: CacheStore,
    private readonly prefix: string,
  ) {}

  private scoped(key: string) {
    return `${this.prefix}:${key}`;
  }

  get<T>(key: string) {
    return this.inner.get<T>(this.scoped(key));
  }

  set<T>(key: string, value: T, ttlMs: number) {
    return this.inner.set(this.scoped(key), value, ttlMs);
  }

  delete(key: string) {
    return this.inner.delete(this.scoped(key));
  }

  deleteByPrefix(prefix: string) {
    return this.inner.deleteByPrefix(this.scoped(prefix));
  }

  clear() {
    return this.inner.deleteByPrefix(`${this.prefix}:`);
  }
}
