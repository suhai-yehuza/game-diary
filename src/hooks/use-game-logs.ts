import { useCallback, useEffect, useRef, useState, useMemo } from 'react';

import { useOptimizedQuery } from '@/hooks/use-optimized-query';
import { GameLogCacheUtils, CACHE_CONFIG } from '@/lib/cache';
import { API_CONFIG } from '@/lib/config/app.config';
import { GET_FRIENDS_GAME_LOGS, GET_GAME_LOGS } from '@/lib/graphql/queries';
import { errorHandlers } from '@/lib/utils/error-handler';
import { ErrorCategory, ErrorSeverity } from '@/types';
import type {
  IFriendsGameLogsResponse,
  IGameLog,
  IGameLogsResponse,
  IPaginationParams,
  GameLogFilters,
} from '@/types';

export function useGameLogs(
  filters: GameLogFilters = {},
  pagination: IPaginationParams = { page: 1, limit: 20 },
  options: { skip?: boolean } = {}
) {
  const [gameLogs, setGameLogs] = useState<IGameLog[]>([]);
  const [gameLogsEndCursor, setGameLogsEndCursor] = useState<string | null>(null);
  const [gameLogsHasNextPage, setGameLogsHasNextPage] = useState<boolean>(false);
  const [gameLogsTotalCount, setGameLogsTotalCount] = useState<number>(0);

  // Cache state
  const [cachedGameLogs, setCachedGameLogs] = useState<IGameLog[] | null>(null);
  const [isCacheHit, setIsCacheHit] = useState(false);

  // Add timeout state to prevent hanging
  const [_queryTimeout, _setQueryTimeout] = useState<NodeJS.Timeout | null>(null);

  // Add mounted state to prevent updates on unmounted component
  const [isMounted, setIsMounted] = useState(true);

  // Memoize filters and pagination to prevent unnecessary re-renders
  const memoizedFilters = useMemo(
    () => filters,
    [
      filters.userId,
      filters.gameId,
      filters.classification,
      filters.watchedSetting,
      filters.watchedScope,
      filters.ratingForGame,
      filters.tags,
      filters.search,
      filters.dateRange?.start,
      filters.dateRange?.end,
    ]
  );

  const memoizedPagination = useMemo(() => pagination, [pagination.page, pagination.limit]);

  // Track if cache has been loaded to prevent multiple loads
  const cacheLoadedRef = useRef(false);

  // Track if query has completed to prevent multiple executions
  const queryCompletedRef = useRef(false);

  // Reset query completed flag when filters or pagination change
  useEffect(() => {
    queryCompletedRef.current = false;
  }, [memoizedFilters, memoizedPagination]);

  // Cleanup effect to prevent state updates on unmounted component
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Try to get game logs from cache first
  useEffect(() => {
    // Prevent multiple cache loads
    if (cacheLoadedRef.current) {
      return;
    }

    const loadFromCache = async () => {
      try {
        const cached = await GameLogCacheUtils.getCachedGameLogList(
          memoizedFilters,
          memoizedPagination
        );

        if (cached && isMounted) {
          setCachedGameLogs(cached as IGameLog[]);
          setIsCacheHit(true);
        }
      } catch (error) {
        console.warn('Failed to load game logs from cache:', error);
      } finally {
        cacheLoadedRef.current = true;
      }
    };

    void loadFromCache();
  }, [memoizedFilters, memoizedPagination, isMounted]);

  // Memoize the onCompleted callback to prevent infinite re-renders
  const onCompleted = useCallback(
    (data: IGameLogsResponse) => {
      // Only update state if component is still mounted and query hasn't completed yet
      if (!isMounted || queryCompletedRef.current) return;

      if (data?.gameLogs) {
        const newGameLogs = data.gameLogs.edges.map(edge => edge.node);
        setGameLogs(newGameLogs);
        setGameLogsEndCursor(data.gameLogs.pageInfo.endCursor ?? null);
        setGameLogsHasNextPage(!!data.gameLogs.pageInfo.hasNextPage);
        setGameLogsTotalCount(data.gameLogs.totalCount);

        // Cache the game logs
        if (!isCacheHit) {
          void GameLogCacheUtils.cacheGameLogList(
            memoizedFilters,
            memoizedPagination,
            newGameLogs,
            {
              ttl: CACHE_CONFIG.TTL.GAME_LOG_LIST,
              tags: ['gameLogList', 'gameLogs'],
            }
          );
        }

        // Mark query as completed
        queryCompletedRef.current = true;
      }
    },
    [isMounted, isCacheHit, memoizedFilters, memoizedPagination]
  );

  // Memoize the onError callback
  const onError = useCallback(
    (error: Error) => {
      // Only log error if component is still mounted
      if (!isMounted) return;

      errorHandlers.api(error, {
        component: 'useGameLogs',
        action: 'Load game logs',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      });
    },
    [isMounted]
  );

  const { loading, error, refetch, fetchMore, networkStatus } =
    useOptimizedQuery<IGameLogsResponse>(GET_GAME_LOGS, {
      variables: {
        filters: memoizedFilters, // Pass memoized filters as a nested object
        pagination: { first: memoizedPagination.limit }, // Pass memoized pagination as a nested object
      },
      skip: options.skip, // Only skip if explicitly requested, not based on cache
      notifyOnNetworkStatusChange: true,
      context: {
        component: 'useGameLogs',
        action: 'Load game logs',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      },
      onCompleted,
      onError,
    });

  const loadMoreGameLogs = useCallback(async () => {
    if (!gameLogsHasNextPage || !gameLogsEndCursor) return;

    try {
      const result = await fetchMore({
        variables: {
          pagination: {
            ...memoizedPagination,
            after: gameLogsEndCursor,
          },
        },
      });

      if (result.data?.gameLogs) {
        const gameLogsData = result.data.gameLogs;
        const newGameLogs = gameLogsData.edges?.map(edge => edge.node) || [];
        setGameLogs(prev => [...prev, ...newGameLogs]);
        setGameLogsEndCursor(gameLogsData.pageInfo?.endCursor ?? null);
        setGameLogsHasNextPage(!!gameLogsData.pageInfo?.hasNextPage);

        // Cache the updated game logs list
        void GameLogCacheUtils.cacheGameLogList(
          memoizedFilters,
          memoizedPagination,
          [...gameLogs, ...newGameLogs],
          {
            ttl: CACHE_CONFIG.TTL.GAME_LOG_LIST,
            tags: ['gameLogList', 'gameLogs'],
          }
        );
      }
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useGameLogs',
        action: 'Load more game logs',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      });
    }
  }, [
    gameLogsHasNextPage,
    gameLogsEndCursor,
    memoizedPagination,
    fetchMore,
    gameLogs,
    memoizedFilters,
  ]);

  // Force refresh from server (bypassing cache)
  const forceRefresh = useCallback(async () => {
    setIsCacheHit(false);
    setCachedGameLogs(null);
    cacheLoadedRef.current = false; // Reset cache loaded flag
    await refetch();
  }, [refetch]);

  // Clear cache for this query
  const clearCache = useCallback(async () => {
    await GameLogCacheUtils.invalidateGameLogCaches();
    setCachedGameLogs(null);
    setIsCacheHit(false);
    cacheLoadedRef.current = false; // Reset cache loaded flag
  }, []);

  return {
    // Data
    gameLogs: cachedGameLogs || gameLogs,
    cachedGameLogs,
    isCacheHit,

    // Pagination
    gameLogsEndCursor,
    gameLogsHasNextPage,
    gameLogsTotalCount,

    // State
    loading,
    error,
    networkStatus,

    // Actions
    loadMoreGameLogs,
    forceRefresh,
    clearCache,
    refetch,

    // Utilities
    hasMoreGameLogs: gameLogsHasNextPage,
    canLoadMore: gameLogsHasNextPage && !!gameLogsEndCursor,
  };
}

