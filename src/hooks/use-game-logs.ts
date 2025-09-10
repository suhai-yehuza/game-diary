import { useCallback, useState } from 'react';

import { useOptimizedQuery } from '@/hooks/use-optimized-query';
import { GET_FRIENDS_GAME_LOGS, GET_GAME_LOGS } from '@/lib/graphql/queries';
import { errorHandlers } from '@/lib/utils/error-handler';
import type {
  IFriendsGameLogsResponse,
  IGameLog,
  IGameLogsResponse,
  IPaginationParams,
  GameLogFilters,
  GameLogEdge,
} from '@/types';

export function useGameLogs(
  filtersParam: GameLogFilters = {},
  paginationParam: IPaginationParams = { page: 1, limit: 20 },
  options: { skip?: boolean } = {}
) {
  const [gameLogs, setGameLogs] = useState<IGameLog[]>([]);
  const [gameLogsEndCursor, setGameLogsEndCursor] = useState<string | null>(null);
  const [gameLogsHasNextPage, setGameLogsHasNextPage] = useState<boolean>(false);
  const [gameLogsTotalCount, setGameLogsTotalCount] = useState<number>(0);

  // Convert pagination to GraphQL format
  const graphqlPagination = {
    first: paginationParam.limit,
    after: paginationParam.offset ? btoa(`arrayconnection:${paginationParam.offset}`) : null,
  };

  const { loading, error, refetch } = useOptimizedQuery<IGameLogsResponse>(GET_GAME_LOGS, {
    variables: {
      filters: filtersParam || {},
      pagination: graphqlPagination,
    },
    skip: options.skip,
    onCompleted: data => {
      if (data?.gameLogs) {
        const newGameLogs = data.gameLogs.edges?.map((edge: GameLogEdge) => edge.node) || [];
        setGameLogs(newGameLogs);
        setGameLogsEndCursor(data.gameLogs.pageInfo?.endCursor || null);
        setGameLogsHasNextPage(data.gameLogs.pageInfo?.hasNextPage || false);
        setGameLogsTotalCount(data.gameLogs.totalCount || 0);
      }
    },
    onError: error => {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useGameLogs',
        action: 'GraphQL operation',
      });
    },
  });

  const loadMore = useCallback(async () => {
    if (!gameLogsHasNextPage || loading) return;

    try {
      const result = await refetch();

      const typedResult = result as { data?: IGameLogsResponse };
      if (typedResult.data?.gameLogs) {
        const newGameLogs = typedResult.data.gameLogs.edges?.map(edge => edge.node) || [];
        setGameLogs(prev => [...prev, ...newGameLogs]);
        setGameLogsEndCursor(typedResult.data.gameLogs.pageInfo?.endCursor || null);
        setGameLogsHasNextPage(typedResult.data.gameLogs.pageInfo?.hasNextPage || false);
      }
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useGameLogs.loadMore',
        action: 'Load more game logs',
      });
    }
  }, [gameLogsHasNextPage, loading, refetch]);

  const refresh = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useGameLogs.refresh',
        action: 'Refresh game logs',
      });
    }
  }, [refetch]);

  return {
    gameLogs,
    loading,
    error,
    loadMoreGameLogs: loadMore,
    refresh,
    refetch,

    // Pagination
    gameLogsEndCursor,
    gameLogsHasNextPage,
    gameLogsTotalCount,
  };
}

