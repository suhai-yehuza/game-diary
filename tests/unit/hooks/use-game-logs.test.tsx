/// <reference types="vitest/globals" />

import { useQuery } from '@apollo/client';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  useGameLogs,
  useMyGameLogs,
  usePublicGameLogs,
  useFriendsGameLogs,
} from '@/hooks/use-game-logs';

// Mock Apollo Client
vi.mock('@apollo/client', () => {
  const mockUseQuery = vi.fn();
  const mockGql = vi.fn(() => '');

  return {
    useQuery: mockUseQuery,
    gql: mockGql,
    NetworkStatus: {
      loading: 1,
      setVariables: 2,
      fetchMore: 3,
      refetch: 4,
      poll: 6,
      ready: 7,
      error: 8,
    },
  };
});

// Mock API_CONFIG
vi.mock('@/lib/config/app.config', () => ({
  API_CONFIG: {
    pagination: {
      DEFAULT_PAGE_SIZE: 20,
      DEFAULT_GAME_LOG_PAGE_SIZE: 20,
    },
  },
}));

// Mock CLASSIFICATION
vi.mock('@/lib/types', () => ({
  CLASSIFICATION: {
    PUBLIC: 'public',
    PRIVATE: 'private',
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
      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        networkStatus: 7, // NetworkStatus.ready
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useGameLogs());

      expect(result.current).toHaveProperty('gameLogs');
      expect(result.current).toHaveProperty('friendsLogs');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('gameLogsTotalCount');
      expect(result.current).toHaveProperty('friendsLogsTotalCount');
      expect(result.current).toHaveProperty('gameLogsHasNextPage');
      expect(result.current).toHaveProperty('friendsLogsHasNextPage');
      expect(result.current).toHaveProperty('loadMoreGameLogs');
      expect(result.current).toHaveProperty('loadMoreFriendsLogs');
      expect(result.current).toHaveProperty('refetch');
    });

    it('should accept options parameter', () => {
      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        networkStatus: 7, // NetworkStatus.ready
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      const options = { filters: { userId: 'user123' }, pagination: { first: 10 } };
      renderHook(() => useGameLogs(options));

      expect(useQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          variables: {
            filters: { userId: 'user123' },
            pagination: { first: 10 },
          },
        })
      );
    });

    it('should handle error state', () => {
      const mockError = new Error('Test error');
      (useQuery as any).mockReturnValue({
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
      (useQuery as any).mockReturnValue({
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
      const mockFetchMore = vi.fn().mockResolvedValue({
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

      (useQuery as any).mockReturnValue({
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
        const queryOptions = (useQuery as any).mock.calls[0][1];
        if (queryOptions.onCompleted) {
          queryOptions.onCompleted(mockData);
        }
      });

      // Call loadMoreGameLogs
      await act(async () => {
        await result.current.loadMoreGameLogs();
      });

      expect(mockFetchMore).toHaveBeenCalledWith({
        variables: {
          filters: {},
          pagination: {
            first: 20,
            after: 'cursor1',
          },
        },
      });
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

      (useQuery as any).mockReturnValue({
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
        const queryOptions = (useQuery as any).mock.calls[0][1];
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

      (useQuery as any).mockReturnValue({
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

      (useQuery as any).mockReturnValue({
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
        const queryOptions = (useQuery as any).mock.calls[0][1];
        if (queryOptions.onCompleted) {
          queryOptions.onCompleted(mockData);
        }
      });

      // Call loadMoreFriendsLogs
      await act(async () => {
        await result.current.loadMoreFriendsLogs();
      });

      expect(mockFetchMore).toHaveBeenCalledWith({
        variables: {
          filters: {},
          pagination: {
            first: 20,
            after: 'cursor1',
          },
        },
      });
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

      (useQuery as any).mockReturnValue({
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
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      (useQuery as any).mockReturnValue({
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
        const queryOptions = (useQuery as any).mock.calls[0][1];
        if (queryOptions.onError) {
          queryOptions.onError({
            graphQLErrors: [{ extensions: { code: 'FORBIDDEN' } }],
          });
        }
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Game logs query error:', expect.any(Object));
      expect(consoleSpy).toHaveBeenCalledWith(
        'Authentication error in game logs query, user may not be authenticated'
      );

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should handle onError callback with other error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      (useQuery as any).mockReturnValue({
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
        const queryOptions = (useQuery as any).mock.calls[0][1];
        if (queryOptions.onError) {
          queryOptions.onError(new Error('Test error'));
        }
      });

      expect(consoleSpy).toHaveBeenCalledWith('Game logs query error:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('useMyGameLogs', () => {
    it('should return an object with expected properties', () => {
      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        networkStatus: 7, // NetworkStatus.ready
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useMyGameLogs('user123'));

      expect(result.current).toHaveProperty('gameLogs');
      expect(result.current).toHaveProperty('friendsLogs');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('gameLogsTotalCount');
      expect(result.current).toHaveProperty('friendsLogsTotalCount');
      expect(result.current).toHaveProperty('gameLogsHasNextPage');
      expect(result.current).toHaveProperty('friendsLogsHasNextPage');
      expect(result.current).toHaveProperty('loadMoreGameLogs');
      expect(result.current).toHaveProperty('loadMoreFriendsLogs');
      expect(result.current).toHaveProperty('refetch');
    });

    it('should handle undefined userId', () => {
      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        networkStatus: 7, // NetworkStatus.ready
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      renderHook(() => useMyGameLogs(undefined));

      expect(useQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          variables: {
            filters: { userId: undefined },
            pagination: { first: 20 },
          },
        })
      );
    });

    it('should pass userId filter to useGameLogs', () => {
      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        networkStatus: 7, // NetworkStatus.ready
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      renderHook(() => useMyGameLogs('user123'));

      expect(useQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          variables: {
            filters: { userId: 'user123' },
            pagination: { first: 20 },
          },
        })
      );
    });
  });

  describe('usePublicGameLogs', () => {
    it('should return an object with expected properties', () => {
      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        networkStatus: 7, // NetworkStatus.ready
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => usePublicGameLogs());

      expect(result.current).toHaveProperty('gameLogs');
      expect(result.current).toHaveProperty('friendsLogs');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('gameLogsTotalCount');
      expect(result.current).toHaveProperty('friendsLogsTotalCount');
      expect(result.current).toHaveProperty('gameLogsHasNextPage');
      expect(result.current).toHaveProperty('friendsLogsHasNextPage');
      expect(result.current).toHaveProperty('loadMoreGameLogs');
      expect(result.current).toHaveProperty('loadMoreFriendsLogs');
      expect(result.current).toHaveProperty('refetch');
    });

    it('should pass public classification filter to useGameLogs', () => {
      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        networkStatus: 7, // NetworkStatus.ready
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      renderHook(() => usePublicGameLogs());

      expect(useQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          variables: {
            filters: { classification: 'public' },
            pagination: { first: 20 },
          },
        })
      );
    });
  });

  describe('useFriendsGameLogs', () => {
    it('should return an object with expected properties', () => {
      (useQuery as any).mockReturnValue({
        loading: false,
        error: null,
        data: null,
        networkStatus: 7, // NetworkStatus.ready
        refetch: vi.fn(),
        fetchMore: vi.fn(),
      });

      const { result } = renderHook(() => useFriendsGameLogs());

      expect(result.current).toHaveProperty('logs');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('hasNextPage');
      expect(result.current).toHaveProperty('loadMore');
      expect(result.current).toHaveProperty('refetch');
      expect(result.current).toHaveProperty('totalCount');
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

      (useQuery as any).mockReturnValue({
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
        const queryOptions = (useQuery as any).mock.calls[0][1];
        if (queryOptions.onCompleted) {
          queryOptions.onCompleted(mockData);
        }
      });

      // Call loadMore
      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockFetchMore).toHaveBeenCalledWith({
        variables: {
          pagination: { first: 20, after: 'cursor1' },
        },
      });
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

      (useQuery as any).mockReturnValue({
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
        const queryOptions = (useQuery as any).mock.calls[0][1];
        if (queryOptions.onCompleted) {
          queryOptions.onCompleted(mockData);
        }
      });

      // Call loadMore
      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockFetchMore).not.toHaveBeenCalled();
    });

    it('should not loadMore when loading is true', async () => {
      const mockFetchMore = vi.fn();

      (useQuery as any).mockReturnValue({
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
        await result.current.loadMore();
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

      (useQuery as any).mockReturnValue({
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
