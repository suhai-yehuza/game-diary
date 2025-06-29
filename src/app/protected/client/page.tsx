'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import React from 'react';

export function ProtectedClientPage() {
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

export function ClientPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">Client Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your client dashboard.</p>
      </div>
    </div>
  );
}
