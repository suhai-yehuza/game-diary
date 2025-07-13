'use client';

import { ThemeProvider } from 'next-themes';
import { Suspense } from 'react';

import { ClerkProviderWrapper } from '@/app/components/providers/clerk-provider';
import { MenuProvider } from '@/app/components/providers/menu-context';
import type { IClientProvidersProps } from '@/lib/types/componentTypes';

export function ClientProviders({ children }: IClientProvidersProps) {
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
