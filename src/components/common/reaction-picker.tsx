import { useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CREATE_REACTION, DELETE_REACTION } from '@/lib/graphql/mutations';
import { REACTION_EMOJIS, ReactionEmojiType, Reaction, ReactionPickerProps } from '@/lib/types';

export function ReactionPicker({
  targetId,
  targetType,
  existingReactions = [],
  onReactionChanged,
}: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const [createReaction] = useMutation(CREATE_REACTION);
  const [deleteReaction] = useMutation(DELETE_REACTION);

  const handleReaction = async (emojiName: ReactionEmojiType) => {
    if (!user) return;

    // Check if user already has this reaction
    const existingReaction = existingReactions.find(
      (reaction: Reaction) => reaction.userId === user.id && reaction.emoji === emojiName
    );

    try {
      if (existingReaction) {
        // Remove existing reaction
        await deleteReaction({
          variables: {
            id: existingReaction.id,
          },
        });
      } else {
        // Add new reaction
        await createReaction({
          variables: {
            input: {
              target_id: targetId,
              target_type: targetType,
              emoji: emojiName,
            },
          },
        });
      }
      setIsOpen(false);
      onReactionChanged?.();
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="text-lg">😀</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="grid grid-cols-5 gap-1">
          {Object.entries(REACTION_EMOJIS).map(([name, emoji]) => {
            const hasReacted = existingReactions.some(
              (reaction: Reaction) => reaction.userId === user?.id && reaction.emoji === name
            );
            return (
              <Button
                key={name}
                variant={hasReacted ? 'secondary' : 'ghost'}
                size="sm"
                className={`h-8 w-8 p-0 ${hasReacted ? 'bg-accent' : 'hover:bg-accent'}`}
                onClick={() => handleReaction(name as ReactionEmojiType)}
              >
                <span className="text-lg">{emoji}</span>
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
