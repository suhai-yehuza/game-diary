import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Inter } from 'next/font/google';
import Script from 'next/script';

import { CacheValidationInitializer } from '@/app/components/CacheValidationInitializer';
import { CacheWarmingInitializer } from '@/app/components/CacheWarmingInitializer';
import { E2ETestSetup } from '@/app/components/E2ETestSetup';
import { Footer } from '@/app/components/layout/Footer';
import { HeaderWrapper } from '@/app/components/layout/HeaderWrapper';
import { LiveGamesBanner } from '@/app/components/LiveGamesBanner';
import { LiveGamesMonitor } from '@/app/components/performance/LiveGamesMonitor';
import { ClientProviders } from '@/app/components/providers';
import { isTestOrCIEnvironment } from '@/lib/utils/e2e-test-setup';

import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'Game Diary - Track Your Sports Watching Experience',
    template: '%s | Game Diary',
  },
  description:
    'Track your gaming watching experiences, connect with fellow sports fans, and share your thoughts on live games across NBA, NFL, MLB, NHL, and MLS.',
  keywords: [
    'sports',
    'game diary',
    'basketball',
    'football',
    'baseball',
    'hockey',
    'soccer',
    'live games',
    'sports tracking',
    'fan community',
  ],
  authors: [{ name: 'Game Diary Team' }],
  creator: 'Game Diary',
  publisher: 'Game Diary',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.game-diary.io'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Game Diary - Track Your Sports Watching Experience',
    description:
      'Track your gaming watching experiences, connect with fellow sports fans, and share your thoughts on live games across NBA, NFL, MLB, NHL, and MLS.',
    siteName: 'Game Diary',
    images: [
      {
        url: '/logos/gamelog-large.svg',
        width: 1200,
        height: 630,
        alt: 'Game Diary Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Game Diary - Track Your Sports Watching Experience',
    description:
      'Track your gaming watching experiences, connect with fellow sports fans, and share your thoughts on live games.',
    images: ['/logos/gamelog-large.svg'],
    creator: '@gamediary',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  manifest: '/manifest.json',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Game Diary',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': 'hsl(221, 83%, 53%)', // Using centralized brand primary color
    'msapplication-config': '/browserconfig.xml',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="scroll-smooth antialiased"
      suppressHydrationWarning
      // Set mock mode state at the root level for immediate availability
      data-mock-mode={process.env.MOCK_MODE === 'true' ? 'true' : 'false'}
    >
      <head>
        {/* Viewport meta tag for proper mobile rendering */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover"
        />

        {/* Theme initialization script - runs before hydration to prevent flashing */}
        <Script id="theme-init" strategy="beforeInteractive" src="/scripts/theme-init.js" />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Game Diary',
              description:
                'Track your gaming watching experiences, connect with fellow sports fans, and share your thoughts on live games across NBA, NFL, MLB, NHL, and MLS.',
              url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.game-diary.io',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.game-diary.io'}/search?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
              publisher: {
                '@type': 'Organization',
                name: 'Game Diary',
                logo: {
                  '@type': 'ImageObject',
                  url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.game-diary.io'}/logos/gamelog-large.svg`,
                },
              },
            }),
          }}
        />

        {/* Additional structured data for sports content */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SportsOrganization',
              name: 'Game Diary Sports Community',
              description:
                'A community platform for sports fans to track and share their game watching experiences',
              sport: ['Basketball', 'Football', 'Baseball', 'Hockey', 'Soccer'],
              url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.game-diary.io',
            }),
          }}
        />
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

        {/* Cache Validation Initializer - runs before cache warming */}
        <CacheValidationInitializer />

        {/* Cache Warming Initializer */}
        <CacheWarmingInitializer />

        {/* Live Games Banner - fixed at top */}
        <LiveGamesBanner />
        <ClientProviders>
          <HeaderWrapper />
          <main
            id="main-content"
            className="grow pb-8 lg:pb-4 pt-4" // Reduced top padding since header is sticky
            style={{
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)',
            }}
          >
            {children}
          </main>
          <Footer />
        </ClientProviders>
        <Analytics />
        <SpeedInsights />
        <LiveGamesMonitor />
      </body>
    </html>
  );
}
