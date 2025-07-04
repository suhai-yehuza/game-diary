'use client';

import { useUser } from '@clerk/nextjs';
import React from 'react';

export default function MLBPage() {
  // Safely use useUser with fallback values
  let userData: { isLoaded: boolean; isSignedIn: boolean; user: { firstName?: string } | null } = {
    isLoaded: false,
    isSignedIn: false,
    user: null,
  };

  try {
    userData = (
      useUser as () => {
        isLoaded: boolean;
        isSignedIn: boolean;
        user: { firstName?: string } | null;
      }
    )();
  } catch (error) {
    // Fallback values if useUser is not available (e.g., ClerkProvider not ready)
    console.warn('useUser not available, using fallback values:', error);
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl font-bold">This will be the MLB page</h1>
        {userData.isLoaded && userData.isSignedIn ? (
          <p className="mt-4">You are logged in as {userData.user?.firstName}</p>
        ) : (
          <p className="mt-4">You are not logged in</p>
        )}
      </div>
    </section>
  );
}

export function MLBSportsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">MLB</h1>
        <p className="text-muted-foreground">Major League Baseball games and statistics.</p>
      </div>
    </div>
  );
}
