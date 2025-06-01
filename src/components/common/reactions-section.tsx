import React from 'react';

import { ReactionDisplay } from '@/components/common/reaction-display';
import { Reaction } from '@/lib/types/generated/graphql';
import { cn } from '@/lib/utils';

interface ReactionsSectionProps {
  targetId: string;
  targetType: string;
  reactions?: Reaction[];
  totalReactionCount?: number;
  onReactionChange?: () => void;
  className?: string;
}

export function ReactionsSection({ 
  targetId, 
  targetType, 
  reactions, 
  totalReactionCount, 
  onReactionChange,
  className 
}: ReactionsSectionProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 p-1 rounded-lg transition-all duration-200",
      "hover:bg-muted/30",
      className
    )}>
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
