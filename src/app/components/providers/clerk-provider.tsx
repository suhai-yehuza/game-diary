'use client';

import { ClerkProvider, useUser, useAuth } from '@clerk/nextjs';
import type { ReactNode } from 'react';

import { getClerkAppearance } from '@/lib/config/clerk-theme';

export { ClerkProvider, useUser, useAuth };

export function ClerkProviderWrapper({ children }: { children: ReactNode }) {
  // Check if Clerk is properly configured
  const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!isClerkConfigured) {
    console.warn('Clerk is not configured. Authentication features will be disabled.');
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      appearance={getClerkAppearance()}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      redirectUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
