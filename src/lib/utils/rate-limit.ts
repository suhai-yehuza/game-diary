export type RateLimitConfig = {
  tokensPerInterval: number;
  intervalMs: number;
};

class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private readonly capacity: number,
    private readonly intervalMs: number
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    if (elapsed <= 0) return;

    const tokensToAdd = Math.floor(elapsed / this.intervalMs) * this.capacity;
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  async removeToken(): Promise<void> {
    this.refill();
    if (this.tokens > 0) {
      this.tokens -= 1;
      return;
    }
    const waitMs = Math.max(this.intervalMs - (Date.now() - this.lastRefill), 50);
    await new Promise(resolve => setTimeout(resolve, waitMs));
    return this.removeToken();
  }
}

export class RateLimiter {
  private readonly buckets = new Map<string, TokenBucket>();
  constructor(private readonly defaultConfig: RateLimitConfig) {}

  private getBucket(key: string, config?: Partial<RateLimitConfig>): TokenBucket {
    const cfg = { ...this.defaultConfig, ...config };
    const capacity = Math.max(1, cfg.tokensPerInterval);
    const intervalMs = Math.max(50, cfg.intervalMs);
    const mapKey = `${capacity}:${intervalMs}:${key}`;
    let bucket = this.buckets.get(mapKey);
    if (!bucket) {
      bucket = new TokenBucket(capacity, intervalMs);
      this.buckets.set(mapKey, bucket);
    }
    return bucket;
  }

  async limit<T>(key: string, fn: () => Promise<T>, config?: Partial<RateLimitConfig>): Promise<T> {
    const bucket = this.getBucket(key, config);
    await bucket.removeToken();
    return fn();
  }
}

// Default: 5 tokens per 1000ms per-key
export const rateLimiter = new RateLimiter({ tokensPerInterval: 5, intervalMs: 1000 });
