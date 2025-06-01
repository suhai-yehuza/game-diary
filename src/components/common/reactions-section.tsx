import React from 'react';

import { ReactionDisplay } from '@/components/common/reaction-display';
import { Reaction } from '@/lib/types/generated/graphql';

interface ReactionsSectionProps {
  targetId: string;
  targetType: string;
  reactions?: Reaction[];
  totalReactionCount?: number;
  onReactionChange?: () => void;
}

export function ReactionsSection({ targetId, targetType, reactions, totalReactionCount, onReactionChange }: ReactionsSectionProps) {
  return (
    <div className="flex items-center gap-2">
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
