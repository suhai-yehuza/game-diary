'use client';

import { ThemeProvider } from 'next-themes';
import { Suspense } from 'react';

import { ClerkProviderWrapper } from '@/app/components/providers/clerk-provider';
import { MenuProvider } from '@/app/components/providers/menu-context';
import { isE2ETestEnvironment } from '@/lib/config/api.config';
import type { IClientProvidersProps } from '@/lib/types/componentTypes';

export function ClientProviders({ children }: IClientProvidersProps) {
  // For E2E tests, always render ClerkProviderWrapper to prevent useSession errors
  // Use a mock key if the real one is not available
  const shouldRenderClerk =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) || isE2ETestEnvironment;

  if (!shouldRenderClerk) {
    return (
      <MenuProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </MenuProvider>
    );
  }

  return (
    <MenuProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <Suspense fallback={<>{children}</>}>
          <ClerkProviderWrapper>{children}</ClerkProviderWrapper>
        </Suspense>
      </ThemeProvider>
    </MenuProvider>
  );
}
