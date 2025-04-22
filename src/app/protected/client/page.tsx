'use client';

import React from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

export default function Page() {
  const { user } = useUser();
  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth();

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <section className="py-24">
      <div className="container">
        <h1 className="text-3xl font-bold">This is a client-side page</h1>
        <p className="mt-4">You are logged in as {user?.firstName}</p>
        <p>UserId: {userId}</p>
        <p>SessionId: {sessionId}</p>
        <p>Token: {getToken()}</p>
      </div>
    </section>
  );
}
