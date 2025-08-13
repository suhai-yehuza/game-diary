'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import React, { useState, useEffect, Suspense } from 'react';

import { ClerkWrapper } from '@/app/components/common/ClerkErrorBoundary';
import { isUnitTestEnvironment, isE2ETestEnvironment } from '@/lib/config/app.config';
import { logE2E } from '@/lib/utils/logger';
import { isSSOCallback } from '@/lib/utils/sso-utils';

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
  const [isSSO, setIsSSO] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsSSO(isSSOCallback());
  }, []);

  // Add E2E debug logging
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'test') {
      // Try to log Clerk user state if available
      try {
        const win = window as Window & { Clerk?: unknown };
        const maybeClerk = win.Clerk;
        if (
          maybeClerk &&
          typeof maybeClerk === 'object' &&
          'user' in maybeClerk &&
          typeof (maybeClerk as { user?: unknown }).user === 'object'
        ) {
          logE2E('Clerk user found', { user: (maybeClerk as { user: unknown }).user });
        } else {
          logE2E('Clerk user not found');
        }
      } catch (e) {
        logE2E('Clerk user logging error', { error: e });
      }
    }
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

  // During SSO callback, show a loading state to prevent useSession errors
  if (isSSO) {
    return (
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex items-center justify-center">
          <span className="text-xs text-gray-500">SSO</span>
        </div>
      </div>
    );
  }

  // Always render the test sign-in button for unit tests only, not for E2E tests
  if (isUnitTestEnvironment && !isE2ETestEnvironment) {
    return (
      <div className="flex items-center">
        <button
          className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Sign In (Test)"
          onClick={() => {
            // Mock sign-in for unit tests
            logE2E('Mock sign-in clicked');
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
        <div
          data-testid="auth-placeholder"
          className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex items-center justify-center"
        >
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
            <div
              data-testid="sign-in-button"
              className="px-4 py-2 bg-blue-800 text-white rounded-lg shadow-md hover:bg-blue-900 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label="Sign In"
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.currentTarget.click();
                }
              }}
            >
              Sign In
            </div>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton data-testid="user-button" />
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
