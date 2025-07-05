'use client';

import { SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import React from 'react';

export default function LiveGamesPage() {
  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl font-bold">This will be the Live Games page</h1>
        <SignedIn>
          <UserGreeting />
        </SignedIn>
        <SignedOut>
          <p className="mt-4">You are not logged in</p>
        </SignedOut>
      </div>
    </section>
  );
}

function UserGreeting() {
  const { user } = useUser();
  return <p className="mt-4">You are logged in as {user?.firstName}</p>;
}

export function LiveSportsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">Live Sports</h1>
        <p className="text-muted-foreground">Watch live games and updates.</p>
      </div>
    </div>
  );
}
