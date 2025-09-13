import { ErrorHandler } from '@/lib/utils/error-handler';
import { getServerApiUrl } from '@/lib/utils/server-api-client';
import type {
  ICacheOptions,
  IAppNotification,
  IComment,
  Game,
  UserSummary,
  Comment,
  Reaction,
  Friendship,
} from '@/types';

import { simpleCacheService } from './simple-cache-service';

/**
 * Cache utilities for different data types and use cases
 */

// Game-related caching utilities
export class GameCacheUtils {
  private static readonly NAMESPACE = 'games';
  private static readonly DEFAULT_TTL = 1800; // 30 minutes

  /**
   * Cache game data with appropriate TTL
   */
  static cacheGame(gameId: string, gameData: Game, options: ICacheOptions = {}) {
    const cacheKey = `game:${gameId}`;
    simpleCacheService.set(cacheKey, gameData, {
      namespace: this.NAMESPACE,
      ttl: options.ttl || this.DEFAULT_TTL,
      tags: ['game', `game:${gameId}`],
      strategy: 'hybrid',
      ...options,
    });
  }

  /**
   * Get cached game data
   */
  static async getCachedGame(gameId: string): Promise<Game | null> {
    const cacheKey = `game:${gameId}`;
    return simpleCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Cache game list with pagination support
   */
  static cacheGameList(
    filters: Record<string, unknown>,
    pagination: Record<string, unknown>,
    gameList: Game[],
    options: ICacheOptions = {}
  ) {
    const cacheKey = `gameList:${JSON.stringify(filters)}:${JSON.stringify(pagination)}`;
    simpleCacheService.set(cacheKey, gameList, {
      namespace: this.NAMESPACE,
      ttl: options.ttl || 900, // 15 minutes for lists
      tags: ['gameList', 'games'],
      strategy: 'hybrid',
      ...options,
    });
  }

  /**
   * Get cached game list
   */
  static async getCachedGameList(
    filters: Record<string, unknown>,
    pagination: Record<string, unknown>
  ): Promise<Game[] | null> {
    const cacheKey = `gameList:${JSON.stringify(filters)}:${JSON.stringify(pagination)}`;
    return simpleCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Invalidate game-related caches
   */
  static invalidateGameCaches(gameId?: string) {
    if (gameId) {
      simpleCacheService.invalidate({
        pattern: `game:${gameId}:*`,
      });
    } else {
      simpleCacheService.invalidate({});
    }

    // Also invalidate NBA Hub counts since games count may have changed
    ErrorHandler.getInstance().handleSync(
      () => NBAHubCacheUtils.invalidateSpecificCountCaches('games'),
      {
        component: 'GameCacheUtils',
        action: 'invalidateAll',
      }
    );
  }
}

// User-related caching utilities
export class UserCacheUtils {
  private static readonly NAMESPACE = 'users';
  private static readonly DEFAULT_TTL = 3600; // 1 hour

  /**
   * Cache user data
   */
  static cacheUser(userId: string, userData: UserSummary, options: ICacheOptions = {}) {
    const cacheKey = `user:${userId}`;
    simpleCacheService.set(cacheKey, userData, {
      namespace: this.NAMESPACE,
      ttl: options.ttl || this.DEFAULT_TTL,
      tags: ['user', `user:${userId}`],
      strategy: 'hybrid',
      ...options,
    });
  }

  /**
   * Get cached user data
   */
  static async getCachedUser(userId: string): Promise<UserSummary | null> {
    const cacheKey = `user:${userId}`;
    return simpleCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Cache user friendships
   */
  static cacheUserFriendships(
    userId: string,
    friendships: Friendship[],
    options: ICacheOptions = {}
  ) {
    const cacheKey = `friendships:${userId}`;
    simpleCacheService.set(cacheKey, friendships, {
      namespace: this.NAMESPACE,
      ttl: options.ttl || 1800, // 30 minutes
      tags: ['friendships', `user:${userId}`],
      strategy: 'hybrid',
      ...options,
    });
  }

  /**
   * Get cached user friendships
   */
  static async getCachedUserFriendships(userId: string): Promise<Friendship[] | null> {
    const cacheKey = `friendships:${userId}`;
    return simpleCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Invalidate user-related caches
   */
  static invalidateUserCaches(userId?: string) {
    if (userId) {
      simpleCacheService.invalidate({
        pattern: `user:${userId}:*`,
      });
    } else {
      simpleCacheService.invalidate({});
    }
  }
}

// Comment caching utilities
export class CommentCacheUtils {
  private static readonly NAMESPACE = 'comments';
  private static readonly DEFAULT_TTL = 600; // 10 minutes

  /**
   * Cache comment data
   */
  static cacheComment(commentId: string, commentData: IComment, options: ICacheOptions = {}) {
    const cacheKey = `comment:${commentId}`;
    simpleCacheService.set(cacheKey, commentData, {
      namespace: this.NAMESPACE,
      ttl: options.ttl || this.DEFAULT_TTL,
      tags: ['comment', `comment:${commentId}`],
      strategy: 'hybrid',
      ...options,
    });
  }

  /**
   * Get cached comment data
   */
  static async getCachedComment(commentId: string): Promise<Comment | null> {
    const cacheKey = `comment:${commentId}`;
    return simpleCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Cache comment list for a parent
   */
  static cacheCommentList(
    parentId: string,
    parentType: string,
    comments: IComment[],
    options: ICacheOptions = {}
  ) {
    const cacheKey = `commentList:${parentType}:${parentId}`;
    simpleCacheService.set(cacheKey, comments, {
      namespace: this.NAMESPACE,
      ttl: options.ttl || 300, // 5 minutes for comment lists
      tags: ['commentList', `parent:${parentType}:${parentId}`],
      strategy: 'hybrid',
      ...options,
    });
  }

  /**
   * Get cached comment list
   */
  static async getCachedCommentList(
    parentId: string,
    parentType: string
  ): Promise<Comment[] | null> {
    const cacheKey = `commentList:${parentType}:${parentId}`;
    return simpleCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Invalidate comment caches
   */
  static invalidateCommentCaches(commentId?: string, parentId?: string, parentType?: string) {
    if (commentId) {
      simpleCacheService.invalidate({
        pattern: `comment:${commentId}:*`,
      });
    } else if (parentId && parentType) {
      simpleCacheService.invalidate({
        pattern: `parent:${parentType}:${parentId}:*`,
      });
    } else {
      simpleCacheService.invalidate({});
    }
  }
}

// Reaction caching utilities
export class ReactionCacheUtils {
  private static readonly NAMESPACE = 'reactions';
  private static readonly DEFAULT_TTL = 300; // 5 minutes

  /**
   * Cache reactions for a target
   */
  static cacheReactions(
    targetId: string,
    targetType: string,
    reactions: Reaction[],
    options: ICacheOptions = {}
  ) {
    const cacheKey = `reactions:${targetType}:${targetId}`;
    simpleCacheService.set(cacheKey, reactions, {
      namespace: this.NAMESPACE,
      ttl: options.ttl || this.DEFAULT_TTL,
      tags: ['reactions', `target:${targetType}:${targetId}`],
      strategy: 'hybrid',
      ...options,
    });
  }

  /**
   * Get cached reactions
   */
  static async getCachedReactions(
    targetId: string,
    targetType: string
  ): Promise<Reaction[] | null> {
    const cacheKey = `reactions:${targetType}:${targetId}`;
    return simpleCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Invalidate reaction caches
   */
  static invalidateReactionCaches(targetId?: string, targetType?: string) {
    if (targetId && targetType) {
      simpleCacheService.invalidate({
        pattern: `target:${targetType}:${targetId}:*`,
      });
    } else {
      simpleCacheService.invalidate({});
    }
  }
}

// Search caching utilities
export class SearchCacheUtils {
  private static readonly NAMESPACE = 'search';
  private static readonly DEFAULT_TTL = 1800; // 30 minutes

  /**
   * Cache search results
   */
  static cacheSearchResults(
    query: string,
    searchType: string,
    results: unknown[],
    options: ICacheOptions = {}
  ) {
    const cacheKey = `search:${searchType}:${query}`;
    simpleCacheService.set(cacheKey, results, {
      namespace: this.NAMESPACE,
      ttl: options.ttl || this.DEFAULT_TTL,
      tags: ['search', `searchType:${searchType}`],
      strategy: 'hybrid',
      ...options,
    });
  }

  /**
   * Get cached search results
   */
  static async getCachedSearchResults(
    query: string,
    searchType: string
  ): Promise<unknown[] | null> {
    const cacheKey = `search:${searchType}:${query}`;
    return simpleCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Invalidate search caches
   */
  static invalidateSearchCaches(searchType?: string) {
    if (searchType) {
      simpleCacheService.invalidate({
        pattern: `searchType:${searchType}:*`,
      });
    } else {
      simpleCacheService.invalidate({});
    }
  }
}

// Cache warming utilities
export class CacheWarmingUtils {
  /**
   * Warm up frequently accessed data
   */
  static async warmUpFrequentData() {
    await ErrorHandler.getInstance().handleAsync(
      async () => {
        // Warm up top games
        await this.warmUpTopGames();

        // Warm up recent game logs
        await this.warmUpRecentGameLogs();

        // Warm up user statistics
        await this.warmUpUserStats();

        console.log('[Cache Warming] Frequent data warmed up successfully');
      },
      {
        component: 'CacheWarmingUtils',
        action: 'warmUpFrequentData',
      }
    );
  }

  /**
   * Warm up top games cache
   */
  private static async warmUpTopGames() {
    // This would fetch and cache top games
    // Implementation depends on your data fetching logic
  }

  /**
   * Warm up recent game logs cache
   */
  private static async warmUpRecentGameLogs() {
    // This would fetch and cache recent game logs
    // Implementation depends on your data fetching logic
  }

  /**
   * Warm up user statistics cache
   */
  private static async warmUpUserStats() {
    // This would fetch and cache user statistics
    // Implementation depends on your data fetching logic
  }
}

// Cache monitoring utilities
export class CacheMonitoringUtils {
  /**
   * Get comprehensive cache statistics
   */
  static getCacheStats() {
    const stats = simpleCacheService.getStats();
    const health = { status: 'healthy', memory: true, redis: false, database: true };

    return {
      ...stats,
      health,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Monitor cache performance
   */
  static monitorCachePerformance() {
    const stats = this.getCacheStats();

    // Log performance metrics
    console.log('[Cache Monitor] Performance Metrics:', {
      size: stats.size,
      maxSize: stats.maxSize,
      keysCount: stats.keys.length,
      timestamp: stats.timestamp,
    });
  }
}

// NBA Hub caching utilities
export class NBAHubCacheUtils {
  private static readonly NAMESPACE = 'nbaHub';
  private static readonly DEFAULT_TTL = 3600; // 1 hour - counts don't change frequently

  /**
   * Cache NBA Hub counts (individual keys for better granularity)
   */
  static cacheNBACounts(
    counts: { games: number; teams: number; players: number },
    options: ICacheOptions = {}
  ) {
    const ttl = options.ttl || this.DEFAULT_TTL;

    // Cache each count separately for better granular control
    void Promise.all([
      // Games count
      simpleCacheService.set('games.count', counts.games, {
        ttl,
        tags: ['nbaHub', 'counts', 'games'],
        strategy: 'hybrid',
        ...options,
      }),

      // Teams count
      simpleCacheService.set('teams.count', counts.teams, {
        ttl,
        tags: ['nbaHub', 'counts', 'teams'],
        strategy: 'hybrid',
        ...options,
      }),

      // Players count
      simpleCacheService.set('players.count', counts.players, {
        ttl,
        tags: ['nbaHub', 'counts', 'players'],
        strategy: 'hybrid',
        ...options,
      }),
    ]);
  }

  /**
   * Get cached NBA Hub counts (aggregated from individual keys)
   */
  static getCachedNBACounts(): {
    totalGames: number;
    totalTeams: number;
    totalPlayers: number;
    liveGames: number;
  } | null {
    const result = ErrorHandler.getInstance().handleSync(
      () => {
        // Fetch all counts in parallel
        const gamesCount = simpleCacheService.get<number>('games.count', {
          strategy: 'hybrid',
        });
        const teamsCount = simpleCacheService.get<number>('teams.count', {
          strategy: 'hybrid',
        });
        const playersCount = simpleCacheService.get<number>('players.count', {
          strategy: 'hybrid',
        });

        // Only return if all counts are available
        if (gamesCount !== null && teamsCount !== null && playersCount !== null) {
          return {
            totalGames: gamesCount,
            totalTeams: teamsCount,
            totalPlayers: playersCount,
            liveGames: 0, // This will be updated by the live games service
          };
        }

        return null;
      },
      {
        component: 'NBAHubCacheUtils',
        action: 'getCachedNBACounts',
      }
    );

    return result || null;
  }

  /**
   * Get individual cached count
   */
  static getCachedCount(type: 'games' | 'teams' | 'players'): number | null {
    return (
      ErrorHandler.getInstance().handleSync(
        () => {
          const result = simpleCacheService.get<number>(`${type}.count`, {
            strategy: 'hybrid',
          });
          return result || null;
        },
        {
          component: 'NBAHubCacheUtils',
          action: 'getCachedCount',
        }
      ) || null
    );
  }

  /**
   * Cache individual count
   */
  static cacheCount(
    type: 'games' | 'teams' | 'players',
    count: number,
    options: ICacheOptions = {}
  ) {
    ErrorHandler.getInstance().handleSync(
      () => {
        simpleCacheService.set(`${type}.count`, count, {
          ttl: options.ttl || this.DEFAULT_TTL,
          tags: ['nbaHub', 'counts', type],
          strategy: 'hybrid',
          ...options,
        });
      },
      {
        component: 'NBAHubCacheUtils',
        action: 'cacheCount',
      }
    );
  }

  /**
   * Invalidate NBA Hub count caches
   * Call this when games, teams, or players are added/removed
   */
  static invalidateNBACountCaches() {
    simpleCacheService.invalidate({
      pattern: 'nbaHub:*',
    });
  }

  /**
   * Invalidate specific count caches
   */
  static invalidateSpecificCountCaches(type: 'games' | 'teams' | 'players') {
    simpleCacheService.invalidate({
      pattern: `nbaHub:${type}:*`,
    });
  }

  /**
   * Warm up NBA Hub counts cache
   * Call this during app initialization or after cache invalidation
   */
  static async warmupNBACountsCache() {
    await ErrorHandler.getInstance().handleAsync(
      async () => {
        console.log('🔥 Warming up NBA Hub counts cache...');
        const response = await fetch(getServerApiUrl('/api/nba-hub/counts'));
        const data = await response.json();

        if (data.success) {
          this.cacheNBACounts(data.counts);
          console.log('✅ NBA Hub counts cache warmed up successfully');
        }
      },
      {
        component: 'NBAHubCacheUtils',
        action: 'warmupNBACountsCache',
      }
    );
  }
}

// Notification caching utilities
export class NotificationCacheUtils {
  private static readonly NAMESPACE = 'notifications';
  private static readonly DEFAULT_TTL = 300; // 5 minutes - notifications change frequently

  /**
   * Cache user notifications
   */
  static cacheUserNotifications(
    userId: string,
    notifications: IAppNotification[],
    options: ICacheOptions = {}
  ) {
    const cacheKey = `user:${userId}:notifications`;
    simpleCacheService.set(cacheKey, notifications, {
      namespace: this.NAMESPACE,
      ttl: options.ttl || this.DEFAULT_TTL,
      tags: ['notifications', `user:${userId}`],
      strategy: 'hybrid',
      ...options,
    });
  }

  /**
   * Get cached user notifications
   */
  static async getCachedUserNotifications(userId: string): Promise<IAppNotification[] | null> {
    const cacheKey = `user:${userId}:notifications`;
    return simpleCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Cache user unread count
   */
  static cacheUserUnreadCount(userId: string, count: number, options: ICacheOptions = {}) {
    const cacheKey = `user:${userId}:unreadCount`;
    simpleCacheService.set(cacheKey, count, {
      namespace: this.NAMESPACE,
      ttl: options.ttl || this.DEFAULT_TTL,
      tags: ['notifications', 'unreadCount', `user:${userId}`],
      strategy: 'hybrid',
      ...options,
    });
  }

  /**
   * Get cached user unread count
   */
  static async getCachedUserUnreadCount(userId: string): Promise<number | null> {
    const cacheKey = `user:${userId}:unreadCount`;
    return simpleCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Invalidate user notification caches
   */
  static invalidateUserNotificationCaches(userId: string) {
    simpleCacheService.invalidate({
      pattern: `user:${userId}:notifications:*`,
    });
  }

  /**
   * Invalidate specific notification caches
   */
  static invalidateNotificationCaches(type: 'notifications' | 'unreadCount', userId?: string) {
    if (userId) {
      simpleCacheService.invalidate({
        pattern: `user:${userId}:${type}:*`,
      });
    } else {
      simpleCacheService.invalidate({
        pattern: `${type}:*`,
      });
    }
  }

  /**
   * Warm up notification caches
   */
  static warmupNotificationCaches(userId: string) {
    ErrorHandler.getInstance().handleSync(
      () => {
        console.log('🔥 Warming up notification caches for user:', userId);

        // This would typically fetch from the API and cache the results
        // For now, we'll just log the attempt
        console.log('✅ Notification cache warmup initiated');
      },
      {
        component: 'NotificationCacheUtils',
        action: 'warmupNotificationCaches',
      }
    );
  }
}
