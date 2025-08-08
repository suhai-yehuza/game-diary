import { useMutation, useQuery } from '@apollo/client';
import { useCallback, useState } from 'react';

import { API_CONFIG } from '@/lib/config/app.config';
import { CREATE_COMMENT, UPDATE_COMMENT, DELETE_COMMENT } from '@/lib/graphql/mutations';
import { GET_COMMENTS } from '@/lib/graphql/queries';
import type { IComment, ICommentsOptions, ICommentsResponse } from '@/lib/types';
import { ParentType } from '@/lib/types/generated/graphql';

export function useComments(options: ICommentsOptions = {}) {
  const { filters = {}, pagination = {} } = options;
  const [comments, setComments] = useState<IComment[]>([]);
  const [commentsEndCursor, setCommentsEndCursor] = useState<string | null>(null);
  const [commentsHasNextPage, setCommentsHasNextPage] = useState(true);
  const [commentsTotalCount, setCommentsTotalCount] = useState<number>(0);

  const { loading, error, refetch, fetchMore } = useQuery<ICommentsResponse>(GET_COMMENTS, {
    variables: {
      filters,
      pagination,
    },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    // Add a small delay to prevent overwhelming the server
    notifyOnNetworkStatusChange: true,
    onCompleted: data => {
      if (
        data &&
        typeof data === 'object' &&
        'comments' in data &&
        data.comments &&
        Array.isArray(data.comments.edges)
      ) {
        setComments(data.comments.edges.map(edge => edge.node));
        setCommentsTotalCount(data.comments.totalCount);
        setCommentsEndCursor(data.comments.pageInfo.endCursor ?? null);
        setCommentsHasNextPage(!!data.comments.pageInfo.hasNextPage);
      }
    },
    onError: error => {
      console.error('Comments query error:', error);
      // Handle rate limiting errors gracefully
      if (error.graphQLErrors?.some(e => e.extensions?.code === 'FORBIDDEN')) {
        console.warn('Authentication error in comments query, user may not be authenticated');
      }
    },
  });

  const loadMoreComments = useCallback(async () => {
    if (!commentsHasNextPage || loading) return;
    const fetchResult = await fetchMore({
      variables: {
        filters,
        pagination: {
          first: API_CONFIG.pagination.DEFAULT_COMMENT_PAGE_SIZE,
          after: commentsEndCursor,
        },
      },
    });
    const moreData = fetchResult?.data;
    if (
      moreData &&
      typeof moreData === 'object' &&
      'comments' in moreData &&
      moreData.comments &&
      Array.isArray(moreData.comments.edges)
    ) {
      setComments(prev => {
        const existingIds = new Set(prev.map(comment => comment.id));
        const newComments = moreData.comments.edges
          .map(edge => edge.node)
          .filter(comment => !existingIds.has(comment.id));
        return [...prev, ...newComments];
      });
      setCommentsTotalCount(prev => prev + moreData.comments.edges.length);
      setCommentsEndCursor(moreData.comments.pageInfo.endCursor ?? null);
      setCommentsHasNextPage(!!moreData.comments.pageInfo.hasNextPage);
    }
  }, [fetchMore, filters, commentsEndCursor, commentsHasNextPage, loading]);

  const wrappedRefetch = useCallback(
    async (...args: Parameters<typeof refetch>) => {
      const result = await refetch(...args);
      const newData = result?.data;
      if (
        newData &&
        typeof newData === 'object' &&
        'comments' in newData &&
        newData.comments &&
        Array.isArray(newData.comments.edges)
      ) {
        setComments(newData.comments.edges.map(edge => edge.node));
        setCommentsTotalCount(newData.comments.totalCount);
        setCommentsEndCursor(newData.comments.pageInfo.endCursor ?? null);
        setCommentsHasNextPage(!!newData.comments.pageInfo.hasNextPage);
      }
      return result;
    },
    [refetch]
  );

  return {
    comments,
    commentsEndCursor,
    commentsHasNextPage,
    commentsTotalCount,
    loadMoreComments,
    loading,
    error: error ? new Error(error.message) : null,
    refetch: wrappedRefetch,
  };
}

export function useGameLogComments(gameLogId: string, initialLimit = 3) {
  return useComments({
    filters: { parentId: gameLogId, parentType: ParentType.GameLog },
    pagination: { first: initialLimit },
  });
}

export function useCommentReplies(commentId: string, initialLimit = 2) {
  return useComments({
    filters: { parentId: commentId, parentType: ParentType.Comment },
    pagination: { first: initialLimit },
  });
}

// Mutation hooks
export function useCreateComment() {
  const [createComment, { loading, error }] = useMutation(CREATE_COMMENT);

  const createCommentMutation = useCallback(
    async (input: { content: string; parentId: string; parentType: string }) => {
      try {
        const result = await createComment({
          variables: { input },
        });
        return result.data?.createComment;
      } catch (err) {
        console.error('Error creating comment:', err);
        throw err;
      }
    },
    [createComment]
  );

  return {
    createComment: createCommentMutation,
    loading,
    error: error ? new Error(error.message) : null,
  };
}

export function useUpdateComment() {
  const [updateComment, { loading, error }] = useMutation(UPDATE_COMMENT);

  const updateCommentMutation = useCallback(
    async (id: string, input: { content: string }) => {
      try {
        const result = await updateComment({
          variables: { id, input },
        });
        return result.data?.updateComment;
      } catch (err) {
        console.error('Error updating comment:', err);
        throw err;
      }
    },
    [updateComment]
  );

  return {
    updateComment: updateCommentMutation,
    loading,
    error: error ? new Error(error.message) : null,
  };
}

export function useDeleteComment() {
  const [deleteComment, { loading, error }] = useMutation(DELETE_COMMENT);

  const deleteCommentMutation = useCallback(
    async (id: string) => {
      try {
        const result = await deleteComment({
          variables: { id },
        });
        return result.data?.deleteComment;
      } catch (err) {
        console.error('Error deleting comment:', err);
        throw err;
      }
    },
    [deleteComment]
  );

  return {
    deleteComment: deleteCommentMutation,
    loading,
    error: error ? new Error(error.message) : null,
  };
}
