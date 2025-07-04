'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import React from 'react';

export default function ProtectedClientPage() {
  // Safely use useUser with fallback values
  let userData: { user: { firstName?: string } | null } = { user: null };

  try {
    userData = (useUser as () => { user: { firstName?: string } | null })();
  } catch (error) {
    // Fallback values if useUser is not available (e.g., ClerkProvider not ready)
    console.warn('useUser not available, using fallback values:', error);
  }

  // Safely use useAuth with fallback values
  let authData: {
    isLoaded: boolean;
    isSignedIn: boolean;
    userId: string;
    sessionId: string;
    getToken: () => Promise<string | null>;
  } = {
    isLoaded: false,
    isSignedIn: false,
    userId: '',
    sessionId: '',
    getToken: () => Promise.resolve(null),
  };

  try {
    authData = (
      useAuth as () => {
        isLoaded: boolean;
        isSignedIn: boolean;
        userId: string;
        sessionId: string;
        getToken: () => Promise<string | null>;
      }
    )();
  } catch (error) {
    // Fallback values if useAuth is not available (e.g., ClerkProvider not ready)
    console.warn('useAuth not available, using fallback values:', error);
  }

  if (!authData.isLoaded || !authData.isSignedIn) {
    return null;
  }

  return (
    <section className="py-24">
      <div className="container">
        <h1 className="text-3xl font-bold">This is a client-side page</h1>
        <p className="mt-4">You are logged in as {userData.user?.firstName}</p>
        <p>UserId: {authData.userId}</p>
        <p>SessionId: {authData.sessionId}</p>
        <p>Token: {authData.getToken()}</p>
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
