import Link from 'next/link';
import React from 'react';

import { useLiveGames } from '@/hooks/use-live-games';

// Constants
const MAX_DISPLAY_GAMES = 3;

export function LiveGamesBanner() {
  const { games } = useLiveGames();

  return (
    <div
      className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white"
      data-testid="live-games-banner"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div
                className="w-2 h-2 bg-white rounded-full animate-pulse"
                data-testid="live-indicator"
                style={{
                  // Ensure visibility on mobile devices
                  visibility: 'visible',
                  display: 'block',
                  opacity: '1',
                }}
              />
              <span className="text-sm font-semibold">LIVE</span>
            </div>
            <span className="text-sm">
              {games.length} {games.length === 1 ? 'Game' : 'Games'} Live
            </span>
          </div>

          <div className="flex items-center space-x-4 overflow-x-auto">
            {games.slice(0, MAX_DISPLAY_GAMES).map(game => (
              <div key={game.id} className="flex items-center space-x-2 text-xs whitespace-nowrap">
                <div className="flex items-center space-x-1">
                  <span className="font-medium">{game.teams.visitors.code}</span>
                  <span>{game.scores.visitors.points}</span>
                  <span>-</span>
                  <span>{game.scores.home.points}</span>
                  <span className="font-medium">{game.teams.home.code}</span>
                </div>
                {game.status.clock && (
                  <span className="text-yellow-300 font-mono">{game.status.clock}</span>
                )}
                {game.status.halftime && <span className="text-yellow-300">HALFTIME</span>}
              </div>
            ))}
            {games.length > MAX_DISPLAY_GAMES && (
              <span className="text-xs opacity-75">+{games.length - MAX_DISPLAY_GAMES} more</span>
            )}
            <Link
              href="/sports/live"
              className="text-xs font-medium hover:text-yellow-300 transition-colors ml-2 px-2 py-1 border border-white/30 rounded hover:bg-white/10"
            >
              View All
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
