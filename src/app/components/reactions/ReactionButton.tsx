import { useState } from 'react';

import type { IReactionButtonProps } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ReactionButton({
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
        'group inline-flex items-center gap-1.5 rounded-full border-2 transition-all duration-200 hover:scale-105 active:scale-95',
        sizeClasses[size],
        hasReacted
          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700',
        isPressed && 'scale-95',
        className
      )}
      aria-label={`React with ${emoji}${showCount ? ` (${count})` : ''}`}
    >
      <span className="text-lg transition-transform group-hover:scale-110">{emoji}</span>
      {showCount && count > 0 && (
        <span className="font-semibold text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}
