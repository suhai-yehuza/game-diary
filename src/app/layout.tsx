import { type Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';

import '@/styles/globals.css';

import { Header } from '@/app/components/layout/header';
import { Footer } from '@src/app/components/layout';
import { ClientProviders } from '@src/app/components/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Game Diary',
  description: 'Placeholder sentence or paragraph here',
};

// Optimize rendering - only force dynamic when necessary
// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth antialiased" suppressHydrationWarning>
      <body className={`flex min-h-screen flex-col ${inter.className}`}>
        <ClientProviders>
          <Header />
          <main className="grow">{children}</main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
