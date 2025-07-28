import { type Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import React from 'react';

import '@/styles/globals.css';

import { HeaderWrapper } from '@/app/components/layout/HeaderWrapper';
import { LiveGamesBanner } from '@/app/components/LiveGamesBanner';
import { Footer } from '@src/app/components/layout';
import { ClientProviders } from '@src/app/components/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Placeholder',
  description: 'Placeholder sentence or paragraph',
};

// Optimize rendering - only force dynamic when necessary
// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

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
        <ClientProviders>
          {/* Live Games Banner - sticky at top */}
          <LiveGamesBanner />
          <HeaderWrapper />
          <main id="main-content" className="grow pt-12">
            {children}
          </main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
