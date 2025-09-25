import { memo } from 'react';

import {
  formatReactionCount,
  formatReactionCountWithEmoji,
  getEmojiName,
} from '@/lib/utils/formatReactionCount';
import type { IReactionGroup as _IReactionGroup, IMemoizedReactionButtonProps } from '@/types';

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
      className={`group inline-flex items-center gap-1.5 px-2 py-1 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${sizeClasses} ${
        group.hasUserReacted
          ? 'bg-gray-700 dark:bg-gray-600 text-white'
          : 'bg-gray-600 dark:bg-gray-700 text-white hover:bg-gray-500 dark:hover:bg-gray-600'
      }`}
      aria-label={`React with ${formatReactionCountWithEmoji(group.count, getEmojiName(group.emoji))}`}
    >
      <span className="text-base transition-transform group-hover:scale-110">{group.emoji}</span>
      {showCount && group.count > 0 && (
        <span className="font-medium text-xs text-current">{formatReactionCount(group.count)}</span>
      )}
    </button>
  );
});
