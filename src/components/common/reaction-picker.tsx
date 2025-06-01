import { useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { Heart, ThumbsUp, Laugh, Flame, Star, MoreHorizontal } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CREATE_REACTION } from '@/lib/graphql/mutations';
import { GET_REACTIONS } from '@/lib/graphql/queries';
import { REACTION_EMOJIS } from '@/lib/types/config.types';
import { Reaction, ReactionEmojiType } from '@/lib/types/generated/graphql';
import { ReactionPickerProps } from '@/lib/types/reaction.types';
import { cn } from '@/lib/utils';

// Quick reactions that appear immediately
const QUICK_REACTIONS: ReactionEmojiType[] = ['LIKE', 'LOVE', 'FIRE', 'CLAP', 'GOAT'];

// Categorized reactions for the picker
const REACTION_CATEGORIES = {
  'Emotions': ['LIKE', 'LOVE', 'LAUGH', 'WOW', 'SAD', 'ANGRY'],
  'Celebratory': ['FIRE', 'CLAP', 'EYES', 'ROCKET', 'MUSCLE', 'GOAT'],
  'Sports': ['BASKETBALL', 'SOCCER', 'FOOTBALL', 'BASEBALL', 'TENNIS', 'GOLF'],
  'Other': ['BULLSEYE', 'THUMBS_DOWN'],
};

