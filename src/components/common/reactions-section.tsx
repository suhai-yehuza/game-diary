import { useQuery } from '@apollo/client';
import React from 'react';

import { ReactionDisplay } from '@/components/common/reaction-display';
import { GET_REACTIONS } from '@/lib/graphql/queries';

interface ReactionsSectionProps {
  target_id: string;
  target_type: string;
}

export function ReactionsSection({ target_id, target_type }: ReactionsSectionProps) {
  const { data, loading, error } = useQuery(GET_REACTIONS, {
    variables: { targetId: target_id },
    fetchPolicy: 'cache-and-network',
  });

  if (loading && !data) return null;
  if (error) {
    console.error('Error loading reactions:', error);
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <ReactionDisplay targetId={target_id} targetType={target_type} />
    </div>
  );
}
