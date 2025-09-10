'use client';

import { useUser } from '@clerk/nextjs';
import { useCallback, useMemo, useState } from 'react';

import { useOptimizedMutation } from '@/hooks/use-optimized-mutation';
import { useOptimizedQuery } from '@/hooks/use-optimized-query';
import { CREATE_PUBLIC_REACTION, DELETE_PUBLIC_REACTION } from '@/lib/graphql/mutations';
import { GET_PUBLIC_REACTIONS } from '@/lib/graphql/queries';
import { errorHandlers } from '@/lib/utils/error-handler';
import type {
  IPublicReaction,
  IPublicReactionGroup,
  IReactionOptions,
  GetPublicReactionsQuery,
  CreatePublicReactionMutation,
  DeletePublicReactionMutation as _DeletePublicReactionMutation,
} from '@/types';
import { ErrorCategory, ErrorSeverity, ParentType } from '@/types';

// Adapter function to convert GraphQL public reaction to IPublicReaction
function adaptGraphQLPublicReaction(
  graphqlReaction: GetPublicReactionsQuery['publicReactions'][0]
): IPublicReaction {
  return {
    id: graphqlReaction.id,
    emoji: graphqlReaction.emoji,
    user_id: graphqlReaction.user_id,
    anonymous_name: graphqlReaction.anonymous_name,
    anonymous_email: graphqlReaction.anonymous_email,
    target_id: graphqlReaction.target_id,
    target_type: graphqlReaction.target_type,
    is_approved: graphqlReaction.is_approved,
    created_at: graphqlReaction.created_at,
    updated_at: graphqlReaction.updated_at,
    deleted_at: graphqlReaction.deleted_at,
    user: graphqlReaction.user
      ? {
          id: graphqlReaction.user.id,
          username: graphqlReaction.user.username,
          first_name: graphqlReaction.user.first_name,
          last_name: graphqlReaction.user.last_name,
          image_url: graphqlReaction.user.image_url,
          isAdmin: false, // Default value since query doesn't include isAdmin
        }
      : null,
  };
}

