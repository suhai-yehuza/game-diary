'use client';

import { useQuery } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { useMemo, useCallback } from 'react';

import { API_CONFIG } from '@/lib/config/app.config';
import {
  GET_COMMENT,
  GET_COMMENT_WITH_COUNTS,
  GET_PUBLIC_COMMENT,
  GET_PUBLIC_COMMENT_WITH_COUNTS,
} from '@/lib/graphql/queries';
import { errorHandlers } from '@/lib/utils/error-handler';
import type {
  IReaction,
  IPublicReaction,
  IUseCommentOptions,
  IUseCommentReturn,
  IUsePublicCommentReturn,
  IReactionGroup,
  IPublicReactionGroup,
} from '@/types';

const defaultLimit = API_CONFIG.pagination.DEFAULT_PAGE_SIZE;
// Comment Hook (protected comments)
export function useComment(commentId: string, options: IUseCommentOptions = {}): IUseCommentReturn {
  const { limit = defaultLimit, skip = false, useDetailed = false } = options;
  const { user } = useUser();

  const query = useDetailed ? GET_COMMENT : GET_COMMENT_WITH_COUNTS;

  const { data, loading, error, refetch, fetchMore } = useQuery(query, {
    variables: {
      commentId,
      repliesPagination: { first: limit, after: null },
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
        reactions: [],
        reactionGroups: [],
        totalReplyCount: 0,
        totalReactionCount: 0,
        hasNextPage: false,
        endCursor: null,
        replyCounts: new Map(),
      };
    }

    const replies = data.comments?.edges?.map((edge: { node: unknown }) => edge.node) || [];
    const reactions = data.reactions || [];

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

    // Group reactions by emoji
    const reactionGroups: IReactionGroup[] = [];
    const emojiMap = new Map<string, IReaction[]>();

    reactions.forEach((reaction: IReaction) => {
      const emoji = reaction.emoji;
      if (!emojiMap.has(emoji)) {
        emojiMap.set(emoji, []);
      }
      emojiMap.get(emoji)?.push(reaction);
    });

    emojiMap.forEach((reactionList, emoji) => {
      reactionGroups.push({
        emoji,
        count: reactionList.length,
        reactions: reactionList,
        users: reactionList.map(r => ({
          id: r.user?.id || '',
          username: r.user?.username || '',
          imageUrl: r.user?.image_url || null,
        })),
        hasUserReacted: reactionList.some(r => r.user?.id === user?.id),
      });
    });

    return {
      replies,
      reactions,
      reactionGroups: reactionGroups.sort((a, b) => b.count - a.count),
      totalReplyCount: data.comments?.totalCount || 0,
      totalReactionCount: reactions.length,
      hasNextPage: data.comments?.pageInfo?.hasNextPage || false,
      endCursor: data.comments?.pageInfo?.endCursor || null,
      replyCounts,
    };
  }, [data, user?.id]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (!transformedData.hasNextPage) {
      return;
    }

    try {
      await fetchMore({
        variables: {
          commentId,
          repliesPagination: {
            first: limit,
            after: transformedData.endCursor,
          },
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          const newReplies = fetchMoreResult.comments?.edges || [];
          const existingReplies = prev.comments?.edges || [];

          return {
            ...prev,
            comments: {
              ...prev.comments,
              edges: [...existingReplies, ...newReplies],
              pageInfo: fetchMoreResult.comments?.pageInfo || prev.comments?.pageInfo,
              totalCount: fetchMoreResult.comments?.totalCount || prev.comments?.totalCount,
            },
          };
        },
      });
    } catch (err) {
      errorHandlers.api(err instanceof Error ? err : new Error(String(err)), {
        component: 'useComment',
        action: 'loadMore',
        metadata: { commentId, limit },
      });
    }
  }, [fetchMore, commentId, limit, transformedData.hasNextPage, transformedData.endCursor]);

  return {
    replies: transformedData.replies,
    reactions: transformedData.reactions,
    reactionGroups: transformedData.reactionGroups,
    totalReplyCount: transformedData.totalReplyCount,
    totalReactionCount: transformedData.totalReactionCount,
    hasNextPage: transformedData.hasNextPage,
    endCursor: transformedData.endCursor,
    loading,
    error,
    refetch,
    loadMore,
    replyCounts: transformedData.replyCounts,
  };
}

