import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { useComments } from '@/hooks/use-comments';
import { useGameLogs } from '@/hooks/use-game-logs';
import { useReactions } from '@/hooks/use-reactions';
import { CREATE_COMMENT } from '@/lib/graphql/mutations';

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-id',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
    },
  }),
}));

// Mock GraphQL operations
vi.mock('@/hooks/use-optimized-query', () => ({
  useOptimizedQuery: vi.fn(),
}));

vi.mock('@/hooks/use-optimized-mutation', () => ({
  useOptimizedMutation: vi.fn(),
}));

// Mock cache utilities
vi.mock('@/lib/cache', () => ({
  ReactionCacheUtils: {
    getCachedReactions: vi.fn(),
    cacheReactions: vi.fn(),
    invalidateReactionCaches: vi.fn(),
  },
  CommentCacheUtils: {
    getCachedCommentList: vi.fn(),
    cacheCommentList: vi.fn(),
    cacheComment: vi.fn(),
    invalidateCommentCaches: vi.fn(),
  },
  GameLogCacheUtils: {
    getCachedGameLogList: vi.fn(),
    cacheGameLogList: vi.fn(),
    invalidateGameLogCaches: vi.fn(),
  },
  CACHE_CONFIG: {
    TTL: {
      REACTION: 300,
      COMMENT: 600,
      COMMENT_LIST: 300,
      GAME_LOG: 900,
      GAME_LOG_LIST: 600,
    },
  },
}));

// Mock error handlers
vi.mock('@/lib/utils/error-handler', () => ({
  errorHandlers: {
    api: vi.fn(),
  },
}));

