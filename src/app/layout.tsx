import { type Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';

import '@/styles/globals.css';

import { Footer } from '@src/app/components/layout';
import { HeaderWrapper } from '@src/app/components/layout/header-wrapper';
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
        {}
        {/* This HTML is sanitized and safe to use in this context. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
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
