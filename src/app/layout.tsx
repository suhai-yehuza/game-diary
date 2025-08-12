import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Inter } from 'next/font/google';
import Script from 'next/script';

import { PerformanceMonitor } from '@/app/components/analytics/PerformanceMonitor';
import { E2ETestSetup } from '@/app/components/E2ETestSetup';
import { Footer } from '@/app/components/layout/Footer';
import { HeaderWrapper } from '@/app/components/layout/HeaderWrapper';
import { LiveGamesBanner } from '@/app/components/LiveGamesBanner';
import { ClientProviders } from '@/app/components/providers';
import { isTestOrCIEnvironment } from '@/lib/utils/e2e-test-setup';

import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Placeholder',
  description: 'Track your gaming watching experience',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="scroll-smooth antialiased"
      suppressHydrationWarning
      // Set mock mode state at the root level for immediate availability
      data-mock-mode={process.env.API_MOCK_MODE === 'true' ? 'true' : 'false'}
    >
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

        {/* Initialize mock mode - runs before hydration */}
        <Script id="mock-mode-init" strategy="beforeInteractive" src="/scripts/mock-mode-init.js" />

        {/* Live Games Banner - fixed at top */}
        <LiveGamesBanner />
        <ClientProviders>
          <HeaderWrapper />
          <main
            id="main-content"
            className="grow pb-20 lg:pb-0 pt-16" // pt-16 = 4rem for header height
            style={{
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 5rem)',
            }}
          >
            {children}
          </main>
          <Footer />
        </ClientProviders>
        <Analytics />
        <SpeedInsights />
        <PerformanceMonitor />
      </body>
    </html>
  );
}
