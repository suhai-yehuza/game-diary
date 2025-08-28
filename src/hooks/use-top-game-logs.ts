import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

import { GET_GAME_LOGS } from '@/lib/graphql/queries';
import type { IGameLog, ITopGameLogsOptions } from '@/lib/types';

export function useTopGameLogs(options: ITopGameLogsOptions = {}) {
  const { limit = 100, skip = false } = options;

  const { data, loading, error, refetch } = useQuery(GET_GAME_LOGS, {
    variables: {
      filters: {
        // Only get public game logs for the landing page
        classification: 'PUBLIC',
      },
      pagination: {
        first: limit,
      },
    },
    skip,
  });

  // Sort game logs by total activity (comments + reactions)
  const topGameLogs = useMemo(() => {
    if (!data?.gameLogs?.edges) return [];

    const gameLogs = data.gameLogs.edges.map((edge: unknown) => edge as { node: IGameLog });

    // Sort by total activity (comments + reactions)
    return gameLogs
      .map((edge: { node: IGameLog }) => edge.node)
      .sort((a: IGameLog, b: IGameLog) => {
        const activityA = (a.totalCommentCount || 0) + (a.totalReactionCount || 0);
        const activityB = (b.totalCommentCount || 0) + (b.totalReactionCount || 0);
        return activityB - activityA; // Descending order
      });
  }, [data?.gameLogs?.edges]);

  return {
    topGameLogs,
    loading,
    error: error?.message || null,
    refetch,
  };
}
