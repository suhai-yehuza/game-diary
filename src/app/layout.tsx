import { type Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import { Toaster as HotToaster } from 'react-hot-toast';

import '@/styles/globals.css';
import { Footer, Header } from '@src/app/components/layout';
import { ClerkProviderWrapper, ThemeProvider } from '@src/app/components/providers';
import { Toaster } from '@src/app/components/ui/toaster';
import { ToastProvider } from '@src/app/components/ui/use-toast';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
            <ToastProvider>
              <Header />
              <main className="grow">{children}</main>
              <Footer />
              <Toaster />
              <HotToaster position="top-center" />
            </ToastProvider>
          </ClerkProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
