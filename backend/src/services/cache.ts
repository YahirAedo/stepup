import { LRUCache } from 'lru-cache';

export class ResponseCache<T extends {}> {
  private cache: LRUCache<string, T> | null;
  private disabled: boolean;

  constructor(ttlSeconds: number, maxSize: number) {
    this.disabled = ttlSeconds === 0 || maxSize === 0;
    this.cache = this.disabled ? null : new LRUCache<string, T>({
      max: maxSize,
      ttl: ttlSeconds * 1000, // convertir a milisegundos
    });
  }

  get(key: string): T | undefined {
    if (this.disabled || !this.cache) return undefined;
    return this.cache.get(key);
  }

  set(key: string, value: T): void {
    if (this.disabled || !this.cache) return;
    this.cache.set(key, value);
  }

  clear(): void {
    if (this.cache) this.cache.clear();
  }

  get size(): number {
    return this.cache?.size ?? 0;
  }
}
