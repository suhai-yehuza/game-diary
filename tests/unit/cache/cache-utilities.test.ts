import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import {
  GameCacheUtils,
  UserCacheUtils,
  GameLogCacheUtils,
  CommentCacheUtils,
  ReactionCacheUtils,
  SearchCacheUtils,
  CacheWarmingUtils,
  CacheMonitoringUtils,
} from '@/lib/cache/cache-utilities';
import { hybridCacheService } from '@/lib/cache/hybrid-cache-service';

// Mock the hybrid cache service
vi.mock('@/lib/cache/hybrid-cache-service', () => ({
  hybridCacheService: {
    get: vi.fn(),
    set: vi.fn(),
    invalidate: vi.fn(),
    getStats: vi.fn(),
    healthCheck: vi.fn(),
  },
}));

// Mock the cache service
vi.mock('@/lib/cache/hybrid-cache-service', () => ({
  hybridCacheService: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    invalidate: vi.fn(),
    clear: vi.fn(),
    getStats: vi.fn(),
    healthCheck: vi.fn(),
  },
}));

// Mock ErrorHandler
vi.mock('@/lib/utils/error-handler', () => ({
  ErrorHandler: {
    getInstance: vi.fn().mockReturnValue({
      handleAsync: vi.fn().mockImplementation(async fn => {
        try {
          return await fn();
        } catch (error) {
          console.error('[Cache Warming] Error warming up frequent data:', error);
          return undefined;
        }
      }),
    }),
  },
}));

