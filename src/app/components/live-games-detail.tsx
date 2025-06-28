'use client';

import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';

import { MOCK_LIVE_GAMES } from '@/lib/mock/liveGamesMock';
import type { IGamesApiResponse, IRapidAPIConfig } from '@/lib/types/externalApiTypes';
import { createRapidAPIClient } from '@/lib/utils/api-client';
import { API_CONFIG } from '@src/lib/config/api.config';

// Constants
const REFRESH_INTERVAL_MS = 30000;

function isGamesApiResponse(data: unknown): data is IGamesApiResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'results' in data &&
    'response' in data &&
    Array.isArray((data as IGamesApiResponse).response)
  );
}

export function LiveGamesDetail({ rapidApiConfig }: { rapidApiConfig: IRapidAPIConfig }) {
  const [liveGames, setLiveGames] = useState<IGamesApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const client = createRapidAPIClient(rapidApiConfig);
      const data = await client.fetch<IGamesApiResponse | unknown>(API_CONFIG.endpoints.GAMES, {
        live: 'all',
      });

      // Use mock data if API returns no live games
      if (isGamesApiResponse(data) && (data.results === 0 || data.response.length === 0)) {
        setLiveGames(MOCK_LIVE_GAMES);
      } else if (isGamesApiResponse(data)) {
        setLiveGames(data);
      } else {
        setLiveGames(MOCK_LIVE_GAMES);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      console.error('Failed to fetch live games:', error);

      // Use mock data as fallback on error
      setLiveGames(MOCK_LIVE_GAMES);
    } finally {
      setLoading(false);
    }
  }, [rapidApiConfig]);

  useEffect(() => {
    void fetchLiveGames();

    // Refresh live games every 30 seconds
    const interval = setInterval(() => {
      void fetchLiveGames();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchLiveGames]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-lg">Loading live games...</p>
        </div>
      </div>
    );
  }

  if (error && !liveGames) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 text-lg">Error loading live games: {error}</p>
          <button
            onClick={() => {
              void fetchLiveGames();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Use mock data if no live games from API
  const gamesData = liveGames?.response ?? MOCK_LIVE_GAMES.response;

  if (gamesData.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Live Games</h1>
          <p className="text-gray-600">There are currently no live NBA games.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Live NBA Games</h1>
        <p className="text-gray-600">
          {gamesData.length} {gamesData.length === 1 ? 'game' : 'games'} currently live
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {gamesData.map(game => (
          <div
            key={game.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            {/* Game Status */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">LIVE</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{game.status.long}</div>
            </div>

            {/* Teams and Scores */}
            <div className="space-y-4">
              {/* Away Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 relative">
                    <Image
                      src={game.teams.visitors.logo}
                      alt={game.teams.visitors.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-semibold">{game.teams.visitors.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {game.teams.visitors.nickname}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold">{game.scores.visitors.points}</div>
              </div>

              {/* VS */}
              <div className="text-center text-gray-500 text-sm">VS</div>

              {/* Home Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 relative">
                    <Image
                      src={game.teams.home.logo}
                      alt={game.teams.home.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-semibold">{game.teams.home.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {game.teams.home.nickname}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold">{game.scores.home.points}</div>
              </div>
            </div>

            {/* Game Details */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Arena:</span>
                  <div className="font-medium">{game.arena.name}</div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {game.arena.city}, {game.arena.state}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Period:</span>
                  <div className="font-medium">
                    {game.periods.current} of {game.periods.total}
                  </div>
                  {game.status.clock && (
                    <div className="text-gray-600 dark:text-gray-400">
                      Time: {game.status.clock}
                    </div>
                  )}
                </div>
              </div>

              {game.nugget && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">{game.nugget}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
