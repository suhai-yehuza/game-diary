'use client';

import { ClerkProvider, useUser, useAuth } from '@clerk/nextjs';
import type { ReactNode } from 'react';

import { getClerkAppearance } from '@/lib/config/clerk-theme';

export { ClerkProvider, useUser, useAuth };

export function ClerkProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={getClerkAppearance()}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
