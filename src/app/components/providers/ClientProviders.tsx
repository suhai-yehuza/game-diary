'use client';

import { ThemeProvider } from 'next-themes';
import { Suspense } from 'react';

import { ClerkProviderWrapper } from '@/app/components/providers/ClerkProvider';
import { MenuProvider } from '@/app/components/providers/MenuContext';
import type { IClientProvidersProps } from '@/lib/types/component.types';

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
