import { type Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';

import '@/app/styles/globals.css';
import { Footer, Header } from '@/components/layout';
import { ClientProviders } from '@/components/providers/client-providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Game Diary',
  description: 'Your personal space to track and share your pro game watching experiences',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth antialiased" suppressHydrationWarning>
      <body className={`flex min-h-screen flex-col ${inter.className}`}>
        <ClientProviders>
          <Header />
          <main className="grow">{children}</main>
          <Footer />
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