export function useFriendsGameLogs(
  pagination: IPaginationParams = { page: 1, limit: 20 },
  options: { skip?: boolean } = {}
) {
  const [friendsLogs, setFriendsLogs] = useState<IGameLog[]>([]);
  const [friendsLogsEndCursor, setFriendsLogsEndCursor] = useState<string | null>(null);
  const [friendsLogsHasNextPage, setFriendsLogsHasNextPage] = useState<boolean>(false);
  const [friendsLogsTotalCount, setFriendsLogsTotalCount] = useState<number>(0);

  // Convert pagination to GraphQL format
  const graphqlPagination = {
    first: pagination.limit,
    after: pagination.offset ? btoa(`arrayconnection:${pagination.offset}`) : null,
  };

  const { loading, error, refetch } = useOptimizedQuery<IFriendsGameLogsResponse>(
    GET_FRIENDS_GAME_LOGS,
    {
      variables: {
        pagination: graphqlPagination,
      },
      skip: options.skip,
      onCompleted: data => {
        if (data?.friendsGameLogs) {
          const newFriendsLogs =
            data.friendsGameLogs.edges?.map((edge: GameLogEdge) => edge.node) || [];
          setFriendsLogs(newFriendsLogs);
          setFriendsLogsEndCursor(data.friendsGameLogs.pageInfo?.endCursor || null);
          setFriendsLogsHasNextPage(data.friendsGameLogs.pageInfo?.hasNextPage || false);
          setFriendsLogsTotalCount(data.friendsGameLogs.totalCount || 0);
        }
      },
      onError: error => {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'useFriendsGameLogs',
          action: 'Load friends game logs',
        });
      },
    }
  );

  const loadMore = useCallback(async () => {
    if (!friendsLogsHasNextPage || loading) return;

    try {
      const result = await refetch();

      const typedResult = result as { data?: IFriendsGameLogsResponse };
      if (typedResult.data?.friendsGameLogs) {
        const newFriendsLogs = typedResult.data.friendsGameLogs.edges?.map(edge => edge.node) || [];
        setFriendsLogs(prev => [...prev, ...newFriendsLogs]);
        setFriendsLogsEndCursor(typedResult.data.friendsGameLogs.pageInfo?.endCursor || null);
        setFriendsLogsHasNextPage(typedResult.data.friendsGameLogs.pageInfo?.hasNextPage || false);
      }
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useFriendsGameLogs.loadMore',
        action: 'Load more friends game logs',
      });
    }
  }, [friendsLogsHasNextPage, loading, refetch]);

  const refresh = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useFriendsGameLogs.refresh',
        action: 'Refresh friends game logs',
      });
    }
  }, [refetch]);

  return {
    friendsLogs,
    loading,
    error,
    loadMoreFriendsLogs: loadMore,
    refresh,
    refetch,

    // Pagination
    friendsLogsEndCursor,
    friendsLogsHasNextPage,
    friendsLogsTotalCount,
  };
}

export function usePublicGameLogs(
  pagination: IPaginationParams = { page: 1, limit: 20 },
  options: { skip?: boolean } = {}
) {
  const [logs, setLogs] = useState<IGameLog[]>([]);
  const [logsEndCursor, setLogsEndCursor] = useState<string | null>(null);
  const [logsHasNextPage, setLogsHasNextPage] = useState<boolean>(false);
  const [logsTotalCount, setLogsTotalCount] = useState<number>(0);

  // Convert pagination to GraphQL format
  const graphqlPagination = {
    first: pagination.limit,
    after: pagination.offset ? btoa(`arrayconnection:${pagination.offset}`) : null,
  };

  const { loading, error, refetch } = useOptimizedQuery<IGameLogsResponse>(GET_GAME_LOGS, {
    variables: {
      filters: { classification: 'PUBLIC' },
      pagination: graphqlPagination,
    },
    skip: options.skip,
    onCompleted: data => {
      if (data?.gameLogs) {
        const newLogs = data.gameLogs.edges?.map((edge: GameLogEdge) => edge.node) || [];
        setLogs(newLogs);
        setLogsEndCursor(data.gameLogs.pageInfo?.endCursor || null);
        setLogsHasNextPage(data.gameLogs.pageInfo?.hasNextPage || false);
        setLogsTotalCount(data.gameLogs.totalCount || 0);
      }
    },
    onError: error => {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'usePublicGameLogs',
        action: 'GraphQL operation',
      });
    },
  });

  const loadMore = useCallback(async () => {
    if (!logsHasNextPage || loading) return;

    try {
      const result = await refetch();

      const typedResult = result as { data?: IGameLogsResponse };
      if (typedResult.data?.gameLogs) {
        const newLogs = typedResult.data.gameLogs.edges?.map(edge => edge.node) || [];
        setLogs(prev => [...prev, ...newLogs]);
        setLogsEndCursor(typedResult.data.gameLogs.pageInfo?.endCursor || null);
        setLogsHasNextPage(typedResult.data.gameLogs.pageInfo?.hasNextPage || false);
      }
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'usePublicGameLogs.loadMore',
        action: 'Load more public game logs',
      });
    }
  }, [logsHasNextPage, loading, refetch]);

  const refresh = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'usePublicGameLogs.refresh',
        action: 'Refresh public game logs',
      });
    }
  }, [refetch]);

  return {
    logs,
    loading,
    error,
    loadMore,
    refresh,
    refetch,

    // Pagination
    logsEndCursor,
    hasNextPage: logsHasNextPage,
    totalCount: logsTotalCount,
  };
}
