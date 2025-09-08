import { useUser } from '@clerk/nextjs';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useOptimizedMutation } from '@/hooks/use-optimized-mutation';
import { useOptimizedQuery } from '@/hooks/use-optimized-query';
import { ReactionCacheUtils, CACHE_CONFIG } from '@/lib/cache';
import { CREATE_REACTION, DELETE_REACTION } from '@/lib/graphql/mutations';
import { GET_REACTIONS } from '@/lib/graphql/queries';
import { errorHandlers } from '@/lib/utils/error-handler';
import type {
  IReaction,
  IReactionGroup,
  IReactionOptions,
  GetReactionsQuery,
  ReactionFragmentFragment,
  CreateReactionMutation,
  Reaction,
} from '@/types';
import { REACTION_EMOJIS, ErrorCategory, ErrorSeverity, ParentType } from '@/types';

// Adapter function to convert GraphQL reaction to IReaction
function adaptGraphQLReaction(graphqlReaction: ReactionFragmentFragment): IReaction {
  return {
    id: graphqlReaction.id,
    emoji: graphqlReaction.emoji,
    user_id: graphqlReaction.user_id,
    target_id: graphqlReaction.target_id,
    target_type: graphqlReaction.target_type,
    created_at: graphqlReaction.created_at,
    updated_at: graphqlReaction.created_at, // Use created_at as fallback since fragment doesn't include updated_at
    user: {
      id: graphqlReaction.user.id,
      username: graphqlReaction.user.username,
      first_name: graphqlReaction.user.first_name,
      last_name: graphqlReaction.user.last_name,
      image_url: null, // Fragment doesn't include image_url
      isAdmin: false, // Default value, should be fetched from user data
    },
  };
}

