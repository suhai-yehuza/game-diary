'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import { Suspense } from 'react';

import { isE2ETestEnvironment } from '@/lib/config/api.config';
import type { IClientProvidersProps } from '@/lib/types/componentTypes';

export function ClientProviders({ children }: IClientProvidersProps) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // For E2E tests, always render ClerkProvider to prevent useSession errors
  // Use a mock key if the real one is not available
  const shouldRenderClerk = Boolean(clerkPublishableKey) || isE2ETestEnvironment;
  const keyToUse = clerkPublishableKey ?? 'pk_test_e2e_mock_key_for_testing_only';

  // If Clerk is not configured and not in E2E test environment, render without ClerkProvider
  if (!shouldRenderClerk) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <Suspense fallback={<>{children}</>}>
        <ClerkProvider
          publishableKey={keyToUse}
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
    </ThemeProvider>
  );
}