export function usePublicReactions(options: IReactionOptions) {
  const { user } = useUser();
  const [optimisticReactions, setOptimisticReactions] = useState<IPublicReaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastActionTime, setLastActionTime] = useState<number>(0);

  const { data, loading, error, refetch } = useOptimizedQuery<GetPublicReactionsQuery>(
    GET_PUBLIC_REACTIONS,
    {
      variables: {
        targetId: options.targetId,
        targetType: options.targetType,
      },
      skip: Boolean((options.skip ?? false) || !options.targetId || !options.targetType),
      context: {
        component: 'usePublicReactions',
        action: 'Load public reactions',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
      },
      onError: (error: import('@apollo/client').ApolloError) => {
        errorHandlers.api(error, {
          component: 'usePublicReactions',
          action: 'Load public reactions',
          category: ErrorCategory.API,
          severity: ErrorSeverity.MEDIUM,
          timestamp: new Date().toISOString(),
        });
      },
    }
  );

  const [createPublicReactionMutation, createPublicReactionResult] = useOptimizedMutation(
    CREATE_PUBLIC_REACTION,
    {
      context: {
        component: 'usePublicReactions',
        action: 'Create public reaction',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
      },
    }
  );

  const createPublicReaction = createPublicReactionMutation;
  const { loading: createLoading, error: createError } = createPublicReactionResult;

  const [deletePublicReactionMutation, deletePublicReactionResult] = useOptimizedMutation(
    DELETE_PUBLIC_REACTION,
    {
      context: {
        component: 'usePublicReactions',
        action: 'Delete public reaction',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date(),
      },
    }
  );

  const deletePublicReaction = deletePublicReactionMutation;
  const { loading: deleteLoading, error: deleteError } = deletePublicReactionResult;

  const reactions = useMemo(() => {
    // Use server data and merge with optimistic reactions
    const baseReactions = data?.publicReactions
      ? (data.publicReactions || []).map(adaptGraphQLPublicReaction)
      : [];

    // Merge optimistic reactions with base data
    const optimisticIds = new Set(optimisticReactions.map(r => r.id));
    const filteredBaseReactions = baseReactions.filter(
      (r: IPublicReaction) => !optimisticIds.has(r.id)
    );

    return [...optimisticReactions, ...filteredBaseReactions];
  }, [data?.publicReactions, optimisticReactions]);

  // Check if user has existing reactions (moved outside of callback to avoid hook violation)
  const hasUserReactedToEmoji = useCallback(
    (emoji: string) => {
      return reactions.some(
        r => (r.user_id === user?.id || (!user?.id && r.anonymous_name)) && r.emoji === emoji
      );
    },
    [reactions, user?.id]
  );

  const reactionGroups = useMemo(() => {
    if (!reactions.length) return [];

    const groups: IPublicReactionGroup[] = [];
    const emojiMap = new Map<string, IPublicReaction[]>();

    reactions.forEach(reaction => {
      const emoji = reaction.emoji;
      if (!emojiMap.has(emoji)) {
        emojiMap.set(emoji, []);
      }
      const reactions = emojiMap.get(emoji);
      if (reactions) {
        reactions.push(reaction);
      }
    });

    emojiMap.forEach((reactions, emoji) => {
      groups.push({
        emoji,
        count: reactions.length,
        reactions: reactions,
        hasUserReacted: reactions.some(r => r.user_id === user?.id),
        users: reactions
          .map(r => r.user)
          .filter((user): user is NonNullable<typeof user> => Boolean(user))
          .map(user => ({
            id: user.id,
            username: user.username,
            imageUrl: user.image_url,
          })),
      });
    });

    return groups.sort((a, b) => b.count - a.count);
  }, [reactions, user?.id]);

  const userReactions = useMemo(() => {
    if (!user?.id || !reactions.length) return [];
    return reactions.filter(reaction => reaction.user_id === user.id);
  }, [reactions, user?.id]);

  const hasUserReacted = useCallback(
    (emoji: string) => {
      return userReactions.some(reaction => reaction.emoji === emoji);
    },
    [userReactions]
  );

  const getReactionCount = useCallback(
    (emoji: string) => {
      return reactions.filter(reaction => reaction.emoji === emoji).length;
    },
    [reactions]
  );

  const handleCreatePublicReaction = useCallback(
    async (emoji: string) => {
      console.log(
        '🚀 CREATE PUBLIC REACTION CALLED:',
        emoji,
        'user:',
        user?.id,
        'target:',
        options.targetId
      );
      if (!options.targetId) return;

      // Prevent multiple simultaneous requests
      if (isProcessing) {
        console.warn('Public reaction creation already in progress, skipping');
        return;
      }

      // Check if user already has this reaction (including optimistic ones)
      if (hasUserReactedToEmoji(emoji)) {
        console.warn('User already has this public reaction, skipping');
        return;
      }

      // Debounce rapid successive calls
      const now = Date.now();
      if (now - lastActionTime < 500) {
        console.warn('Public reaction action too frequent, skipping');
        return;
      }
      setLastActionTime(now);

      setIsProcessing(true);
      let optimisticReaction: IPublicReaction | null = null;
      try {
        // Add optimistic reaction
        optimisticReaction = {
          id: `temp-${Date.now()}`,
          emoji,
          user_id: user?.id || null,
          anonymous_name: user?.id ? null : `Anonymous${Math.floor(Math.random() * 1000)}`,
          anonymous_email: null,
          target_id: options.targetId,
          target_type: options.targetType || ParentType.BasketballGame,
          is_approved: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
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

        if (optimisticReaction) {
          const reaction = optimisticReaction;
          setOptimisticReactions(prev => [...prev, reaction]);
        }

        const result = await createPublicReaction({
          variables: {
            input: {
              emoji,
              targetId: options.targetId,
              targetType: options.targetType,
              anonymousName: user?.id ? undefined : optimisticReaction?.anonymous_name,
            },
          },
        });

        if ((result as { data?: CreatePublicReactionMutation }).data?.createPublicReaction) {
          // Remove optimistic reaction immediately to prevent duplicates
          if (optimisticReaction) {
            const reactionId = optimisticReaction.id;
            setOptimisticReactions(prev => prev.filter(r => r.id !== reactionId));
          }

          // Refetch to get the updated data immediately
          await refetch();

          // Trigger a global event to refetch game log lists
          window.dispatchEvent(
            new CustomEvent('gameLogDataChanged', {
              detail: {
                targetId: options.targetId,
                targetType: options.targetType,
                action: 'public_reaction_created',
              },
            })
          );
        }
      } catch (error) {
        // Remove optimistic reaction on error
        if (optimisticReaction) {
          const reactionId = optimisticReaction.id;
          setOptimisticReactions(prev => prev.filter(r => r.id !== reactionId));
        }

        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'usePublicReactions',
          action: 'Create public reaction',
          metadata: {
            targetId: options.targetId,
            targetType: options.targetType,
            emoji,
          },
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [
      user,
      options.targetId,
      options.targetType,
      createPublicReaction,
      lastActionTime,
      refetch,
      hasUserReactedToEmoji,
      isProcessing,
    ]
  );

  const handleDeletePublicReaction = useCallback(
    async (emoji: string) => {
      console.log(
        '🗑️ DELETE PUBLIC REACTION CALLED:',
        emoji,
        'user:',
        user?.id,
        'target:',
        options.targetId
      );
      if (!options.targetId) return;

      // Debounce rapid successive calls
      const now = Date.now();
      if (now - lastActionTime < 500) {
        console.warn('Public reaction action too frequent, skipping');
        return;
      }
      setLastActionTime(now);

      setIsProcessing(true);
      try {
        const userReaction = userReactions.find(r => r.emoji === emoji);
        if (!userReaction) return;

        await deletePublicReaction({
          variables: {
            id: userReaction.id,
          },
        });

        // Refetch to get the updated data immediately
        await refetch();

        // Trigger a global event to refetch game log lists
        window.dispatchEvent(
          new CustomEvent('gameLogDataChanged', {
            detail: {
              targetId: options.targetId,
              targetType: options.targetType,
              action: 'public_reaction_deleted',
            },
          })
        );

        // Remove optimistic reaction after refetch completes
        setOptimisticReactions(prev => prev.filter(r => r.id !== userReaction.id));
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'usePublicReactions',
          action: 'Delete public reaction',
          metadata: {
            targetId: options.targetId,
            targetType: options.targetType,
            emoji,
          },
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [
      user?.id,
      options.targetId,
      options.targetType,
      userReactions,
      deletePublicReaction,
      lastActionTime,
      refetch,
    ]
  );

  const toggleReaction = useCallback(
    async (emoji: string) => {
      console.log('🔄 TOGGLE PUBLIC REACTION:', emoji, 'hasUserReacted:', hasUserReacted(emoji));
      if (hasUserReacted(emoji)) {
        console.log('🗑️ DELETING PUBLIC REACTION:', emoji);
        await handleDeletePublicReaction(emoji);
      } else {
        console.log('➕ CREATING PUBLIC REACTION:', emoji);
        await handleCreatePublicReaction(emoji);
      }
    },
    [hasUserReacted, handleCreatePublicReaction, handleDeletePublicReaction]
  );

  const clearOptimisticReactions = useCallback(() => {
    setOptimisticReactions([]);
  }, []);

  const forceRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const finalLoading = loading || createLoading || deleteLoading || isProcessing;

  return {
    // Data
    reactions: reactions || [],
    reactionGroups: reactionGroups || [],

    // State
    loading: finalLoading,
    error: error || createError || deleteError,

    // Performance
    queryTime: 0,
    isSlowQuery: false,

    // Actions
    createReaction: handleCreatePublicReaction,
    deleteReaction: handleDeletePublicReaction,
    addReaction: handleCreatePublicReaction, // Alias for backward compatibility
    removeReaction: handleDeletePublicReaction, // Alias for backward compatibility
    toggleReaction,
    clearOptimisticReactions,
    forceRefresh,
    refetch,

    // Utilities
    hasUserReacted,
    getReactionCount,
    userReactions,
  };
}
