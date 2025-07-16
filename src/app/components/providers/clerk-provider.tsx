'use client';

import { ClerkProvider, useUser, useAuth } from '@clerk/nextjs';
import type { ReactNode } from 'react';

import { getClerkAppearance } from '@/lib/config/clerk-theme';
import {
  LOCALHOST_URLS,
  PRODUCTION_DOMAINS,
  VERCEL_PREVIEW_URLS,
  VERCEL_MAIN_URL,
  VERCEL_BASE_URL,
} from '@/lib/config/urls';

export { ClerkProvider, useUser, useAuth };

export function ClerkProviderWrapper({ children }: { children: ReactNode }) {
  // Check if Clerk is properly configured
  const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!isClerkConfigured) {
    console.warn('Clerk is not configured. Authentication features will be disabled.');
    return <>{children}</>;
  }

  // Generate comprehensive list of allowed origins
  const generateAllowedOrigins = () => {
    // Parse environment variable for allowed origins
    const envOrigins = process.env.NEXT_PUBLIC_CLERK_ALLOWED_REDIRECT_ORIGINS
      ? process.env.NEXT_PUBLIC_CLERK_ALLOWED_REDIRECT_ORIGINS.split(',').map(origin =>
          origin.trim()
        )
      : [LOCALHOST_URLS[0], ...PRODUCTION_DOMAINS];

    // Fallback origins if environment variable is not set
    const fallbackOrigins = [
      // LocalDevelopment
      ...LOCALHOST_URLS,

      // Production (custom domain)
      ...PRODUCTION_DOMAINS,

      // Production (Vercel default)
      VERCEL_MAIN_URL,

      // Preview & Staging (Vercel)
      VERCEL_BASE_URL,
    ];

    // Additional environment variables (if set)
    const additionalEnvOrigins = [process.env.NEXT_PUBLIC_APP_URL, process.env.VERCEL_URL].filter(
      (origin): origin is string => Boolean(origin)
    );

    // Combine all origins and remove duplicates
    const allOrigins = [
      ...envOrigins,
      ...(envOrigins.length === 0 ? fallbackOrigins : []), // Only use fallback if env var is empty
      ...additionalEnvOrigins,
      ...VERCEL_PREVIEW_URLS,
    ];

    // Remove duplicates while preserving order
    const uniqueOrigins = [...new Set(allOrigins)];

    return uniqueOrigins;
  };

  const allowedOrigins = generateAllowedOrigins();

  return (
    <ClerkProvider
      appearance={getClerkAppearance()}
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? '/sign-in'}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? '/sign-up'}
      signInFallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ?? '/'}
      signUpFallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ?? '/'}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      allowedRedirectOrigins={allowedOrigins}
    >
      {children}
    </ClerkProvider>
  );
}