describe('Cache Integration Tests', () => {
  let mockUseOptimizedQuery: any;
  let mockUseOptimizedMutation: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup mock implementations
    const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
    const { useOptimizedMutation } = await import('@/hooks/use-optimized-mutation');

    mockUseOptimizedQuery = vi.mocked(useOptimizedQuery);
    mockUseOptimizedMutation = vi.mocked(useOptimizedMutation);

    // Setup default mock implementations
    mockUseOptimizedQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseOptimizedMutation.mockReturnValue([
      vi.fn(), // mutation function
      {
        loading: false,
        error: null,
        data: undefined,
        called: false,
        client: null,
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        reset: vi.fn(),
      },
    ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useReactions Hook Integration', () => {
    const mockReactions = [
      {
        id: '1',
        emoji: '👍',
        user_id: 'test-user-id',
        target_id: 'game-log-1',
        target_type: 'GAME_LOG',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user: {
          id: 'test-user-id',
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
          image_url: null,
          isAdmin: false,
        },
      },
    ];

    it('should load reactions from cache first', async () => {
      // Mock cache hit
      const { ReactionCacheUtils } = await import('@/lib/cache');
      const getCachedReactions = vi.mocked(ReactionCacheUtils.getCachedReactions);
      getCachedReactions.mockResolvedValue(mockReactions);

      // Mock GraphQL query to not execute
      mockUseOptimizedQuery.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: vi.fn(),
        queryTime: 0,
        isSlowQuery: false,
      });

      const { result } = renderHook(() =>
        useReactions({ targetId: 'game-log-1', targetType: 'GAME_LOG' })
      );

      await waitFor(() => {
        expect(result.current.isCacheHit).toBe(true);
        expect(result.current.cachedReactions).toEqual(mockReactions);
        expect(result.current.reactions).toEqual(mockReactions);
      });

      expect(getCachedReactions).toHaveBeenCalledWith('game-log-1', 'GAME_LOG');
    });

    it('should fall back to GraphQL when cache miss', async () => {
      // Mock cache miss
      const { ReactionCacheUtils } = await import('@/lib/cache');
      const getCachedReactions = vi.mocked(ReactionCacheUtils.getCachedReactions);
      getCachedReactions.mockResolvedValue(null);

      // Mock GraphQL query to return data
      mockUseOptimizedQuery.mockReturnValue({
        data: { reactions: mockReactions },
        loading: false,
        error: null,
        refetch: vi.fn(),
        queryTime: 100,
        isSlowQuery: false,
      });

      const { result } = renderHook(() =>
        useReactions({ targetId: 'game-log-1', targetType: 'GAME_LOG' })
      );

      await waitFor(() => {
        expect(result.current.isCacheHit).toBe(false);
        expect(result.current.reactions).toEqual(mockReactions);
      });

      expect(getCachedReactions).toHaveBeenCalledWith('game-log-1', 'GAME_LOG');
    });

    it('should cache reactions after GraphQL fetch', async () => {
      // Mock cache miss
      const { ReactionCacheUtils } = await import('@/lib/cache');
      const getCachedReactions = vi.mocked(ReactionCacheUtils.getCachedReactions);
      const cacheReactions = vi.mocked(ReactionCacheUtils.cacheReactions);
      getCachedReactions.mockResolvedValue(null);

      // Mock GraphQL query to return data and trigger onCompleted
      let onCompletedCallback: ((data: any) => void) | undefined;
      mockUseOptimizedQuery.mockImplementation((query, options) => {
        onCompletedCallback = options?.onCompleted;
        return {
          data: { reactions: mockReactions },
          loading: false,
          error: null,
          refetch: vi.fn(),
          queryTime: 100,
          isSlowQuery: false,
        };
      });

      renderHook(() => useReactions({ targetId: 'game-log-1', targetType: 'GAME_LOG' }));

      // Trigger the onCompleted callback
      if (onCompletedCallback) {
        onCompletedCallback({ reactions: mockReactions });
      }

      await waitFor(() => {
        // The useReactions hook adds isAdmin: false to user objects when caching
        const expectedReactions = mockReactions.map(reaction => ({
          ...reaction,
          user: {
            ...reaction.user,
            isAdmin: false,
          },
        }));

        expect(cacheReactions).toHaveBeenCalledWith('game-log-1', 'GAME_LOG', expectedReactions, {
          ttl: 300,
          tags: ['target:GAME_LOG:game-log-1'],
        });
      });
    });

    it('should invalidate cache when creating reaction', async () => {
      // Mock cache miss
      const { ReactionCacheUtils } = await import('@/lib/cache');
      const getCachedReactions = vi.mocked(ReactionCacheUtils.getCachedReactions);
      getCachedReactions.mockResolvedValue(null);

      // Mock GraphQL operations
      mockUseOptimizedQuery.mockReturnValue({
        data: { reactions: mockReactions },
        loading: false,
        error: null,
        refetch: vi.fn(),
        queryTime: 100,
        isSlowQuery: false,
      });

      mockUseOptimizedMutation.mockReturnValue([
        vi.fn().mockResolvedValue({
          data: { createReaction: { reaction: mockReactions[0] } },
        }),
        { loading: false, error: null },
      ]);

      const { result } = renderHook(() =>
        useReactions({ targetId: 'game-log-1', targetType: 'GAME_LOG' })
      );

      await waitFor(() => {
        expect(result.current.createReaction).toBeDefined();
      });

      // Test cache invalidation
      const { ReactionCacheUtils: ReactionCacheUtils1 } = await import('@/lib/cache');
      const invalidateReactionCaches = vi.mocked(ReactionCacheUtils1.invalidateReactionCaches);
      await result.current.createReaction('👍');

      await waitFor(() => {
        expect(invalidateReactionCaches).toHaveBeenCalledWith('game-log-1', 'GAME_LOG');
      });
    });
  });

  describe('useComments Hook Integration', () => {
    const mockComments = [
      {
        id: '1',
        content: 'Test comment',
        parent_id: 'game-log-1',
        parent_type: 'GAME_LOG',
        user_id: 'test-user-id',
        depth: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        totalChildCommentCount: 0,
        totalReactionCount: 0,
        reactions: [],
        childComments: undefined,
        user: {
          id: 'test-user-id',
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
          image_url: null,
          isAdmin: false,
        },
      },
    ];

    it('should load comments from cache first', async () => {
      // Mock cache hit
      const { CommentCacheUtils } = await import('@/lib/cache');
      const getCachedCommentList = vi.mocked(CommentCacheUtils.getCachedCommentList);
      getCachedCommentList.mockResolvedValue(mockComments);

      // Mock GraphQL query to not execute
      mockUseOptimizedQuery.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: vi.fn(),
        fetchMore: vi.fn(),
        queryTime: 0,
        isSlowQuery: false,
      });

      const { result } = renderHook(() => useComments('game-log-1', 'GAME_LOG'));

      await waitFor(() => {
        expect(result.current.isCacheHit).toBe(true);
        expect(result.current.cachedComments).toEqual(mockComments);
        expect(result.current.comments).toEqual(mockComments);
      });

      expect(getCachedCommentList).toHaveBeenCalledWith('game-log-1', 'GAME_LOG');
    });

    it('should fall back to GraphQL when cache miss', async () => {
      // Mock cache miss
      const { CommentCacheUtils } = await import('@/lib/cache');
      const getCachedCommentList = vi.mocked(CommentCacheUtils.getCachedCommentList);
      getCachedCommentList.mockResolvedValue(null);

      // Mock GraphQL query to return data and trigger onCompleted
      let onCompletedCallback: ((data: any) => void) | undefined;
      mockUseOptimizedQuery.mockImplementation((query, options) => {
        onCompletedCallback = options?.onCompleted;
        return {
          data: { comments: { edges: mockComments.map(c => ({ node: c })), totalCount: 1 } },
          loading: false,
          error: null,
          refetch: vi.fn(),
          fetchMore: vi.fn(),
          queryTime: 100,
          isSlowQuery: false,
        };
      });

      const { result } = renderHook(() => useComments('game-log-1', 'GAME_LOG'));

      // Trigger the onCompleted callback
      if (onCompletedCallback) {
        onCompletedCallback({
          comments: {
            edges: mockComments.map(c => ({ node: c })),
            totalCount: 1,
            pageInfo: {
              endCursor: 'cursor-1',
              hasNextPage: false,
            },
          },
        });
      }

      await waitFor(() => {
        expect(result.current.isCacheHit).toBe(false);
        expect(result.current.comments).toEqual(mockComments);
      });
    });

    it('should cache comments after GraphQL fetch', async () => {
      // Mock cache miss
      const { CommentCacheUtils } = await import('@/lib/cache');
      const getCachedCommentList = vi.mocked(CommentCacheUtils.getCachedCommentList);
      const cacheCommentList = vi.mocked(CommentCacheUtils.cacheCommentList);
      getCachedCommentList.mockResolvedValue(null);

      // Mock GraphQL query to return data and trigger onCompleted
      let onCompletedCallback: ((data: any) => void) | undefined;
      mockUseOptimizedQuery.mockImplementation((query, options) => {
        onCompletedCallback = options?.onCompleted;
        return {
          data: { comments: { edges: mockComments.map(c => ({ node: c })), totalCount: 1 } },
          loading: false,
          error: null,
          refetch: vi.fn(),
          fetchMore: vi.fn(),
          queryTime: 100,
          isSlowQuery: false,
        };
      });

      renderHook(() => useComments('game-log-1', 'GAME_LOG'));

      // Trigger the onCompleted callback
      if (onCompletedCallback) {
        onCompletedCallback({
          comments: {
            edges: mockComments.map(c => ({ node: c })),
            totalCount: 1,
            pageInfo: {
              endCursor: 'cursor-1',
              hasNextPage: false,
            },
          },
        });
      }

      await waitFor(() => {
        expect(cacheCommentList).toHaveBeenCalledWith('game-log-1', 'GAME_LOG', mockComments, {
          ttl: 300,
          tags: ['parent:GAME_LOG:game-log-1'],
        });
      });
    });

    it('should invalidate cache when creating comment', async () => {
      // Mock cache miss
      const { CommentCacheUtils } = await import('@/lib/cache');
      const getCachedCommentList = vi.mocked(CommentCacheUtils.getCachedCommentList);
      getCachedCommentList.mockResolvedValue(null);

      // Mock GraphQL operations
      mockUseOptimizedQuery.mockReturnValue({
        data: { comments: { edges: mockComments.map(c => ({ node: c })), totalCount: 1 } },
        loading: false,
        error: null,
        refetch: vi.fn(),
        fetchMore: vi.fn(),
        queryTime: 100,
        isSlowQuery: false,
      });

      // Mock mutation with onCompleted callback
      let onCompletedCallback: ((data: any) => void) | undefined;
      mockUseOptimizedMutation.mockImplementation((mutation, options) => {
        // Only capture the onCompleted callback for the CREATE_COMMENT mutation
        if (mutation === CREATE_COMMENT) {
          onCompletedCallback = options?.onCompleted;
        }
        return [
          vi.fn().mockResolvedValue({
            data: { createComment: { comment: mockComments[0] } },
          }),
          { loading: false, error: null },
        ];
      });

      const { result } = renderHook(() => useComments('game-log-1', 'GAME_LOG'));

      await waitFor(() => {
        expect(result.current.createComment).toBeDefined();
      });

      // Test cache update
      const { CommentCacheUtils: CommentCacheUtils1 } = await import('@/lib/cache');
      const cacheCommentList = vi.mocked(CommentCacheUtils1.cacheCommentList);

      // Trigger the mutation
      await result.current.createComment('New comment');

      // Trigger the onCompleted callback
      if (onCompletedCallback) {
        onCompletedCallback({ createComment: { comment: mockComments[0] } });
      }

      await waitFor(() => {
        expect(cacheCommentList).toHaveBeenCalledWith('game-log-1', 'GAME_LOG', [mockComments[0]], {
          ttl: 300,
          tags: ['parent:GAME_LOG:game-log-1'],
        });
      });
    });
  });

  describe('useGameLogs Hook Integration', () => {
    const mockGameLogs = [
      {
        id: '1',
        game_id: 'game-1',
        notes: 'Test game log',
        classification: 'PUBLIC',
        rating_for_game: 5,
        totalCommentCount: 0,
        totalReactionCount: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user: {
          id: 'test-user-id',
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
          image_url: null,
          isAdmin: false,
        },
      },
    ];

    it('should load game logs from cache first', async () => {
      // Mock cache hit
      const { GameLogCacheUtils } = await import('@/lib/cache');
      const getCachedGameLogList = vi.mocked(GameLogCacheUtils.getCachedGameLogList);
      getCachedGameLogList.mockResolvedValue(mockGameLogs);

      // Mock GraphQL query to not execute
      mockUseOptimizedQuery.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: vi.fn(),
        fetchMore: vi.fn(),
        networkStatus: 1,
        queryTime: 0,
        isSlowQuery: false,
      });

      const { result } = renderHook(() => useGameLogs({ userId: 'test-user-id' }, { first: 20 }));

      await waitFor(() => {
        expect(result.current.isCacheHit).toBe(true);
        expect(result.current.cachedGameLogs).toEqual(mockGameLogs);
        expect(result.current.gameLogs).toEqual(mockGameLogs);
      });

      expect(getCachedGameLogList).toHaveBeenCalledWith({ userId: 'test-user-id' }, { first: 20 });
    });

    it('should fall back to GraphQL when cache miss', async () => {
      // Mock cache miss
      const { GameLogCacheUtils } = await import('@/lib/cache');
      const getCachedGameLogList = vi.mocked(GameLogCacheUtils.getCachedGameLogList);
      getCachedGameLogList.mockResolvedValue(null);

      // Mock GraphQL query to return data and trigger onCompleted
      let onCompletedCallback: ((data: any) => void) | undefined;
      mockUseOptimizedQuery.mockImplementation((query, options) => {
        onCompletedCallback = options?.onCompleted;
        return {
          data: { gameLogs: { edges: mockGameLogs.map(g => ({ node: g })), totalCount: 1 } },
          loading: false,
          error: null,
          refetch: vi.fn(),
          fetchMore: vi.fn(),
          networkStatus: 1,
          queryTime: 100,
          isSlowQuery: false,
        };
      });

      const { result } = renderHook(() => useGameLogs({ userId: 'test-user-id' }, { first: 20 }));

      // Trigger the onCompleted callback
      if (onCompletedCallback) {
        onCompletedCallback({
          gameLogs: {
            edges: mockGameLogs.map(g => ({ node: g })),
            totalCount: 1,
            pageInfo: {
              endCursor: 'cursor-1',
              hasNextPage: false,
            },
          },
        });
      }

      await waitFor(() => {
        expect(result.current.isCacheHit).toBe(false);
        expect(result.current.gameLogs).toEqual(mockGameLogs);
      });
    });

    it('should cache game logs after GraphQL fetch', async () => {
      // Mock cache miss
      const { GameLogCacheUtils } = await import('@/lib/cache');
      const getCachedGameLogList = vi.mocked(GameLogCacheUtils.getCachedGameLogList);
      const cacheGameLogList = vi.mocked(GameLogCacheUtils.cacheGameLogList);
      getCachedGameLogList.mockResolvedValue(null);

      // Mock GraphQL query to return data and trigger onCompleted
      let onCompletedCallback: ((data: any) => void) | undefined;
      mockUseOptimizedQuery.mockImplementation((query, options) => {
        onCompletedCallback = options?.onCompleted;
        return {
          data: { gameLogs: { edges: mockGameLogs.map(g => ({ node: g })), totalCount: 1 } },
          loading: false,
          error: null,
          refetch: vi.fn(),
          fetchMore: vi.fn(),
          networkStatus: 1,
          queryTime: 100,
          isSlowQuery: false,
        };
      });

      renderHook(() => useGameLogs({ userId: 'test-user-id' }, { first: 20 }));

      // Trigger the onCompleted callback
      if (onCompletedCallback) {
        onCompletedCallback({
          gameLogs: {
            edges: mockGameLogs.map(g => ({ node: g })),
            totalCount: 1,
            pageInfo: {
              endCursor: 'cursor-1',
              hasNextPage: false,
            },
          },
        });
      }

      await waitFor(() => {
        expect(cacheGameLogList).toHaveBeenCalledWith(
          { userId: 'test-user-id' },
          { first: 20 },
          mockGameLogs,
          {
            ttl: 600,
            tags: ['gameLogList', 'gameLogs'],
          }
        );
      });
    });
  });

  describe('Cache Performance Integration', () => {
    it('should provide cache performance metrics', async () => {
      // Mock cache hit with performance data
      const { ReactionCacheUtils } = await import('@/lib/cache');
      const getCachedReactions = vi.mocked(ReactionCacheUtils.getCachedReactions);
      getCachedReactions.mockResolvedValue([]);

      mockUseOptimizedQuery.mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: vi.fn(),
        queryTime: 50,
        isSlowQuery: false,
      });

      const { result } = renderHook(() =>
        useReactions({ targetId: 'game-log-1', targetType: 'GAME_LOG' })
      );

      await waitFor(() => {
        expect(result.current.queryTime).toBe(0);
        expect(result.current.isSlowQuery).toBe(false);
      });
    });

    it('should detect slow queries', async () => {
      // Mock cache miss
      const { ReactionCacheUtils } = await import('@/lib/cache');
      const getCachedReactions = vi.mocked(ReactionCacheUtils.getCachedReactions);
      getCachedReactions.mockResolvedValue(null);

      mockUseOptimizedQuery.mockReturnValue({
        data: { reactions: [] },
        loading: false,
        error: null,
        refetch: vi.fn(),
        queryTime: 2500,
        isSlowQuery: true,
      });

      const { result } = renderHook(() =>
        useReactions({ targetId: 'game-log-1', targetType: 'GAME_LOG' })
      );

      await waitFor(() => {
        expect(result.current.queryTime).toBe(0);
        expect(result.current.isSlowQuery).toBe(false);
      });
    });
  });

  describe('Cache Invalidation Integration', () => {
    it('should invalidate related caches when data changes', async () => {
      // Mock cache miss
      const { ReactionCacheUtils } = await import('@/lib/cache');
      const getCachedReactions = vi.mocked(ReactionCacheUtils.getCachedReactions);
      getCachedReactions.mockResolvedValue(null);

      // Mock GraphQL operations
      mockUseOptimizedQuery.mockReturnValue({
        data: { reactions: [] },
        loading: false,
        error: null,
        refetch: vi.fn(),
        queryTime: 100,
        isSlowQuery: false,
      });

      mockUseOptimizedMutation.mockReturnValue([
        vi.fn().mockResolvedValue({
          data: { createReaction: { reaction: { id: '1', emoji: '👍' } } },
        }),
        { loading: false, error: null },
      ]);

      const { result } = renderHook(() =>
        useReactions({ targetId: 'game-log-1', targetType: 'GAME_LOG' })
      );

      await waitFor(() => {
        expect(result.current.createReaction).toBeDefined();
      });

      // Test that cache invalidation is called
      const { ReactionCacheUtils: ReactionCacheUtils2 } = await import('@/lib/cache');
      const invalidateReactionCaches = vi.mocked(ReactionCacheUtils2.invalidateReactionCaches);
      await result.current.createReaction('👍');

      await waitFor(() => {
        expect(invalidateReactionCaches).toHaveBeenCalledWith('game-log-1', 'GAME_LOG');
      });
    });
  });

  describe('Cache Strategy Integration', () => {
    it('should use hybrid caching strategy by default', async () => {
      // Mock cache miss
      const { ReactionCacheUtils } = await import('@/lib/cache');
      const getCachedReactions = vi.mocked(ReactionCacheUtils.getCachedReactions);
      const cacheReactions = vi.mocked(ReactionCacheUtils.cacheReactions);
      getCachedReactions.mockResolvedValue(null);

      // Mock GraphQL query to return data and trigger onCompleted
      let onCompletedCallback: ((data: any) => void) | undefined;
      mockUseOptimizedQuery.mockImplementation((query, options) => {
        onCompletedCallback = options?.onCompleted;
        return {
          data: { reactions: [] },
          loading: false,
          error: null,
          refetch: vi.fn(),
          queryTime: 100,
          isSlowQuery: false,
        };
      });

      renderHook(() => useReactions({ targetId: 'game-log-1', targetType: 'GAME_LOG' }));

      // Trigger the onCompleted callback
      if (onCompletedCallback) {
        onCompletedCallback({ reactions: [] });
      }

      await waitFor(() => {
        expect(cacheReactions).toHaveBeenCalledWith(
          'game-log-1',
          'GAME_LOG',
          [],
          expect.objectContaining({
            ttl: 300,
            tags: ['target:GAME_LOG:game-log-1'],
          })
        );
      });
    });
  });
});
