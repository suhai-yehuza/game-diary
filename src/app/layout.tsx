import { type Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import React from 'react';

import '@/styles/globals.css';

import { E2ETestSetup } from '@/app/components/E2ETestSetup';
import { HeaderWrapper } from '@/app/components/layout/HeaderWrapper';
import { LiveGamesBanner } from '@/app/components/LiveGamesBanner';
import { isTestOrCIEnvironment } from '@/lib/utils/e2e-test-setup';
import { Footer } from '@src/app/components/layout';
import { ClientProviders } from '@src/app/components/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Game Diary - Track Your Sports Journey',
  description: 'Track your favorite sports teams, games, and create your personal sports diary',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth antialiased" suppressHydrationWarning>
      <head>
        {/* Theme initialization script - runs before hydration to prevent flashing */}
        <Script id="theme-init" strategy="beforeInteractive" src="/scripts/theme-init.js" />
      </head>
      <body className={`flex min-h-screen flex-col ${inter.className}`}>
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {/* E2E Test Setup - only runs in test environments */}
        {isTestOrCIEnvironment() && <E2ETestSetup />}
        {/* Live Games Banner - fixed at top */}
        <LiveGamesBanner />
        <ClientProviders>
          <HeaderWrapper />
          <main id="main-content" className="grow pt-24">
            {children}
          </main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
