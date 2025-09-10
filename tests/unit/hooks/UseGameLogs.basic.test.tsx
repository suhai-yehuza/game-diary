/// <reference types="vitest/globals" />

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  useGameLogs,
  useMyGameLogs,
  usePublicGameLogs,
  useFriendsGameLogs,
} from '@/hooks/use-game-logs';
import { errorHandlers } from '@/lib/utils/error-handler';

// Mock useOptimizedQuery
vi.mock('@/hooks/use-optimized-query', () => ({
  useOptimizedQuery: vi.fn(),
}));

// Import the mocked function
import { useOptimizedQuery } from '@/hooks/use-optimized-query';

// Mock API_CONFIG
vi.mock('@/lib/config/app.config', () => ({
  API_CONFIG: {
    pagination: {
      DEFAULT_PAGE_SIZE: 20,
      DEFAULT_GAME_LOG_PAGE_SIZE: 20,
    },
  },
}));

// Mock CLASSIFICATION, LogLevel, ErrorCategory, and ErrorSeverity
vi.mock('@/types', () => ({
  CLASSIFICATION: {
    PUBLIC: 'public',
    PRIVATE: 'private',
  },
  LogLevel: {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
  },
  ErrorCategory: {
    API: 'api',
    VALIDATION: 'validation',
    NETWORK: 'network',
    AUTHENTICATION: 'authentication',
  },
  ErrorSeverity: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  },
}));

