'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { useBannerVisibility } from '@/hooks/use-banner-visibility';
import { useLiveGames } from '@/hooks/use-live-games';
import { MOCK_LIVE_GAMES } from '@/lib/mock/liveGamesMock';
import type { IGameResponse } from '@/lib/types';

/**
 * Determines which games to display based on environment and data availability
 */
function getDisplayGames(realGames: IGameResponse[] | null): IGameResponse[] {
  // If there are real live games, use them
  if (realGames && realGames.length > 0) {
    return realGames;
  }

  // Check if we should show mock games
  const shouldShowMockGames =
    // Development with mock mode
    (process.env.NODE_ENV === 'development' && process.env.API_MOCK_MODE === 'true') ||
    // Test/CI environment
    (typeof window !== 'undefined' &&
      (window.__API_MOCK_MODE__ || window.__E2E_MOCK_MODE__ || window.__PLAYWRIGHT_TEST__));

  if (shouldShowMockGames) {
    return MOCK_LIVE_GAMES.response;
  }

  return [];
}

export function LiveGamesBanner() {
  const { games } = useLiveGames();
  const { shouldDisplayBanner, isClient } = useBannerVisibility();

  // Use the banner visibility hook to determine if we should render
  if (!shouldDisplayBanner || !isClient) {
    return null;
  }

  // Get the games to display using our centralized logic
  const displayGames = getDisplayGames(games);

  if (displayGames.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="live-games-banner"
      className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-gray-900 to-blue-900 text-white py-3 px-4 shadow-lg pointer-events-none"
      style={
        {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          // Ensure proper stacking context for WebKit
          transform: 'translateZ(0)',
          willChange: 'transform',
        } as React.CSSProperties
      }
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Live Games Info */}
          <div className="flex items-center space-x-4">
            {/* Live Indicator */}
            <div className="flex items-center space-x-2 pointer-events-auto">
              <div
                data-testid="live-indicator"
                className="w-2 h-2 bg-red-600 rounded-full animate-live-dot-glow"
              />
              <span className="text-sm font-semibold">
                {displayGames.length} {displayGames.length === 1 ? 'Live Game' : 'Live Games'}
              </span>
            </div>

            {/* Games Preview with Scrolling Animation */}
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center space-x-4 animate-scroll-left">
                {displayGames.map((game: IGameResponse, index: number) => (
                  <React.Fragment key={game.id}>
                    <div data-testid="game" className="flex items-center space-x-2 flex-shrink-0">
                      {/* Away Team */}
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 relative">
                          <Image
                            src={game.teams.visitors.logo}
                            alt={game.teams.visitors.name}
                            fill
                            className="object-contain"
                            sizes="16px"
                            loading="lazy"
                          />
                        </div>
                        <span className="text-xs font-medium">{game.teams.visitors.code}</span>
                        <span className="text-xs font-bold">{game.scores.visitors.points}</span>
                      </div>

                      {/* @ */}
                      <span className="text-xs text-gray-200">@</span>

                      {/* Home Team */}
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 relative">
                          <Image
                            src={game.teams.home.logo}
                            alt={game.teams.home.name}
                            fill
                            className="object-contain"
                            sizes="16px"
                            loading="lazy"
                          />
                        </div>
                        <span className="text-xs font-medium">{game.teams.home.code}</span>
                        <span className="text-xs font-bold">{game.scores.home.points}</span>
                      </div>

                      {/* Game Status */}
                      {game.status.clock && (
                        <span className="text-xs text-gray-200 ml-2">{game.status.clock}</span>
                      )}
                      {/* Quarter */}
                      <span className="text-xs text-gray-200 ml-1">{game.status.short}</span>
                    </div>

                    {/* Separator between games */}
                    {index < displayGames.length - 1 && (
                      <div className="w-px h-6 bg-gray-600 flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* View All Link */}
          <Link
            href="/sports/live"
            className="text-sm font-medium hover:text-gray-200 transition-colors duration-200 flex items-center space-x-1 ml-4 pointer-events-auto"
          >
            <span>View All</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
