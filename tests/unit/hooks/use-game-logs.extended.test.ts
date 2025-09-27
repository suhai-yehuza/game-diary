import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { useGameLogs } from '@/hooks/use-game-logs';

// Mock the useOptimizedQuery hook
vi.mock('@/hooks/use-optimized-query', () => ({
  useOptimizedQuery: vi.fn(),
}));

// Mock error handlers
vi.mock('@/lib/utils/error-handler', () => ({
  errorHandlers: {
    api: vi.fn(),
  },
}));

// Mock GraphQL queries
vi.mock('@/lib/graphql/queries', () => ({
  GET_GAME_LOGS: 'GET_GAME_LOGS_QUERY',
  GET_FRIENDS_GAME_LOGS: 'GET_FRIENDS_GAME_LOGS_QUERY',
}));

describe('useGameLogs - Extended Tests', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
    vi.mocked(useOptimizedQuery).mockReturnValue({
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useGameLogs());

    expect(result.current.gameLogs).toEqual([]);
    expect(result.current.gameLogsEndCursor).toBeNull();
    expect(result.current.gameLogsHasNextPage).toBe(false);
    expect(result.current.gameLogsTotalCount).toBe(0);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles custom filters and pagination', async () => {
    const filters = { rating: 5, classification: 'positive' };
    const pagination = { page: 2, limit: 10 };

    renderHook(() => useGameLogs(filters, pagination));

    const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
    expect(useOptimizedQuery).toHaveBeenCalledWith(
      'GET_GAME_LOGS_QUERY',
      expect.objectContaining({
        variables: {
          filters,
          pagination: {
            first: 10,
            after: null, // No offset for page 2
          },
        },
        skip: undefined,
      })
    );
  });

  it('handles skip option', async () => {
    renderHook(() => useGameLogs({}, { page: 1, limit: 20 }, { skip: true }));

    const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
    expect(useOptimizedQuery).toHaveBeenCalledWith(
      'GET_GAME_LOGS_QUERY',
      expect.objectContaining({
        skip: true,
      })
    );
  });

  it('processes successful data response', async () => {
    const mockData = {
      gameLogs: {
        edges: [
          {
            node: {
              id: '1',
              rating: 5,
              notes: 'Great game!',
              classification: 'positive',
            },
          },
          {
            node: {
              id: '2',
              rating: 3,
              notes: 'Average game',
              classification: 'neutral',
            },
          },
        ],
        pageInfo: {
          endCursor: 'cursor123',
          hasNextPage: true,
        },
        totalCount: 25,
      },
    };

    let onCompletedCallback: (data: any) => void;
    const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
    vi.mocked(useOptimizedQuery).mockImplementation((query, options) => {
      onCompletedCallback = options.onCompleted;
      return {
        loading: false,
        error: null,
        refetch: vi.fn(),
      };
    });

    const { result } = renderHook(() => useGameLogs());

    act(() => {
      onCompletedCallback(mockData);
    });

    expect(result.current.gameLogs).toHaveLength(2);
    expect(result.current.gameLogs[0].id).toBe('1');
    expect(result.current.gameLogs[1].id).toBe('2');
    expect(result.current.gameLogsEndCursor).toBe('cursor123');
    expect(result.current.gameLogsHasNextPage).toBe(true);
    expect(result.current.gameLogsTotalCount).toBe(25);
  });

  it('handles empty data response', async () => {
    const mockData = {
      gameLogs: {
        edges: [],
        pageInfo: {
          endCursor: null,
          hasNextPage: false,
        },
        totalCount: 0,
      },
    };

    let onCompletedCallback: (data: any) => void;
    const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
    vi.mocked(useOptimizedQuery).mockImplementation((query, options) => {
      onCompletedCallback = options.onCompleted;
      return {
        loading: false,
        error: null,
        refetch: vi.fn(),
      };
    });

    const { result } = renderHook(() => useGameLogs());

    act(() => {
      onCompletedCallback(mockData);
    });

    expect(result.current.gameLogs).toEqual([]);
    expect(result.current.gameLogsEndCursor).toBeNull();
    expect(result.current.gameLogsHasNextPage).toBe(false);
    expect(result.current.gameLogsTotalCount).toBe(0);
  });

  it('handles null/undefined data gracefully', async () => {
    let onCompletedCallback: (data: any) => void;
    const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
    vi.mocked(useOptimizedQuery).mockImplementation((query, options) => {
      onCompletedCallback = options.onCompleted;
      return {
        loading: false,
        error: null,
        refetch: vi.fn(),
      };
    });

    const { result } = renderHook(() => useGameLogs());

    act(() => {
      onCompletedCallback(null);
    });

    expect(result.current.gameLogs).toEqual([]);
    expect(result.current.gameLogsEndCursor).toBeNull();
    expect(result.current.gameLogsHasNextPage).toBe(false);
    expect(result.current.gameLogsTotalCount).toBe(0);
  });

  it('handles error responses', async () => {
    const mockError = new Error('GraphQL error');
    let onErrorCallback: (error: any) => void;

    const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
    vi.mocked(useOptimizedQuery).mockImplementation((query, options) => {
      onErrorCallback = options.onError;
      return {
        loading: false,
        error: mockError,
        refetch: vi.fn(),
      };
    });

    renderHook(() => useGameLogs());

    act(() => {
      onErrorCallback(mockError);
    });

    const { errorHandlers } = await import('@/lib/utils/error-handler');
    expect(errorHandlers.api).toHaveBeenCalledWith(mockError, {
      component: 'useGameLogs',
      action: 'GraphQL operation',
    });
  });

  it('handles string errors', async () => {
    const stringError = 'String error message';
    let onErrorCallback: (error: any) => void;

    const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
    vi.mocked(useOptimizedQuery).mockImplementation((query, options) => {
      onErrorCallback = options.onError;
      return {
        loading: false,
        error: stringError,
        refetch: vi.fn(),
      };
    });

    renderHook(() => useGameLogs());

    act(() => {
      onErrorCallback(stringError);
    });

    const { errorHandlers } = await import('@/lib/utils/error-handler');
    expect(errorHandlers.api).toHaveBeenCalledWith(expect.any(Error), {
      component: 'useGameLogs',
      action: 'GraphQL operation',
    });
  });

  it('converts pagination correctly for GraphQL', async () => {
    const pagination = { page: 3, limit: 15, offset: 30 };

    renderHook(() => useGameLogs({}, pagination));

    const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
    expect(useOptimizedQuery).toHaveBeenCalledWith(
      'GET_GAME_LOGS_QUERY',
      expect.objectContaining({
        variables: {
          filters: {},
          pagination: {
            first: 15,
            after: btoa('arrayconnection:30'),
          },
        },
      })
    );
  });

  it('handles pagination without offset', async () => {
    const pagination = { page: 1, limit: 20 };

    renderHook(() => useGameLogs({}, pagination));

    const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
    expect(useOptimizedQuery).toHaveBeenCalledWith(
      'GET_GAME_LOGS_QUERY',
      expect.objectContaining({
        variables: {
          filters: {},
          pagination: {
            first: 20,
            after: null,
          },
        },
      })
    );
  });

  it('exposes refetch function', async () => {
    const mockRefetch = vi.fn();
    const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
    vi.mocked(useOptimizedQuery).mockReturnValue({
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useGameLogs());

    expect(result.current.refetch).toBe(mockRefetch);
  });

  it('handles loading state', async () => {
    const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
    vi.mocked(useOptimizedQuery).mockReturnValue({
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useGameLogs());

    expect(result.current.loading).toBe(true);
  });

  it('handles error state', async () => {
    const mockError = new Error('Test error');
    const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
    vi.mocked(useOptimizedQuery).mockReturnValue({
      loading: false,
      error: mockError,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useGameLogs());

    expect(result.current.error).toBe(mockError);
  });

  it('handles complex filter combinations', async () => {
    const complexFilters = {
      rating: 4,
      classification: 'positive',
      dateRange: {
        start: '2023-01-01',
        end: '2023-12-31',
      },
      gameId: 'game123',
    };

    renderHook(() => useGameLogs(complexFilters));

    const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
    expect(useOptimizedQuery).toHaveBeenCalledWith(
      'GET_GAME_LOGS_QUERY',
      expect.objectContaining({
        variables: {
          filters: complexFilters,
          pagination: expect.any(Object),
        },
      })
    );
  });

  it('handles edge cases in data processing', async () => {
    const mockData = {
      gameLogs: {
        edges: [
          {
            node: null, // Null node
          },
          {
            node: {
              id: '1',
              rating: 5,
              // Missing other fields
            },
          },
        ],
        pageInfo: null, // Null pageInfo
        totalCount: undefined, // Undefined totalCount
      },
    };

    let onCompletedCallback: (data: any) => void;
    const { useOptimizedQuery } = await import('@/hooks/use-optimized-query');
    vi.mocked(useOptimizedQuery).mockImplementation((query, options) => {
      onCompletedCallback = options.onCompleted;
      return {
        loading: false,
        error: null,
        refetch: vi.fn(),
      };
    });

    const { result } = renderHook(() => useGameLogs());

    act(() => {
      onCompletedCallback(mockData);
    });

    // Should include all nodes (including null)
    expect(result.current.gameLogs).toHaveLength(2);
    expect(result.current.gameLogs[0]).toBeNull();
    expect(result.current.gameLogs[1].id).toBe('1');
    expect(result.current.gameLogsEndCursor).toBeNull();
    expect(result.current.gameLogsHasNextPage).toBe(false);
    expect(result.current.gameLogsTotalCount).toBe(0);
  });
});
