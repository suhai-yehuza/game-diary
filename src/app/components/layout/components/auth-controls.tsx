'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import React, { useState, useEffect, Suspense } from 'react';

import { ClerkWrapper } from '@/app/components/common/clerk-error-boundary';
import { isUnitTestEnvironment, isE2ETestEnvironment } from '@/lib/config/api.config';

// Utility function to check if Clerk is configured
function isClerkConfigured(): boolean {
  // In E2E test environments, always return true to ensure consistent behavior
  if (
    process.env.E2E_MOCK_MODE === 'true' ||
    process.env.GITHUB_ACTIONS === 'true' ||
    process.env.PLAYWRIGHT_CI === 'true'
  ) {
    return true;
  }

  // Check for Clerk environment variable
  return !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
}

function AuthControlsContent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial client render, render a consistent placeholder
  if (!mounted) {
    return (
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex items-center justify-center">
          <span className="text-xs text-gray-500">Auth</span>
        </div>
      </div>
    );
  }

  // Always render the test sign-in button for unit tests only, not for E2E tests
  if (isUnitTestEnvironment && !isE2ETestEnvironment) {
    return (
      <div className="flex items-center">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => {
            // Mock sign-in for unit tests
            console.log('Mock sign-in clicked');
          }}
        >
          Sign In (Test)
        </button>
      </div>
    );
  }

  // Check if Clerk is configured
  if (!isClerkConfigured()) {
    return (
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex items-center justify-center">
          <span className="text-xs text-gray-500">Auth</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <ClerkWrapper>
        <SignedOut>
          <SignInButton mode="modal">
            <button
              data-testid="sign-in-button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </ClerkWrapper>
    </div>
  );
}

export function ClientOnlyAuthControls() {
  return (
    <Suspense
      fallback={<div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />}
    >
      <AuthControlsContent />
    </Suspense>
  );
}
