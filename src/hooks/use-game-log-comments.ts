'use client';

import { useQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';

import {
  GET_GAME_LOG_COMMENTS_COUNTS,
  GET_GAME_LOG_COMMENTS_WITH_COUNTS,
  GET_GAME_LOG_COMMENTS_DETAILED,
} from '@/lib/graphql/queries';
import type { IUseGameLogCommentsOptions, IUseGameLogCommentsReturn } from '@/types';

export function useGameLogComments(
  gameLogId: string,
  options: IUseGameLogCommentsOptions = {}
): IUseGameLogCommentsReturn {
  const { limit = 10, skip = false, useCountsOnly = false, useDetailed = false } = options;

  // Determine which query to use based on optimization level
  const query = useCountsOnly
    ? GET_GAME_LOG_COMMENTS_COUNTS
    : useDetailed
      ? GET_GAME_LOG_COMMENTS_DETAILED
      : GET_GAME_LOG_COMMENTS_WITH_COUNTS;

  const { data, loading, error, refetch, fetchMore } = useQuery(query, {
    variables: {
      gameLogId,
      ...(useCountsOnly ? {} : { pagination: { first: limit, after: null } }),
    },
    skip: skip || !gameLogId,
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });

  // Transform data based on query type
  const transformedData = useMemo(() => {
    if (!data) {
      return {
        comments: [],
        totalCommentCount: 0,
        totalReactionCount: 0,
        hasNextPage: false,
        endCursor: null,
        commentCounts: new Map(),
      };
    }

    if (useCountsOnly) {
      return {
        comments: [],
        totalCommentCount: data.gameLog?.totalCommentCount || 0,
        totalReactionCount: data.gameLog?.totalReactionCount || 0,
        hasNextPage: false,
        endCursor: null,
        commentCounts: new Map(),
      };
    }

    const comments = data.comments?.edges?.map((edge: { node: unknown }) => edge.node) || [];
    const gameLog = data.gameLog;

    // Create comment counts map from individual comments
    const commentCounts = new Map<
      string,
      { totalChildCommentCount: number; totalReactionCount: number }
    >();
    comments.forEach(
      (comment: { id: string; totalChildCommentCount?: number; totalReactionCount?: number }) => {
        commentCounts.set(comment.id, {
          totalChildCommentCount: comment.totalChildCommentCount || 0,
          totalReactionCount: comment.totalReactionCount || 0,
        });
      }
    );

    return {
      comments,
      totalCommentCount: gameLog?.totalCommentCount || 0,
      totalReactionCount: gameLog?.totalReactionCount || 0,
      hasNextPage: data.comments?.pageInfo?.hasNextPage || false,
      endCursor: data.comments?.pageInfo?.endCursor || null,
      commentCounts,
    };
  }, [data, useCountsOnly]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (useCountsOnly || !transformedData.hasNextPage) {
      return;
    }

    try {
      await fetchMore({
        variables: {
          gameLogId,
          pagination: {
            first: limit,
            after: transformedData.endCursor,
          },
        },
      });
    } catch (err) {
      console.error('Error loading more comments:', err);
    }
  }, [
    fetchMore,
    gameLogId,
    limit,
    transformedData.hasNextPage,
    transformedData.endCursor,
    useCountsOnly,
  ]);

  return {
    comments: transformedData.comments,
    totalCommentCount: transformedData.totalCommentCount,
    totalReactionCount: transformedData.totalReactionCount,
    loading,
    error,
    hasNextPage: transformedData.hasNextPage,
    endCursor: transformedData.endCursor,
    refetch,
    loadMore,
    commentCounts: transformedData.commentCounts,
  };
}
