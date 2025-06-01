import { useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { Smile, Sparkles, Heart } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CREATE_REACTION } from '@/lib/graphql/mutations';
import { GET_REACTIONS } from '@/lib/graphql/queries';
import { REACTION_EMOJIS } from '@/lib/types/config.types';
import { Reaction, ReactionEmojiType } from '@/lib/types/generated/graphql';
import { ReactionPickerProps } from '@/lib/types/reaction.types';
import { cn } from '@/lib/utils';

export function ReactionPicker({
  targetId,
  targetType,
  existingReactions = [],
  onReactionChanged,
}: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);
  const { user } = useUser();
  const [createReaction] = useMutation(CREATE_REACTION);

  // Reset hover state when popover closes
  useEffect(() => {
    if (!isOpen) {
      setHoveredEmoji(null);
    }
  }, [isOpen]);

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
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "h-8 px-2 gap-1.5 group relative overflow-hidden",
            "hover:bg-accent/80 transition-all duration-200",
            "border border-transparent hover:border-border/50"
          )}
        >
          <div className="relative">
            {/* Animated emoji background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Smile className={cn(
                "h-4 w-4 transition-all duration-300",
                isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100 group-hover:scale-110"
              )} />
              <Heart className={cn(
                "h-4 w-4 absolute text-pink-500 transition-all duration-300",
                isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
              )} />
            </div>
            {/* Sparkle effect on hover */}
            <Sparkles className={cn(
              "h-3 w-3 absolute -top-1 -right-1 text-yellow-500",
              "transition-all duration-300 opacity-0 group-hover:opacity-100",
              "animate-pulse"
            )} />
          </div>
          <span className={cn(
            "text-xs font-medium ml-4 transition-all duration-200",
            "opacity-0 group-hover:opacity-100"
          )}>
            React
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-3 bg-background/95 backdrop-blur-sm" 
        align="start"
        sideOffset={5}
      >
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground text-center mb-2">
            Pick a reaction
          </p>
          <div className="grid grid-cols-5 gap-1">
            {Object.entries(REACTION_EMOJIS).map(([name, emoji]) => {
              const hasReacted = existingReactions.some(
                (reaction: Reaction) => reaction.userId === user?.id && reaction.emoji === name
              );
              const isHovered = hoveredEmoji === name;
              
              return (
                <div key={name} className="relative">
                  <Button
                    variant={hasReacted ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(
                      "h-10 w-10 p-0 relative transition-all duration-200",
                      hasReacted && "bg-accent ring-2 ring-primary/20",
                      !hasReacted && "hover:bg-accent/80 hover:scale-110",
                      isHovered && "scale-125 z-10"
                    )}
                    onClick={() => handleReaction(name as ReactionEmojiType)}
                    onMouseEnter={() => setHoveredEmoji(name)}
                    onMouseLeave={() => setHoveredEmoji(null)}
                  >
                    <span className={cn(
                      "text-xl transition-transform duration-200",
                      isHovered && "animate-bounce"
                    )}>
                      {emoji}
                    </span>
                    {hasReacted && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
                    )}
                  </Button>
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div className={cn(
                      "absolute -top-8 left-1/2 -translate-x-1/2",
                      "bg-popover px-2 py-1 rounded text-xs whitespace-nowrap",
                      "border shadow-sm z-20 animate-in fade-in-0 zoom-in-95",
                      "pointer-events-none"
                    )}>
                      {name.charAt(0) + name.slice(1).toLowerCase()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Popular reactions section */}
          <div className="pt-2 border-t">
            <p className="text-[10px] text-muted-foreground text-center">
              Click any emoji to {existingReactions.some((r: Reaction) => r.userId === user?.id) ? 'change your' : 'add a'} reaction
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
