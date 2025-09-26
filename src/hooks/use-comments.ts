import { useCallback, useEffect, useState, useMemo } from 'react';

import { useOptimizedMutation } from '@/hooks/use-optimized-mutation';
import { useOptimizedQuery } from '@/hooks/use-optimized-query';
import { CommentCacheUtils, CACHE_CONFIG } from '@/lib/cache';
import { CREATE_COMMENT, DELETE_COMMENT, UPDATE_COMMENT } from '@/lib/graphql/mutations';
import { GET_COMMENTS } from '@/lib/graphql/queries';
import { errorHandlers } from '@/lib/utils/error-handler';
import {
  ErrorCategory,
  ErrorSeverity,
  ParentType,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from '@/types';
import type {
  IComment,
  GetCommentsQuery,
  ICreateCommentResponse,
  IUpdateCommentResponse,
  IDeleteCommentResponse,
  CommentEdge,
} from '@/types';

// Adapter functions to convert GraphQL types to IComment interface
function adaptGraphQLComment(graphqlComment: Record<string, unknown>): IComment {
  return {
    id: graphqlComment.id as string,
    content: graphqlComment.content as string,
    user_id: graphqlComment.user_id as string,
    parent_id: graphqlComment.parent_id as string,
    parent_type: graphqlComment.parent_type as ParentType,
    depth: graphqlComment.depth as number,
    created_at: graphqlComment.created_at as string,
    updated_at: (graphqlComment.updated_at || graphqlComment.created_at) as string,
    user: {
      id: (graphqlComment.user as { id: string }).id,
      username: (graphqlComment.user as { username: string }).username,
      first_name: (graphqlComment.user as { first_name: string }).first_name,
      last_name: (graphqlComment.user as { last_name: string }).last_name,
      image_url: (graphqlComment.user as { image_url: string }).image_url,
      isAdmin: false, // Default value, should be fetched from user data
    },
    reactions: [], // GraphQL types don't include reactions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    childComments: graphqlComment.childComments as any,
    totalChildCommentCount: (graphqlComment.totalChildCommentCount as number) || 0,
    totalReactionCount: (graphqlComment.totalReactionCount as number) || 0,
  };
}

export function useComments(
  parentId: string,
  parentType: string,
  initialFilters: Record<string, unknown> = {},
  initialPagination: Record<string, unknown> = { first: 10 }
) {
  const [comments, setComments] = useState<IComment[]>([]);
  const [commentsEndCursor, setCommentsEndCursor] = useState<string | null>(null);
  const [commentsHasNextPage, setCommentsHasNextPage] = useState<boolean>(false);
  const [commentsTotalCount, setCommentsTotalCount] = useState<number>(0);

  // Cache state
  const [cachedComments, setCachedComments] = useState<IComment[] | null>(null);
  const [isCacheHit, setIsCacheHit] = useState(false);

  // Try to get comments from cache first
  useEffect(() => {
    const loadFromCache = async () => {
      if (!parentId || !parentType) return;

      try {
        const cached = await CommentCacheUtils.getCachedCommentList(parentId, parentType);

        if (cached) {
          setCachedComments(cached as unknown as IComment[]);
          setIsCacheHit(true);
        }
      } catch (error) {
        console.warn('Failed to load comments from cache:', error);
      }
    };

    void loadFromCache();
  }, [parentId, parentType]);

  const filters = useMemo(
    () => ({ ...initialFilters, parentId, parentType }),
    [initialFilters, parentId, parentType]
  );
  const pagination = useMemo(() => ({ ...initialPagination }), [initialPagination]);

  const { loading, error, refetch, fetchMore } = useOptimizedQuery<GetCommentsQuery>(GET_COMMENTS, {
    variables: {
      filters,
      pagination,
    },
    skip: !parentId || isCacheHit, // Skip if we have cached data
    context: {
      component: 'useComments',
      action: 'Load comments',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    },
    onCompleted: data => {
      if (data?.comments) {
        const newComments = data.comments.edges.map((edge: CommentEdge) =>
          adaptGraphQLComment(edge.node as Record<string, unknown>)
        );
        setComments(newComments);
        setCommentsEndCursor(data.comments.pageInfo.endCursor ?? null);
        setCommentsHasNextPage(!!data.comments.pageInfo.hasNextPage);
        setCommentsTotalCount(data.comments.totalCount);

        // Cache the comments
        if (!isCacheHit) {
          void CommentCacheUtils.cacheCommentList(parentId, parentType, newComments, {
            ttl: CACHE_CONFIG.TTL.COMMENT_LIST,
            tags: [`parent:${parentType}:${parentId}`],
          });
        }
      }
    },
    onError: (error: unknown) => {
      console.error('useComments - GraphQL error:', error);
      console.error('useComments - parentId:', parentId);
      console.error('useComments - parentType:', parentType);

      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useComments',
        action: 'Load comments',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      });
    },
  });

  const loadMoreComments = useCallback(async () => {
    if (!commentsHasNextPage || !commentsEndCursor) return;

    try {
      const result = await fetchMore({
        variables: {
          pagination: {
            ...pagination,
            after: commentsEndCursor,
          },
        },
      });

      const typedResult = result as { data?: GetCommentsQuery };
      if (typedResult.data?.comments) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newComments = typedResult.data.comments.edges.map((edge: any) =>
          adaptGraphQLComment(edge.node as Record<string, unknown>)
        );
        setComments(prev => [...prev, ...newComments]);
        setCommentsEndCursor(typedResult.data.comments.pageInfo.endCursor ?? null);
        setCommentsHasNextPage(!!typedResult.data.comments.pageInfo.hasNextPage);

        // Cache the updated comment list
        void CommentCacheUtils.cacheCommentList(
          parentId,
          parentType,
          [...comments, ...newComments],
          {
            ttl: CACHE_CONFIG.TTL.COMMENT_LIST,
            tags: [`parent:${parentType}:${parentId}`],
          }
        );
      }
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useComments',
        action: 'Load more comments',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      });
    }
  }, [
    commentsHasNextPage,
    commentsEndCursor,
    pagination,
    fetchMore,
    comments,
    parentId,
    parentType,
  ]);

  const [createCommentMutation, createCommentResult] = useOptimizedMutation(CREATE_COMMENT, {
    context: {
      component: 'useComments',
      action: 'Create comment',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    },
    onCompleted: (data: ICreateCommentResponse) => {
      if (data?.createComment?.comment) {
        // Add new comment to the beginning of the list
        const newComment = adaptGraphQLComment(data.createComment.comment);
        setComments(prev => [newComment, ...prev]);
        setCommentsTotalCount(prev => prev + 1);

        // Cache the updated comment list
        void CommentCacheUtils.cacheCommentList(parentId, parentType, [newComment, ...comments], {
          ttl: CACHE_CONFIG.TTL.COMMENT_LIST,
          tags: [`parent:${parentType}:${parentId}`],
        });

        // Cache the individual comment
        void CommentCacheUtils.cacheComment(newComment.id, newComment, {
          ttl: CACHE_CONFIG.TTL.COMMENT,
          tags: [`comment:${newComment.id}`, `parent:${parentType}:${parentId}`],
        });
      }
    },
    onError: (error: unknown) => {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useComments',
        action: 'Create comment',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      });
    },
  });

  const createComment = createCommentMutation;
  const { loading: createLoading, error: createError } = createCommentResult;

  const [updateCommentMutation, updateCommentResult] = useOptimizedMutation(UPDATE_COMMENT, {
    context: {
      component: 'useComments',
      action: 'Update comment',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    },
    onCompleted: (data: IUpdateCommentResponse) => {
      if (data?.updateComment?.comment) {
        // Update the comment in the list
        const updatedComment = adaptGraphQLComment(data.updateComment.comment);
        setComments(prev =>
          prev.map(comment => (comment.id === updatedComment.id ? updatedComment : comment))
        );

        // Cache the updated comment
        void CommentCacheUtils.cacheComment(updatedComment.id, updatedComment, {
          ttl: CACHE_CONFIG.TTL.COMMENT,
          tags: [`comment:${updatedComment.id}`, `parent:${parentType}:${parentId}`],
        });

        // Invalidate comment list cache to ensure consistency
        void CommentCacheUtils.invalidateCommentCaches(undefined, parentId, parentType);
      }
    },
    onError: (error: unknown) => {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useComments',
        action: 'Update comment',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      });
    },
  });

  const updateComment = updateCommentMutation;
  const { loading: updateLoading, error: updateError } = updateCommentResult;

  const [deleteCommentMutation, deleteCommentResult] = useOptimizedMutation(DELETE_COMMENT, {
    context: {
      component: 'useComments',
      action: 'Delete comment',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    },
    onCompleted: (data: IDeleteCommentResponse) => {
      if (data?.deleteComment?.success) {
        // Since the GraphQL response doesn't include the comment ID,
        // we need to handle this differently. The comment will be removed
        // from the UI when the cache is invalidated and refetched.
        // For now, just invalidate all comment caches for this parent.
        void CommentCacheUtils.invalidateCommentCaches(undefined, parentId, parentType);

        // Refetch comments to get the updated list
        void refetch();
      }
    },
    onError: (error: unknown) => {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'useComments',
        action: 'Delete comment',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      });
    },
  });

  const deleteComment = deleteCommentMutation;
  const { loading: deleteLoading, error: deleteError } = deleteCommentResult;

  const handleCreateComment = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      try {
        await createComment({
          variables: {
            input: {
              content: content.trim(),
              parentId,
              parentType,
            },
          },
        });
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'useComments',
          action: 'Create comment',
          category: ErrorCategory.API,
          severity: ErrorSeverity.MEDIUM,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [createComment, parentId, parentType]
  );

  const handleUpdateComment = useCallback(
    async (commentId: string, content: string) => {
      if (!content.trim()) return;

      try {
        await updateComment({
          variables: {
            id: commentId,
            input: { content: content.trim() },
          },
        });
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'useComments',
          action: 'Update comment',
          category: ErrorCategory.API,
          severity: ErrorSeverity.MEDIUM,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [updateComment]
  );

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      try {
        await deleteComment({
          variables: { id: commentId },
        });
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'useComments',
          action: 'Delete comment',
          category: ErrorCategory.API,
          severity: ErrorSeverity.MEDIUM,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [deleteComment]
  );

  // Force refresh from server (bypassing cache)
  const forceRefresh = useCallback(async () => {
    setIsCacheHit(false);
    setCachedComments(null);
    await refetch();
  }, [refetch]);

  // Clear cache for this parent
  const clearCache = useCallback(async () => {
    await CommentCacheUtils.invalidateCommentCaches(undefined, parentId, parentType);
    setCachedComments(null);
    setIsCacheHit(false);
  }, [parentId, parentType]);

  return {
    // Data
    comments: cachedComments || comments,
    cachedComments,
    isCacheHit,

    // Pagination
    commentsEndCursor,
    commentsHasNextPage,
    commentsTotalCount,

    // State
    loading: loading || createLoading || updateLoading || deleteLoading,
    error: error || createError || updateError || deleteError,

    // Performance
    queryTime: 0, // Removed
    isSlowQuery: false, // Removed

    // Actions
    createComment: handleCreateComment,
    updateComment: handleUpdateComment,
    deleteComment: handleDeleteComment,
    loadMoreComments,
    forceRefresh,
    clearCache,
    refetch,

    // Utilities
    hasMoreComments: commentsHasNextPage,
    canLoadMore: commentsHasNextPage && !!commentsEndCursor,
  };
}

export function useGameLogComments(gameLogId: string, initialLimit = 3) {
  console.log('useGameLogComments - gameLogId:', gameLogId);
  console.log('useGameLogComments - initialLimit:', initialLimit);

  // Always call useComments, but pass empty string if gameLogId is not available
  const result = useComments(gameLogId || '', ParentType.GameLog, {}, { first: initialLimit });

  // Return early if no gameLogId
  if (!gameLogId) {
    console.error('useGameLogComments - gameLogId is empty or undefined');
    return {
      comments: [],
      loading: false,
      error: new Error('GameLog ID is required'),
      commentsHasNextPage: false,
      loadMoreComments: () => {
        /* No-op */
      },
      refetch: () => {
        /* No-op */
      },
      commentsTotalCount: 0,
    };
  }

  return result;
}

export function useCommentReplies(commentId: string, initialLimit = 2) {
  return useComments(commentId, ParentType.Comment, {}, { first: initialLimit });
}

// mutation hooks
export function useCreateComment() {
  const [createCommentMutation, { loading, error }] = useCreateCommentMutation();

  const createComment = useCallback(
    async (input: { parentId: string; parentType: ParentType; content: string }) => {
      try {
        const result = await createCommentMutation({
          variables: { input },
        });
        return result;
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'useCreateComment',
          action: 'Create comment',
          category: ErrorCategory.API,
          severity: ErrorSeverity.MEDIUM,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }
    },
    [createCommentMutation]
  );

  return {
    createComment,
    loading,
    error,
  };
}

export function useUpdateComment() {
  const [updateCommentMutation, { loading, error }] = useUpdateCommentMutation();

  const updateComment = useCallback(
    async (input: { id: string; content: string }) => {
      try {
        const result = await updateCommentMutation({
          variables: { id: input.id, input: { content: input.content } },
        });
        return result;
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'useUpdateComment',
          action: 'Update comment',
          category: ErrorCategory.API,
          severity: ErrorSeverity.MEDIUM,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }
    },
    [updateCommentMutation]
  );

  return {
    updateComment,
    loading,
    error,
  };
}

export function useDeleteComment() {
  const [deleteCommentMutation, { loading, error }] = useDeleteCommentMutation();

  const deleteComment = useCallback(
    async (id: string) => {
      try {
        const result = await deleteCommentMutation({
          variables: { id },
        });
        return result;
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'useDeleteComment',
          action: 'Delete comment',
          category: ErrorCategory.API,
          severity: ErrorSeverity.MEDIUM,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }
    },
    [deleteCommentMutation]
  );

  return {
    deleteComment,
    loading,
    error,
  };
}
