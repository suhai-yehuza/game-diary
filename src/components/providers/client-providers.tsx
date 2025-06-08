'use client';

import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';

import { ApolloWrapper, ThemeProvider } from '@src/components/providers';
import { ToastProvider } from '@src/components/ui/use-toast';
import { AuthProvider } from '@/contexts/auth-context';
import { NotificationProvider } from '@/contexts/notification-context';

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
