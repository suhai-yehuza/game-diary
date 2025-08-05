'use client';

import { ApolloProvider } from '@apollo/client';
import dynamic from 'next/dynamic';
import { ThemeProvider } from 'next-themes';
import { Suspense } from 'react';
import { Toaster } from 'sonner';

import { ClerkProviderWrapper } from '@/app/components/providers/ClerkProvider';
import { MenuProvider } from '@/app/components/providers/MenuContext';
import { NotificationProvider } from '@/app/components/providers/NotificationProvider';
import { apolloClient } from '@/lib/apollo-client';
import type { IClientProvidersProps } from '@/lib/types';

// Dynamically import NotificationOnLogin with SSR disabled to prevent context errors
const NotificationOnLogin = dynamic(
  () =>
    import('@/app/components/common/NotificationOnLogin').then(mod => ({
      default: mod.NotificationOnLogin,
    })),
  {
    ssr: false,
  }
);

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
            <ClerkProviderWrapper>
              <NotificationProvider>
                {children}
                <NotificationOnLogin />
              </NotificationProvider>
            </ClerkProviderWrapper>
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
