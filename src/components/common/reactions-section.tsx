import { useQuery } from '@apollo/client';
import React from 'react';

import { ReactionDisplay } from '@/components/common/reaction-display';
import { GET_REACTIONS } from '@/lib/graphql/queries';

interface ReactionsSectionProps {
  targetId: string;
  targetType: string;
}

export function ReactionsSection({ targetId, targetType }: ReactionsSectionProps) {
  const { data, loading, error } = useQuery(GET_REACTIONS, {
    variables: { targetId: targetId },
    fetchPolicy: 'cache-and-network',
  });

  if (loading && !data) return null;
  if (error) {
    console.error('Error loading reactions:', error);
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <ReactionDisplay targetId={targetId} targetType={targetType} />
    </div>
  );
}
