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
        cssLayerName: 'clerk',
        elements: {
          rootBox: 'clerk',
          modalBackdrop: 'bg-black/60 backdrop-blur-sm',
          card: 'bg-white border border-gray-200 shadow-xl rounded-2xl',
          headerTitle: 'text-gray-900',
          headerSubtitle: 'text-gray-600',
          formFieldLabel: 'text-gray-700',
          formFieldInput:
            'border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary bg-white text-gray-900',
          formButtonPrimary:
            'bg-brand-primary hover:bg-brand-primary-hover text-white rounded-lg px-4 py-2 font-semibold',
          socialButtonsBlockButton:
            'bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm',
          socialButtonsBlockButtonText: 'font-medium text-gray-900',
          footer: 'py-6',
          footerAction: 'py-6',
          footerActionText: 'text-gray-900 hover:text-gray-700 py-6',
          footerActionLink: 'text-gray-900 hover:text-gray-700',
          alternativeMethodsBlockButton: 'text-gray-700 hover:text-gray-900',
          alternativeMethodsBlockButtonText: 'text-gray-700 hover:text-gray-900',
          formFieldAction: 'text-gray-700 hover:text-gray-900',
          formFieldActionText: 'text-gray-700 hover:text-gray-900',
          identityPreviewText: 'text-gray-900',
          identityPreviewEditButton: 'text-gray-700 hover:text-gray-900',
          formFieldActionLink: 'text-gray-900 hover:text-gray-700',
          formFieldActionLinkText: 'text-gray-900 hover:text-gray-700',
        },
        variables: {
          colorPrimary: 'hsl(221, 83%, 53%)',
          colorText: '#1f2937',
          colorTextSecondary: '#6b7280',
          colorDanger: 'hsl(0, 84%, 60%)',
          colorSuccess: 'hsl(142, 76%, 36%)',
          colorWarning: 'hsl(38, 92%, 50%)',
          colorNeutral: '#9ca3af',
          colorBackground: '#ffffff',
          colorInputBackground: '#ffffff',
          colorInputText: '#1f2937',
          colorBorder: '#e5e7eb',
          borderRadius: '12px',
          fontFamily: 'inherit',
          fontSize: '14px',
        },
      }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      {children}
    </ClerkProvider>
  );
}