describe('Cache Utilities', () => {
  let mockCacheService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCacheService = hybridCacheService;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GameCacheUtils', () => {
    const mockGameData = { id: 'unit-test-game-1', name: 'Unit Test Game' };
    const mockFilters = { genre: 'action' };
    const mockPagination = { first: 10 };

    describe('cacheGame', () => {
      it('should cache game data with correct options', async () => {
        await GameCacheUtils.cacheGame('unit-test-game-1', mockGameData);

        expect(mockCacheService.set).toHaveBeenCalledWith('game:unit-test-game-1', mockGameData, {
          namespace: 'games',
          ttl: 1800,
          tags: ['game', 'game:unit-test-game-1'],
          strategy: 'hybrid',
        });
      });

      it('should use custom TTL when provided', async () => {
        await GameCacheUtils.cacheGame('unit-test-game-1', mockGameData, { ttl: 3600 });

        expect(mockCacheService.set).toHaveBeenCalledWith('game:unit-test-game-1', mockGameData, {
          namespace: 'games',
          ttl: 3600,
          tags: ['game', 'game:unit-test-game-1'],
          strategy: 'hybrid',
        });
      });
    });

    describe('getCachedGame', () => {
      it('should retrieve cached game data', async () => {
        mockCacheService.get.mockResolvedValue(mockGameData);

        const result = await GameCacheUtils.getCachedGame('unit-test-game-1');

        expect(result).toEqual(mockGameData);
        expect(mockCacheService.get).toHaveBeenCalledWith('game:unit-test-game-1', {
          namespace: 'games',
          strategy: 'hybrid',
        });
      });
    });

    describe('cacheGameList', () => {
      it('should cache game list with correct options', async () => {
        const gameList = [mockGameData];
        await GameCacheUtils.cacheGameList(mockFilters, mockPagination, gameList);

        expect(mockCacheService.set).toHaveBeenCalledWith(
          expect.stringContaining('gameList:'),
          gameList,
          {
            namespace: 'games',
            ttl: 900,
            tags: ['gameList', 'games'],
            strategy: 'hybrid',
          }
        );
      });
    });

    describe('invalidateGameCaches', () => {
      it('should invalidate specific game cache when gameId provided', async () => {
        await GameCacheUtils.invalidateGameCaches('unit-test-game-1');

        expect(mockCacheService.invalidate).toHaveBeenCalledWith({
          tags: ['game:unit-test-game-1'],
        });
      });

      it('should invalidate all game caches when no gameId provided', async () => {
        await GameCacheUtils.invalidateGameCaches();

        expect(mockCacheService.invalidate).toHaveBeenCalledWith({
          namespace: 'games',
        });
      });
    });
  });

  describe('UserCacheUtils', () => {
    const mockUserData = { id: 'unit-test-user-1', username: 'unit-test-basic-user' };
    const mockFriendships = [{ id: 'unit-test-friendship-1', userId: 'unit-test-user-1' }];

    describe('cacheUser', () => {
      it('should cache user data with correct options', async () => {
        await UserCacheUtils.cacheUser('unit-test-user-1', mockUserData);

        expect(mockCacheService.set).toHaveBeenCalledWith('user:unit-test-user-1', mockUserData, {
          namespace: 'users',
          ttl: 3600,
          tags: ['user', 'user:unit-test-user-1'],
          strategy: 'hybrid',
        });
      });
    });

    describe('getCachedUser', () => {
      it('should retrieve cached user data', async () => {
        mockCacheService.get.mockResolvedValue(mockUserData);

        const result = await UserCacheUtils.getCachedUser('unit-test-game-1');

        expect(result).toEqual(mockUserData);
        expect(mockCacheService.get).toHaveBeenCalledWith('user:unit-test-game-1', {
          namespace: 'users',
          strategy: 'hybrid',
        });
      });
    });

    describe('cacheUserFriendships', () => {
      it('should cache user friendships with correct options', async () => {
        await UserCacheUtils.cacheUserFriendships('unit-test-game-1', mockFriendships);

        expect(mockCacheService.set).toHaveBeenCalledWith(
          'friendships:unit-test-game-1',
          mockFriendships,
          {
            namespace: 'users',
            ttl: 1800,
            tags: ['friendships', 'user:unit-test-game-1'],
            strategy: 'hybrid',
          }
        );
      });
    });
  });

  describe('GameLogCacheUtils', () => {
    const mockGameLogData = {
      id: 'unit-test-game-1',
      gameId: 'unit-test-game-1',
      notes: 'Test log',
    };
    const mockFilters = { userId: 'unit-test-game-1' };
    const mockPagination = { first: 20 };

    describe('cacheGameLog', () => {
      it('should cache game log data with correct options', async () => {
        await GameLogCacheUtils.cacheGameLog('unit-test-game-1', mockGameLogData);

        expect(mockCacheService.set).toHaveBeenCalledWith(
          'gameLog:unit-test-game-1',
          mockGameLogData,
          {
            namespace: 'gameLogs',
            ttl: 900,
            tags: ['gameLog', 'gameLog:unit-test-game-1'],
            strategy: 'hybrid',
          }
        );
      });
    });

    describe('getCachedGameLog', () => {
      it('should retrieve cached game log data', async () => {
        mockCacheService.get.mockResolvedValue(mockGameLogData);

        const result = await GameLogCacheUtils.getCachedGameLog('unit-test-game-1');

        expect(result).toEqual(mockGameLogData);
        expect(mockCacheService.get).toHaveBeenCalledWith('gameLog:unit-test-game-1', {
          namespace: 'gameLogs',
          strategy: 'hybrid',
        });
      });
    });

    describe('cacheGameLogList', () => {
      it('should cache game log list with correct options', async () => {
        const gameLogList = [mockGameLogData];
        await GameLogCacheUtils.cacheGameLogList(mockFilters, mockPagination, gameLogList);

        expect(mockCacheService.set).toHaveBeenCalledWith(
          expect.stringContaining('gameLogList:'),
          gameLogList,
          {
            namespace: 'gameLogs',
            ttl: 600,
            tags: ['gameLogList', 'gameLogs'],
            strategy: 'hybrid',
          }
        );
      });
    });
  });

  describe('CommentCacheUtils', () => {
    const mockCommentData = { id: 'unit-test-game-1', content: 'Test comment' };

    describe('cacheComment', () => {
      it('should cache comment data with correct options', async () => {
        await CommentCacheUtils.cacheComment('unit-test-game-1', mockCommentData);

        expect(mockCacheService.set).toHaveBeenCalledWith(
          'comment:unit-test-game-1',
          mockCommentData,
          {
            namespace: 'comments',
            ttl: 600,
            tags: ['comment', 'comment:unit-test-game-1'],
            strategy: 'hybrid',
          }
        );
      });
    });

    describe('getCachedComment', () => {
      it('should retrieve cached comment data', async () => {
        mockCacheService.get.mockResolvedValue(mockCommentData);

        const result = await CommentCacheUtils.getCachedComment('unit-test-game-1');

        expect(result).toEqual(mockCommentData);
        expect(mockCacheService.get).toHaveBeenCalledWith('comment:unit-test-game-1', {
          namespace: 'comments',
          strategy: 'hybrid',
        });
      });
    });

    describe('cacheCommentList', () => {
      it('should cache comment list with correct options', async () => {
        const commentList = [mockCommentData];
        await CommentCacheUtils.cacheCommentList('unit-test-game-1', 'GAME_LOG', commentList);

        expect(mockCacheService.set).toHaveBeenCalledWith(
          'commentList:GAME_LOG:unit-test-game-1',
          commentList,
          {
            namespace: 'comments',
            ttl: 300,
            tags: ['commentList', 'parent:GAME_LOG:unit-test-game-1'],
            strategy: 'hybrid',
          }
        );
      });
    });

    describe('invalidateCommentCaches', () => {
      it('should invalidate specific comment cache when commentId provided', async () => {
        await CommentCacheUtils.invalidateCommentCaches('unit-test-game-1');

        expect(mockCacheService.invalidate).toHaveBeenCalledWith({
          tags: ['comment:unit-test-game-1'],
        });
      });

      it('should invalidate parent comment caches when parentId and parentType provided', async () => {
        await CommentCacheUtils.invalidateCommentCaches(undefined, 'unit-test-game-1', 'GAME_LOG');

        expect(mockCacheService.invalidate).toHaveBeenCalledWith({
          tags: ['parent:GAME_LOG:unit-test-game-1'],
        });
      });

      it('should invalidate all comment caches when no parameters provided', async () => {
        await CommentCacheUtils.invalidateCommentCaches();

        expect(mockCacheService.invalidate).toHaveBeenCalledWith({
          namespace: 'comments',
        });
      });
    });
  });

  describe('ReactionCacheUtils', () => {
    const mockReactions = [{ id: 'unit-test-game-1', emoji: '👍' }];

    describe('cacheReactions', () => {
      it('should cache reactions with correct options', async () => {
        await ReactionCacheUtils.cacheReactions('unit-test-game-1', 'GAME_LOG', mockReactions);

        expect(mockCacheService.set).toHaveBeenCalledWith(
          'reactions:GAME_LOG:unit-test-game-1',
          mockReactions,
          {
            namespace: 'reactions',
            ttl: 300,
            tags: ['reactions', 'target:GAME_LOG:unit-test-game-1'],
            strategy: 'hybrid',
          }
        );
      });
    });

    describe('getCachedReactions', () => {
      it('should retrieve cached reactions', async () => {
        mockCacheService.get.mockResolvedValue(mockReactions);

        const result = await ReactionCacheUtils.getCachedReactions('unit-test-game-1', 'GAME_LOG');

        expect(result).toEqual(mockReactions);
        expect(mockCacheService.get).toHaveBeenCalledWith('reactions:GAME_LOG:unit-test-game-1', {
          namespace: 'reactions',
          strategy: 'hybrid',
        });
      });
    });

    describe('invalidateReactionCaches', () => {
      it('should invalidate specific reaction cache when targetId and targetType provided', async () => {
        await ReactionCacheUtils.invalidateReactionCaches('unit-test-game-1', 'GAME_LOG');

        expect(mockCacheService.invalidate).toHaveBeenCalledWith({
          tags: ['target:GAME_LOG:unit-test-game-1'],
        });
      });

      it('should invalidate all reaction caches when no parameters provided', async () => {
        await ReactionCacheUtils.invalidateReactionCaches();

        expect(mockCacheService.invalidate).toHaveBeenCalledWith({
          namespace: 'reactions',
        });
      });
    });
  });

  describe('SearchCacheUtils', () => {
    const mockSearchResults = [{ id: 'unit-test-game-1', name: 'Test Result' }];

    describe('cacheSearchResults', () => {
      it('should cache search results with correct options', async () => {
        await SearchCacheUtils.cacheSearchResults('test query', 'games', mockSearchResults);

        expect(mockCacheService.set).toHaveBeenCalledWith(
          'search:games:test query',
          mockSearchResults,
          {
            namespace: 'search',
            ttl: 1800,
            tags: ['search', 'searchType:games'],
            strategy: 'hybrid',
          }
        );
      });
    });

    describe('getCachedSearchResults', () => {
      it('should retrieve cached search results', async () => {
        mockCacheService.get.mockResolvedValue(mockSearchResults);

        const result = await SearchCacheUtils.getCachedSearchResults('test query', 'games');

        expect(result).toEqual(mockSearchResults);
        expect(mockCacheService.get).toHaveBeenCalledWith('search:games:test query', {
          namespace: 'search',
          strategy: 'hybrid',
        });
      });
    });

    describe('invalidateSearchCaches', () => {
      it('should invalidate specific search type caches when searchType provided', async () => {
        await SearchCacheUtils.invalidateSearchCaches('games');

        expect(mockCacheService.invalidate).toHaveBeenCalledWith({
          tags: ['searchType:games'],
        });
      });

      it('should invalidate all search caches when no searchType provided', async () => {
        await SearchCacheUtils.invalidateSearchCaches();

        expect(mockCacheService.invalidate).toHaveBeenCalledWith({
          namespace: 'search',
        });
      });
    });
  });

  describe('CacheWarmingUtils', () => {
    describe('warmUpFrequentData', () => {
      it('should warm up frequent data without throwing errors', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await expect(CacheWarmingUtils.warmUpFrequentData()).resolves.not.toThrow();

        expect(consoleSpy).toHaveBeenCalledWith(
          '[Cache Warming] Frequent data warmed up successfully'
        );

        consoleSpy.mockRestore();
        errorSpy.mockRestore();
      });

      it('should handle errors gracefully during warm up', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // Mock the private methods to throw errors
        vi.spyOn(CacheWarmingUtils as any, 'warmUpTopGames').mockRejectedValue(
          new Error('Warm up failed')
        );

        await expect(CacheWarmingUtils.warmUpFrequentData()).resolves.not.toThrow();

        expect(consoleSpy).toHaveBeenCalledWith(
          '[Cache Warming] Error warming up frequent data:',
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });
    });
  });

  describe('CacheMonitoringUtils', () => {
    describe('getCacheStats', () => {
      it('should return cache statistics with health check', async () => {
        const mockStats = { totalRequests: 100, hitRate: 0.8 };
        const mockHealth = { memory: true, redis: true, database: false };

        mockCacheService.getStats.mockReturnValue(mockStats);
        mockCacheService.healthCheck.mockResolvedValue(mockHealth);

        const result = await CacheMonitoringUtils.getCacheStats();

        expect(result).toEqual({
          ...mockStats,
          health: mockHealth,
          timestamp: expect.any(String),
        });
      });
    });

    describe('monitorCachePerformance', () => {
      it('should log performance metrics', async () => {
        const mockStats = {
          hitRate: 0.7,
          averageResponseTime: 150,
          memoryUsage: 50 * 1024 * 1024, // 50MB
          totalRequests: 1000,
        };

        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        vi.spyOn(CacheMonitoringUtils, 'getCacheStats').mockResolvedValue(mockStats);

        await CacheMonitoringUtils.monitorCachePerformance();

        expect(consoleSpy).toHaveBeenCalledWith(
          '[Cache Monitor] Performance Metrics:',
          expect.objectContaining({
            hitRate: '70.00%',
            averageResponseTime: '150.00ms',
            memoryUsage: '50.00MB',
            totalRequests: 1000,
          })
        );

        // Should warn about high response time (150ms > 100ms threshold)
        expect(warnSpy).toHaveBeenCalledWith('[Cache Monitor] High response time detected:', 150);

        consoleSpy.mockRestore();
        warnSpy.mockRestore();
      });

      it('should warn about high response times', async () => {
        const mockStats = {
          hitRate: 0.9,
          averageResponseTime: 200,
          memoryUsage: 10 * 1024 * 1024,
          totalRequests: 100,
        };

        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        vi.spyOn(CacheMonitoringUtils, 'getCacheStats').mockResolvedValue(mockStats);

        await CacheMonitoringUtils.monitorCachePerformance();

        expect(warnSpy).toHaveBeenCalledWith('[Cache Monitor] High response time detected:', 200);

        warnSpy.mockRestore();
      });
    });
  });
});