export function useFriendsGameLogs(pagination: IPaginationParams = { page: 1, limit: 20 }) {
  const [friendsLogs, setFriendsLogs] = useState<IGameLog[]>([]);
  const [friendsLogsEndCursor, setFriendsLogsEndCursor] = useState<string | null>(null);
  const [friendsLogsHasNextPage, setFriendsLogsHasNextPage] = useState<boolean>(false);
  const [friendsLogsTotalCount, setFriendsLogsTotalCount] = useState<number>(0);

  // Cache state
  const [cachedFriendsLogs, setCachedFriendsLogs] = useState<IGameLog[] | null>(null);
  const [isCacheHit, setIsCacheHit] = useState(false);

  // Try to get friends game logs from cache first
  useEffect(() => {
    const loadFromCache = async () => {
      try {
        const cached = await GameLogCacheUtils.getCachedGameLogList(
          { isFriendsOnly: true },
          pagination
        );

        if (cached) {
          setCachedFriendsLogs(cached as IGameLog[]);
          setIsCacheHit(true);
        }
      } catch (error) {
        console.warn('Failed to load friends game logs from cache:', error);
      }
    };

    void loadFromCache();
  }, [pagination]);

  const { loading, error, refetch, fetchMore, networkStatus } =
    useOptimizedQuery<IFriendsGameLogsResponse>(GET_FRIENDS_GAME_LOGS, {
      variables: {
        pagination: { first: pagination.limit },
      },
      skip: isCacheHit, // Skip if we have cached data
      notifyOnNetworkStatusChange: true,
      context: {
        component: 'useFriendsGameLogs',
        action: 'Load friends game logs',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      },
      onCompleted: useCallback(
        (data: IFriendsGameLogsResponse) => {
          if (data?.friendsGameLogs) {
            const newFriendsLogs = data.friendsGameLogs.edges.map(edge => edge.node);
            setFriendsLogs(newFriendsLogs);
            setFriendsLogsEndCursor(data.friendsGameLogs.pageInfo.endCursor ?? null);
            setFriendsLogsHasNextPage(!!data.friendsGameLogs.pageInfo.hasNextPage);
            setFriendsLogsTotalCount(data.friendsGameLogs.totalCount);

            // Cache the friends game logs
            if (!isCacheHit) {
              void GameLogCacheUtils.cacheGameLogList(
                { isFriendsOnly: true },
                pagination,
                newFriendsLogs,
                {
                  ttl: CACHE_CONFIG.TTL.GAME_LOG_LIST,
                  tags: ['gameLogList', 'gameLogs', 'friends'],
                }
              );
            }
          }
        },
        [isCacheHit, pagination]
      ),
      onError: error => {
        errorHandlers.api(error, {
          component: 'useFriendsGameLogs',
          action: 'Load friends game logs',
          category: ErrorCategory.API,
          severity: ErrorSeverity.MEDIUM,
          timestamp: new Date().toISOString(),
        });
      },
    });

  const loadMoreFriendsLogs = useCallback(async () => {
    if (!friendsLogsHasNextPage || !friendsLogsEndCursor) return;

    try {
      const result = await fetchMore({
        variables: {
          pagination: {
            ...pagination,
            after: friendsLogsEndCursor,
          },
        },
      });

      if (result.data?.friendsGameLogs) {
        const friendsLogsData = result.data.friendsGameLogs;
        const newFriendsLogs = friendsLogsData.edges?.map(edge => edge.node) || [];
        setFriendsLogs(prev => [...prev, ...newFriendsLogs]);
        setFriendsLogsEndCursor(friendsLogsData.pageInfo?.endCursor ?? null);
        setFriendsLogsHasNextPage(!!friendsLogsData.pageInfo?.hasNextPage);

        // Cache the updated friends game log list
        void GameLogCacheUtils.cacheGameLogList(
          { isFriendsOnly: true },
          pagination,
          [...friendsLogs, ...newFriendsLogs],
          {
            ttl: CACHE_CONFIG.TTL.GAME_LOG_LIST,
            tags: ['gameLogList', 'gameLogs', 'friends'],
          }
        );
      }
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useFriendsGameLogs',
        action: 'Load more friends game logs',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      });
    }
  }, [friendsLogsHasNextPage, friendsLogsEndCursor, pagination, fetchMore, friendsLogs]);

  // Force refresh from server (bypassing cache)
  const forceRefresh = useCallback(async () => {
    setIsCacheHit(false);
    setCachedFriendsLogs(null);
    await refetch();
  }, [refetch]);

  // Clear cache for friends game logs
  const clearCache = useCallback(async () => {
    await GameLogCacheUtils.invalidateGameLogCaches();
    setCachedFriendsLogs(null);
    setIsCacheHit(false);
  }, []);

  return {
    // Data
    friendsLogs: cachedFriendsLogs || friendsLogs,
    cachedFriendsLogs,
    isCacheHit,

    // Pagination
    friendsLogsEndCursor,
    friendsLogsHasNextPage,
    friendsLogsTotalCount,

    // State
    loading,
    error,
    networkStatus,

    // Actions
    loadMoreFriendsLogs,
    forceRefresh,
    clearCache,
    refetch,

    // Utilities
    hasMoreFriendsLogs: friendsLogsHasNextPage,
    canLoadMore: friendsLogsHasNextPage && !!friendsLogsEndCursor,
  };
}

