'use client';

import { useQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';

import { GET_NBA_HUB_COUNTS } from '@/lib/graphql/queries';
import type { INBAHubCounts, IUseOptimizedNBAHubCountsOptions } from '@/types';

export function useOptimizedNBAHubCounts(options: IUseOptimizedNBAHubCountsOptions = {}) {
  const { skip = false } = options;

  const { data, loading, error, refetch } = useQuery(GET_NBA_HUB_COUNTS, {
    skip,
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
    // Cache for 5 minutes
    pollInterval: 5 * 60 * 1000,
  });

  // Transform data to match expected interface
  const counts = useMemo((): INBAHubCounts => {
    if (!data) {
      return {
        totalGames: 0,
        totalTeams: 0,
        totalPlayers: 0,
        liveGames: 0,
      };
    }

    return {
      totalGames: data.games?.totalCount || 0,
      totalTeams: data.teams?.totalCount || 0,
      totalPlayers: data.players?.totalCount || 0,
      liveGames: data.liveGames?.totalCount || 0,
    };
  }, [data]);

  // Refetch function
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    counts,
    loading,
    error,
    refresh,
    lastUpdated: new Date(),
    source: 'optimized-graphql' as const,
  };
}
