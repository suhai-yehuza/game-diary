import { useQuery } from '@apollo/client';
import React from 'react';

import { Button } from '@/components/ui/button';
import { GET_REACTIONS } from '@/lib/graphql/queries';
import { REACTION_EMOJIS, type ReactionEmojiValue } from '@/lib/types';
import { ReactionDisplayProps } from '@/lib/types/consolidated.types';
import { Reaction } from '@/lib/types/generated/graphql';

import { ReactionPicker } from './reaction-picker';

export function ReactionDisplay({ targetId, targetType }: ReactionDisplayProps) {
  const { data, loading, refetch } = useQuery(GET_REACTIONS, {
    variables: { target_id: targetId },
  });

  if (loading) return null;

  const reactions = data?.reactions || [];
  const reactionCounts = reactions.reduce(
    (acc: Record<string, number>, reaction: { emoji: ReactionEmojiValue }) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    },
    {}
  );

  // Transform reactions to match the expected format
  const formattedReactions = reactions.map((reaction: Reaction) => ({
    id: reaction.id,
    emoji: reaction.emoji,
    userId: reaction.userId,
  }));

  return (
    <div className="flex items-center gap-2">
      {Object.entries(REACTION_EMOJIS).map(([name, emoji]) => {
        const count = reactionCounts[emoji] || 0;
        if (count === 0) return null;

        return (
          <Button key={name} variant="ghost" size="sm" className="h-8 px-2 hover:bg-accent">
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
