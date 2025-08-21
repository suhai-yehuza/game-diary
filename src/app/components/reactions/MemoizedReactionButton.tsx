import { memo } from 'react';

import type { IReactionGroup } from '@/lib/types';
import {
  formatReactionCount,
  formatReactionCountWithEmoji,
  getEmojiName,
} from '@/lib/utils/formatReactionCount';

interface IMemoizedReactionButtonProps {
  group: IReactionGroup;
  onClick: (emoji: string) => void;
  loading: boolean;
  sizeClasses: string;
  showCount: boolean;
}

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
      className={`group inline-flex items-center gap-1.5 rounded-full border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${sizeClasses} ${
        group.hasUserReacted
          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700'
      }`}
      aria-label={`React with ${formatReactionCountWithEmoji(group.count, getEmojiName(group.emoji))}`}
    >
      <span className="text-lg transition-transform group-hover:scale-110">{group.emoji}</span>
      {showCount && group.count > 0 && (
        <span className="font-semibold text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full text-gray-900 dark:text-white">
          {formatReactionCount(group.count)}
        </span>
      )}
    </button>
  );
});
