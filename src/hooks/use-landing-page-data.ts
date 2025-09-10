'use client';

import { useQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';

import {
  GET_LANDING_PAGE_TRENDING_CONTENT,
  GET_LANDING_PAGE_LATEST_GAMES,
  GET_LANDING_PAGE_POPULAR_GAMES,
} from '@/lib/graphql/queries';
import type { ILandingPageData, IUseOptimizedLandingPageDataOptions } from '@/types';

export function useOptimizedLandingPageData(options: IUseOptimizedLandingPageDataOptions = {}) {
  const { limit = 10, skip = false } = options;

  // Fetch trending content (game logs)
  const {
    data: trendingData,
    loading: trendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useQuery(GET_LANDING_PAGE_TRENDING_CONTENT, {
    variables: { limit },
    skip,
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });

  // Fetch latest games
  const {
    data: latestGamesData,
    loading: latestGamesLoading,
    error: latestGamesError,
    refetch: refetchLatestGames,
  } = useQuery(GET_LANDING_PAGE_LATEST_GAMES, {
    variables: { limit: 5 },
    skip,
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });

  // Fetch popular games
  const {
    data: popularGamesData,
    loading: popularGamesLoading,
    error: popularGamesError,
    refetch: refetchPopularGames,
  } = useQuery(GET_LANDING_PAGE_POPULAR_GAMES, {
    variables: { limit: 5 },
    skip,
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });

  // Combine loading states
  const loading = trendingLoading || latestGamesLoading || popularGamesLoading;

  // Combine errors
  const error = trendingError || latestGamesError || popularGamesError;

  // Transform and combine data
  const data = useMemo((): ILandingPageData | null => {
    if (!trendingData && !latestGamesData && !popularGamesData) {
      return null;
    }

    // Transform trending content
    const topGameLogs =
      trendingData?.gameLogs?.edges?.map((edge: { node: unknown }) => edge.node) || [];

    // Find most active game log
    const mostActiveGameLog = topGameLogs.reduce((mostActive: unknown, current: unknown) => {
      const currentActivity =
        ((current as { totalCommentCount?: number; totalReactionCount?: number })
          .totalCommentCount || 0) +
        ((current as { totalCommentCount?: number; totalReactionCount?: number })
          .totalReactionCount || 0);
      const mostActiveActivity =
        ((mostActive as { totalCommentCount?: number; totalReactionCount?: number })
          .totalCommentCount || 0) +
        ((mostActive as { totalCommentCount?: number; totalReactionCount?: number })
          .totalReactionCount || 0);
      return currentActivity > mostActiveActivity ? current : mostActive;
    }, topGameLogs[0] || null);

    // Transform latest games
    const latestGames =
      latestGamesData?.games?.edges?.map((edge: { node: unknown }) => edge.node) || [];
    const latestFinishedGame = latestGames.length > 0 ? latestGames[0] : null;

    // Transform popular games
    const popularGames =
      popularGamesData?.games?.edges?.map((edge: { node: unknown }) => edge.node) || [];

    // Sort popular games by different criteria
    const topRated = [...popularGames]
      .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
      .slice(0, 5);

    const mostRated = [...popularGames]
      .sort((a, b) => (b.total_ratings || 0) - (a.total_ratings || 0))
      .slice(0, 5);

    const mostPopular = [...popularGames]
      .sort(
        (a, b) =>
          (b.totalPublicCommentCount || 0) +
          (b.totalPublicReactionCount || 0) -
          (a.totalPublicCommentCount || 0) -
          (a.totalPublicReactionCount || 0)
      )
      .slice(0, 5);

    return {
      id: 'optimized-landing-page-data',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trendingContent: {
        topGameLogs,
        mostActiveGameLog,
      },
      latestResults: {
        latestGames,
        latestFinishedGame,
      },
      recentGames: latestGames,
      popularGames: {
        topRated,
        mostRated,
        mostPopular,
      },
      timestamp: new Date().toISOString(),
      source: 'optimized-graphql',
    };
  }, [trendingData, latestGamesData, popularGamesData]);

  // Refetch function
  const refetch = useCallback(async () => {
    await Promise.all([refetchTrending(), refetchLatestGames(), refetchPopularGames()]);
  }, [refetchTrending, refetchLatestGames, refetchPopularGames]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
