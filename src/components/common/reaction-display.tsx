import { useQuery, useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { CREATE_REACTION } from '@/lib/graphql/mutations';
import { GET_REACTIONS } from '@/lib/graphql/queries';
import { REACTION_EMOJIS } from '@/lib/types/config.types';
import { ReactionDisplayProps } from '@/lib/types/consolidated.types';
import { Reaction, ReactionEmojiType } from '@/lib/types/generated/graphql';

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
  onReactionChange
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
  const reactions = showAllReactions && data?.reactions?.edges 
    ? data.reactions.edges.map((edge: { node: Reaction }) => edge.node)
    : (providedReactions || data?.reactions?.edges?.map((edge: { node: Reaction }) => edge.node) || []);
  
  // Use provided total count if available
  const totalCount = providedTotalCount || data?.reactions?.totalCount || reactions.length;
  
  if (!providedReactions && loading) return null;

  // Group reactions by emoji and count them
  const reactionGroups = reactions.reduce((acc: Record<string, { count: number; users: string[]; hasCurrentUser: boolean }>, reaction: Reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = { count: 0, users: [], hasCurrentUser: false };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push(reaction.user?.username || 'Unknown');
    if (reaction.userId === user?.id) {
      acc[reaction.emoji].hasCurrentUser = true;
    }
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

    // Check if user already has this reaction
    const existingReaction = reactions.find(
      (r: Reaction) => r.userId === user.id && r.emoji === emojiName
    );

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
      });

      if (result.data?.createReaction?.errors?.length > 0) {
        console.error('Reaction errors:', result.data.createReaction.errors);
      }

      // Call onReactionChange after successful mutation
      if (onReactionChange) {
        onReactionChange();
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      // Still call onReactionChange on error to refresh state
      if (onReactionChange) {
        onReactionChange();
      }
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
    <div className="flex items-center gap-2 flex-wrap">
      {Object.entries(REACTION_EMOJIS).map(([name, emoji]) => {
        const group = reactionGroups[name];
        if (!group || group.count === 0) return null;

        const userHasReacted = group.hasCurrentUser;

        return (
          <Button
            key={name}
            variant={userHasReacted ? 'secondary' : 'ghost'}
            size="sm"
            className={`h-8 px-2 hover:bg-accent ${userHasReacted ? 'bg-accent' : ''}`}
            onClick={() => handleEmojiClick(name as ReactionEmojiType)}
            title={`${group.users.slice(0, 5).join(', ')}${group.users.length > 5 ? ` and ${group.users.length - 5} more` : ''}`}
          >
            <span className="text-lg">{emoji}</span>
            <span className="ml-1 text-sm">{group.count}</span>
          </Button>
        );
      })}
      
      {/* Show count of additional reactions not displayed */}
      {totalCount > reactions.length && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => setShowAllReactions(true)}
        >
          +{totalCount - reactions.length} more
        </Button>
      )}
      
      <ReactionPicker
        targetId={targetId}
        targetType={targetType}
        existingReactions={formattedReactions}
        onReactionChanged={() => {
          if (providedReactions) {
            // If reactions are provided, call parent to refetch
            if (onReactionChange) {
              onReactionChange();
            }
          } else {
            // Otherwise refetch our own query
            refetch();
          }
        }}
      />
    </div>
  );
}
