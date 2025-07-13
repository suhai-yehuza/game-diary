'use client';

import { ClerkProvider, useUser as realUseUser, useAuth as realUseAuth } from '@clerk/nextjs';
import type { ReactNode } from 'react';
import { Suspense, createContext, useContext } from 'react';

import type { IClerkProviderWrapperProps, ITestClerkMock } from '@src/lib/types';

// E2E Test Clerk Context
const TestClerkContext = createContext<ITestClerkMock>({
  useUser: () => ({ isLoaded: false, isSignedIn: undefined, user: undefined }),
  useAuth: () => ({ isLoaded: false, isSignedIn: undefined }),
});

function TestClerkProvider({ children }: { children: ReactNode }) {
  const win = typeof window !== 'undefined' ? (window as unknown) : undefined;
  const maybeMock = win && (win as { __clerkMock?: unknown }).__clerkMock;
  // Only use the mock if it has both useUser and useAuth
  const mock =
    maybeMock && typeof maybeMock === 'object' && 'useUser' in maybeMock && 'useAuth' in maybeMock
      ? (maybeMock as ITestClerkMock)
      : undefined;

  // Provide a default mock object with the required properties
  const defaultMock: ITestClerkMock = {
    useUser: () => ({ isLoaded: false, isSignedIn: undefined, user: undefined }),
    useAuth: () => ({ isLoaded: false, isSignedIn: undefined }),
  };

  return (
    <TestClerkContext.Provider value={mock ?? defaultMock}>{children}</TestClerkContext.Provider>
  );
}

// Custom hooks that use the mock context
export function useUser() {
  const context = useContext(TestClerkContext);
  if (!context || typeof context.useUser !== 'function') {
    return realUseUser();
  }
  try {
    return context.useUser();
  } catch {
    // Fallback to real useUser if mock fails
    return realUseUser();
  }
}

export function useAuth() {
  const context = useContext(TestClerkContext);
  if (!context || typeof context.useAuth !== 'function') {
    return realUseAuth();
  }
  try {
    return context.useAuth();
  } catch {
    // Fallback to real useAuth if mock fails
    return realUseAuth();
  }
}

export function ClerkProviderWrapper({ children }: IClerkProviderWrapperProps) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    console.warn('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set');
    return <>{children}</>;
  }

  const win = typeof window !== 'undefined' ? (window as unknown) : undefined;
  if (win && (win as { __E2E_AUTH_BYPASS__?: boolean }).__E2E_AUTH_BYPASS__) {
    return <TestClerkProvider>{children}</TestClerkProvider>;
  }

  return (
    <Suspense fallback={<>{children}</>}>
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        appearance={{
          elements: {
            formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
            card: 'bg-background border border-border',
            headerTitle: 'text-foreground',
            headerSubtitle: 'text-muted-foreground',
            socialButtonsBlockButton:
              'bg-background border border-border text-foreground hover:bg-accent',
            socialButtonsBlockButtonText: 'text-foreground',
            formFieldLabel: 'text-foreground',
            formFieldInput: 'bg-background border border-border text-foreground',
            footerActionLink: 'text-primary hover:text-primary/90',
          },
        }}
      >
        {children}
      </ClerkProvider>
    </Suspense>
  );
}
