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
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
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
        'group inline-flex items-center gap-2 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        sizeClasses[size],
        hasReacted
          ? 'border-semantic-info bg-semantic-info/10 text-semantic-info shadow-sm ring-1 ring-semantic-info/20'
          : 'border-theme-primary bg-surface-card text-theme-primary hover:border-theme-secondary hover:bg-bg-theme-secondary hover:shadow-sm',
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
        <span className="font-medium text-xs bg-bg-theme-secondary text-theme-primary px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
          {formatReactionCount(count)}
        </span>
      )}
    </button>
  );
});
