'use client';

import { ClerkProvider } from '@clerk/nextjs';
import type { ReactNode } from 'react';

export function ClerkProviderWrapper({ children }: { children: ReactNode }) {
  // Check if we should bypass Clerk (mock mode, test environment, etc.)
  const shouldBypassClerk =
    process.env.NODE_ENV === 'test' ||
    process.env.MOCK_MODE === 'true' ||
    process.env.E2E_AUTH_BYPASS === 'true' ||
    process.env.PLAYWRIGHT_TEST === 'true' ||
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // If we should bypass Clerk, just return children without the provider
  if (shouldBypassClerk) {
    console.log('[CLERK BYPASS] Skipping ClerkProvider in mock/test mode');
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'bg-brand-primary hover:bg-brand-primary-hover text-theme-inverse',
          card: 'bg-white shadow-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-600',
          headerTitle: 'text-gray-900 dark:text-white',
          headerSubtitle: 'text-gray-600 dark:text-gray-300',
          socialButtonsBlockButton:
            'bg-white dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-500 dark:hover:border-gray-500',
          socialButtonsBlockButtonText: 'font-medium',
          formFieldLabel: 'text-gray-700 dark:text-gray-200',
          formFieldInput:
            'border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
          footerActionLink: 'text-black hover:text-gray-700',
          alternativeMethodsBlockButton:
            'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white',
          alternativeMethodsBlockButtonText:
            'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white',
          formFieldAction:
            'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white',
          formFieldActionText:
            'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white',
          identityPreviewText: 'text-gray-900 dark:text-white',
          identityPreviewEditButton:
            'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white',
          formFieldActionLink: 'text-black hover:text-gray-700',
          formFieldActionLinkText: 'text-black hover:text-gray-700',
        },
        variables: {
          colorPrimary: 'hsl(221, 83%, 53%)',
          colorText: '#1f2937', // Dark gray for light mode
          colorTextSecondary: '#6b7280', // Medium gray for light mode
          colorDanger: 'hsl(0, 84%, 60%)',
          colorSuccess: 'hsl(142, 76%, 36%)',
          colorWarning: 'hsl(38, 92%, 50%)',
          colorNeutral: '#9ca3af', // Light gray for light mode
          colorBackground: '#ffffff', // White background for light mode
          colorInputBackground: '#ffffff', // White input background for light mode
          colorInputText: '#1f2937', // Dark text for inputs in light mode
        },
      }}
      // Add proper configuration for SSO callbacks
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      {children}
    </ClerkProvider>
  );
}
