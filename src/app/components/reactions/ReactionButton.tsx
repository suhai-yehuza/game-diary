import { useState, memo } from 'react';

import { cn } from '@/lib/utils';
import {
  formatReactionCount,
  formatReactionCountWithEmoji,
  getEmojiName,
} from '@/lib/utils/formatReactionCount';
import type { IReactionButtonProps } from '@/types';

export const ReactionButton = memo(function ReactionButton({
  emoji,
  count,
  hasReacted,
  onClick,
  className,
  size = 'md',
  showCount = true,
}: IReactionButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const handleClick = () => {
    setIsPressed(true);
    onClick();
    // Reset pressed state after animation
    setTimeout(() => setIsPressed(false), 150);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'group inline-flex items-center gap-1.5 px-2 py-1 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        sizeClasses[size],
        hasReacted
          ? 'bg-gray-700 dark:bg-gray-600 text-white'
          : 'bg-gray-600 dark:bg-gray-700 text-white hover:bg-gray-500 dark:hover:bg-gray-600',
        isPressed && 'scale-95',
        className
      )}
      aria-label={
        showCount && count > 0
          ? `React with ${formatReactionCountWithEmoji(count, getEmojiName(emoji))}`
          : `React with ${emoji}`
      }
    >
      <span className="text-base transition-transform group-hover:scale-110">{emoji}</span>
      {showCount && count > 0 && (
        <span className="font-medium text-xs text-current">{formatReactionCount(count)}</span>
      )}
    </button>
  );
});