// Public Comment Hook (public comments)
export function usePublicComment(
  commentId: string,
  options: IUseCommentOptions = {}
): IUsePublicCommentReturn {
  const { limit = defaultLimit, skip = false, useDetailed = false } = options;
  const { user } = useUser();

  const query = useDetailed ? GET_PUBLIC_COMMENT : GET_PUBLIC_COMMENT_WITH_COUNTS;

  const { data, loading, error, refetch, fetchMore } = useQuery(query, {
    variables: {
      commentId,
      repliesPagination: { first: limit, after: null },
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
        reactions: [],
        reactionGroups: [],
        totalReplyCount: 0,
        totalReactionCount: 0,
        hasNextPage: false,
        endCursor: null,
        replyCounts: new Map(),
      };
    }

    const replies = data.publicComments?.edges?.map((edge: { node: unknown }) => edge.node) || [];
    const reactions = data.publicReactions || [];

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

    // Group reactions by emoji
    const reactionGroups: IPublicReactionGroup[] = [];
    const emojiMap = new Map<string, IPublicReaction[]>();

    reactions.forEach((reaction: IPublicReaction) => {
      const emoji = reaction.emoji;
      if (!emojiMap.has(emoji)) {
        emojiMap.set(emoji, []);
      }
      emojiMap.get(emoji)?.push(reaction);
    });

    emojiMap.forEach((reactionList, emoji) => {
      reactionGroups.push({
        emoji,
        count: reactionList.length,
        reactions: reactionList,
        users: reactionList.map(r => ({
          id: r.user?.id || '',
          username: r.user?.username || '',
          imageUrl: r.user?.image_url || null,
        })),
        hasUserReacted: reactionList.some(r => r.user?.id === user?.id),
      });
    });

    return {
      replies,
      reactions,
      reactionGroups: reactionGroups.sort((a, b) => b.count - a.count),
      totalReplyCount: data.publicComments?.totalCount || 0,
      totalReactionCount: reactions.length,
      hasNextPage: data.publicComments?.pageInfo?.hasNextPage || false,
      endCursor: data.publicComments?.pageInfo?.endCursor || null,
      replyCounts,
    };
  }, [data, user?.id]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (!transformedData.hasNextPage) {
      return;
    }

    try {
      await fetchMore({
        variables: {
          commentId,
          repliesPagination: {
            first: limit,
            after: transformedData.endCursor,
          },
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          const newReplies = fetchMoreResult.publicComments?.edges || [];
          const existingReplies = prev.publicComments?.edges || [];

          return {
            ...prev,
            publicComments: {
              ...prev.publicComments,
              edges: [...existingReplies, ...newReplies],
              pageInfo: fetchMoreResult.publicComments?.pageInfo || prev.publicComments?.pageInfo,
              totalCount:
                fetchMoreResult.publicComments?.totalCount || prev.publicComments?.totalCount,
            },
          };
        },
      });
    } catch (err) {
      errorHandlers.api(err instanceof Error ? err : new Error(String(err)), {
        component: 'usePublicComment',
        action: 'loadMore',
        metadata: { commentId, limit },
      });
    }
  }, [fetchMore, commentId, limit, transformedData.hasNextPage, transformedData.endCursor]);

  return {
    replies: transformedData.replies,
    reactions: transformedData.reactions,
    reactionGroups: transformedData.reactionGroups,
    totalReplyCount: transformedData.totalReplyCount,
    totalReactionCount: transformedData.totalReactionCount,
    hasNextPage: transformedData.hasNextPage,
    endCursor: transformedData.endCursor,
    loading,
    error,
    refetch,
    loadMore,
    replyCounts: transformedData.replyCounts,
  };
}
