import { useQuery } from '@apollo/client';

import { GET_GAME_LOGS } from '@/lib/graphql/queries';
import type { IGameLogsOptions, IGameLogsResponse } from '@/lib/types';
import { CLASSIFICATION } from '@/lib/types';

export function useGameLogs(options: IGameLogsOptions = {}) {
  const { filters = {}, pagination = {} } = options;

  const { data, loading, error, refetch } = useQuery<IGameLogsResponse>(GET_GAME_LOGS, {
    variables: {
      filters,
      pagination,
    },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  return {
    gameLogs: data?.gameLogs,
    loading,
    error: error ? new Error(error.message) : null,
    refetch,
  };
}

// Convenience hooks for specific use cases
export function useMyGameLogs(userId?: string) {
  return useGameLogs({
    filters: { userId },
  });
}

export function usePublicGameLogs() {
  return useGameLogs({
    filters: { classification: CLASSIFICATION.PUBLIC },
  });
}

export function useFriendsGameLogs() {
  return useGameLogs({
    filters: { classification: CLASSIFICATION.PROTECTED },
  });
}
