/**
 * Redis Cache Usage Guide
 *
 * This guide shows how to effectively use Redis caching throughout the application
 * to improve performance and reduce database/API calls.
 */

import { CacheNamespace } from '@/lib/types';

import { cache } from './index';

// ========================================
// CACHE NAMESPACES
// ========================================

/**
 * Cache namespaces help organize and manage different types of cached data:
 *
 * - SYSTEM: General system data, configuration, etc.
 * - USER_SESSIONS: User-specific data, preferences, etc.
 * - GAME_DATA: Game-related data, scores, schedules, etc.
 * - TEAM_DATA: Team information, stats, etc.
 * - PLAYER_DATA: Player information, stats, etc.
 * - SEARCH_RESULTS: Search query results
 * - API_RESPONSES: External API responses
 * - ANALYTICS: Analytics data, metrics, etc.
 */

// ========================================
// BASIC CACHING PATTERNS
// ========================================

/**
 * Pattern 1: Simple Key-Value Caching
 * Use for simple data that doesn't change frequently
 */
export async function cacheSimpleData() {
  const key = 'user:preferences:123';
  const data = { theme: 'dark', language: 'en' };

  // Cache for 1 hour
  await cache.set(key, data, 60 * 60 * 1000, CacheNamespace.USER_SESSIONS);

  // Retrieve
  const cached = await cache.get(key, CacheNamespace.USER_SESSIONS);
  return cached;
}

/**
 * Pattern 2: Database Query Caching
 * Cache expensive database queries
 */
export async function cacheDatabaseQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  ttl: number = 15 * 60 * 1000 // 15 minutes default
): Promise<T> {
  // Try to get from cache first
  const cached = await cache.get<T>(queryKey, CacheNamespace.GAME_DATA);
  if (cached !== null) {
    console.log(`[Cache] Hit for query: ${queryKey}`);
    return cached;
  }

  // Cache miss, execute query
  console.log(`[Cache] Miss for query: ${queryKey}`);
  const result = await queryFn();

  // Cache the result
  await cache.set(queryKey, result, ttl, CacheNamespace.GAME_DATA);

  return result;
}

/**
 * Pattern 3: API Response Caching
 * Cache external API responses
 */
export async function cacheApiResponse<T>(
  endpoint: string,
  apiCall: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): Promise<T> {
  const cacheKey = `api:${endpoint}`;

  // Try cache first
  const cached = await cache.get<T>(cacheKey, CacheNamespace.API_RESPONSES);
  if (cached !== null) {
    return cached;
  }

  // Make API call
  const response = await apiCall();

  // Cache response
  await cache.set(cacheKey, response, ttl, CacheNamespace.API_RESPONSES);

  return response;
}

/**
 * Pattern 4: Computed Data Caching
 * Cache expensive computations
 */
export async function cacheComputedData<T>(
  computationKey: string,
  computeFn: () => Promise<T>,
  ttl: number = 30 * 60 * 1000 // 30 minutes default
): Promise<T> {
  const cacheKey = `computed:${computationKey}`;

  const cached = await cache.get<T>(cacheKey, CacheNamespace.SYSTEM);
  if (cached !== null) {
    return cached;
  }

  const result = await computeFn();
  await cache.set(cacheKey, result, ttl, CacheNamespace.SYSTEM);

  return result;
}

// ========================================
// SPORTS-SPECIFIC CACHING
// ========================================

/**
 * Cache NBA game data
 */
export async function cacheNBAGames(season: string, date?: string) {
  const key = `nba:games:${season}${date ? `:${date}` : ''}`;
  return cache.get(key, CacheNamespace.GAME_DATA);
}

/**
 * Cache team statistics
 */
export async function cacheTeamStats(teamId: string, season: string) {
  const key = `team:stats:${teamId}:${season}`;
  return cache.get(key, CacheNamespace.TEAM_DATA);
}

/**
 * Cache player statistics
 */
