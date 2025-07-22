import Link from 'next/link';
import React from 'react';

import type { ISportsPageLayoutProps } from '@/lib/types';

export function SportsPageLayout({
  title,
  description,
  children,
  showLiveGamesButton = true,
  showSportButtons = false,
  sportButtons = [],
}: ISportsPageLayoutProps) {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>

        <div className="flex flex-wrap gap-4 mb-6">
          {showLiveGamesButton && (
            <Link
              href="/sports/live"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
              Live Games
            </Link>
          )}

          {showSportButtons &&
            sportButtons.map(button => (
              <Link
                key={button.name}
                href={button.href}
                className={`inline-flex items-center px-4 py-2 ${button.color} text-white rounded-md hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                {button.name}
              </Link>
            ))}
        </div>
      </div>

      {children}
    </section>
  );
}
