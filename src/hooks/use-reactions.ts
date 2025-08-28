import { useMutation, useQuery } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { useCallback, useMemo, useState, useRef } from 'react';

import { CREATE_REACTION, DELETE_REACTION } from '@/lib/graphql/mutations';
import { GET_REACTIONS } from '@/lib/graphql/queries';
import type { IReaction, IReactionGroup, IReactionOptions, ParentType } from '@/lib/types';
import { REACTION_EMOJIS } from '@/lib/types';

export function useReactions(options: IReactionOptions) {
  const { user } = useUser();
  const [optimisticReactions, setOptimisticReactions] = useState<IReaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_REACTIONS, {
    variables: {
      targetId: options.targetId,
      targetType: options.targetType,
    },
    skip: !options.targetId,
  });

  const [createReaction] = useMutation(CREATE_REACTION);
  const [deleteReaction] = useMutation(DELETE_REACTION);

  const reactions = useMemo(() => {
    // If we have optimistic reactions, use them entirely to avoid Apollo cache invalidation
    // This gives us full control over when reactions update
    if (optimisticReactions.length > 0) {
      return optimisticReactions.filter(
        (reaction: IReaction) =>
          reaction?.id && reaction?.emoji && reaction?.user_id && !reaction.deleted_at
      );
    }

    // Otherwise use server data as fallback
    const serverReactions = data?.reactions || [];
    return serverReactions.filter(
      (reaction: IReaction) =>
        reaction?.id && reaction?.emoji && reaction?.user_id && !reaction.deleted_at
    );
  }, [data?.reactions, optimisticReactions]);

  // Use a ref to store the previous grouped reactions for stable references
  const previousGroupsRef = useRef<Map<string, IReactionGroup>>(new Map());

  const groupedReactions = useMemo(() => {
    const groups: Record<string, IReactionGroup> = {};
    const userReactions = new Set<string>();
    const newGroupsMap = new Map<string, IReactionGroup>();

    // Create a stable map of emoji to reactions
    const emojiMap = new Map<string, IReaction[]>();

    // Process all reactions
    reactions.forEach((reaction: IReaction) => {
      if (!reaction.emoji || !reaction.user_id) return;

      if (!emojiMap.has(reaction.emoji)) {
        emojiMap.set(reaction.emoji, []);
      }
      const emojiReactions = emojiMap.get(reaction.emoji);
      if (emojiReactions) {
        emojiReactions.push(reaction);
      }
    });

    // Create stable group objects with reference preservation
    emojiMap.forEach((emojiReactions, emoji) => {
      const count = emojiReactions.length;
      const reactionIds = emojiReactions.map(r => r.id);
      const userReaction = emojiReactions.find(r => r.user_id === user?.id);
      const hasUserReacted = Boolean(userReaction);

      if (hasUserReacted) {
        userReactions.add(emoji);
      }

      // Check if we can reuse the previous group object (for stable references)
      const previousGroup = previousGroupsRef.current.get(emoji);

      if (
        previousGroup &&
        previousGroup.count === count &&
        previousGroup.hasUserReacted === hasUserReacted &&
        JSON.stringify(previousGroup.reactionIds.sort()) === JSON.stringify(reactionIds.sort())
      ) {
        // Reuse the previous group object to maintain stable references
        groups[emoji] = previousGroup;
        newGroupsMap.set(emoji, previousGroup);
      } else {
        // Create a new group object only when necessary
        const newGroup: IReactionGroup = {
          emoji,
          count,
          hasUserReacted,
          reactionIds,
        };
        groups[emoji] = newGroup;
        newGroupsMap.set(emoji, newGroup);
      }
    });

    // Update the ref with the new groups map
    previousGroupsRef.current = newGroupsMap;

    // Only return a new array if the groups have actually changed
    const groupValues = Object.values(groups);

    return {
      groups: groupValues,
      userReactions,
    };
  }, [reactions, user?.id]);

  const addReaction = useCallback(
    async (emoji: string) => {
      if (!user?.id) return;

      // Check if user already has this reaction (including optimistic ones)
      const currentReactions =
        optimisticReactions.length > 0 ? optimisticReactions : data?.reactions || [];
      const existingReaction = currentReactions.find(
        (reaction: IReaction) =>
          reaction.user_id === user.id && reaction.emoji === emoji && !reaction.deleted_at
      );

      if (existingReaction) {
        // If reaction already exists and is not deleted, don't add it again
        return;
      }

      // Create optimistic reaction
      const optimisticReaction: IReaction = {
        id: `optimistic-${Date.now()}`,
        emoji,
        user_id: user.id,
        target_id: options.targetId,
        target_type: options.targetType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: user.id,
          username: user.username || '',
          first_name: user.firstName || '',
          last_name: user.lastName || '',
          email_address: user.emailAddresses?.[0]?.emailAddress || null,
          phone_number: null,
          image_url: null,
        },
      };

      // Add optimistic reaction, initializing with server data if needed
      setOptimisticReactions(prev => {
        // If we don't have optimistic state yet, start with server data
        const baseReactions = prev.length === 0 ? data?.reactions || [] : prev;
        const filtered = baseReactions.filter(
          (r: IReaction) => !(r.user_id === user.id && r.emoji === emoji)
        );
        return [...filtered, optimisticReaction];
      });

      try {
        await createReaction({
          variables: {
            input: {
              emoji,
              targetId: options.targetId,
              targetType: options.targetType,
            },
          },
          update: (cache, { data: mutationData }) => {
            if (mutationData?.createReaction?.reaction) {
              const newReaction = mutationData.createReaction.reaction;

              // Instead of modifying Apollo cache, just update optimistic state directly
              // This prevents Apollo from invalidating the entire reactions query
              setOptimisticReactions(prev => {
                // Remove the temporary optimistic reaction and add the real one
                const withoutOptimistic = prev.filter(r => r.id !== optimisticReaction.id);
                return [...withoutOptimistic, newReaction];
              });
            } else {
              // Clear only this specific optimistic reaction if mutation failed
              setOptimisticReactions(prev => prev.filter(r => r.id !== optimisticReaction.id));
            }
          },
        });
      } catch (error) {
        console.error('Failed to add reaction:', error);
        // Remove optimistic reaction on error
        setOptimisticReactions(prev => prev.filter(r => r.id !== optimisticReaction.id));
      }
    },
    [
      createReaction,
      user,
      data?.reactions,
      optimisticReactions,
      options.targetId,
      options.targetType,
    ]
  );

  const removeReaction = useCallback(
    async (emoji: string) => {
      if (!user?.id) return;

      // Find the reaction to delete from current reactions (including optimistic ones)
      const currentReactions =
        optimisticReactions.length > 0 ? optimisticReactions : data?.reactions || [];
      const userReaction = currentReactions.find(
        (reaction: IReaction) =>
          reaction.user_id === user.id && reaction.emoji === emoji && !reaction.deleted_at
      );

      if (!userReaction) return;

      // Optimistically remove the reaction by marking it as deleted
      setOptimisticReactions(prev => {
        // If we don't have optimistic state yet, start with server data
        const baseReactions = prev.length === 0 ? data?.reactions || [] : prev;
        const filtered = baseReactions.filter((r: IReaction) => r.id !== userReaction.id);
        return [...filtered, { ...userReaction, deleted_at: new Date().toISOString() }];
      });

      try {
        await deleteReaction({
          variables: {
            id: userReaction.id,
          },
          update: (_cache, _mutationData) => {
            // Instead of modifying Apollo cache, just update optimistic state directly
            // The optimistic reaction is already marked as deleted, so just keep it that way
            // This prevents Apollo from invalidating the entire reactions query
            // No need to modify cache or clear optimistic state since the soft delete
            // is already handled optimistically and we want to maintain that state
          },
        });
      } catch (error) {
        console.error('Failed to remove reaction:', error);
        // Remove only this specific optimistic reaction on error
        setOptimisticReactions(prev => prev.filter(r => r.id !== userReaction.id));
      }
    },
    [deleteReaction, data?.reactions, optimisticReactions, user?.id]
  );

  const toggleReaction = useCallback(
    async (emoji: string) => {
      if (!user?.id || isProcessing) return;

      setIsProcessing(true);

      try {
        // Get the most current state, prioritizing optimistic updates
        const currentReactions =
          optimisticReactions.length > 0 ? optimisticReactions : data?.reactions || [];

        // Look for a non-deleted reaction from the current user for this emoji
        const hasReacted = currentReactions.some(
          (reaction: IReaction) =>
            reaction?.user_id === user?.id && reaction?.emoji === emoji && !reaction?.deleted_at
        );

        if (hasReacted) {
          await removeReaction(emoji);
        } else {
          await addReaction(emoji);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [addReaction, removeReaction, optimisticReactions, data?.reactions, user?.id, isProcessing]
  );

  return {
    reactions,
    groupedReactions: groupedReactions.groups,
    userReactions: groupedReactions.userReactions,
    loading,
    error: error?.message || null,
    addReaction,
    removeReaction,
    toggleReaction,
    refetch,
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
