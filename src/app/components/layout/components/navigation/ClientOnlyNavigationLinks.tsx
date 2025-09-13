'use client';

import Link from 'next/link';
import React, { Suspense } from 'react';

import { NavigationLinks } from '@/app/components/layout/components/navigation/NavigationLinks';
import { SPORTS_CONFIG } from '@/app/components/sports/SportsConfig';

export function ClientOnlyNavigationLinks(
  props: React.ComponentProps<typeof NavigationLinks> & {
    closeMenu?: () => void;
    isStacked?: boolean;
  }
) {
  return (
    <Suspense
      fallback={
        <nav className="flex flex-col lg:flex-row items-start lg:items-center h-full lg:space-x-6 lg:space-y-0 text-xs sm:text-sm font-medium m-0 p-0">
          <Link
            href="/"
            className="block py-2 lg:py-1.5 text-base lg:text-sm transition-colors whitespace-nowrap flex items-center w-full lg:w-auto h-full"
          >
            <div className="w-16 h-4 bg-bg-theme-secondary rounded animate-pulse" />
          </Link>
          {Object.values(SPORTS_CONFIG).map(sport => (
            <Link
              key={sport.href}
              href={sport.href}
              className="block py-2 lg:py-1.5 text-base lg:text-sm transition-colors whitespace-nowrap flex items-center w-full lg:w-auto h-full"
            >
              <div className="w-8 h-4 bg-bg-theme-secondary rounded animate-pulse" />
            </Link>
          ))}
          <Link
            href="/sports/all-sports"
            className="block py-2 lg:py-1.5 text-base lg:text-sm transition-colors whitespace-nowrap flex items-center w-full lg:w-auto h-full"
          >
            <div className="w-16 h-4 bg-bg-theme-secondary rounded animate-pulse" />
          </Link>
          <div className="hidden lg:block h-6 w-px bg-theme-primary mx-3" />
          <Link
            href="/protected/dashboard"
            className="block py-2 lg:py-1.5 text-base lg:text-sm transition-colors whitespace-nowrap flex items-center w-full lg:w-auto h-full"
          >
            <div className="w-12 h-4 bg-bg-theme-secondary rounded animate-pulse" />
          </Link>
        </nav>
      }
    >
      <NavigationLinks {...props} />
    </Suspense>
  );
}
