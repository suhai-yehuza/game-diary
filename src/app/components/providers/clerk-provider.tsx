'use client';

import { ClerkProvider } from '@clerk/nextjs';

import type { IClerkProviderWrapperProps } from '@src/lib/types/uiTypes';

export function ClerkProviderWrapper({ children }: IClerkProviderWrapperProps) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
          card: 'bg-background border border-border',
          headerTitle: 'text-foreground',
          headerSubtitle: 'text-muted-foreground',
          socialButtonsBlockButton:
            'bg-background border border-border text-foreground hover:bg-accent',
          socialButtonsBlockButtonText: 'text-foreground',
          formFieldLabel: 'text-foreground',
          formFieldInput: 'bg-background border border-border text-foreground',
          footerActionLink: 'text-primary hover:text-primary/90',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
