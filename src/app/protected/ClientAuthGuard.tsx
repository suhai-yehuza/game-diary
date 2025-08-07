'use client';
import { useUser } from '@clerk/nextjs';
import React from 'react';

import SignInModalTrigger from '@/app/components/auth/SignInModalTrigger';

export default function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  // Handle case where Clerk is not configured (e.g., during SSR or in test environment)
  let isLoaded = false;
  let isSignedIn = false;

  try {
    const userData = useUser();
    isLoaded = userData.isLoaded;
    isSignedIn = userData.isSignedIn ?? false;
  } catch {
    // Clerk is not configured (e.g., during SSR or in test environment)
    console.log('Clerk not configured, using fallback auth data');
    isLoaded = true;
    isSignedIn = false;
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <SignInModalTrigger autoTrigger={true} />
        <div className="text-center mt-8">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="mb-6 text-muted-foreground">You must be signed in to view this page.</p>
        </div>
      </div>
    );
  }

  return children;
}
