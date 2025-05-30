import { useQuery, useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import React from 'react';

import { Button } from '@/components/ui/button';
import { CREATE_REACTION } from '@/lib/graphql/mutations';
import { GET_REACTIONS } from '@/lib/graphql/queries';
import { REACTION_EMOJIS } from '@/lib/types/config.types';
import { ReactionDisplayProps } from '@/lib/types/consolidated.types';
import { Reaction, ReactionEmojiType } from '@/lib/types/generated/graphql';

import { ReactionPicker } from './reaction-picker';

export function ReactionDisplay({ targetId, targetType }: ReactionDisplayProps) {
  const { user } = useUser();
  const { data, loading, refetch } = useQuery(GET_REACTIONS, {
    variables: { targetId: targetId },
  });
  const [createReaction] = useMutation(CREATE_REACTION);

  if (loading) return null;

  // Extract reactions from the GraphQL connection structure
  const reactions = data?.reactions?.edges?.map((edge: { node: Reaction }) => edge.node) || [];
  const reactionCounts = reactions.reduce((acc: Record<string, number>, reaction: Reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {});

  // Transform reactions to match the expected format
  const formattedReactions = reactions.map((reaction: Reaction) => ({
    id: reaction.id,
    emoji: reaction.emoji,
    userId: reaction.userId,
  }));

  // Handle clicking on existing emoji reactions to toggle them
  const handleEmojiClick = async (emojiName: ReactionEmojiType) => {
    if (!user) return;

    try {
      // Use createReaction which now handles toggling internally
      const result = await createReaction({
        variables: {
          input: {
            targetId: targetId,
            targetType: targetType,
            emoji: emojiName,
          },
        },
      });

      if (result.data?.createReaction?.errors?.length > 0) {
        console.error('Reaction errors:', result.data.createReaction.errors);
      }

      refetch();
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  // Check if the current user has reacted with a specific emoji
  const hasUserReacted = (emojiName: string) => {
    return formattedReactions.some(
      (reaction: { id: string; emoji: string; userId: string }) =>
        reaction.userId === user?.id && reaction.emoji === emojiName
    );
  };

  return (
    <div className="flex items-center gap-2">
      {Object.entries(REACTION_EMOJIS).map(([name, emoji]) => {
        const count = reactionCounts[name] || 0;
        if (count === 0) return null;

        const userHasReacted = hasUserReacted(name);

        return (
          <Button
            key={name}
            variant={userHasReacted ? 'secondary' : 'ghost'}
            size="sm"
            className={`h-8 px-2 hover:bg-accent ${userHasReacted ? 'bg-accent' : ''}`}
            onClick={() => handleEmojiClick(name as ReactionEmojiType)}
          >
            <span className="text-lg">{emoji}</span>
            <span className="ml-1 text-sm">{count}</span>
          </Button>
        );
      })}
      <ReactionPicker
        targetId={targetId}
        targetType={targetType}
        existingReactions={formattedReactions}
        onReactionChanged={refetch}
      />
    </div>
  );
}
