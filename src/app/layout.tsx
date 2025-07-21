import { type Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import React from 'react';

import '@/styles/globals.css';

import { HeaderWrapper } from '@/app/components/layout/HeaderWrapper';
import { Footer } from '@src/app/components/layout';
import { ClientProviders } from '@src/app/components/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Game Diary',
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
        <ClientProviders>
          <HeaderWrapper />
          <main className="grow">{children}</main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