export function useReactions(options: IReactionOptions) {
  const { user } = useUser();
  const [optimisticReactions, setOptimisticReactions] = useState<IReaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastActionTime, setLastActionTime] = useState<number>(0);

  // Cache state
  const [cachedReactions, setCachedReactions] = useState<IReaction[] | null>(null);
  const [isCacheHit, setIsCacheHit] = useState(false);

  // Try to get reactions from cache first
  useEffect(() => {
    const loadFromCache = async () => {
      if (!options.targetId || !options.targetType) return;

      try {
        const cached = await ReactionCacheUtils.getCachedReactions(
          options.targetId,
          options.targetType
        );

        if (cached && cached.length > 0) {
          setCachedReactions(cached as unknown as IReaction[]);
          setIsCacheHit(true);
        } else {
          setIsCacheHit(false);
        }
      } catch (error) {
        console.warn('Failed to load reactions from cache:', error);
        setIsCacheHit(false);
      }
    };

    void loadFromCache();
  }, [options.targetId, options.targetType]);

  const { data, loading, error, refetch } = useOptimizedQuery<GetReactionsQuery>(GET_REACTIONS, {
    variables: {
      targetId: options.targetId,
      targetType: options.targetType,
    },
    skip: Boolean(
      (options.skip ?? false) ||
        !options.targetId ||
        (isCacheHit && cachedReactions && cachedReactions.length > 0)
    ), // Skip if explicitly requested, no targetId, or we have valid cached data
    context: {
      component: 'useReactions',
      action: 'Load reactions',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    },
    onCompleted: data => {
      if (data?.reactions) {
        const newReactions = (data.reactions || []).map(adaptGraphQLReaction);

        // Update cached reactions state
        setCachedReactions(newReactions);

        // Cache the reactions (convert IReaction[] to Reaction[] for cache compatibility)
        if (!isCacheHit) {
          const reactionsForCache = newReactions.map(reaction => ({
            ...reaction,
            user: {
              ...reaction.user,
              isAdmin: false, // Default value since GraphQL fragment doesn't include isAdmin
            },
          }));

          if (options.targetId && options.targetType) {
            void ReactionCacheUtils.cacheReactions(
              options.targetId,
              options.targetType,
              reactionsForCache as unknown as Reaction[], // Type assertion to handle the conversion
              {
                ttl: CACHE_CONFIG.TTL.REACTION,
                tags: [`target:${options.targetType}:${options.targetId}`],
              }
            );
          }
        }
      }
    },
    onError: (error: import('@apollo/client').ApolloError) => {
      errorHandlers.api(error, {
        component: 'useReactions',
        action: 'Load reactions',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      });
    },
  });

  const [createReactionMutation, createReactionResult] = useOptimizedMutation(CREATE_REACTION, {
    context: {
      component: 'useReactions',
      action: 'Create reaction',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    },
  });

  const createReaction = createReactionMutation;
  const { loading: createLoading, error: createError } = createReactionResult;

  const [deleteReactionMutation, deleteReactionResult] = useOptimizedMutation(DELETE_REACTION, {
    context: {
      component: 'useReactions',
      action: 'Delete reaction',
      category: ErrorCategory.API,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date(),
    },
  });

  const deleteReaction = deleteReactionMutation;
  const { loading: deleteLoading, error: deleteError } = deleteReactionResult;

  const reactions = useMemo(() => {
    // Use cached reactions if available, otherwise use server data
    const baseReactions =
      cachedReactions || (data?.reactions ? (data.reactions || []).map(adaptGraphQLReaction) : []);

    // Merge optimistic reactions with base data
    const optimisticIds = new Set(optimisticReactions.map(r => r.id));
    const filteredBaseReactions = baseReactions.filter((r: IReaction) => !optimisticIds.has(r.id));

    return [...optimisticReactions, ...filteredBaseReactions];
  }, [cachedReactions, data?.reactions, optimisticReactions]);

  const reactionGroups = useMemo(() => {
    if (!reactions.length) return [];

    const groups: IReactionGroup[] = [];
    const emojiMap = new Map<string, IReaction[]>();

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
        hasUserReacted: reactions.some(r => r.user_id === user?.id),
        users: reactions.map(r => r.user),
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

  const handleCreateReaction = useCallback(
    async (emoji: string) => {
      console.log(
        '🚀 CREATE REACTION CALLED:',
        emoji,
        'user:',
        user?.id,
        'target:',
        options.targetId
      );
      if (!user?.id || !options.targetId) return;

      // Debounce rapid successive calls
      const now = Date.now();
      if (now - lastActionTime < 500) {
        console.warn('Reaction action too frequent, skipping');
        return;
      }
      setLastActionTime(now);

      setIsProcessing(true);
      try {
        // Add optimistic reaction
        const optimisticReaction: IReaction = {
          id: `temp-${Date.now()}`,
          emoji,
          user_id: user.id,
          target_id: options.targetId,
          target_type: options.targetType || ParentType.GameLog,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user: {
            id: user.id,
            username: user.username || '',
            first_name: user.firstName || '',
            last_name: user.lastName || '',
            image_url: user.imageUrl || null,
            isAdmin: false, // Default value, should be fetched from user data
          },
        };

        setOptimisticReactions(prev => [...prev, optimisticReaction]);

        const result = await createReaction({
          variables: {
            input: {
              emoji,
              targetId: options.targetId,
              targetType: options.targetType,
            },
          },
        });

        if ((result as { data?: CreateReactionMutation }).data?.createReaction) {
          // Invalidate cache
          await ReactionCacheUtils.invalidateReactionCaches(options.targetId, options.targetType);

          // Refetch to get the updated data immediately
          await refetch();

          // Remove optimistic reaction after refetch completes
          setOptimisticReactions(prev => prev.filter(r => r.id !== optimisticReaction.id));
        }
      } catch (error) {
        // Remove optimistic reaction on error
        setOptimisticReactions(prev => prev.filter(r => r.id !== `temp-${Date.now()}`));

        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'useReactions',
          action: 'Create reaction',
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
      user?.firstName,
      user?.lastName,
      user?.username,
      user?.imageUrl,
      options.targetId,
      options.targetType,
      createReaction,
      lastActionTime,
      refetch,
    ]
  );

  const handleDeleteReaction = useCallback(
    async (emoji: string) => {
      console.log(
        '🗑️ DELETE REACTION CALLED:',
        emoji,
        'user:',
        user?.id,
        'target:',
        options.targetId
      );
      if (!user?.id || !options.targetId) return;

      // Debounce rapid successive calls
      const now = Date.now();
      if (now - lastActionTime < 500) {
        console.warn('Reaction action too frequent, skipping');
        return;
      }
      setLastActionTime(now);

      setIsProcessing(true);
      try {
        const userReaction = userReactions.find(r => r.emoji === emoji);
        if (!userReaction) return;

        await deleteReaction({
          variables: {
            id: userReaction.id,
          },
        });

        // Invalidate cache
        await ReactionCacheUtils.invalidateReactionCaches(options.targetId, options.targetType);

        // Refetch to get the updated data immediately
        await refetch();

        // Remove optimistic reaction after refetch completes
        setOptimisticReactions(prev => prev.filter(r => r.id !== userReaction.id));
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'useReactions',
          action: 'Delete reaction',
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
      deleteReaction,
      lastActionTime,
      refetch,
    ]
  );

  const toggleReaction = useCallback(
    async (emoji: string) => {
      console.log('🔄 TOGGLE REACTION:', emoji, 'hasUserReacted:', hasUserReacted(emoji));
      if (hasUserReacted(emoji)) {
        console.log('🗑️ DELETING REACTION:', emoji);
        await handleDeleteReaction(emoji);
      } else {
        console.log('➕ CREATING REACTION:', emoji);
        await handleCreateReaction(emoji);
      }
    },
    [hasUserReacted, handleCreateReaction, handleDeleteReaction]
  );

  const clearOptimisticReactions = useCallback(() => {
    setOptimisticReactions([]);
  }, []);

  const forceRefresh = useCallback(async () => {
    setIsCacheHit(false);
    setCachedReactions(null);
    await refetch();
  }, [refetch]);

  const finalLoading = loading || createLoading || deleteLoading || isProcessing;

  return {
    // Data
    reactions: reactions || [],
    reactionGroups: reactionGroups || [],
    cachedReactions,
    isCacheHit,

    // State
    loading: finalLoading,
    error: error || createError || deleteError,

    // Performance
    queryTime: 0,
    isSlowQuery: false,

    // Actions
    createReaction: handleCreateReaction,
    deleteReaction: handleDeleteReaction,
    addReaction: handleCreateReaction, // Alias for backward compatibility
    removeReaction: handleDeleteReaction, // Alias for backward compatibility
    toggleReaction,
    clearOptimisticReactions,
    forceRefresh,
    refetch,

    // Utilities
    hasUserReacted,
    getReactionCount,
    userReactions,

    // Available emojis
    availableEmojis: REACTION_EMOJIS,
  };
}

export function useGameLogReactions(gameLogId: string) {
  return useReactions({
    targetId: gameLogId,
    targetType: 'GAME_LOG' as ParentType,
  });
}

export function useCommentReactions(commentId: string) {
  return useReactions({
    targetId: commentId,
    targetType: 'COMMENT' as ParentType,
  });
}

// Hook for getting available reaction emojis
export function useReactionEmojis() {
  return Object.values(REACTION_EMOJIS);
}
