import { LRUCache } from 'lru-cache';

// Query result cache with TTL
const queryCache = new LRUCache<string, { data: unknown; timestamp: number }>({
  max: 1000, // Maximum number of cached queries
  ttl: 1000 * 60 * 5, // 5 minutes TTL
});

// Cache key generator
function generateCacheKey(operation: string, variables: unknown, userId?: string): string {
  const key = {
    operation,
    variables: JSON.stringify(variables),
    userId,
  };
  return JSON.stringify(key);
}

// Cache operations
export const queryCacheService = {
  // Get cached result
  get<T>(operation: string, variables: unknown, userId?: string): T | undefined {
    const key = generateCacheKey(operation, variables, userId);
    const cached = queryCache.get(key);
    return cached?.data as T | undefined;
  },

  // Set cached result
  set<T>(operation: string, variables: unknown, result: T, userId?: string, ttl?: number): void {
    const key = generateCacheKey(operation, variables, userId);
    const cacheValue = { data: result, timestamp: Date.now() };
    if (ttl) {
      queryCache.set(key, cacheValue, { ttl });
    } else {
      queryCache.set(key, cacheValue);
    }
  },

  // Invalidate cache for specific patterns
  invalidate(pattern: string): void {
    const keys = Array.from(queryCache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        queryCache.delete(key);
      }
    });
  },

  // Invalidate all cache
  clear(): void {
    queryCache.clear();
  },

  // Get cache stats
  getStats() {
    return {
      size: queryCache.size,
      max: queryCache.max,
    };
  },
};

// Cache invalidation patterns
export const cacheInvalidationPatterns = {
  // Invalidate game log caches when a game log is created/updated/deleted
  gameLogChanged: (userId: string) => {
    queryCacheService.invalidate(`"operation":"gameLogs"`);
    queryCacheService.invalidate(`"operation":"gameLog"`);
    queryCacheService.invalidate(`"userId":"${userId}"`);
  },

  // Invalidate user-related caches
  userChanged: (userId: string) => {
    queryCacheService.invalidate(`"userId":"${userId}"`);
    queryCacheService.invalidate(`"operation":"me"`);
  },

  // Invalidate friendship caches
  friendshipChanged: (userId: string) => {
    queryCacheService.invalidate(`"operation":"userFriendships"`);
    queryCacheService.invalidate(`"operation":"friendshipRequests"`);
    queryCacheService.invalidate(`"userId":"${userId}"`);
  },
};
