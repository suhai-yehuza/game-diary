'use client';

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

export default function LiveGamesBanner() {
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

  // Don't show banner if no live games or if there's an error
  if (loading || error || !liveGames || liveGames.results === 0) {
    return null;
  }

  const games = liveGames.response;

  return (
    <div className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold">LIVE</span>
            </div>
            <span className="text-sm">
              {games.length} {games.length === 1 ? 'Game' : 'Games'} Live
            </span>
          </div>

          <div className="flex items-center space-x-4 overflow-x-auto">
            {games.slice(0, 3).map(game => (
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
            {games.length > 3 && (
              <span className="text-xs opacity-75">+{games.length - 3} more</span>
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
