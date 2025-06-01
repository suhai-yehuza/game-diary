import { useQuery, useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { CREATE_REACTION } from '@/lib/graphql/mutations';
import { GET_REACTIONS } from '@/lib/graphql/queries';
import { REACTION_EMOJIS } from '@/lib/types/config.types';
import { ReactionDisplayProps } from '@/lib/types/consolidated.types';
import { Reaction, ReactionEmojiType } from '@/lib/types/generated/graphql';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
  const [optimisticReaction, setOptimisticReaction] = useState<{emoji: string, isAdding: boolean} | null>(null);
  
  // Only query if reactions aren't provided or we need to load all
  const { data, loading, refetch } = useQuery(GET_REACTIONS, {
    variables: { targetId: targetId },
    skip: !!providedReactions && !showAllReactions,
  });
  
  const [createReaction] = useMutation(CREATE_REACTION);

  // Use provided reactions initially, full data when loading all
  let reactions = showAllReactions && data?.reactions?.edges 
    ? data.reactions.edges.map((edge: { node: Reaction }) => edge.node)
    : (providedReactions || data?.reactions?.edges?.map((edge: { node: Reaction }) => edge.node) || []);
  
  // Apply optimistic update if we have one
  if (optimisticReaction && providedReactions) {
    if (optimisticReaction.isAdding) {
      // Add optimistic reaction if not already present
      const hasReaction = reactions.some((r: Reaction) => r.userId === user?.id && r.emoji === optimisticReaction.emoji);
      if (!hasReaction) {
        reactions = [...reactions, {
          __typename: 'Reaction',
          id: `optimistic-${Date.now()}`,
          emoji: optimisticReaction.emoji,
          userId: user!.id,
          targetId: targetId,
          targetType: targetType,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            __typename: 'UserSummary',
            id: user!.id,
            username: user!.username || '',
            firstName: user!.firstName || '',
            lastName: user!.lastName || '',
            emailAddress: user!.emailAddresses?.[0]?.emailAddress || '',
            imageUrl: user!.imageUrl || null,
          },
        } as Reaction];
      }
    } else {
      // Remove optimistic reaction
      reactions = reactions.filter((r: Reaction) => !(r.userId === user?.id && r.emoji === optimisticReaction.emoji));
    }
  }
  
  // Use provided total count if available
  const totalCount = providedTotalCount || data?.reactions?.totalCount || reactions.length;
  
  // Clear optimistic state when provided reactions change (parent refetched)
  React.useEffect(() => {
    setOptimisticReaction(null);
  }, [providedReactions]);
  
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

    // Set optimistic state when reactions are provided as props
    if (providedReactions && !existingReaction) {
      setOptimisticReaction({ emoji: emojiName, isAdding: true });
    }

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
        // Always use optimistic response for immediate feedback
        optimisticResponse: !providedReactions ? {
          __typename: 'Mutation',
          createReaction: {
            __typename: 'CreateReactionResponse',
            reaction: existingReaction
              ? null // Toggling off
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
          },
        } : undefined,
        // Skip cache update when reactions are provided as props
        update: !providedReactions ? (cache, { data }) => {
          if (!data?.createReaction) return;
          
          const existingData = cache.readQuery({
            query: GET_REACTIONS,
            variables: { targetId },
          }) as { reactions: { edges: any[]; totalCount: number } } | null;
          
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
          }
        } : undefined,
        // Ensure refetch happens after mutation
        awaitRefetchQueries: !!providedReactions,
      });

      if (result.data?.createReaction?.errors?.length > 0) {
        console.error('Reaction errors:', result.data.createReaction.errors);
      }

      // Call onReactionChange after mutation completes
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
      {/* Reaction Pills */}
      <div className={cn(
        "flex items-center gap-1.5 flex-wrap",
        Object.keys(reactionGroups).length > 0 && "mr-2"
      )}>
        {Object.entries(REACTION_EMOJIS).map(([name, emoji]) => {
          const group = reactionGroups[name];
          if (!group || group.count === 0) return null;

          const userHasReacted = group.hasCurrentUser;

          return (
            <div
              key={name}
              className={cn(
                "group relative inline-flex items-center gap-1.5 px-2.5 py-1",
                "rounded-full text-sm font-medium cursor-pointer select-none",
                "transition-all duration-200 hover:scale-105",
                "animate-in fade-in-50 zoom-in-95",
                userHasReacted 
                  ? "bg-primary/15 text-primary hover:bg-primary/25 ring-1 ring-primary/30" 
                  : "bg-muted hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
              onClick={() => handleEmojiClick(name as ReactionEmojiType)}
              role="button"
              tabIndex={0}
            >
              {/* Emoji with bounce animation on click */}
              <span 
                className={cn(
                  "text-base transition-transform duration-200",
                  "group-hover:scale-110 group-active:scale-125"
                )}
              >
                {emoji}
              </span>
              
              {/* Count badge */}
              <span className={cn(
                "min-w-[1rem] text-center",
                group.count > 99 && "text-xs"
              )}>
                {group.count > 99 ? '99+' : group.count}
              </span>

              {/* Tooltip with reactor names */}
              <div className={cn(
                "absolute bottom-full left-1/2 -translate-x-1/2 mb-2",
                "bg-popover px-3 py-1.5 rounded-md shadow-lg border",
                "text-xs whitespace-nowrap max-w-xs",
                "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100",
                "transition-all duration-200 pointer-events-none z-50",
                "before:content-[''] before:absolute before:top-full before:left-1/2",
                "before:-translate-x-1/2 before:border-4 before:border-transparent",
                "before:border-t-border"
              )}>
                <div className="font-medium mb-0.5">
                  {userHasReacted ? '✓ You' : group.users[0]}
                  {group.count > 1 && ` and ${group.count - 1} ${group.count === 2 ? 'other' : 'others'}`}
                </div>
                <div className="text-muted-foreground">
                  reacted with {name.charAt(0) + name.slice(1).toLowerCase()}
                </div>
              </div>

              {/* Shine effect on hover */}
              <div className={cn(
                "absolute inset-0 rounded-full overflow-hidden pointer-events-none",
                "before:absolute before:inset-0 before:bg-gradient-to-r",
                "before:from-transparent before:via-white/10 before:to-transparent",
                "before:-translate-x-full before:group-hover:translate-x-full",
                "before:transition-transform before:duration-700"
              )} />
            </div>
          );
        })}
      </div>

      {/* Show more reactions indicator */}
      {totalCount > reactions.length && (
        <Badge
          variant="secondary"
          className={cn(
            "cursor-pointer hover:bg-secondary/80",
            "transition-all duration-200 hover:scale-105"
          )}
          onClick={() => setShowAllReactions(true)}
        >
          +{totalCount - reactions.length} more
        </Badge>
      )}
      
      {/* Reaction Picker with divider */}
      {user && (
        <>
          {Object.keys(reactionGroups).length > 0 && (
            <div className="h-4 w-px bg-border/50" />
          )}
          <ReactionPicker
            targetId={targetId}
            targetType={targetType}
            existingReactions={formattedReactions}
            onReactionChanged={() => {
              if (providedReactions) {
                if (onReactionChange) {
                  onReactionChange();
                }
              } else {
                refetch();
              }
            }}
          />
        </>
      )}
    </div>
  );
}
