import { useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { SmilePlus } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@src/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@src/components/ui/popover';
import { CREATE_REACTION } from '@src/lib/graphql/mutations';
import { GET_REACTIONS, GET_GAME_LOG } from '@src/lib/graphql/queries';
import { logger } from 'lib/core/logger';
import type { ReactionsData } from '@src/lib/types/component.types';
import { REACTION_EMOJIS } from '@src/lib/types/config.types';
import type { ReactionPickerProps } from '@src/lib/types/consolidated.types';
import type { ReactionEmojiType, Reaction } from '@src/lib/types/generated/graphql';
import { cn } from '@src/lib/utils';

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

          // Update GET_REACTIONS cache
          const existingData = cache.readQuery<ReactionsData>({
            query: GET_REACTIONS,
            variables: { targetId },
          });

          if (existingData?.reactions) {
            let newEdges;
            if (data.createReaction.reaction) {
              // Adding reaction
              newEdges = [
                ...existingData.reactions.edges,
                {
                  __typename: 'ReactionEdge',
                  cursor: `cursor-${data.createReaction.reaction.id}`,
                  node: {
                    ...data.createReaction.reaction,
                    user: {
                      id: user.id,
                      username: user.username || '',
                      emailAddress: user.emailAddresses?.[0]?.emailAddress || '',
                      imageUrl: user.imageUrl || '',
                      __typename: 'UserSummary',
                    },
                    __typename: 'Reaction',
                  },
                },
              ];
            } else {
              // Removing reaction
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
          }

          // If this is a game log, also update the GET_GAME_LOG cache
          if (targetType === 'game_log') {
            const gameLogData = cache.readQuery({
              query: GET_GAME_LOG,
              variables: { id: targetId },
            }) as {
              gameLog: {
                reactions: {
                  edges: Array<{ node: Reaction; __typename: string; cursor: string }>;
                  totalCount: number;
                };
              };
            } | null;

            if (gameLogData?.gameLog?.reactions) {
              let newEdges;
              if (data.createReaction.reaction) {
                // Adding reaction
                newEdges = [
                  ...gameLogData.gameLog.reactions.edges,
                  {
                    __typename: 'ReactionEdge',
                    cursor: `cursor-${data.createReaction.reaction.id}`,
                    node: {
                      ...data.createReaction.reaction,
                      user: {
                        id: user.id,
                        username: user.username || '',
                        emailAddress: user.emailAddresses?.[0]?.emailAddress || '',
                        imageUrl: user.imageUrl || '',
                        __typename: 'UserSummary',
                      },
                      __typename: 'Reaction',
                    },
                  },
                ];
              } else {
                // Removing reaction
                newEdges = gameLogData.gameLog.reactions.edges.filter(
                  edge => !(edge.node.userId === user.id && edge.node.emoji === emojiName)
                );
              }

              cache.writeQuery({
                query: GET_GAME_LOG,
                variables: { id: targetId },
                data: {
                  gameLog: {
                    ...gameLogData.gameLog,
                    reactions: {
                      ...gameLogData.gameLog.reactions,
                      edges: newEdges,
                      totalCount: newEdges.length,
                    },
                  },
                },
              });
            }
          }
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
