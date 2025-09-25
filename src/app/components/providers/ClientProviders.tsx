'use client';

import { ApolloProvider } from '@apollo/client';
import dynamic from 'next/dynamic';
import { ThemeProvider, useTheme } from 'next-themes';
import { Suspense, memo } from 'react';
import { Toaster } from 'sonner';

import { ClerkProviderWrapper } from '@/app/components/providers/ClerkProvider';
import { MenuProvider } from '@/app/components/providers/MenuContext';
import { NotificationProvider } from '@/app/components/providers/NotificationProvider';
import { apolloClient } from '@/lib/apollo-client';
import type { IClientProvidersProps } from '@/types';

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

// Theme-aware Toaster component that properly detects and uses the current theme
const DynamicToaster = memo(() => {
  const { resolvedTheme } = useTheme();

  // Determine the theme for Sonner - it needs explicit 'light' or 'dark'
  const sonnerTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={10000}
      expand={true}
      theme={sonnerTheme}
    />
  );
});

DynamicToaster.displayName = 'DynamicToaster';

// Optimized loading fallback component
const LoadingFallback = memo(() => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
));

LoadingFallback.displayName = 'LoadingFallback';

// Combined core providers to reduce nesting
const CoreProviders = memo(({ children }: { children: React.ReactNode }) => (
  <ApolloProvider client={apolloClient}>
    <ClerkProviderWrapper>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <MenuProvider>{children}</MenuProvider>
      </ThemeProvider>
    </ClerkProviderWrapper>
  </ApolloProvider>
));

CoreProviders.displayName = 'CoreProviders';

// Notification and UI providers (lighter weight)
const NotificationProviders = memo(({ children }: { children: React.ReactNode }) => (
  <NotificationProvider>
    {children}
    <NotificationOnLogin />
  </NotificationProvider>
));

NotificationProviders.displayName = 'NotificationProviders';

// Main optimized providers component
export const OptimizedProviders = memo(({ children }: IClientProvidersProps) => (
  <CoreProviders>
    <Suspense fallback={<LoadingFallback />}>
      <NotificationProviders>{children}</NotificationProviders>
    </Suspense>
    <DynamicToaster />
  </CoreProviders>
));

OptimizedProviders.displayName = 'OptimizedProviders';
