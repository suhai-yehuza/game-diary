'use client';

import { useUser } from '@clerk/nextjs';
import { useCallback, useMemo, useState } from 'react';

import { useOptimizedMutation } from '@/hooks/use-optimized-mutation';
import { useOptimizedQuery } from '@/hooks/use-optimized-query';
import {
  CREATE_PUBLIC_COMMENT,
  DELETE_PUBLIC_COMMENT,
  UPDATE_PUBLIC_COMMENT,
} from '@/lib/graphql/mutations';
import { GET_PUBLIC_COMMENTS } from '@/lib/graphql/queries';
import { errorHandlers } from '@/lib/utils/error-handler';
import type {
  IPublicComment,
  IReactionOptions,
  GetPublicCommentsQuery,
  CreatePublicCommentMutation,
  UpdatePublicCommentMutation,
  DeletePublicCommentMutation,
} from '@/types';
import { ErrorCategory, ErrorSeverity, ParentType } from '@/types';

// Adapter function to convert GraphQL public comment to IPublicComment
function adaptGraphQLPublicComment(
  graphqlComment: GetPublicCommentsQuery['publicComments']['edges'][0]['node']
): IPublicComment {
  return {
    id: graphqlComment.id,
    content: graphqlComment.content,
    user_id: graphqlComment.user_id,
    anonymous_name: graphqlComment.anonymous_name,
    anonymous_email: graphqlComment.anonymous_email,
    parent_id: graphqlComment.parent_id,
    parent_type: graphqlComment.parent_type,
    depth: graphqlComment.depth,
    is_approved: graphqlComment.is_approved,
    created_at: graphqlComment.created_at,
    updated_at: graphqlComment.updated_at,
    deleted_at: graphqlComment.deleted_at,
    childComments: {
      edges: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: null, startCursor: null },
      totalCount: 0,
    },
    reactions: [],
    totalChildCommentCount: graphqlComment.totalChildCommentCount || 0,
    totalReactionCount: graphqlComment.totalReactionCount || 0,
    user: graphqlComment.user
      ? {
          id: graphqlComment.user.id,
          username: graphqlComment.user.username,
          first_name: graphqlComment.user.first_name,
          last_name: graphqlComment.user.last_name,
          image_url: graphqlComment.user.image_url,
          isAdmin: false, // Default value since query doesn't include isAdmin
        }
      : null,
  };
}

