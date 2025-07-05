'use client';

import React from 'react';

// Utility to check if we're in E2E test mode
export const isE2ETest = process.env.E2E_TESTING === 'true';

// Test-safe versions of Clerk components
export function TestSafeSignedIn({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  if (isE2ETest) {
    return <>{children}</>; // In test mode, always render children
  }

  // In non-test mode, render fallback or children
  return <>{fallback ?? children}</>;
}

export function TestSafeSignedOut({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  if (isE2ETest) {
    return <>{fallback ?? children}</>; // In test mode, render fallback or children
  }

  // In non-test mode, render fallback or children
  return <>{fallback ?? children}</>;
}

// Test-safe hook for useUser
export function useTestSafeUser() {
  if (isE2ETest) {
    // In test mode, provide mock user data
    return {
      user: {
        firstName: 'Test',
        lastName: 'User',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
      },
      isLoaded: true,
    };
  }

  // In non-test mode, return null user
  return {
    user: null,
    isLoaded: true,
  };
}

// Test-safe hook for useAuth
export function useTestSafeAuth() {
  if (isE2ETest) {
    // In test mode, provide mock auth data
    return {
      isLoaded: true,
      isSignedIn: false,
      userId: null,
    };
  }

  // In non-test mode, return default auth data
  return {
    isLoaded: true,
    isSignedIn: false,
    userId: null,
  };
}
