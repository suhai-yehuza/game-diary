'use client';

import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';

import { AuthProvider } from '@/contexts/auth-context';
import { NotificationProvider } from '@/contexts/notification-context';
import { ApolloWrapper, ThemeProvider } from '@src/app/components/providers';
import { ToastProvider } from '@src/app/components/ui/use-toast';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider enableSystem attribute="class" defaultTheme="system" disableTransitionOnChange>
        <ApolloWrapper>
          <AuthProvider>
            <ToastProvider>
              <NotificationProvider>{children}</NotificationProvider>
            </ToastProvider>
          </AuthProvider>
        </ApolloWrapper>
      </ThemeProvider>
    </ClerkProvider>
  );
}
