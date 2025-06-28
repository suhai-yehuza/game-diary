'use client';

import { useUser } from '@clerk/nextjs';
import React from 'react';

export function AllSportsPage() {
  const { isLoaded, isSignedIn, user } = useUser();

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">All Sports</h1>
          <p className="text-gray-600">
            Explore live games and statistics across all major sports leagues.
          </p>
        </div>
        {isLoaded && isSignedIn ? (
          <p className="mt-4">You are logged in as {user.firstName}</p>
        ) : (
          <p className="mt-4">You are not logged in</p>
        )}
      </div>
    </section>
  );
}
export default AllSportsPage;
