'use client';

import { useUser } from '@clerk/nextjs';
import React from 'react';

export function MLBPage() {
  const { isLoaded, isSignedIn, user } = useUser();

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl font-bold">This will be the MLB page</h1>
        {isLoaded && isSignedIn ? (
          <p className="mt-4">You are logged in as {user.firstName}</p>
        ) : (
          <p className="mt-4">You are not logged in</p>
        )}
      </div>
    </section>
  );
}
export default MLBPage;