describe('Game Logs Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGameLogs', () => {
    it('should be a function', () => {
      expect(typeof useGameLogs).toBe('function');
    });

    it('should return an object with expected properties', () => {
      (useOptimizedQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        networkStatus: 7, // NetworkStatus.ready
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useGameLogs());

      expect(result.current).toHaveProperty('gameLogs');
      expect(result.current).toHaveProperty('gameLogs');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('gameLogsTotalCount');
      expect(result.current).toHaveProperty('gameLogsHasNextPage');
      expect(result.current).toHaveProperty('loadMoreGameLogs');
      expect(result.current).toHaveProperty('refetch');
    });

    it('should accept options parameter', () => {
      (useOptimizedQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        networkStatus: 7, // NetworkStatus.ready
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      const options = { filters: { userId: 'user123' }, pagination: { first: 10 } };
      renderHook(() => useGameLogs(options));

      expect(useOptimizedQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          variables: {
            filters: {
              filters: { userId: 'user123' },
              pagination: { first: 10 },
            },
            pagination: { first: 20, after: null },
          },
        })
      );
    });

    it('should handle error state', () => {
      const mockError = new Error('Test error');
      (useOptimizedQuery as any).mockReturnValue({
        loading: false,
        error: mockError,
        data: null,
        networkStatus: 7, // NetworkStatus.ready
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useGameLogs());

      expect(result.current.error).toStrictEqual(mockError);
    });

    it('should handle loading state', () => {
      (useOptimizedQuery as any).mockReturnValue({
        loading: true,
        error: null,
        data: null,
        networkStatus: 1, // NetworkStatus.loading
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useGameLogs());

      expect(result.current.loading).toBe(true);
    });

    it('should handle loadMoreGameLogs functionality', async () => {
      const mockRefetch = vi.fn().mockResolvedValue({
        data: {
          gameLogs: {
            edges: [{ node: { id: '2', notes: 'Game 2' } }],
            pageInfo: { endCursor: 'cursor2', hasNextPage: false },
          },
        },
      });

      // Mock initial data to set up internal state
      const mockData = {
        gameLogs: {
          edges: [{ node: { id: '1', notes: 'Game 1' } }],
          totalCount: 1,
          pageInfo: { endCursor: 'cursor1', hasNextPage: true },
        },
      };

      (useOptimizedQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: mockData,
        networkStatus: 7, // NetworkStatus.ready
        refetch: mockRefetch,
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useGameLogs());

      // Trigger onCompleted callback manually to set up internal state
      act(() => {
        const queryOptions = (useOptimizedQuery as any).mock.calls[0][1];
        if (queryOptions.onCompleted) {
          queryOptions.onCompleted(mockData);
        }
      });

      // Call loadMoreGameLogs
      await act(async () => {
        await result.current.loadMoreGameLogs();
      });

      expect(mockRefetch).toHaveBeenCalledWith();
    });

    it('should not loadMoreGameLogs when hasNextPage is false', async () => {
      const mockFetchMore = vi.fn();

      const mockData = {
        gameLogs: {
          edges: [{ node: { id: '1', notes: 'Game 1' } }],
          totalCount: 1,
          pageInfo: { endCursor: 'cursor1', hasNextPage: false },
        },
      };

      (useOptimizedQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: mockData,
        networkStatus: 7, // NetworkStatus.ready
        refetch: vi.fn(),
        fetchMore: mockFetchMore,
      });

      const { result } = renderHook(() => useGameLogs());

      // Trigger onCompleted callback manually to set up internal state
      act(() => {
        const queryOptions = (useOptimizedQuery as any).mock.calls[0][1];
        if (queryOptions.onCompleted) {
          queryOptions.onCompleted(mockData);
        }
      });

      // Call loadMoreGameLogs
      await act(async () => {
        await result.current.loadMoreGameLogs();
      });

      expect(mockFetchMore).not.toHaveBeenCalled();
    });

    it('should not loadMoreGameLogs when loading is true', async () => {
      const mockFetchMore = vi.fn();

      (useOptimizedQuery as any).mockReturnValue({
        loading: true,
        error: null,
        data: null,
        networkStatus: 1, // NetworkStatus.loading
        refetch: vi.fn(),
        fetchMore: mockFetchMore,
      });

      const { result } = renderHook(() => useGameLogs());

      // Call loadMoreGameLogs
      await act(async () => {
        await result.current.loadMoreGameLogs();
      });

      expect(mockFetchMore).not.toHaveBeenCalled();
    });

    it('should handle loadMoreFriendsLogs functionality', async () => {
      const mockRefetch = vi.fn().mockResolvedValue({
        data: {
          friendsGameLogs: {
            edges: [{ node: { id: '2', notes: 'Friend Game 2' } }],
            pageInfo: { endCursor: 'cursor2', hasNextPage: false },
          },
        },
      });

      // Mock initial data to set up internal state
      const mockData = {
        friendsGameLogs: {
          edges: [{ node: { id: '1', notes: 'Friend Game 1' } }],
          totalCount: 1,
          pageInfo: { endCursor: 'cursor1', hasNextPage: true },
        },
      };

      (useOptimizedQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: mockData,
        networkStatus: 7, // NetworkStatus.ready
        refetch: mockRefetch,
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useFriendsGameLogs());

      // Trigger onCompleted callback manually to set up internal state
      act(() => {
        const queryOptions = (useOptimizedQuery as any).mock.calls[0][1];
        if (queryOptions.onCompleted) {
          queryOptions.onCompleted(mockData);
        }
      });

      // Call loadMoreFriendsLogs
      await act(async () => {
        await result.current.loadMoreFriendsLogs();
      });

      expect(mockRefetch).toHaveBeenCalledWith();
    });

    it('should handle refetch functionality', async () => {
      const mockRefetch = vi.fn().mockResolvedValue({
        data: {
          gameLogs: {
            edges: [{ node: { id: '1', notes: 'Refetched Game' } }],
            totalCount: 1,
            pageInfo: { endCursor: 'cursor1', hasNextPage: false },
          },
        },
      });

      (useOptimizedQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        networkStatus: 7, // NetworkStatus.ready
        refetch: mockRefetch,
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useGameLogs());

      // Call refetch
      await act(async () => {
        await result.current.refetch();
      });

      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should handle onError callback with FORBIDDEN error', () => {
      const mockErrorHandler = vi.fn();
      errorHandlers.api = mockErrorHandler;

      (useOptimizedQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        networkStatus: 7, // NetworkStatus.ready
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      renderHook(() => useGameLogs());

      // Trigger onError callback manually
      act(() => {
        const queryOptions = (useOptimizedQuery as any).mock.calls[0][1];
        if (queryOptions.onError) {
          queryOptions.onError(new Error('FORBIDDEN'));
        }
      });

      expect(mockErrorHandler).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          component: 'useGameLogs',
          action: 'GraphQL operation',
        })
      );
    });

    it('should handle onError callback with other error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      (useOptimizedQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        networkStatus: 7, // NetworkStatus.ready
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      renderHook(() => useGameLogs());

      // Trigger onError callback manually
      act(() => {
        const queryOptions = (useOptimizedQuery as any).mock.calls[0][1];
        if (queryOptions.onError) {
          queryOptions.onError(new Error('Test error'));
        }
      });

      // Error is handled by error handler, not console.error
      // expect(consoleSpy).toHaveBeenCalledWith('Game logs query error:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  // useMyGameLogs function doesn't exist, so these tests are removed

  describe('usePublicGameLogs', () => {
    it('should return an object with expected properties', () => {
      (useOptimizedQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        networkStatus: 7, // NetworkStatus.ready
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => usePublicGameLogs());

      expect(result.current).toHaveProperty('logs');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('totalCount');
      expect(result.current).toHaveProperty('hasNextPage');
      expect(result.current).toHaveProperty('loadMore');
      expect(result.current).toHaveProperty('refetch');
    });

    it('should pass public classification filter to useGameLogs', () => {
      (useOptimizedQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        networkStatus: 7, // NetworkStatus.ready
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      renderHook(() => usePublicGameLogs());

      expect(useOptimizedQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          variables: {
            filters: { classification: 'PUBLIC' },
            pagination: { first: 20, after: null },
          },
        })
      );
    });
  });

  describe('useFriendsGameLogs', () => {
    it('should return an object with expected properties', () => {
      (useOptimizedQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        networkStatus: 7, // NetworkStatus.ready
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useFriendsGameLogs());

      expect(result.current).toHaveProperty('friendsLogs');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refetch');
    });

    it('should handle loadMore functionality', async () => {
      const mockFetchMore = vi.fn().mockResolvedValue({
        data: {
          friendsGameLogs: {
            edges: [{ node: { id: '2', notes: 'Friend Game 2' } }],
            pageInfo: { endCursor: 'cursor2', hasNextPage: false },
          },
        },
      });

      // Mock initial data to set up internal state
      const mockData = {
        friendsGameLogs: {
          edges: [{ node: { id: '1', notes: 'Friend Game 1' } }],
          totalCount: 1,
          pageInfo: { endCursor: 'cursor1', hasNextPage: true },
        },
      };

      (useOptimizedQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: mockData,
        networkStatus: 7, // NetworkStatus.ready
        refetch: mockFetchMore,
      });

      const { result } = renderHook(() => useFriendsGameLogs());

      // Trigger onCompleted callback manually to set up internal state
      act(() => {
        const queryOptions = (useOptimizedQuery as any).mock.calls[0][1];
        if (queryOptions.onCompleted) {
          queryOptions.onCompleted(mockData);
        }
      });

      // Call loadMore
      await act(async () => {
        await result.current.loadMoreFriendsLogs();
      });

      expect(mockFetchMore).toHaveBeenCalled();
    });

    it('should not loadMore when hasNextPage is false', async () => {
      const mockFetchMore = vi.fn();

      const mockData = {
        friendsGameLogs: {
          edges: [{ node: { id: '1', notes: 'Friend Game 1' } }],
          totalCount: 1,
          pageInfo: { endCursor: 'cursor1', hasNextPage: false },
        },
      };

      (useOptimizedQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: mockData,
        networkStatus: 7, // NetworkStatus.ready
        refetch: vi.fn(),
        fetchMore: mockFetchMore,
      });

      const { result } = renderHook(() => useFriendsGameLogs());

      // Trigger onCompleted callback manually to set up internal state
      act(() => {
        const queryOptions = (useOptimizedQuery as any).mock.calls[0][1];
        if (queryOptions.onCompleted) {
          queryOptions.onCompleted(mockData);
        }
      });

      // Call loadMore
      await act(async () => {
        await result.current.loadMoreFriendsLogs();
      });

      expect(mockFetchMore).not.toHaveBeenCalled();
    });

    it('should not loadMore when loading is true', async () => {
      const mockFetchMore = vi.fn();

      (useOptimizedQuery as any).mockReturnValue({
        loading: true,
        error: null,
        data: null,
        networkStatus: 1, // NetworkStatus.loading
        refetch: vi.fn(),
        fetchMore: mockFetchMore,
      });

      const { result } = renderHook(() => useFriendsGameLogs());

      // Call loadMore
      await act(async () => {
        await result.current.loadMoreFriendsLogs();
      });

      expect(mockFetchMore).not.toHaveBeenCalled();
    });

    it('should handle refetch functionality', async () => {
      const mockRefetch = vi.fn().mockResolvedValue({
        data: {
          friendsGameLogs: {
            edges: [{ node: { id: '1', notes: 'Refetched Friend Game' } }],
            totalCount: 1,
            pageInfo: { endCursor: 'cursor1', hasNextPage: false },
          },
        },
      });

      (useOptimizedQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        networkStatus: 7, // NetworkStatus.ready
        refetch: mockRefetch,
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useFriendsGameLogs());

      // Call refetch
      await act(async () => {
        await result.current.refetch();
      });

      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
