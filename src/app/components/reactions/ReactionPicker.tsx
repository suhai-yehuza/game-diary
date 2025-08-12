import { Smile, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/Popover';
import { useReactions } from '@/hooks/use-reactions';
import type { IReactionPickerProps } from '@/lib/types';

// Emoji categories for better organization
const EMOJI_CATEGORIES = {
  Reactions: ['👍', '👎', '❤️', '😂', '😮', '😢', '😠', '🤔'],
  Sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏌️', '🏆', '🎯'],
  Actions: ['🔥', '💪', '👏', '🚀', '🐐', '💯', '✨', '🎉'],
};

export function ReactionPicker({
  targetId,
  targetType,
  onReactionAdded: _onReactionAdded,
  onReactionRemoved: _onReactionRemoved,
  className,
  size = 'md',
  showCount = true,
}: IReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Reactions');
  const { groupedReactions, userReactions, toggleReaction, loading } = useReactions({
    targetId,
    targetType,
  });
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleReactionClick = async (emoji: string) => {
    await toggleReaction(emoji);
    // Don't close immediately for better UX - let user see the reaction being added
    // Check if window is available (for SSR/test environments)
    if (typeof window !== 'undefined') {
      setTimeout(() => setIsOpen(false), 300);
    } else {
      // In SSR/test environments, close immediately
      setIsOpen(false);
    }
  };

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

  return (
    <div className={`flex flex-wrap gap-1.5 ${className || ''}`} data-testid="reaction-picker">
      {/* Existing reactions with improved styling */}
      {groupedReactions
        .filter(group => group.count > 0)
        .map(group => (
          <button
            key={group.emoji}
            onClick={() => {
              void handleReactionClick(group.emoji);
            }}
            disabled={loading}
            className={`group inline-flex items-center gap-1.5 rounded-full border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${sizeClasses[size]} ${
              group.hasUserReacted
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700'
            }`}
            aria-label={`React with ${group.emoji} (${group.count})`}
          >
            <span className="text-lg transition-transform group-hover:scale-110">
              {group.emoji}
            </span>
            {showCount && group.count > 0 && (
              <span className="font-semibold text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full text-gray-900 dark:text-white">
                {group.count}
              </span>
            )}
          </button>
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

          {/* Category tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {Object.keys(EMOJI_CATEGORIES).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          <div className="p-4">
            <div className="grid grid-cols-8 gap-2">
              {EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES].map(emoji => (
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
}
