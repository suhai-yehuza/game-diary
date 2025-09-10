import { Heart } from 'lucide-react';

import type { IReactionCountProps } from '@/types';

export function ReactionCount({ count = 0, className, size = 'md' }: IReactionCountProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base',
  };

  if (count === 0) {
    return null;
  }

  return (
    <div
      className={`group inline-flex items-center gap-1.5 rounded-full border-2 border-pink-200 bg-pink-50 text-pink-500 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-pink-300 hover:bg-pink-100 hover:text-pink-600 dark:border-pink-300 dark:bg-pink-100 dark:text-pink-500 dark:hover:border-pink-400 dark:hover:bg-pink-200 dark:hover:text-pink-600 ${sizeClasses[size]} ${className || ''}`}
    >
      <Heart className="h-3 w-3 fill-current transition-transform group-hover:scale-110" />
      <span className="font-semibold">{count}</span>
    </div>
  );
}
