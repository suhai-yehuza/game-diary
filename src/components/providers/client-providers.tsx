'use client';

import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';

import { ApolloWrapper, ThemeProvider } from '@/components/providers';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider enableSystem attribute="class" defaultTheme="system" disableTransitionOnChange>
        <ApolloWrapper>
          <AuthProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </AuthProvider>
        </ApolloWrapper>
      </ThemeProvider>
    </ClerkProvider>
  );
}
