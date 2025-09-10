import { errorHandlers } from '@/lib/utils/error-handler';
import type { IGameStatusInfo } from '@/types';

// Cache configuration constants to avoid circular dependency
const CACHE_CONFIG = {
  TTL: {
    GAME: 7200, // 2 hours
    GAMES_FINISHED: 86400, // 24 hours
    GAMES_LIVE: 300, // 5 minutes
    GAMES_SCHEDULED: 3600, // 1 hour
  },
};

/**
 * Utility functions for games caching strategy
 */

/**
 * Determine game status from various status formats
 */
export function getGameStatusInfo(game: { status?: unknown }): IGameStatusInfo {
  const status = game.status;

  // Handle different status formats
  let statusString = '';

  if (typeof status === 'string') {
    statusString = status.toLowerCase();
  } else if (typeof status === 'object' && status !== null) {
    const statusObj = status as { short?: unknown; long?: unknown };
    const shortStatus = typeof statusObj.short === 'string' ? statusObj.short : '';
    const longStatus = typeof statusObj.long === 'string' ? statusObj.long : '';
    statusString = (shortStatus || longStatus || '').toLowerCase();
  }

  const isFinished = statusString.includes('finished') || statusString.includes('final');
  const isLive = statusString.includes('live') || statusString.includes('in progress');
  const isScheduled = statusString.includes('scheduled') || statusString.includes('upcoming');

  return {
    status: statusString,
    isFinished,
    isLive,
    isScheduled,
  };
}

/**
 * Get appropriate cache TTL based on game status or search type
 */
export function getGamesCacheTTL(games: Array<{ status?: unknown }> | string): number {
  // Handle search type
  if (typeof games === 'string') {
    if (games === 'search') {
      return CACHE_CONFIG.TTL.GAME; // 2 hours for search results
    }
    return CACHE_CONFIG.TTL.GAME; // Default TTL
  }

  // Handle array of games (original logic)
  if (games.length === 0) {
    return CACHE_CONFIG.TTL.GAME; // Default TTL
  }

  // Analyze game statuses
  const statusCounts = {
    finished: 0,
    live: 0,
    scheduled: 0,
    other: 0,
  };

  games.forEach(game => {
    const statusInfo = getGameStatusInfo(game);
    if (statusInfo.isFinished) {
      statusCounts.finished++;
    } else if (statusInfo.isLive) {
      statusCounts.live++;
    } else if (statusInfo.isScheduled) {
      statusCounts.scheduled++;
    } else {
      statusCounts.other++;
    }
  });

  // Determine TTL based on dominant status
  const total = games.length;
  const finishedRatio = statusCounts.finished / total;
  const liveRatio = statusCounts.live / total;
  const scheduledRatio = statusCounts.scheduled / total;

  // If mostly finished games, use long TTL
  if (finishedRatio >= 0.8) {
    return CACHE_CONFIG.TTL.GAMES_FINISHED; // 24 hours
  }

  // If mostly live games, use short TTL
  if (liveRatio >= 0.5) {
    return CACHE_CONFIG.TTL.GAMES_LIVE; // 5 minutes
  }

  // If mostly scheduled games, use medium TTL
  if (scheduledRatio >= 0.8) {
    return CACHE_CONFIG.TTL.GAMES_SCHEDULED; // 1 hour
  }

  // Mixed status - use default TTL
  return CACHE_CONFIG.TTL.GAME; // 2 hours
}

/**
 * Generate cache key for paginated games or search results
 */
export function generateGamesCacheKey(params: {
  season?: string;
  page?: number;
  limit?: number;
  status?: string;
  filters?: Record<string, unknown>;
  type?: 'paginated' | 'search';
  query?: string;
}): string {
  const {
    season = 'all',
    page,
    limit,
    status = 'all',
    filters = {},
    type = 'paginated',
    query,
  } = params;

  let key: string;

  if (type === 'search') {
    // Search cache key format
    const queryHash = query
      ? Buffer.from(query.toLowerCase().trim())
          .toString('base64')
          .replace(/[^a-zA-Z0-9]/g, '')
      : 'empty';
    key = `games:search:${season}:${queryHash}:limit:${limit || 100}`;
  } else {
    // Paginated cache key format
    key = `games:paginated:${season}:${status}:page:${page || 1}:limit:${limit || 50}`;
  }

  // Add filter parameters to key if they exist
  const filterKeys = Object.keys(filters).sort();
  if (filterKeys.length > 0) {
    const filterString = filterKeys.map(key => `${key}:${String(filters[key])}`).join(':');
    key += `:filters:${filterString}`;
  }

  return key;
}

/**
 * Cache invalidation utilities for games
 */
export class GamesCacheUtils {
  /**
   * Invalidate all games cache for a specific season
   */
  static invalidateSeasonCache(season: string): void {
    const patterns = [
      `games:paginated:${season}:*`,
      `games:season:${season}`,
      `games:all-seasons:merged`,
    ];

    for (const pattern of patterns) {
      try {
        console.log(`Would invalidate cache pattern: ${pattern}`);
      } catch (error) {
        errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
          component: 'GamesCacheUtils',
          action: 'invalidateSeasonCache',
          metadata: { pattern, season },
        });
      }
    }
  }

  /**
   * Invalidate cache for specific game status
   */
  static invalidateStatusCache(status: string): void {
    const patterns = [`games:paginated:*:${status}:*`];

    for (const pattern of patterns) {
      try {
        console.log(`Would invalidate status cache pattern: ${pattern}`);
      } catch (error) {
        errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
          component: 'GamesCacheUtils',
          action: 'invalidateStatusCache',
          metadata: { pattern, status },
        });
      }
    }
  }

  /**
   * Warm up cache for popular game queries
   */
  static warmPopularQueries(): void {
    const popularQueries = [
      { season: '2024', status: 'finished', page: 1, limit: 50 },
      { season: '2024', status: 'live', page: 1, limit: 50 },
      { season: 'all', status: 'finished', page: 1, limit: 100 },
    ];

    for (const query of popularQueries) {
      try {
        const url = `/api/games/paginated?${new URLSearchParams({
          season: query.season,
          status: query.status,
          page: query.page.toString(),
          limit: query.limit.toString(),
        })}`;

        // Note: This would need to be implemented as a service call
        console.log(`Would warm cache for: ${url}`);
      } catch (error) {
        errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
          component: 'GamesCacheUtils',
          action: 'warmPopularQueries',
          metadata: { query },
        });
      }
    }
  }
}
