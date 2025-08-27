import { Smile, X } from 'lucide-react';
import { useState, useRef, useEffect, useCallback, memo } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/Popover';
import { useReactions } from '@/hooks/use-reactions';
import type { IReactionPickerProps } from '@/lib/types';
import { REACTION_EMOJIS } from '@/lib/types/constant.types';

import { MemoizedReactionButton } from './MemoizedReactionButton';

// Primary reactions (most commonly used) - following industry best practices
const PRIMARY_REACTIONS = [
  REACTION_EMOJIS.THUMBS_UP,
  REACTION_EMOJIS.LOVE,
  REACTION_EMOJIS.LAUGH,
  REACTION_EMOJIS.FIRE,
  REACTION_EMOJIS.BASKETBALL,
  REACTION_EMOJIS.CLAP,
];

// Secondary reactions (less commonly used)
const SECONDARY_REACTIONS = [
  REACTION_EMOJIS.THUMBS_DOWN,
  REACTION_EMOJIS.WOW,
  REACTION_EMOJIS.SAD,
  REACTION_EMOJIS.ANGRY,
  REACTION_EMOJIS.MUSCLE,
  REACTION_EMOJIS.ROCKET,
  REACTION_EMOJIS.GOAT,
  REACTION_EMOJIS.BULLSEYE,
  REACTION_EMOJIS.EYES,
  REACTION_EMOJIS.SOCCER,
  REACTION_EMOJIS.FOOTBALL,
  REACTION_EMOJIS.BASEBALL,
  REACTION_EMOJIS.TENNIS,
  REACTION_EMOJIS.GOLF,
];

export const ReactionPicker = memo(function ReactionPicker({
  targetId,
  targetType,
  onReactionAdded: _onReactionAdded,
  onReactionRemoved: _onReactionRemoved,
  className,
  size = 'md',
  showCount = true,
}: IReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAllReactions, setShowAllReactions] = useState(false);
  const { groupedReactions, userReactions, toggleReaction, loading } = useReactions({
    targetId,
    targetType,
  });
  const popoverRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleReactionClick = useCallback(
    async (emoji: string) => {
      await toggleReaction(emoji);
      // Don't close immediately for better UX - let user see the reaction being added
      // Check if window is available (for SSR/test environments)
      if (typeof window !== 'undefined') {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        // Set new timeout and store reference
        timeoutRef.current = setTimeout(() => setIsOpen(false), 300);
      } else {
        // In SSR/test environments, close immediately
        setIsOpen(false);
      }
    },
    [toggleReaction]
  );

  const handleReactionClickSync = useCallback(
    (emoji: string) => {
      void handleReactionClick(emoji);
    },
    [handleReactionClick]
  );

  const sizeClasses = {
    sm: 'p-1.5 text-sm',
    md: 'p-2 text-base',
    lg: 'p-2.5 text-lg',
  };

  const buttonSizeClasses = {
    sm: 'h-7 w-7 text-sm',
    md: 'h-8 w-8 text-base',
    lg: 'h-9 w-9 text-lg',
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`flex flex-wrap gap-1.5 ${className || ''}`} data-testid="reaction-picker">
      {/* Existing reactions with improved styling and memoization */}
      {groupedReactions
        .filter(group => group.count > 0)
        .map(group => (
          <MemoizedReactionButton
            key={group.emoji}
            group={group}
            onClick={handleReactionClickSync}
            loading={loading}
            sizeClasses={sizeClasses[size]}
            showCount={showCount}
          />
        ))}

      {/* Enhanced Add reaction button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            disabled={loading}
            className={`group inline-flex items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-white text-gray-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 hover:scale-105 active:scale-95 ${sizeClasses[size]} dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300`}
            aria-label="Add reaction"
          >
            <Smile className="h-4 w-4 transition-transform group-hover:scale-110" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          ref={popoverRef}
          className="w-80 p-0 border-0 shadow-2xl bg-white dark:bg-gray-900 rounded-xl overflow-hidden"
          align="start"
          side="top"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Add Reaction</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Primary reactions */}
          <div className="p-4">
            <div className="grid grid-cols-6 gap-2">
              {PRIMARY_REACTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    void handleReactionClick(emoji);
                  }}
                  disabled={loading}
                  className={`group ${buttonSizeClasses[size]} flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    userReactions.has(emoji)
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 ring-2 ring-blue-500'
                      : 'hover:shadow-md'
                  }`}
                  aria-label={`React with ${emoji}`}
                >
                  <span className="text-lg transition-transform group-hover:scale-110">
                    {emoji}
                  </span>
                </button>
              ))}
            </div>

            {/* Show more reactions button */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAllReactions(!showAllReactions)}
                className="w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {showAllReactions ? 'Show less' : 'Show more reactions'}
              </button>
            </div>

            {/* Secondary reactions (collapsible) */}
            {showAllReactions && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-8 gap-2">
                  {SECONDARY_REACTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        void handleReactionClick(emoji);
                      }}
                      disabled={loading}
                      className={`group ${buttonSizeClasses[size]} flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        userReactions.has(emoji)
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 ring-2 ring-blue-500'
                          : 'hover:shadow-md'
                      }`}
                      aria-label={`React with ${emoji}`}
                    >
                      <span className="text-lg transition-transform group-hover:scale-110">
                        {emoji}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recently used section */}
            {groupedReactions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Recently Used
                </h4>
                <div className="flex flex-wrap gap-1">
                  {groupedReactions.slice(0, 6).map(group => (
                    <button
                      key={group.emoji}
                      onClick={() => {
                        void handleReactionClick(group.emoji);
                      }}
                      disabled={loading}
                      className={`group p-1.5 rounded-lg transition-all duration-200 hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        group.hasUserReacted
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300'
                          : ''
                      }`}
                      aria-label={`React with ${group.emoji}`}
                    >
                      <span className="text-lg transition-transform group-hover:scale-110">
                        {group.emoji}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});
