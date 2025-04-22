'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';

export default function Page() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl font-bold">This will be the All Sports page</h1>
        <p className="mt-4">You are logged in as {user?.firstName}</p>
      </div>
    </section>
  );
}