export async function cachePlayerStats(playerId: string, season: string) {
  const key = `player:stats:${playerId}:${season}`;
  return cache.get(key, CacheNamespace.PLAYER_DATA);
}

/**
 * Cache search results
 */
export async function cacheSearchResults(query: string, filters: Record<string, unknown>) {
  const filterString = JSON.stringify(filters);
  const key = `search:${query}:${filterString}`;
  return cache.get(key, CacheNamespace.SEARCH_RESULTS);
}

// ========================================
// CACHE INVALIDATION PATTERNS
// ========================================

/**
 * Invalidate cache when data changes
 */
export function invalidateCache(namespace: CacheNamespace, pattern?: string) {
  // For now, we'll use a simple approach
  // In a production system, you might want to use Redis SCAN or pattern matching
  console.log(`[Cache] Invalidating ${namespace}${pattern ? ` with pattern: ${pattern}` : ''}`);

  // You could implement pattern-based invalidation here
  // For example, invalidate all game data when a new game is added
}

/**
 * Invalidate user-specific cache when user data changes
 */
export function invalidateUserCache(userId: string) {
  const key = `user:${userId}:*`;
  invalidateCache(CacheNamespace.USER_SESSIONS, key);
}

/**
 * Invalidate game data cache when new data is available
 */
export function invalidateGameDataCache(season?: string) {
  const pattern = season ? `nba:games:${season}*` : 'nba:games:*';
  invalidateCache(CacheNamespace.GAME_DATA, pattern);
}

// ========================================
// CACHE MONITORING
// ========================================

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    memory: cache.getStats(),
    redis: cache.getRedisStats(),
  };
}

/**
 * Test cache connectivity
 */
export async function testCacheConnectivity() {
  const redisConnected = await cache.testRedisConnection();
  const stats = getCacheStats();

  return {
    redisConnected,
    memoryHits: stats.memory.hits,
    memoryMisses: stats.memory.misses,
    memorySize: stats.memory.size,
  };
}

// ========================================
// BEST PRACTICES
// ========================================

/**
 * Cache Best Practices:
 *
 * 1. Use appropriate TTL (Time To Live):
 *    - User data: 15-30 minutes
 *    - Game data: 5-15 minutes
 *    - API responses: 1-5 minutes
 *    - Static data: 1-24 hours
 *
 * 2. Use meaningful cache keys:
 *    - Include namespace prefix
 *    - Include relevant parameters
 *    - Use consistent naming conventions
 *
 * 3. Handle cache misses gracefully:
 *    - Always have a fallback to source data
 *    - Don't let cache failures break your app
 *
 * 4. Monitor cache performance:
 *    - Track hit/miss ratios
 *    - Monitor memory usage
 *    - Set up alerts for cache failures
 *
 * 5. Invalidate cache appropriately:
 *    - When data is updated
 *    - When user preferences change
 *    - When external data is refreshed
 */

// ========================================
// EXAMPLE USAGE IN COMPONENTS/API ROUTES
// ========================================

/**
 * Example: Caching in an API route
 */
export async function exampleApiRoute() {
  // Cache expensive database query
  const games = await cacheDatabaseQuery(
    'live-games-today',
    async () => {
      // Expensive database query here
      // This is an example - replace with actual implementation
      return Promise.resolve([]);
    },
    5 * 60 * 1000 // 5 minutes
  );

  return games;
}

/**
 * Example: Caching in a React component
 */
export async function exampleComponentData(userId: string) {
  // Cache user preferences
  const preferences = await cache.get(`user:preferences:${userId}`, CacheNamespace.USER_SESSIONS);

  if (!preferences) {
    // Fetch from database and cache
    // This is an example - replace with actual implementation
    const userPrefs = await Promise.resolve({});
    await cache.set(
      `user:preferences:${userId}`,
      userPrefs,
      30 * 60 * 1000, // 30 minutes
      CacheNamespace.USER_SESSIONS
    );
    return userPrefs;
  }

  return preferences;
}
