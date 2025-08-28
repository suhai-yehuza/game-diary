import { memo } from 'react';

import type { IReactionGroup as _IReactionGroup, IMemoizedReactionButtonProps } from '@/lib/types';
import {
  formatReactionCount,
  formatReactionCountWithEmoji,
  getEmojiName,
} from '@/lib/utils/formatReactionCount';

// Interface moved to src/lib/types/components.types.ts

export const MemoizedReactionButton = memo(function MemoizedReactionButton({
  group,
  onClick,
  loading,
  sizeClasses,
  showCount,
}: IMemoizedReactionButtonProps) {
  return (
    <button
      key={group.emoji}
      onClick={() => onClick(group.emoji)}
      disabled={loading}
      className={`group inline-flex items-center gap-2 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${sizeClasses} ${
        group.hasUserReacted
          ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100 dark:border-blue-300 dark:bg-blue-50 dark:text-blue-700 dark:ring-blue-200'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm dark:border-gray-300 dark:bg-white dark:text-gray-700 dark:hover:border-gray-400 dark:hover:bg-gray-50'
      }`}
      aria-label={`React with ${formatReactionCountWithEmoji(group.count, getEmojiName(group.emoji))}`}
    >
      <span className="text-base transition-transform group-hover:scale-110">{group.emoji}</span>
      {showCount && group.count > 0 && (
        <span className="font-medium text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
          {formatReactionCount(group.count)}
        </span>
      )}
    </button>
  );
});
