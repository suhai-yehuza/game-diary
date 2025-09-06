import type { FailureRecord } from '@/types';

export class FailureCache {
  private readonly failures = new Map<string, FailureRecord>();
  constructor(private readonly ttlMs = 60_000) {}

  shouldSkip(key: string): boolean {
    const rec = this.failures.get(key);
    if (!rec) return false;
    return Date.now() - rec.lastFailedAt < this.ttlMs;
  }

  markFailed(key: string, error?: string): void {
    this.failures.set(key, { lastFailedAt: Date.now(), error });
  }

  clear(key?: string): void {
    if (key) this.failures.delete(key);
    else this.failures.clear();
  }
}

export const failureCache = new FailureCache(90_000); // 90s backoff by default
