'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import type { INbaGamesApiResponse } from '@/lib/types/nba.api.types';
import { API_CONFIG, getRapidApiConfig } from '@src/lib/config/api.config';

// API Client function
const createRapidAPIClient = () => {
  const config = getRapidApiConfig();

  return {
    async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
      const url = new URL(`${config.baseUrl}${endpoint}`);

      // Add query parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          url.searchParams.append(key, value);
        }
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          ...config.headers,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    },
  };
};

export default function LiveGamesDetail() {
  const [liveGames, setLiveGames] = useState<INbaGamesApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveGames = async () => {
    try {
      setLoading(true);
      setError(null);

      const client = createRapidAPIClient();
      const data = await client.fetch<INbaGamesApiResponse>(API_CONFIG.endpoints.GAMES, {
        live: 'all',
      });

      setLiveGames(data);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      console.error('Failed to fetch live games:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveGames();

    // Refresh live games every 30 seconds
    const interval = setInterval(fetchLiveGames, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>Failed to load live games: {error}</p>
        <button
          onClick={fetchLiveGames}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!liveGames || liveGames.results === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No live games at the moment</p>
      </div>
    );
  }

  const games = liveGames.response;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span>Live Games</span>
          </div>
        </h2>
        <div className="text-sm text-gray-500">
          {games.length} {games.length === 1 ? 'Game' : 'Games'} Live
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games.map(game => (
          <div
            key={game.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Game Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="font-semibold">LIVE</span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg">
                    {game.status.clock || 'Q' + game.periods.current}
                  </div>
                  <div className="text-xs opacity-75">
                    {game.status.halftime ? 'HALFTIME' : game.status.long}
                  </div>
                </div>
              </div>
            </div>

            {/* Teams and Scores */}
            <div className="p-4">
              {/* Away Team */}
              <div className="flex items-center justify-between mb-3">
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
                    <div className="font-semibold text-sm">{game.teams.visitors.name}</div>
                    <div className="text-xs text-gray-500">
                      {game.scores.visitors.win}-{game.scores.visitors.loss}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold">{game.scores.visitors.points}</div>
              </div>

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
                    <div className="font-semibold text-sm">{game.teams.home.name}</div>
                    <div className="text-xs text-gray-500">
                      {game.scores.home.win}-{game.scores.home.loss}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold">{game.scores.home.points}</div>
              </div>

              {/* Game Details */}
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Arena:</span> {game.arena.name}
                  </div>
                  <div>
                    <span className="font-medium">City:</span> {game.arena.city}
                  </div>
                  <div>
                    <span className="font-medium">Lead Changes:</span> {game.leadChanges}
                  </div>
                  <div>
                    <span className="font-medium">Times Tied:</span> {game.timesTied}
                  </div>
                </div>

                {game.nugget && (
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">{game.nugget}</div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="px-4 pb-4">
              <Link
                href={`/sports/nba/game/${game.id}`}
                className="w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
