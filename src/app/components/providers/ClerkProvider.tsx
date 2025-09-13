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
          card: 'bg-surface-card shadow-lg border border-theme-primary',
          headerTitle: 'text-theme-primary',
          headerSubtitle: 'text-theme-secondary',
          socialButtonsBlockButton:
            'bg-surface-card border border-theme-primary hover:bg-bg-theme-secondary',
          socialButtonsBlockButtonText: 'text-theme-primary',
          formFieldLabel: 'text-theme-primary',
          formFieldInput:
            'border border-theme-primary rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary bg-surface-card text-theme-primary',
          footerActionLink: 'text-brand-primary hover:text-brand-primary-hover',
          alternativeMethodsBlockButton: 'text-theme-primary hover:text-theme-secondary',
          alternativeMethodsBlockButtonText: 'text-theme-primary hover:text-theme-secondary',
          formFieldAction: 'text-theme-primary hover:text-theme-secondary',
          formFieldActionText: 'text-theme-primary hover:text-theme-secondary',
          identityPreviewText: 'text-theme-primary',
          identityPreviewEditButton: 'text-theme-primary hover:text-theme-secondary',
          formFieldActionLink: 'text-theme-primary hover:text-theme-secondary',
          formFieldActionLinkText: 'text-theme-primary hover:text-theme-secondary',
        },
        variables: {
          colorPrimary: 'hsl(221, 83%, 53%)',
          colorText: 'var(--color-text-primary)',
          colorTextSecondary: 'var(--color-text-secondary)',
          colorDanger: 'hsl(0, 84%, 60%)',
          colorSuccess: 'hsl(142, 76%, 36%)',
          colorWarning: 'hsl(38, 92%, 50%)',
          colorNeutral: 'var(--color-text-muted)',
        },
      }}
      // Add proper configuration for SSO callbacks
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      {children}
    </ClerkProvider>
  );
}
