import React from 'react';

import { ReactionDisplay } from '@src/components/common/reaction-display';
import type { ReactionsSectionProps } from '@src/lib/types/component.types';
import { cn } from '@src/lib/utils';

export function ReactionsSection({
  targetId,
  targetType,
  reactions,
  totalReactionCount,
  onReactionChange,
  className,
}: ReactionsSectionProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-1 rounded-lg transition-all duration-200',
        'hover:bg-muted/30',
        className
      )}
    >
      <ReactionDisplay
        targetId={targetId}
        targetType={targetType}
        reactions={reactions}
        totalReactionCount={totalReactionCount}
        onReactionChange={onReactionChange}
      />
    </div>
  );
}
