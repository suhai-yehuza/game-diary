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
      className={`group inline-flex items-center gap-1.5 rounded-full border-2 border-semantic-error/20 bg-semantic-error/10 text-semantic-error shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-semantic-error/30 hover:bg-semantic-error/20 hover:text-semantic-error ${sizeClasses[size]} ${className || ''}`}
    >
      <Heart className="h-3 w-3 fill-current transition-transform group-hover:scale-110" />
      <span className="font-semibold">{count}</span>
    </div>
  );
}
