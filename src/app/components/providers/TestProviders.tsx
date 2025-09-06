'use client';

import { ThemeProvider } from 'next-themes';
import { Suspense } from 'react';

import type { IClientProvidersProps } from '@/types';

/**
 * Test-specific providers that disable Clerk authentication
 * This prevents Clerk provider errors during E2E tests
 */
export function TestProviders({ children }: IClientProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <Suspense fallback={<>{children}</>}>
        {/* No ClerkProvider wrapper - this prevents Clerk errors during tests */}
        {children}
      </Suspense>
    </ThemeProvider>
  );
}
