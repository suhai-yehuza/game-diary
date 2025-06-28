import { type Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';

import '@/styles/globals.css';

import { Footer, Header } from '@src/app/components/layout';
import { ClerkProviderWrapper, ThemeProvider } from '@src/app/components/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Game Diary',
  description: 'Your personal space to track and share your pro game watching experiences',
};

// Force dynamic rendering for this layout
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth antialiased" suppressHydrationWarning>
      <body className={`flex min-h-screen flex-col ${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProviderWrapper>
            <Header />
            <main className="grow">{children}</main>
            <Footer />
          </ClerkProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

export default RootLayout;
