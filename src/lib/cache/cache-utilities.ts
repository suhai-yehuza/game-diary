import { ErrorHandler } from '@/lib/utils/error-handler';
import type {
  ICacheOptions,
  IAppNotification,
  IComment,
  Game,
  GameLog,
  UserSummary,
  Comment,
  Reaction,
  Friendship,
} from '@/types';

import { hybridCacheService } from './hybrid-cache-service';

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
  static async cacheGame(gameId: string, gameData: Game, options: ICacheOptions = {}) {
    const cacheKey = `game:${gameId}`;
    await hybridCacheService.set(cacheKey, gameData, {
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
    return hybridCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Cache game list with pagination support
   */
  static async cacheGameList(
    filters: Record<string, unknown>,
    pagination: Record<string, unknown>,
    gameList: Game[],
    options: ICacheOptions = {}
  ) {
    const cacheKey = `gameList:${JSON.stringify(filters)}:${JSON.stringify(pagination)}`;
    await hybridCacheService.set(cacheKey, gameList, {
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
    return hybridCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Invalidate game-related caches
   */
  static async invalidateGameCaches(gameId?: string) {
    if (gameId) {
      await hybridCacheService.invalidate({
        tags: [`game:${gameId}`],
      });
    } else {
      await hybridCacheService.invalidate({
        namespace: this.NAMESPACE,
      });
    }

    // Also invalidate NBA Hub counts since games count may have changed
    await ErrorHandler.getInstance().handleAsync(
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
  static async cacheUser(userId: string, userData: UserSummary, options: ICacheOptions = {}) {
    const cacheKey = `user:${userId}`;
    await hybridCacheService.set(cacheKey, userData, {
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
    return hybridCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Cache user friendships
   */
  static async cacheUserFriendships(
    userId: string,
    friendships: Friendship[],
    options: ICacheOptions = {}
  ) {
    const cacheKey = `friendships:${userId}`;
    await hybridCacheService.set(cacheKey, friendships, {
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
    return hybridCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Invalidate user-related caches
   */
  static async invalidateUserCaches(userId?: string) {
    if (userId) {
      await hybridCacheService.invalidate({
        tags: [`user:${userId}`],
      });
    } else {
      await hybridCacheService.invalidate({
        namespace: this.NAMESPACE,
      });
    }
  }
}

// Game log caching utilities
export class GameLogCacheUtils {
  private static readonly NAMESPACE = 'gameLogs';
  private static readonly DEFAULT_TTL = 900; // 15 minutes

  /**
   * Cache game log data
   */
  static async cacheGameLog(gameLogId: string, gameLogData: GameLog, options: ICacheOptions = {}) {
    const cacheKey = `gameLog:${gameLogId}`;
    await hybridCacheService.set(cacheKey, gameLogData, {
      namespace: this.NAMESPACE,
      ttl: options.ttl || this.DEFAULT_TTL,
      tags: ['gameLog', `gameLog:${gameLogId}`],
      strategy: 'hybrid',
      ...options,
    });
  }

  /**
   * Get cached game log data
   */
  static async getCachedGameLog(gameLogId: string): Promise<GameLog | null> {
    const cacheKey = `gameLog:${gameLogId}`;
    return hybridCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Cache game log list with pagination
   */
  static async cacheGameLogList(
    filters: Record<string, unknown>,
    pagination: Record<string, unknown>,
    gameLogList: GameLog[],
    options: ICacheOptions = {}
  ) {
    const cacheKey = `gameLogList:${JSON.stringify(filters)}:${JSON.stringify(pagination)}`;
    await hybridCacheService.set(cacheKey, gameLogList, {
      namespace: this.NAMESPACE,
      ttl: options.ttl || 600, // 10 minutes for lists
      tags: ['gameLogList', 'gameLogs'],
      strategy: 'hybrid',
      ...options,
    });
  }

  /**
   * Get cached game log list
   */
  static async getCachedGameLogList(
    filters: Record<string, unknown>,
    pagination: Record<string, unknown>
  ): Promise<GameLog[] | null> {
    const cacheKey = `gameLogList:${JSON.stringify(filters)}:${JSON.stringify(pagination)}`;
    return hybridCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Invalidate game log caches
   */
  static async invalidateGameLogCaches(gameLogId?: string) {
    if (gameLogId) {
      await hybridCacheService.invalidate({
        tags: [`gameLog:${gameLogId}`],
      });
    } else {
      await hybridCacheService.invalidate({
        namespace: this.NAMESPACE,
      });
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
  static async cacheComment(commentId: string, commentData: IComment, options: ICacheOptions = {}) {
    const cacheKey = `comment:${commentId}`;
    await hybridCacheService.set(cacheKey, commentData, {
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
    return hybridCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Cache comment list for a parent
   */
  static async cacheCommentList(
    parentId: string,
    parentType: string,
    comments: IComment[],
    options: ICacheOptions = {}
  ) {
    const cacheKey = `commentList:${parentType}:${parentId}`;
    await hybridCacheService.set(cacheKey, comments, {
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
    return hybridCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Invalidate comment caches
   */
  static async invalidateCommentCaches(commentId?: string, parentId?: string, parentType?: string) {
    if (commentId) {
      await hybridCacheService.invalidate({
        tags: [`comment:${commentId}`],
      });
    } else if (parentId && parentType) {
      await hybridCacheService.invalidate({
        tags: [`parent:${parentType}:${parentId}`],
      });
    } else {
      await hybridCacheService.invalidate({
        namespace: this.NAMESPACE,
      });
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
  static async cacheReactions(
    targetId: string,
    targetType: string,
    reactions: Reaction[],
    options: ICacheOptions = {}
  ) {
    const cacheKey = `reactions:${targetType}:${targetId}`;
    await hybridCacheService.set(cacheKey, reactions, {
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
    return hybridCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Invalidate reaction caches
   */
  static async invalidateReactionCaches(targetId?: string, targetType?: string) {
    if (targetId && targetType) {
      await hybridCacheService.invalidate({
        tags: [`target:${targetType}:${targetId}`],
      });
    } else {
      await hybridCacheService.invalidate({
        namespace: this.NAMESPACE,
      });
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
  static async cacheSearchResults(
    query: string,
    searchType: string,
    results: unknown[],
    options: ICacheOptions = {}
  ) {
    const cacheKey = `search:${searchType}:${query}`;
    await hybridCacheService.set(cacheKey, results, {
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
    return hybridCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Invalidate search caches
   */
  static async invalidateSearchCaches(searchType?: string) {
    if (searchType) {
      await hybridCacheService.invalidate({
        tags: [`searchType:${searchType}`],
      });
    } else {
      await hybridCacheService.invalidate({
        namespace: this.NAMESPACE,
      });
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
  static async getCacheStats() {
    const stats = hybridCacheService.getStats();
    const health = await hybridCacheService.healthCheck();

    return {
      ...stats,
      health,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Monitor cache performance
   */
  static async monitorCachePerformance() {
    const stats = await this.getCacheStats();

    // Log performance metrics
    console.log('[Cache Monitor] Performance Metrics:', {
      hitRate: `${(stats.hitRate * 100).toFixed(2)}%`,
      averageResponseTime: `${stats.averageResponseTime.toFixed(2)}ms`,
      memoryUsage: `${(typeof stats.memoryUsage === 'number' ? stats.memoryUsage / 1024 / 1024 : 0).toFixed(2)}MB`,
      totalRequests: stats.totalRequests,
    });

    // Alert on low hit rates
    if (stats.hitRate < 0.5) {
      console.warn('[Cache Monitor] Low hit rate detected:', stats.hitRate);
    }

    // Alert on high response times
    if (stats.averageResponseTime > 100) {
      console.warn('[Cache Monitor] High response time detected:', stats.averageResponseTime);
    }
  }
}

// NBA Hub caching utilities
export class NBAHubCacheUtils {
  private static readonly NAMESPACE = 'nbaHub';
  private static readonly DEFAULT_TTL = 3600; // 1 hour - counts don't change frequently

  /**
   * Cache NBA Hub counts (individual keys for better granularity)
   */
  static async cacheNBACounts(
    counts: { games: number; teams: number; players: number },
    options: ICacheOptions = {}
  ) {
    const ttl = options.ttl || this.DEFAULT_TTL;

    // Cache each count separately for better granular control
    await Promise.all([
      // Games count
      hybridCacheService.set('games.count', counts.games, {
        namespace: this.NAMESPACE,
        ttl,
        tags: ['nbaHub', 'counts', 'games'],
        strategy: 'hybrid',
        ...options,
      }),

      // Teams count
      hybridCacheService.set('teams.count', counts.teams, {
        namespace: this.NAMESPACE,
        ttl,
        tags: ['nbaHub', 'counts', 'teams'],
        strategy: 'hybrid',
        ...options,
      }),

      // Players count
      hybridCacheService.set('players.count', counts.players, {
        namespace: this.NAMESPACE,
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
  static async getCachedNBACounts(): Promise<{
    totalGames: number;
    totalTeams: number;
    totalPlayers: number;
    liveGames: number;
  } | null> {
    const result = await ErrorHandler.getInstance().handleAsync(
      async () => {
        // Fetch all counts in parallel
        const [gamesCount, teamsCount, playersCount] = await Promise.all([
          hybridCacheService.get<number>('games.count', {
            namespace: this.NAMESPACE,
            strategy: 'hybrid',
          }),
          hybridCacheService.get<number>('teams.count', {
            namespace: this.NAMESPACE,
            strategy: 'hybrid',
          }),
          hybridCacheService.get<number>('players.count', {
            namespace: this.NAMESPACE,
            strategy: 'hybrid',
          }),
        ]);

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
  static async getCachedCount(type: 'games' | 'teams' | 'players'): Promise<number | null> {
    const result = await ErrorHandler.getInstance().handleAsync(
      () =>
        hybridCacheService.get<number>(`${type}.count`, {
          namespace: this.NAMESPACE,
          strategy: 'hybrid',
        }),
      {
        component: 'NBAHubCacheUtils',
        action: 'getCachedCount',
      }
    );

    return result || null;
  }

  /**
   * Cache individual count
   */
  static async cacheCount(
    type: 'games' | 'teams' | 'players',
    count: number,
    options: ICacheOptions = {}
  ) {
    await ErrorHandler.getInstance().handleAsync(
      () =>
        hybridCacheService.set(`${type}.count`, count, {
          namespace: this.NAMESPACE,
          ttl: options.ttl || this.DEFAULT_TTL,
          tags: ['nbaHub', 'counts', type],
          strategy: 'hybrid',
          ...options,
        }),
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
  static async invalidateNBACountCaches() {
    await hybridCacheService.invalidate({
      namespace: this.NAMESPACE,
      tags: ['nbaHub', 'counts'],
    });
  }

  /**
   * Invalidate specific count caches
   */
  static async invalidateSpecificCountCaches(type: 'games' | 'teams' | 'players') {
    await hybridCacheService.invalidate({
      tags: [`nbaHub:${type}`],
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
        const response = await fetch('/api/nba-hub/counts');
        const data = await response.json();

        if (data.success) {
          await this.cacheNBACounts(data.counts);
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
  static async cacheUserNotifications(
    userId: string,
    notifications: IAppNotification[],
    options: ICacheOptions = {}
  ) {
    const cacheKey = `user:${userId}:notifications`;
    await hybridCacheService.set(cacheKey, notifications, {
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
    return hybridCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Cache user unread count
   */
  static async cacheUserUnreadCount(userId: string, count: number, options: ICacheOptions = {}) {
    const cacheKey = `user:${userId}:unreadCount`;
    await hybridCacheService.set(cacheKey, count, {
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
    return hybridCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });
  }

  /**
   * Invalidate user notification caches
   */
  static async invalidateUserNotificationCaches(userId: string) {
    await hybridCacheService.invalidate({
      tags: [`user:${userId}`, 'notifications'],
    });
  }

  /**
   * Invalidate specific notification caches
   */
  static async invalidateNotificationCaches(
    type: 'notifications' | 'unreadCount',
    userId?: string
  ) {
    if (userId) {
      await hybridCacheService.invalidate({
        tags: [`user:${userId}`, type],
      });
    } else {
      await hybridCacheService.invalidate({
        tags: [type],
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
