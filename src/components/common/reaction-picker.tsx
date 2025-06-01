import { useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CREATE_REACTION } from '@/lib/graphql/mutations';
import { GET_REACTIONS } from '@/lib/graphql/queries';
import { REACTION_EMOJIS } from '@/lib/types/config.types';
import { Reaction, ReactionEmojiType } from '@/lib/types/generated/graphql';
import { ReactionPickerProps } from '@/lib/types/reaction.types';

export function ReactionPicker({
  targetId,
  targetType,
  existingReactions = [],
  onReactionChanged,
}: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const [createReaction] = useMutation(CREATE_REACTION);

  const handleReaction = async (emojiName: ReactionEmojiType) => {
    if (!user) return;

    // Check if user already has this reaction
    const existingReaction = existingReactions.find(
      (reaction: Reaction) => reaction.userId === user.id && reaction.emoji === emojiName
    );

    try {
      // Use createReaction for both adding and removing (toggling)
      await createReaction({
        variables: {
          input: {
            targetId: targetId,
            targetType: targetType,
            emoji: emojiName,
          },
        },
        optimisticResponse: {
          createReaction: {
            reaction: existingReaction
              ? null // If toggling off
              : {
                  __typename: 'Reaction',
                  id: `temp-${Date.now()}`,
                  emoji: emojiName,
                  userId: user.id,
                  targetId: targetId,
                  targetType: targetType,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  user: {
                    __typename: 'UserSummary',
                    id: user.id,
                    username: user.username || '',
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    emailAddress: user.emailAddresses?.[0]?.emailAddress || '',
                    imageUrl: user.imageUrl || null,
                  },
                },
            errors: [],
            __typename: 'CreateReactionPayload',
          },
        },
        update: (cache, { data }) => {
          if (!data?.createReaction) return;

          const existingData = cache.readQuery({
            query: GET_REACTIONS,
            variables: { targetId },
          }) as { reactions: { edges: any[]; totalCount: number } } | null;

          if (!existingData?.reactions) return;

          let newEdges;
          if (data.createReaction.reaction) {
            // Adding a reaction
            const newEdge = {
              __typename: 'ReactionEdge',
              node: data.createReaction.reaction,
              cursor: `cursor-${data.createReaction.reaction.id}`,
            };
            newEdges = [...existingData.reactions.edges, newEdge];
          } else {
            // Removing a reaction
            newEdges = existingData.reactions.edges.filter(
              (edge: any) => !(edge.node.userId === user.id && edge.node.emoji === emojiName)
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
      // Call onReactionChanged to notify parent components
      onReactionChanged?.();
    } catch (error) {
      console.error('Error toggling reaction:', error);
      onReactionChanged?.();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Plus className="text-lg" />
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
