export interface ICache {
  get<T = any>(key: string): Promise<T | null>;

  set<T = any>(key: string, value: T, ttl?: number): Promise<void>;

  del(key: string): Promise<boolean>;

  clear(pattern?: string): Promise<number>;

  has(key: string): Promise<boolean>;

  mget<T = any>(keys: string[]): Promise<Map<string, T>>;

  mset<T = any>(entries: Map<string, T>, ttl?: number): Promise<void>;

  stats(): Promise<{ hits: number; misses: number; keys: number } | null>;
}
