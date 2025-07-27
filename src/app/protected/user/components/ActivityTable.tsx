'use client';

import { useUser } from '@clerk/nextjs';
import React from 'react';

// TODO: Implement activity interface and functionality

export function ActivityTable() {
  const { user } = useUser();

  if (!user?.id) {
    return (
      <div className="rounded-lg border p-6 bg-background">
        <div className="text-center text-muted-foreground">
          Please sign in to view your activity.
        </div>
      </div>
    );
  }

  // TODO: Implement activity functionality with search and sort
  return (
    <div className="rounded-lg border p-6 bg-background">
      <h2 className="text-2xl font-semibold mb-4">Activity & Timeline</h2>
      <p className="text-muted-foreground mb-4">See your recent activities and timeline here.</p>
      <div className="text-center py-8 text-muted-foreground">
        <p>Activity functionality coming soon!</p>
        <p className="text-sm mt-2">This will include search, filter, and sort capabilities.</p>
      </div>
    </div>
  );
}
