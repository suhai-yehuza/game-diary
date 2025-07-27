'use client';

import { useUser } from '@clerk/nextjs';
import React from 'react';

// TODO: Implement friends interface and functionality

export function FriendsTable() {
  const { user } = useUser();

  if (!user?.id) {
    return (
      <div className="rounded-lg border p-6 bg-background">
        <div className="text-center text-muted-foreground">
          Please sign in to view your friends.
        </div>
      </div>
    );
  }

  // TODO: Implement friends functionality with search and sort
  return (
    <div className="rounded-lg border p-6 bg-background">
      <h2 className="text-2xl font-semibold mb-4">Friends</h2>
      <p className="text-muted-foreground mb-4">View and manage your friends list.</p>
      <div className="text-center py-8 text-muted-foreground">
        <p>Friends functionality coming soon!</p>
        <p className="text-sm mt-2">This will include search, filter, and sort capabilities.</p>
      </div>
    </div>
  );
}
