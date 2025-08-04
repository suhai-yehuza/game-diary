'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { useLiveGames } from '@/hooks/use-live-games';
import type { IGameResponse } from '@/lib/types';

export function LiveGamesBanner() {
  const { games } = useLiveGames();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything on server to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  if (!games || games.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="live-games-banner"
      className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-gray-900 to-blue-900 text-white py-2 px-4 shadow-lg"
      style={{ position: 'fixed', top: 0, left: 0, right: 0 }}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Live Games Info */}
          <div className="flex items-center space-x-4">
            {/* Live Indicator */}
            <div className="flex items-center space-x-2">
              <div
                data-testid="live-indicator"
                className="w-2 h-2 bg-red-600 rounded-full animate-live-dot-glow"
              />
              <span className="text-sm font-semibold">
                {games.length} {games.length === 1 ? 'Live Game' : 'Live Games'}
              </span>
            </div>

            {/* Games Preview with Scrolling Animation */}
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center space-x-4 animate-scroll-left">
                {games.map((game: IGameResponse, index: number) => (
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
                    {index < games.length - 1 && (
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
            className="text-sm font-medium hover:text-gray-200 transition-colors duration-200 flex items-center space-x-1 ml-4"
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
