'use client';

import { useUser } from '@clerk/nextjs';
import { Smile, X } from 'lucide-react';
import React, { useState, useCallback, memo } from 'react';

import { usePublicReactions } from '@/hooks/use-public-reactions';
import type { IPublicReaction, IPublicReactionPickerProps, ParentType } from '@/types';

// Check if user has reacted with specific emoji
const hasUserReacted = (reactions: IPublicReaction[], emoji: string, userId?: string): boolean => {
  if (!userId) return false;
  return reactions.some(reaction => reaction.emoji === emoji && reaction.user_id === userId);
};

// Common emojis for public reactions
const COMMON_EMOJIS = ['👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🎉'];

export const PublicReactionPicker = memo<IPublicReactionPickerProps>(function PublicReactionPicker({
  targetId,
  targetType,
  size = 'md',
  showCount = true,
  showPicker = true,
  onReactionSelect,
}) {
  const { user } = useUser();
  const currentUserId = user?.id;

  const [isOpen, setIsOpen] = useState(false);
  const [showMoreReactions, setShowMoreReactions] = useState(false);

  // Use the full public reactions hook with mutation capabilities
  const { reactions, reactionGroups, loading, toggleReaction } = usePublicReactions({
    targetId,
    targetType: targetType as ParentType,
  });

  // Toggle picker - no need to fetch, just show/hide
  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  // Handle reaction selection
  const handleReactionSelect = useCallback(
    async (emoji: string) => {
      onReactionSelect?.(emoji);
      setIsOpen(false);
      // Use the actual toggle reaction functionality
      await toggleReaction(emoji);
    },
    [onReactionSelect, toggleReaction]
  );

  // Handle showing more reactions
  const handleShowMore = useCallback(() => {
    setShowMoreReactions(!showMoreReactions);
  }, [showMoreReactions]);

  // Size classes
  const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const buttonSizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-1">
        <div className="animate-pulse bg-theme-muted rounded-full h-6 w-6" />
        <span className="text-xs text-theme-muted">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      {/* Reaction Display */}
      <div className="flex items-center space-x-1">
        {reactionGroups.slice(0, showMoreReactions ? reactionGroups.length : 3).map(group => (
          <button
            key={group.emoji}
            onClick={() => {
              void handleReactionSelect(group.emoji);
            }}
            disabled={loading}
            className={`group inline-flex items-center gap-2 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 p-1.5 ${sizeClasses[size]} ${
              hasUserReacted(reactions, group.emoji, currentUserId)
                ? 'border-brand-primary/20 bg-brand-primary/10 text-brand-primary shadow-sm ring-1 ring-brand-primary/20'
                : 'border-theme-primary bg-surface-card text-theme-primary hover:border-theme-secondary hover:bg-bg-theme-secondary hover:shadow-sm'
            }`}
            aria-label={`React with ${group.emoji}`}
          >
            <span className="text-base transition-transform group-hover:scale-110">
              {group.emoji}
            </span>
            {showCount && group.count > 0 && (
              <span className="font-medium text-xs bg-bg-theme-secondary text-theme-primary px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                {group.count}
              </span>
            )}
          </button>
        ))}

        {/* Show More Button */}
        {reactionGroups.length > 3 && (
          <button
            onClick={handleShowMore}
            className={`${buttonSizeClasses[size]} rounded-full border border-theme-primary bg-surface-card hover:bg-bg-theme-secondary flex items-center justify-center transition-colors ${sizeClasses[size]}`}
            title="Show more reactions"
          >
            +{reactionGroups.length - 3}
          </button>
        )}

        {/* Add Reaction Button */}
        {showPicker && (
          <button
            onClick={handleToggle}
            className={`${buttonSizeClasses[size]} rounded-full border border-theme-primary bg-surface-card hover:bg-bg-theme-secondary flex items-center justify-center transition-colors`}
            title="Add reaction"
          >
            <Smile className="h-3 w-3 text-theme-muted" />
          </button>
        )}
      </div>

      {/* Reaction Picker */}
      {isOpen && showPicker && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-surface-card border border-theme-primary rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-theme-primary">Add Reaction</span>
            <button onClick={handleToggle} className="text-theme-muted hover:text-theme-primary">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {COMMON_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => {
                  void handleReactionSelect(emoji);
                }}
                className={`${buttonSizeClasses[size]} rounded-full border border-theme-primary bg-surface-card hover:bg-bg-theme-secondary flex items-center justify-center transition-colors ${sizeClasses[size]}`}
                title={`Add ${emoji} reaction`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
