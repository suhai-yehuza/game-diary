'use client';

import { useQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';

import {
  GET_COMMENT_REPLIES_WITH_COUNTS,
  GET_COMMENT_REPLIES_DETAILED,
} from '@/lib/graphql/queries';
import type {
  IUseOptimizedCommentRepliesOptions,
  IUseOptimizedCommentRepliesReturn,
} from '@/types';

export function useOptimizedCommentReplies(
  commentId: string,
  options: IUseOptimizedCommentRepliesOptions = {}
): IUseOptimizedCommentRepliesReturn {
  const { limit = 5, skip = false, useDetailed = false } = options;

  // Determine which query to use based on optimization level
  const query = useDetailed ? GET_COMMENT_REPLIES_DETAILED : GET_COMMENT_REPLIES_WITH_COUNTS;

  const { data, loading, error, refetch, fetchMore } = useQuery(query, {
    variables: {
      commentId,
      pagination: { first: limit, after: null },
    },
    skip: skip || !commentId,
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });

  // Transform data
  const transformedData = useMemo(() => {
    if (!data) {
      return {
        replies: [],
        totalChildCommentCount: 0,
        totalReactionCount: 0,
        hasNextPage: false,
        endCursor: null,
        replyCounts: new Map(),
      };
    }

    const replies = data.comments?.edges?.map((edge: { node: unknown }) => edge.node) || [];

    // Since we don't have access to the parent comment data in this query,
    // we'll calculate the counts from the replies data
    const totalChildCommentCount = data.comments?.totalCount || 0;
    const totalReactionCount = replies.reduce(
      (sum: number, reply: { totalReactionCount?: number }) =>
        sum + (reply.totalReactionCount || 0),
      0
    );

    // Create reply counts map from individual replies
    const replyCounts = new Map<
      string,
      { totalChildCommentCount: number; totalReactionCount: number }
    >();
    replies.forEach(
      (reply: { id: string; totalChildCommentCount?: number; totalReactionCount?: number }) => {
        replyCounts.set(reply.id, {
          totalChildCommentCount: reply.totalChildCommentCount || 0,
          totalReactionCount: reply.totalReactionCount || 0,
        });
      }
    );

    return {
      replies,
      totalChildCommentCount,
      totalReactionCount,
      hasNextPage: data.comments?.pageInfo?.hasNextPage || false,
      endCursor: data.comments?.pageInfo?.endCursor || null,
      replyCounts,
    };
  }, [data]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (!transformedData.hasNextPage) {
      return;
    }

    try {
      await fetchMore({
        variables: {
          commentId,
          pagination: {
            first: limit,
            after: transformedData.endCursor,
          },
        },
      });
    } catch (err) {
      console.error('Error loading more replies:', err);
    }
  }, [fetchMore, commentId, limit, transformedData.hasNextPage, transformedData.endCursor]);

  return {
    replies: transformedData.replies,
    totalChildCommentCount: transformedData.totalChildCommentCount,
    totalReactionCount: transformedData.totalReactionCount,
    loading,
    error,
    hasNextPage: transformedData.hasNextPage,
    endCursor: transformedData.endCursor,
    refetch,
    loadMore,
    replyCounts: transformedData.replyCounts,
  };
}
