'use client';

import React from 'react';

import { TestSafeSignedIn, TestSafeSignedOut, useTestSafeUser } from '@/lib/utils/clerk-test-utils';

export default function LiveGamesPage() {
  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl font-bold">This will be the Live Games page</h1>
        <TestSafeSignedIn>
          <UserGreeting />
        </TestSafeSignedIn>
        <TestSafeSignedOut>
          <p className="mt-4">You are not logged in</p>
        </TestSafeSignedOut>
      </div>
    </section>
  );
}

function UserGreeting() {
  const { user } = useTestSafeUser();
  return <p>Welcome, {user?.firstName ?? 'User'}!</p>;
}
