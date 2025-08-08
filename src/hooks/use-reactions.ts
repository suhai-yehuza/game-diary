import { useMutation, useQuery } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { useCallback, useMemo, useState } from 'react';

import { CREATE_REACTION, DELETE_REACTION } from '@/lib/graphql/mutations';
import { GET_REACTIONS } from '@/lib/graphql/queries';
import type { IReaction, IReactionGroup, IReactionOptions, ParentType } from '@/lib/types';
import { REACTION_EMOJIS } from '@/lib/types/constant.types';

export function useReactions(options: IReactionOptions) {
  const { user } = useUser();
  const [localReactions, setLocalReactions] = useState<IReaction[]>([]);

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
    const serverReactions = data?.reactions || [];
    return [...serverReactions, ...localReactions];
  }, [data?.reactions, localReactions]);

  const groupedReactions = useMemo(() => {
    const groups: Record<string, IReactionGroup> = {};
    const userReactions = new Set<string>();

    reactions.forEach((reaction: IReaction) => {
      if (!groups[reaction.emoji]) {
        groups[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          hasUserReacted: false,
          reactionIds: [],
        };
      }

      groups[reaction.emoji].count++;
      groups[reaction.emoji].reactionIds.push(reaction.id);

      // Check if current user has reacted with this emoji
      if (reaction.user_id === user?.id) {
        groups[reaction.emoji].hasUserReacted = true;
        userReactions.add(reaction.emoji);
      }
    });

    return {
      groups: Object.values(groups),
      userReactions,
    };
  }, [reactions, user?.id]);

  const addReaction = useCallback(
    async (emoji: string) => {
      if (!user?.id) return;

      try {
        const result = await createReaction({
          variables: {
            input: {
              emoji,
              targetId: options.targetId,
              targetType: options.targetType,
            },
          },
        });

        const newReaction = result.data?.createReaction?.reaction;
        if (newReaction) {
          setLocalReactions(prev => [...prev, newReaction]);
          await refetch();
        }
      } catch (error) {
        console.error('Failed to add reaction:', error);
      }
    },
    [createReaction, options.targetId, options.targetType, user?.id, refetch]
  );

  const removeReaction = useCallback(
    async (emoji: string) => {
      if (!user?.id) return;

      try {
        // Find the reaction to delete
        const userReaction = reactions.find(
          (reaction: IReaction) => reaction.user_id === user.id && reaction.emoji === emoji
        );

        if (userReaction) {
          await deleteReaction({
            variables: {
              id: userReaction.id,
            },
          });

          setLocalReactions(prev => prev.filter(r => r.id !== userReaction.id));
          await refetch();
        }
      } catch (error) {
        console.error('Failed to remove reaction:', error);
      }
    },
    [deleteReaction, reactions, user?.id, refetch]
  );

  const toggleReaction = useCallback(
    async (emoji: string) => {
      const hasReacted = groupedReactions.userReactions.has(emoji);

      if (hasReacted) {
        await removeReaction(emoji);
      } else {
        await addReaction(emoji);
      }
    },
    [addReaction, removeReaction, groupedReactions.userReactions]
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
  return useMemo(() => Object.values(REACTION_EMOJIS), []);
}
