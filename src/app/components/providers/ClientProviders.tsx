'use client';

import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from 'next-themes';
import { Suspense } from 'react';
import { Toaster } from 'sonner';

import { ClerkProviderWrapper } from '@/app/components/providers/ClerkProvider';
import { MenuProvider } from '@/app/components/providers/MenuContext';
import { apolloClient } from '@/lib/apollo-client';
import type { IClientProvidersProps } from '@/lib/types';

export function ClientProviders({ children }: IClientProvidersProps) {
  return (
    <ApolloProvider client={apolloClient}>
      <MenuProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<>{children}</>}>
            <ClerkProviderWrapper>{children}</ClerkProviderWrapper>
          </Suspense>
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={10000}
            expand={true}
            theme="dark"
          />
        </ThemeProvider>
      </MenuProvider>
    </ApolloProvider>
  );
}
