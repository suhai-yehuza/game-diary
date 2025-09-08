import { useUser } from '@clerk/nextjs';
import { useMemo } from 'react';

import { useOptimizedQuery } from '@/hooks/use-optimized-query';
import { GET_GAME_LOGS } from '@/lib/graphql/queries';
import { ErrorCategory, ErrorSeverity } from '@/types';
import type { IGameLog, GetGameLogsQuery, GameLogFragmentFragment } from '@/types';

// Adapter function to convert GraphQL game log to IGameLog
function adaptGraphQLGameLog(graphqlGameLog: GameLogFragmentFragment): IGameLog {
  return {
    id: graphqlGameLog.id,
    game_id: graphqlGameLog.game_id,
    rating_for_game: graphqlGameLog.rating_for_game,
    notes: graphqlGameLog.notes || '',
    created_at: graphqlGameLog.created_at,
    updated_at: graphqlGameLog.updated_at,
    user_id: graphqlGameLog.user?.id || '',
    classification: 'PUBLIC' as const, // Default value since GraphQL doesn't include this
    comments: {
      __typename: 'CommentConnection',
      edges: [],
      pageInfo: {
        __typename: 'PageInfo',
        hasNextPage: false,
        hasPreviousPage: false,
        endCursor: null,
        startCursor: null,
      },
      totalCount: 0,
    }, // Default value since GraphQL doesn't include this
    reactions: [], // Default value since GraphQL doesn't include this
    totalCommentCount: 0, // Default value since GraphQL doesn't include this
    totalReactionCount: 0, // Default value since GraphQL doesn't include this
    user: {
      id: graphqlGameLog.user?.id || '',
      username: graphqlGameLog.user?.username || '',
      first_name: graphqlGameLog.user?.first_name || '',
      last_name: graphqlGameLog.user?.last_name || '',
      image_url: graphqlGameLog.user?.image_url || undefined,
      isAdmin: false,
    },
    game: {
      id: graphqlGameLog.game.id,
      date: graphqlGameLog.game.date,
      status: graphqlGameLog.game.status,
      game_type: 'regular', // Default value since GraphQL doesn't include this
      teams: graphqlGameLog.game.teams,
      scores: graphqlGameLog.game.scores,
      home_team: {
        id: graphqlGameLog.game.teams?.home?.id || '',
        name: graphqlGameLog.game.teams?.home?.name || '',
        nickname: graphqlGameLog.game.teams?.home?.nickname || '',
        logo: graphqlGameLog.game.teams?.home?.logo || '',
        city: '', // Default value since GraphQL doesn't include this
        conference: '', // Default value since GraphQL doesn't include this
        all_star: false, // Default value since GraphQL doesn't include this
        nba_franchise: true, // Default value since GraphQL doesn't include this
        created_at: '', // Default value since GraphQL doesn't include this
        updated_at: '', // Default value since GraphQL doesn't include this
      },
      away_team: {
        id: graphqlGameLog.game.teams?.visitors?.id || '',
        name: graphqlGameLog.game.teams?.visitors?.name || '',
        nickname: graphqlGameLog.game.teams?.visitors?.nickname || '',
        logo: graphqlGameLog.game.teams?.visitors?.logo || '',
        city: '', // Default value since GraphQL doesn't include this
        conference: '', // Default value since GraphQL doesn't include this
        all_star: false, // Default value since GraphQL doesn't include this
        nba_franchise: true, // Default value since GraphQL doesn't include this
        created_at: '', // Default value since GraphQL doesn't include this
        updated_at: '', // Default value since GraphQL doesn't include this
      },
      created_at: '', // Default value since GraphQL doesn't include this
      updated_at: '', // Default value since GraphQL doesn't include this
      publicComments: {
        edges: [],
        pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: null },
        totalCount: 0,
      },
      publicReactions: [],
      totalPublicCommentCount: 0,
      totalPublicReactionCount: 0,
    },
  };
}

export function useTopGameLogs(options?: { limit?: number }) {
  const { isSignedIn, user } = useUser();
  const limit = options?.limit || 5;

  // Skip query if user is not authenticated
  const shouldSkip = !isSignedIn || !user?.id;

  const { data, loading, error } = useOptimizedQuery<GetGameLogsQuery>(GET_GAME_LOGS, {
    variables: {
      filters: {},
      pagination: { first: Math.max(limit, 10) }, // Use GraphQL pagination directly
    },
    skip: shouldSkip, // Skip if user is not authenticated
    context: {
      component: 'useTopGameLogs',
      action: 'Load top game logs',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    },
  });

  const topGameLogs = useMemo(() => {
    if (!data?.gameLogs?.edges) return [];

    return data.gameLogs.edges
      .map(edge => adaptGraphQLGameLog(edge.node))
      .filter((log: IGameLog): log is IGameLog => log !== null)
      .sort((a: IGameLog, b: IGameLog) => (b.rating_for_game || 0) - (a.rating_for_game || 0))
      .slice(0, limit);
  }, [data?.gameLogs?.edges, limit]);

  return {
    topGameLogs,
    loading,
    error: error ? new Error(error.message) : null,
  };
}
