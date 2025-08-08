import { useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/Popover';
import { useReactions } from '@/hooks/use-reactions';
import type { IReactionDisplayProps } from '@/lib/types';

export function ReactionDisplay({
  targetId,
  targetType,
  onReactionClick,
  className,
  size = 'md',
  showUserNames = false,
  maxReactions = 5,
}: IReactionDisplayProps) {
  const [_isOpen, _setIsOpen] = useState(false);
  const { reactions, groupedReactions, loading } = useReactions({
    targetId,
    targetType,
  });

  const handleReactionClick = (emoji: string) => {
    onReactionClick?.(emoji);
  };

  const sizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  // Get reactions for a specific emoji
  const getReactionsForEmoji = (emoji: string) => {
    return reactions.filter(reaction => reaction.emoji === emoji);
  };

  return (
    <div className={`flex flex-wrap gap-1 ${className || ''}`}>
      {groupedReactions.slice(0, maxReactions).map(group => (
        <Popover key={group.emoji}>
          <PopoverTrigger asChild>
            <button
              onClick={() => handleReactionClick(group.emoji)}
              disabled={loading}
              className={`inline-flex items-center gap-1.5 rounded-full border transition-all duration-150 hover:scale-105 active:scale-95 ${sizeClasses[size]} border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700`}
              aria-label={`${group.count} reactions with ${group.emoji}`}
            >
              <span className="text-lg">{group.emoji}</span>
              <span className="font-medium">{group.count}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{group.emoji}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {group.count} reaction{group.count !== 1 ? 's' : ''}
                </span>
              </div>
              {showUserNames && (
                <div className="space-y-1">
                  {getReactionsForEmoji(group.emoji).map(reaction => (
                    <div
                      key={reaction.id}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                        {reaction.user.first_name?.[0] || reaction.user.username?.[0] || '?'}
                      </span>
                      <span>
                        {reaction.user.first_name && reaction.user.last_name
                          ? `${reaction.user.first_name} ${reaction.user.last_name}`
                          : reaction.user.username || 'Unknown User'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      ))}

      {groupedReactions.length > maxReactions && (
        <span className="text-sm text-gray-500 dark:text-gray-400 self-center">
          +{groupedReactions.length - maxReactions} more
        </span>
      )}
    </div>
  );
}
