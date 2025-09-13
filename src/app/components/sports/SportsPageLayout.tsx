'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { SPORTS_CONFIG, getSportsButtonClass } from '@/lib/constants/colors';
import type { ISportsPageLayoutProps } from '@/types';

export function SportsPageLayout({
  title,
  description,
  children,
  showLiveGamesButton = true,
  showSportButtons = false,
  sportButtons = [],
}: ISportsPageLayoutProps) {
  const pathname = usePathname();

  // Determine if this is an NBA page based on the title or pathname
  const isNBAPage =
    (title?.includes('NBA') ||
      title?.includes('Games') ||
      title?.includes('Teams') ||
      title?.includes('Players') ||
      pathname?.includes('/sports/nba')) &&
    !title?.includes('All Sports');

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-6">
        {/* Header with title and description */}
        <div className="mb-6">
          <div className="flex-1">
            <h1
              className={`text-3xl font-bold mb-2 ${
                isNBAPage ? 'nba-games-title' : 'all-sports-title'
              }`}
            >
              {title}
            </h1>
            <p className={isNBAPage ? 'nba-games-description' : 'all-sports-description'}>
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Sport Buttons and Live Games Button in horizontal row */}
      {showSportButtons && sportButtons.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-4">
            {showLiveGamesButton && (
              <Link
                href="/sports/live"
                className="inline-flex items-center px-4 py-3 bg-semantic-error hover:bg-semantic-error/90 text-text-inverse rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
                Live Games
              </Link>
            )}
            {sportButtons.map(sport => {
              // Get sport key from the sport object or name
              const sportKey = Object.keys(SPORTS_CONFIG).find(
                key => SPORTS_CONFIG[key as keyof typeof SPORTS_CONFIG].name === sport.name
              ) as keyof typeof SPORTS_CONFIG | undefined;

              // Get the color classes from SPORTS_CONFIG
              const colorClasses = sportKey
                ? getSportsButtonClass(sportKey)
                : 'bg-theme-muted hover:bg-theme-secondary';

              return (
                <Link
                  key={sport.href}
                  href={sport.href}
                  className={`inline-flex items-center justify-center px-4 py-3 text-text-inverse ${colorClasses} rounded-lg font-medium transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  {sport.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {children}
    </section>
  );
}
