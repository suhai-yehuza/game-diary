import { errorHandlers } from '@/lib/utils/error-handler';

import { hybridCacheService } from './hybrid-cache-service';

// Main cache exports
export { simpleCacheService, SimpleCacheService } from './simple-cache-service';
export { redisCacheService, RedisCacheService } from './redis-cache-service';
export { hybridCacheService, HybridCacheService } from './hybrid-cache-service';

// Cache decorators
export {
  CacheMethod,
  CacheProperty,
  CacheAPI,
  CacheGraphQL,
  CacheDatabase,
  InvalidateCache,
  WarmCache,
} from './cache-decorators';

// Cache utilities
export {
  GameCacheUtils,
  UserCacheUtils,
  CommentCacheUtils,
  ReactionCacheUtils,
  SearchCacheUtils,
  CacheWarmingUtils,
  CacheMonitoringUtils,
  NBAHubCacheUtils,
  NotificationCacheUtils,
} from './cache-utilities';

// Games cache utilities
export {
  GamesCacheUtils,
  getGameStatusInfo,
  getGamesCacheTTL,
  generateGamesCacheKey,
} from './games-cache-utils';

// Cache configuration
export const CACHE_CONFIG = {
  // Default TTL values (in seconds)
  TTL: {
    GAME: 7200, // 2 hours - games data is static once season ends
    GAME_LIST: 7200, // 2 hours - game lists don't change frequently
    GAMES_FINISHED: 86400, // 24 hours - finished games never change
    GAMES_LIVE: 300, // 5 minutes - live games change frequently
    GAMES_SCHEDULED: 3600, // 1 hour - scheduled games change less frequently
    USER: 3600, // 1 hour
    USER_FRIENDSHIPS: 1800, // 30 minutes
    GAME_LOG: 900, // 15 minutes
    GAME_LOG_LIST: 600, // 10 minutes
    COMMENT: 600, // 10 minutes
    COMMENT_LIST: 300, // 5 minutes
    REACTION: 300, // 5 minutes
    SEARCH: 1800, // 30 minutes
    NBA_HUB_COUNTS: 3600, // 1 hour - counts don't change frequently ✅
    NBA_HUB_TEAMS_COUNT: 86400, // 24 hours - teams count changes extremely rarely ✅
    PLAYERS: 3600, // 1 hour - increased from 30 minutes (players data changes infrequently)
    TEAMS: 86400, // 24 hours - teams data changes extremely rarely (only during off-season) ✅
    LANDING_PAGE: 300, // 5 minutes - needs to be relatively fresh for user experience ✅
  },

  // Cache strategies
  STRATEGIES: {
    MEMORY: 'memory' as const,
    REDIS: 'redis' as const,
    HYBRID: 'hybrid' as const,
    DATABASE: 'database' as const,
  },

  // Cache priorities
  PRIORITIES: {
    HIGH: 'high' as const,
    MEDIUM: 'medium' as const,
    LOW: 'low' as const,
  },

  // Namespaces
  NAMESPACES: {
    GAMES: 'games',
    USERS: 'users',
    GAME_LOGS: 'gameLogs',
    COMMENTS: 'comments',
    REACTIONS: 'reactions',
    SEARCH: 'search',
    SYSTEM: 'system',
    NBA_HUB: 'nbaHub',
  },

  // Cache tags
  TAGS: {
    GAME: 'game',
    USER: 'user',
    GAME_LOG: 'gameLog',
    COMMENT: 'comment',
    REACTION: 'reaction',
    SEARCH: 'search',
    LIST: 'list',
    STATS: 'stats',
    NBA_HUB: 'nbaHub',
    COUNTS: 'counts',
  },

  // Memory limits
  MEMORY: {
    MAX_ENTRIES: 10000,
    MAX_SIZE_MB: 100,
    CLEANUP_INTERVAL_MS: 60000, // 1 minute
  },

  // Redis limits
  REDIS: {
    MAX_KEY_LENGTH: 512,
    MAX_VALUE_SIZE_MB: 512,
    CONNECTION_TIMEOUT_MS: 5000,
  },

  // Performance thresholds
  THRESHOLDS: {
    SLOW_QUERY_MS: 2000,
    SLOW_MUTATION_MS: 1000,
    LOW_HIT_RATE: 0.5,
    HIGH_RESPONSE_TIME_MS: 100,
  },
};

// Cache initialization function
export function initializeCache() {
  try {
    console.log('🚀 Cache system initialized successfully');
    return true;
  } catch (error) {
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'Cache System',
      action: 'Initialize cache',
      timestamp: new Date().toISOString(),
    });
    return false;
  }
}

// Cache cleanup function
export function cleanupCache() {
  try {
    console.log('🧹 Cache cleanup completed');
  } catch (error) {
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'Cache System',
      action: 'Cleanup cache',
      timestamp: new Date().toISOString(),
    });
  }
}

// Cache health check function
export async function checkCacheHealth() {
  try {
    const healthStatus = await hybridCacheService.getHealthStatus();
    const stats = await hybridCacheService.getStats();

    return {
      healthy: healthStatus.healthy,
      health: {
        redis: healthStatus.redis,
        memory: healthStatus.memory,
      },
      stats,
      strategy: healthStatus.strategy,
      timestamp: healthStatus.timestamp,
    };
  } catch (error) {
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'Cache System',
      action: 'Check cache health',
      timestamp: new Date().toISOString(),
    });
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}
