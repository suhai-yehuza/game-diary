import { type Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';

import '@/styles/globals.css';

import { LazyHeader, LazyTestHeader } from '@/components/lazy/header';
import { Footer } from '@src/app/components/layout';
import { ClientProviders, TestProviders } from '@src/app/components/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Game Diary',
  description: 'Your personal space to track and share your pro game watching experiences',
};

// Optimize rendering - only force dynamic when necessary
// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Use TestProviders during E2E tests to prevent Clerk authentication errors
  const isTestEnvironment = process.env.E2E_TESTING === 'true' || process.env.NODE_ENV === 'test';
  const Providers = isTestEnvironment ? TestProviders : ClientProviders;

  // Debug logging
  console.log('🔍 Layout Environment Debug:');
  console.log('  E2E_TESTING:', process.env.E2E_TESTING);
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  console.log('  isTestEnvironment:', isTestEnvironment);
  console.log('  Using Providers:', isTestEnvironment ? 'TestProviders' : 'ClientProviders');

  return (
    <html lang="en" className="scroll-smooth antialiased" suppressHydrationWarning>
      <body className={`flex min-h-screen flex-col ${inter.className}`}>
        <Providers>
          {isTestEnvironment ? <LazyTestHeader /> : <LazyHeader />}
          <main className="grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