export function usePublicComments(options: IReactionOptions) {
  const { user } = useUser();
  const [optimisticComments, setOptimisticComments] = useState<IPublicComment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastActionTime, setLastActionTime] = useState<number>(0);

  const { data, loading, error, refetch } = useOptimizedQuery<GetPublicCommentsQuery>(
    GET_PUBLIC_COMMENTS,
    {
      variables: {
        targetId: options.targetId,
        targetType: options.targetType,
      },
      skip: Boolean((options.skip ?? false) || !options.targetId || !options.targetType),
      context: {
        component: 'usePublicComments',
        action: 'Load public comments',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
      },
      onError: (error: import('@apollo/client').ApolloError) => {
        errorHandlers.api(error, {
          component: 'usePublicComments',
          action: 'Load public comments',
          category: ErrorCategory.API,
          severity: ErrorSeverity.MEDIUM,
          timestamp: new Date().toISOString(),
        });
      },
    }
  );

  const [createPublicCommentMutation, createPublicCommentResult] = useOptimizedMutation(
    CREATE_PUBLIC_COMMENT,
    {
      context: {
        component: 'usePublicComments',
        action: 'Create public comment',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
      },
    }
  );

  const createPublicComment = createPublicCommentMutation;
  const { loading: createLoading, error: createError } = createPublicCommentResult;

  const [updatePublicCommentMutation, updatePublicCommentResult] = useOptimizedMutation(
    UPDATE_PUBLIC_COMMENT,
    {
      context: {
        component: 'usePublicComments',
        action: 'Update public comment',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
      },
    }
  );

  const updatePublicComment = updatePublicCommentMutation;
  const { loading: updateLoading, error: updateError } = updatePublicCommentResult;

  const [deletePublicCommentMutation, deletePublicCommentResult] = useOptimizedMutation(
    DELETE_PUBLIC_COMMENT,
    {
      context: {
        component: 'usePublicComments',
        action: 'Delete public comment',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
      },
    }
  );

  const deletePublicComment = deletePublicCommentMutation;
  const { loading: deleteLoading, error: deleteError } = deletePublicCommentResult;

  const comments = useMemo(() => {
    // Use server data and merge with optimistic comments
    const baseComments =
      data?.publicComments?.edges?.map(edge => adaptGraphQLPublicComment(edge.node)) || [];

    // Merge optimistic comments with base data
    const optimisticIds = new Set(optimisticComments.map(c => c.id));
    const filteredBaseComments = baseComments.filter(
      (c: IPublicComment) => !optimisticIds.has(c.id)
    );

    return [...optimisticComments, ...filteredBaseComments];
  }, [data?.publicComments?.edges, optimisticComments]);

  const handleCreatePublicComment = useCallback(
    async (content: string, anonymousName?: string) => {
      console.log(
        '🚀 CREATE PUBLIC COMMENT CALLED:',
        content,
        'user:',
        user?.id,
        'target:',
        options.targetId
      );
      if (!content.trim() || !options.targetId) return;

      // Debounce rapid successive calls
      const now = Date.now();
      if (now - lastActionTime < 500) {
        console.warn('Public comment action too frequent, skipping');
        return;
      }
      setLastActionTime(now);

      setIsProcessing(true);
      let optimisticComment: IPublicComment | null = null;
      try {
        // Add optimistic comment
        optimisticComment = {
          id: `temp-${Date.now()}`,
          content: content.trim(),
          user_id: user?.id || null,
          anonymous_name: user?.id
            ? null
            : anonymousName || `Anonymous${Math.floor(Math.random() * 1000)}`,
          anonymous_email: null,
          parent_id: options.targetId,
          parent_type: options.targetType || ParentType.BasketballGame,
          depth: 0,
          is_approved: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          childComments: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              endCursor: null,
              startCursor: null,
            },
            totalCount: 0,
          },
          reactions: [],
          totalChildCommentCount: 0,
          totalReactionCount: 0,
          user: user
            ? {
                id: user.id,
                username: user.username || '',
                first_name: user.firstName || '',
                last_name: user.lastName || '',
                image_url: user.imageUrl || null,
                isAdmin: false, // Clerk users are not admin by default
              }
            : null,
        };

        if (optimisticComment) {
          const comment = optimisticComment;
          setOptimisticComments(prev => [...prev, comment]);
        }

        const result = await createPublicComment({
          variables: {
            input: {
              content: content.trim(),
              parentId: options.targetId,
              parentType: options.targetType,
              anonymousName: user?.id ? undefined : optimisticComment?.anonymous_name,
            },
          },
        });

        if ((result as { data?: CreatePublicCommentMutation }).data?.createPublicComment) {
          // Refetch to get the updated data immediately
          await refetch();

          // Remove optimistic comment after refetch completes
          if (optimisticComment) {
            const commentId = optimisticComment.id;
            setOptimisticComments(prev => prev.filter(c => c.id !== commentId));
          }

          // Trigger a global event to refetch game log lists
          window.dispatchEvent(
            new CustomEvent('gameLogDataChanged', {
              detail: {
                targetId: options.targetId,
                targetType: options.targetType,
                action: 'public_comment_created',
              },
            })
          );
        }
      } catch (error) {
        // Remove optimistic comment on error
        if (optimisticComment) {
          const commentId = optimisticComment.id;
          setOptimisticComments(prev => prev.filter(c => c.id !== commentId));
        }

        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'usePublicComments',
          action: 'Create public comment',
          metadata: {
            targetId: options.targetId,
            targetType: options.targetType,
            content: content.trim(),
          },
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [user, options.targetId, options.targetType, createPublicComment, lastActionTime, refetch]
  );

  const handleUpdatePublicComment = useCallback(
    async (commentId: string, content: string) => {
      console.log('✏️ UPDATE PUBLIC COMMENT CALLED:', commentId, content, 'user:', user?.id);
      if (!content.trim() || !commentId) return;

      // Debounce rapid successive calls
      const now = Date.now();
      if (now - lastActionTime < 500) {
        console.warn('Public comment action too frequent, skipping');
        return;
      }
      setLastActionTime(now);

      setIsProcessing(true);
      try {
        const result = await updatePublicComment({
          variables: {
            id: commentId,
            input: { content: content.trim() },
          },
        });

        if ((result as { data?: UpdatePublicCommentMutation }).data?.updatePublicComment) {
          // Refetch to get the updated data immediately
          await refetch();
        }
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'usePublicComments',
          action: 'Update public comment',
          metadata: {
            commentId,
            content: content.trim(),
          },
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [user?.id, updatePublicComment, lastActionTime, refetch]
  );

  const handleDeletePublicComment = useCallback(
    async (commentId: string) => {
      console.log('🗑️ DELETE PUBLIC COMMENT CALLED:', commentId, 'user:', user?.id);
      if (!commentId) return;

      // Debounce rapid successive calls
      const now = Date.now();
      if (now - lastActionTime < 500) {
        console.warn('Public comment action too frequent, skipping');
        return;
      }
      setLastActionTime(now);

      setIsProcessing(true);
      try {
        const result = await deletePublicComment({
          variables: {
            id: commentId,
          },
        });

        if ((result as { data?: DeletePublicCommentMutation }).data?.deletePublicComment) {
          // Refetch to get the updated data immediately
          await refetch();
        }
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'usePublicComments',
          action: 'Delete public comment',
          metadata: {
            commentId,
          },
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [user?.id, deletePublicComment, lastActionTime, refetch]
  );

  const clearOptimisticComments = useCallback(() => {
    setOptimisticComments([]);
  }, []);

  const forceRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const finalLoading = loading || createLoading || updateLoading || deleteLoading || isProcessing;

  return {
    // Data
    comments: comments || [],

    // State
    loading: finalLoading,
    error: error || createError || updateError || deleteError,

    // Performance
    queryTime: 0,
    isSlowQuery: false,

    // Actions
    createComment: handleCreatePublicComment,
    updateComment: handleUpdatePublicComment,
    deleteComment: handleDeletePublicComment,
    clearOptimisticComments,
    forceRefresh,
    refetch,

    // Utilities
    totalCommentCount: comments.length,
  };
}
