'use client';

import { ClerkProvider } from '@clerk/nextjs';
import type { ReactNode } from 'react';

export function ClerkProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
          card: 'bg-white shadow-lg',
          headerTitle: 'text-gray-900',
          headerSubtitle: 'text-gray-600',
          socialButtonsBlockButton: 'bg-white border border-gray-300 hover:bg-gray-50',
          socialButtonsBlockButtonText: 'text-gray-700',
          formFieldLabel: 'text-gray-700',
          formFieldInput:
            'border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
          footerActionLink: 'text-blue-600 hover:text-blue-700',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