export function usePublicGameLogs(pagination: IPaginationParams = { page: 1, limit: 20 }) {
  const [logs, setLogs] = useState<IGameLog[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Cache state
  const [cachedLogs, setCachedLogs] = useState<IGameLog[] | null>(null);
  const [isCacheHit, setIsCacheHit] = useState(false);

  // Try to get public game logs from cache first
  useEffect(() => {
    const loadFromCache = async () => {
      try {
        const cached = await GameLogCacheUtils.getCachedGameLogList(
          { classification: 'PUBLIC' },
          pagination
        );

        if (cached) {
          setCachedLogs(cached as IGameLog[]);
          setIsCacheHit(true);
        }
      } catch (error) {
        console.warn('Failed to load public game logs from cache:', error);
      }
    };

    void loadFromCache();
  }, [pagination]);

  const queryStartTime = useRef<number>(Date.now());

  const { loading, error, refetch, fetchMore, networkStatus } = useOptimizedQuery<
    Pick<IGameLogsResponse, 'gameLogs'>
  >(GET_GAME_LOGS, {
    variables: {
      filters: { classification: 'PUBLIC' },
      pagination: { first: API_CONFIG.pagination.DEFAULT_PAGE_SIZE },
    },
    skip: isCacheHit, // Skip if we have cached data
    notifyOnNetworkStatusChange: true,
    context: {
      component: 'usePublicGameLogs',
      action: 'Load public game logs',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    },
    onCompleted: data => {
      // Performance monitoring
      const queryDuration = Date.now() - queryStartTime.current;

      if (queryDuration > 2000) {
        console.warn(`Slow public game logs query detected: ${queryDuration}ms`);
      }

      if (data?.gameLogs) {
        const logsData = data.gameLogs;
        const newLogs = logsData.edges?.map(edge => edge.node) || [];
        setLogs(newLogs);
        setTotalCount(logsData.totalCount || logsData.edges?.length || 0);
        setEndCursor(logsData.pageInfo?.endCursor ?? null);
        setHasNextPage(!!logsData.pageInfo?.hasNextPage);

        // Cache the public game logs
        if (!isCacheHit) {
          void GameLogCacheUtils.cacheGameLogList(
            { classification: 'PUBLIC' },
            pagination,
            newLogs,
            {
              ttl: CACHE_CONFIG.TTL.GAME_LOG_LIST,
              tags: ['gameLogList', 'gameLogs', 'public'],
            }
          );
        }
      }
    },
    onError: error => {
      errorHandlers.api(error, {
        component: 'usePublicGameLogs',
        action: 'Query public game logs',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      });
    },
  });

  const loadMore = useCallback(async () => {
    if (!hasNextPage || !endCursor) return;

    try {
      const result = await fetchMore({
        variables: {
          pagination: {
            first: API_CONFIG.pagination.DEFAULT_PAGE_SIZE,
            after: endCursor,
          },
        },
      });

      if (result.data?.gameLogs) {
        const logsData = result.data.gameLogs;
        const newLogs = logsData.edges?.map(edge => edge.node) || [];
        setLogs(prev => [...prev, ...newLogs]);
        setEndCursor(logsData.pageInfo?.endCursor ?? null);
        setHasNextPage(!!logsData.pageInfo?.hasNextPage);

        // Cache the updated public game log list
        void GameLogCacheUtils.cacheGameLogList(
          { classification: 'PUBLIC' },
          pagination,
          [...logs, ...newLogs],
          {
            ttl: CACHE_CONFIG.TTL.GAME_LOG_LIST,
            tags: ['gameLogList', 'gameLogs', 'public'],
          }
        );
      }
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'usePublicGameLogs',
        action: 'Load more public game logs',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      });
    }
  }, [hasNextPage, endCursor, fetchMore, logs, pagination]);

  // Force refresh from server (bypassing cache)
  const forceRefresh = useCallback(async () => {
    setIsCacheHit(false);
    setCachedLogs(null);
    await refetch();
  }, [refetch]);

  // Clear cache for public game logs
  const clearCache = useCallback(async () => {
    await GameLogCacheUtils.invalidateGameLogCaches();
    setCachedLogs(null);
    setIsCacheHit(false);
  }, []);

  return {
    // Data
    logs: cachedLogs || logs,
    cachedLogs,
    isCacheHit,

    // Pagination
    endCursor,
    hasNextPage,
    totalCount,

    // State
    loading,
    error,
    networkStatus,

    // Actions
    loadMore,
    forceRefresh,
    clearCache,
    refetch,

    // Utilities
    hasMoreLogs: hasNextPage,
    canLoadMore: hasNextPage && !!endCursor,
  };
}
