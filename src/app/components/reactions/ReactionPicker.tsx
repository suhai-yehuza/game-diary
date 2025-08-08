import { useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/Popover';
import { useReactions, useReactionEmojis } from '@/hooks/use-reactions';
import type { IReactionPickerProps } from '@/lib/types';

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
  const { groupedReactions, userReactions, toggleReaction, loading } = useReactions({
    targetId,
    targetType,
  });
  const availableEmojis = useReactionEmojis();

  const handleReactionClick = async (emoji: string) => {
    await toggleReaction(emoji);
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  return (
    <div className={`flex flex-wrap gap-1 ${className || ''}`}>
      {/* Existing reactions */}
      {groupedReactions.map(group => (
        <button
          key={group.emoji}
          onClick={() => {
            void handleReactionClick(group.emoji);
          }}
          disabled={loading}
          className={`inline-flex items-center gap-1.5 rounded-full border transition-all duration-150 hover:scale-105 active:scale-95 ${sizeClasses[size]} ${
            group.hasUserReacted
              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700'
          }`}
          aria-label={`React with ${group.emoji} (${group.count})`}
        >
          <span className="text-lg">{group.emoji}</span>
          {showCount && group.count > 1 && <span className="font-medium">{group.count}</span>}
        </button>
      ))}

      {/* Add reaction button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            disabled={loading}
            className={`inline-flex items-center justify-center rounded-full border border-dashed border-gray-300 bg-white text-gray-500 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:bg-gray-700 ${sizeClasses[size]}`}
            aria-label="Add reaction"
          >
            <span className="text-lg">+</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-6 gap-1">
            {availableEmojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => {
                  void handleReactionClick(emoji);
                }}
                disabled={loading}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  userReactions.has(emoji)
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300'
                    : ''
                }`}
                aria-label={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
