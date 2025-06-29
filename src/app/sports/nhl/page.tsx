'use client';

import { useUser } from '@clerk/nextjs';
import React from 'react';

export function NHLPage() {
  const { isLoaded, isSignedIn, user } = useUser();

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl font-bold">This will be the NHL page</h1>
        {isLoaded && isSignedIn ? (
          <p className="mt-4">You are logged in as {user.firstName}</p>
        ) : (
          <p className="mt-4">You are not logged in</p>
        )}
      </div>
    </section>
  );
}

export function NHLSportsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">NHL</h1>
        <p className="text-muted-foreground">National Hockey League games and statistics.</p>
      </div>
    </div>
  );
}