export function ReactionPicker({
  targetId,
  targetType,
  existingReactions = [],
  onReactionChanged,
}: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showQuickReactions, setShowQuickReactions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Emotions');
  const [recentlyUsed, setRecentlyUsed] = useState<ReactionEmojiType[]>([]);
  const { user } = useUser();
  const [createReaction] = useMutation(CREATE_REACTION);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load recently used reactions from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const saved = localStorage.getItem(`reactions-recent-${user.id}`);
      if (saved) {
        setRecentlyUsed(JSON.parse(saved));
      }
    }
  }, [user]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const showReactions = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setShowQuickReactions(true);
  };

  const hideReactions = () => {
    hideTimeoutRef.current = setTimeout(() => {
      if (!isOpen) {
        setShowQuickReactions(false);
      }
    }, 300); // 300ms delay
  };

  const handleReaction = async (emojiName: ReactionEmojiType, fromQuick = false) => {
    if (!user) return;

    // Update recently used
    const newRecent = [emojiName, ...recentlyUsed.filter(e => e !== emojiName)].slice(0, 5);
    setRecentlyUsed(newRecent);
    localStorage.setItem(`reactions-recent-${user.id}`, JSON.stringify(newRecent));

    // Check if user already has this reaction
    const existingReaction = existingReactions.find(
      (reaction: Reaction) => reaction.userId === user.id && reaction.emoji === emojiName
    );

    try {
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
              ? null
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
            const newEdge = {
              __typename: 'ReactionEdge',
              node: data.createReaction.reaction,
              cursor: `cursor-${data.createReaction.reaction.id}`,
            };
            newEdges = [...existingData.reactions.edges, newEdge];
          } else {
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
      
      if (!fromQuick) {
        setIsOpen(false);
      }
      // Don't hide quick reactions immediately after selecting
      onReactionChanged?.();
    } catch (error) {
      console.error('Error toggling reaction:', error);
      onReactionChanged?.();
    }
  };

  const hasUserReacted = (emojiName: string) => {
    return existingReactions.some(
      (reaction: Reaction) => reaction.userId === user?.id && reaction.emoji === emojiName
    );
  };

  return (
    <div 
      className="relative"
      onMouseEnter={showReactions}
      onMouseLeave={hideReactions}
    >
      {/* Quick Reactions Bar */}
      <div className={cn(
        "absolute bottom-full left-0 mb-2 flex items-center gap-1 p-1.5",
        "bg-background/95 backdrop-blur-sm rounded-full shadow-lg border",
        "transition-all duration-300 origin-bottom-left",
        showQuickReactions 
          ? "opacity-100 scale-100 translate-y-0" 
          : "opacity-0 scale-95 translate-y-2 pointer-events-none"
      )}>
        {QUICK_REACTIONS.map((emojiName, index) => {
          const emoji = REACTION_EMOJIS[emojiName];
          const hasReacted = hasUserReacted(emojiName);
          
          return (
            <Button
              key={emojiName}
              variant="ghost"
              size="sm"
              onClick={() => handleReaction(emojiName, true)}
              className={cn(
                "h-9 w-9 p-0 rounded-full transition-all duration-300",
                "hover:scale-125 hover:bg-accent/80",
                hasReacted && "bg-primary/20 ring-2 ring-primary/30",
                "animate-in slide-in-from-bottom-2 fade-in-0"
              )}
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'backwards'
              }}
            >
              <span className="text-lg">{emoji}</span>
            </Button>
          );
        })}
        <div className="w-px h-6 bg-border mx-1" />
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 w-9 p-0 rounded-full",
                "hover:scale-110 hover:bg-accent/80",
                "animate-in slide-in-from-bottom-2 fade-in-0"
              )}
              style={{
                animationDelay: `${QUICK_REACTIONS.length * 50}ms`,
                animationFillMode: 'backwards'
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-80 p-0 overflow-hidden" 
            align="start"
            side="top"
            sideOffset={10}
          >
            {/* Categories */}
            <div className="flex gap-1 p-2 border-b bg-muted/30">
              {Object.keys(REACTION_CATEGORIES).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs h-7 px-2"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Recently Used */}
            {recentlyUsed.length > 0 && selectedCategory === 'Emotions' && (
              <div className="p-2 border-b">
                <p className="text-xs text-muted-foreground mb-1.5">Recently used</p>
                <div className="flex gap-1">
                  {recentlyUsed.map((emojiName) => {
                    const emoji = REACTION_EMOJIS[emojiName];
                    const hasReacted = hasUserReacted(emojiName);
                    
                    return (
                      <Button
                        key={emojiName}
                        variant={hasReacted ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => handleReaction(emojiName)}
                        className={cn(
                          "h-8 w-8 p-0",
                          hasReacted && "ring-1 ring-primary/20"
                        )}
                      >
                        <span className="text-base">{emoji}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Category Emojis */}
            <div className="p-3">
              <div className="grid grid-cols-6 gap-1">
                {REACTION_CATEGORIES[selectedCategory as keyof typeof REACTION_CATEGORIES].map((emojiName) => {
                  const emoji = REACTION_EMOJIS[emojiName as ReactionEmojiType];
                  const hasReacted = hasUserReacted(emojiName);
                  
                  return (
                    <Button
                      key={emojiName}
                      variant={hasReacted ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => handleReaction(emojiName as ReactionEmojiType)}
                      className={cn(
                        "h-10 w-full p-0 relative group",
                        "hover:scale-110 hover:z-10 transition-all duration-200",
                        hasReacted && "bg-accent ring-1 ring-primary/20"
                      )}
                    >
                      <span className="text-xl">{emoji}</span>
                      {hasReacted && (
                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
                      )}
                      {/* Tooltip */}
                      <div className={cn(
                        "absolute -top-7 left-1/2 -translate-x-1/2",
                        "bg-popover px-2 py-0.5 rounded text-[10px] whitespace-nowrap",
                        "border shadow-sm opacity-0 group-hover:opacity-100",
                        "transition-opacity duration-200 pointer-events-none z-20"
                      )}>
                        {emojiName.charAt(0) + emojiName.slice(1).toLowerCase()}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Main Reaction Button */}
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => setShowQuickReactions(!showQuickReactions)}
        className={cn(
          "h-8 px-3 gap-2 group relative",
          "hover:bg-accent/50 transition-all duration-200",
          "border border-transparent hover:border-border/50",
          "cursor-pointer active:scale-95"
        )}
      >
        {/* Animated Icons */}
        <div className="relative w-4 h-4">
          <Heart className={cn(
            "h-4 w-4 absolute transition-all duration-300",
            "text-muted-foreground group-hover:text-pink-500",
            showQuickReactions ? "scale-0 rotate-180" : "scale-100 rotate-0"
          )} />
          <ThumbsUp className={cn(
            "h-4 w-4 absolute transition-all duration-300",
            "text-blue-500",
            showQuickReactions ? "scale-100 rotate-0" : "scale-0 -rotate-180"
          )} />
        </div>
        <span className={cn(
          "text-xs font-medium transition-all duration-200",
          "text-muted-foreground group-hover:text-foreground"
        )}>
          React
        </span>
      </Button>
    </div>
  );
}
