import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

import { MOCK_LIVE_GAMES } from '@/lib/mock/live-games.mock';
import type { IGamesApiResponse } from '@/lib/types/external.api.types';

// Constants
const REFRESH_INTERVAL_MS = 30000;
const MAX_DISPLAY_GAMES = 3;

function isGamesApiResponse(data: unknown): data is IGamesApiResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'results' in data &&
    'response' in data &&
    Array.isArray((data as IGamesApiResponse).response)
  );
}

export function LiveGamesBanner() {
  const [liveGames, setLiveGames] = useState<IGamesApiResponse | null>(null);

  const fetchLiveGames = useCallback(async () => {
    try {
      // Use the server-side API route instead of calling external API directly
      const response = await fetch('/api/live-games?live=all');

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as unknown;

      // Use mock data if API returns no live games
      if (isGamesApiResponse(data) && (data.results === 0 || data.response.length === 0)) {
        setLiveGames(MOCK_LIVE_GAMES);
      } else if (isGamesApiResponse(data)) {
        setLiveGames(data);
      } else {
        setLiveGames(MOCK_LIVE_GAMES);
      }
    } catch (err) {
      // Silently handle errors and use mock data
      console.warn('Failed to fetch live games, using mock data:', err);
      setLiveGames(MOCK_LIVE_GAMES);
    }
  }, []);

  useEffect(() => {
    void fetchLiveGames();

    // Refresh live games every 30 seconds
    const interval = setInterval(() => {
      void fetchLiveGames();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchLiveGames]);

  // Always show banner with mock data if no live games from API
  const games = liveGames?.response ?? MOCK_LIVE_GAMES.response;

  return (
    <div className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
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
