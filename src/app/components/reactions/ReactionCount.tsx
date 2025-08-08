import { Heart } from 'lucide-react';

import type { IReactionCountProps } from '@/lib/types';

export function ReactionCount({ count = 0, className, size = 'md' }: IReactionCountProps) {
  const sizeClasses = {
    sm: 'p-1 text-xs',
    md: 'p-1.5 text-sm',
    lg: 'p-2 text-base',
  };

  if (count === 0) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 ${sizeClasses[size]} ${className || ''}`}
    >
      <Heart className="h-3 w-3 fill-current" />
      <span className="font-medium">{count}</span>
    </div>
  );
}
