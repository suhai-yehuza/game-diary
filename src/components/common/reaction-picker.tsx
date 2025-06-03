import { useMutation } from '@apollo/client';
import { SmilePlus } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuthContext } from '@/contexts/AuthContext';
import { CREATE_REACTION } from '@/lib/graphql/mutations';
import { GET_REACTIONS } from '@/lib/graphql/queries';
import { ReactionsData } from '@/lib/types/component.types';
import { REACTION_EMOJIS } from '@/lib/types/config.types';
import { ReactionPickerProps } from '@/lib/types/consolidated.types';
import type { ReactionEmojiType } from '@/lib/types/generated/graphql';
import { cn } from '@/lib/utils';
import { import { logger } from '@/lib/logger'; } from '@/lib/logger';
export function ReactionPicker({
  targetId,
  targetType,
  existingReactions = [],
  onReactionChanged,
}: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthContext();
  const [createReaction] = useMutation(CREATE_REACTION);

  const handleReaction = async (emojiName: ReactionEmojiType) => {
    if (!user) return;

    try {
      await createReaction({
        variables: {
          input: {
            targetId: targetId,
            targetType: targetType,
            emoji: emojiName,
          },
        },
        update: (cache, { data }) => {
          if (!data?.createReaction) return;

          const existingData = cache.readQuery<ReactionsData>({
            query: GET_REACTIONS,
            variables: { targetId },
          });

          if (!existingData?.reactions) return;

          let newEdges;
          if (data.createReaction.reaction) {
            const newEdge = {
              __typename: 'ReactionEdge',
              node: data.createReaction.reaction,
              cursor: `cursor-${data.createReaction.reaction.id}`,
            };
            newEdges = [...existingData.reactions.edges, newEdge];
          } else {
            newEdges = existingData.reactions.edges.filter(
              edge => !(edge.node.userId === user.id && edge.node.emoji === emojiName)
            );
          }

          cache.writeQuery({
            query: GET_REACTIONS,
            variables: { targetId },
            data: {
              reactions: {
                ...existingData.reactions,
                edges: newEdges,
                totalCount: newEdges.length,
              },
            },
          });
        },
      });

      setIsOpen(false);
      onReactionChanged?.();
    } catch (error) {
      logger.error('Error toggling reaction:', error);
      onReactionChanged?.();
    }
  };

  const hasUserReacted = (emojiName: ReactionEmojiType) => {
    return existingReactions.some(
      reaction => reaction.userId === user?.id && reaction.emoji === emojiName
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
          <SmilePlus className="h-4 w-4" />
          <span className="text-xs">React</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="grid grid-cols-6 gap-1">
          {Object.entries(REACTION_EMOJIS).map(([name, emoji]) => {
            const hasReacted = hasUserReacted(name as ReactionEmojiType);

            return (
              <Button
                key={name}
                variant={hasReacted ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleReaction(name as ReactionEmojiType)}
                className={cn('h-8 w-full p-0', hasReacted && 'ring-1 ring-primary/20')}
                title={name.charAt(0) + name.slice(1).toLowerCase()}
              >
                <span className="text-base">{emoji}</span>
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
