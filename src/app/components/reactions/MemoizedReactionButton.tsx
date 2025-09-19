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
      className={`group inline-flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${sizeClasses} ${
        group.hasUserReacted
          ? 'text-brand-primary'
          : 'text-theme-primary hover:text-theme-secondary'
      }`}
      aria-label={`React with ${formatReactionCountWithEmoji(group.count, getEmojiName(group.emoji))}`}
    >
      <span className="text-base transition-transform group-hover:scale-110">{group.emoji}</span>
      {showCount && group.count > 0 && (
        <span className="font-medium text-xs text-theme-primary min-w-[1.25rem] text-center">
          {formatReactionCount(group.count)}
        </span>
      )}
    </button>
  );
});
