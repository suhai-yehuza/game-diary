import { useQuery, useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { CREATE_REACTION } from '@/lib/graphql/mutations';
import { GET_REACTIONS } from '@/lib/graphql/queries';
import { logger } from '@/lib/logger';
import { REACTION_EMOJIS } from '@/lib/types/config.types';
import { ReactionDisplayProps } from '@/lib/types/consolidated.types';
import { Reaction, ReactionEmojiType } from '@/lib/types/generated/graphql';
import { cn } from '@/lib/utils';

import { ReactionPicker } from './reaction-picker';
interface ExtendedReactionDisplayProps extends ReactionDisplayProps {
  reactions?: Reaction[];
  totalReactionCount?: number;
  onReactionChange?: () => void;
}

export function ReactionDisplay({
  targetId,
  targetType,
  reactions: providedReactions,
  totalReactionCount: providedTotalCount,
  onReactionChange,
}: ExtendedReactionDisplayProps) {
  const { user } = useUser();
  const [showAllReactions, setShowAllReactions] = useState(false);

  // Only query if reactions aren't provided or we need to load all
  const { data, loading, refetch } = useQuery(GET_REACTIONS, {
    variables: { targetId: targetId },
    skip: !!providedReactions && !showAllReactions,
  });

  const [createReaction] = useMutation(CREATE_REACTION);

  // Use provided reactions initially, full data when loading all
  const reactions =
    showAllReactions && data?.reactions?.edges
      ? data.reactions.edges.map((edge: { node: Reaction }) => edge.node)
      : providedReactions ||
        data?.reactions?.edges?.map((edge: { node: Reaction }) => edge.node) ||
        [];

  // Use provided total count if available
  const totalCount = providedTotalCount || data?.reactions?.totalCount || reactions.length;

  if (!providedReactions && loading) return null;

  // Group reactions by emoji and count them
  const reactionGroups = reactions.reduce(
    (
      acc: Record<string, { count: number; users: string[]; hasCurrentUser: boolean }>,
      reaction: Reaction
    ) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = { count: 0, users: [], hasCurrentUser: false };
      }
      acc[reaction.emoji].count++;
      acc[reaction.emoji].users.push(reaction.user?.username || 'Unknown');
      if (reaction.userId === user?.id) {
        acc[reaction.emoji].hasCurrentUser = true;
      }
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

  // Handle clicking on existing emoji reactions to toggle them
  const handleEmojiClick = async (emojiName: ReactionEmojiType) => {
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
        update: !providedReactions
          ? (cache, { data }) => {
              if (!data?.createReaction) return;

              const existingData = cache.readQuery({
                query: GET_REACTIONS,
                variables: { targetId },
              }) as {
                reactions: {
                  edges: Array<{ node: Reaction; __typename: string; cursor: string }>;
                  totalCount: number;
                };
              } | null;

              if (existingData?.reactions) {
                let newEdges;
                if (data.createReaction.reaction) {
                  // Adding reaction
                  newEdges = [
                    ...existingData.reactions.edges,
                    {
                      __typename: 'ReactionEdge',
                      cursor: `cursor-${data.createReaction.reaction.id}`,
                      node: data.createReaction.reaction,
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
            }
          : undefined,
      });

      if (onReactionChange) {
        onReactionChange();
      }
    } catch (error) {
      logger.error('Error toggling reaction:', error);
      if (onReactionChange) {
        onReactionChange();
      }
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Reaction Pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {Object.entries(REACTION_EMOJIS).map(([name, emoji]) => {
          const group = reactionGroups[name];
          if (!group || group.count === 0) return null;

          const userHasReacted = group.hasCurrentUser;

          return (
            <div key={name} className="relative group/reaction">
              <button
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-1',
                  'rounded-full text-sm transition-colors',
                  userHasReacted
                    ? 'bg-primary/15 text-primary hover:bg-primary/20'
                    : 'bg-muted hover:bg-muted/80'
                )}
                onClick={() => handleEmojiClick(name as ReactionEmojiType)}
              >
                <span>{emoji}</span>
                <span className="font-medium">{group.count}</span>
              </button>

              {/* Simple tooltip */}
              <div
                className={cn(
                  'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50',
                  'bg-popover border rounded px-2 py-1 text-xs shadow-sm',
                  'opacity-0 invisible group-hover/reaction:opacity-100 group-hover/reaction:visible',
                  'transition-opacity duration-200 pointer-events-none',
                  'whitespace-nowrap max-w-xs'
                )}
              >
                {userHasReacted ? (
                  <span>
                    You
                    {group.count > 1 &&
                      `, ${group.users.filter((u: string) => u !== user?.username).join(', ')}`}
                  </span>
                ) : (
                  <span>
                    {group.users.slice(0, 3).join(', ')}
                    {group.count > 3 && ` +${group.count - 3} more`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more reactions indicator */}
      {totalCount > reactions.length && (
        <Badge
          variant="secondary"
          className="cursor-pointer hover:bg-secondary/80"
          onClick={() => setShowAllReactions(true)}
        >
          +{totalCount - reactions.length} more
        </Badge>
      )}

      {/* Reaction Picker */}
      {user && (
        <ReactionPicker
          targetId={targetId}
          targetType={targetType}
          existingReactions={formattedReactions}
          onReactionChanged={() => {
            if (providedReactions && onReactionChange) {
              onReactionChange();
            } else {
              refetch();
            }
          }}
        />
      )}
    </div>
  );
}
