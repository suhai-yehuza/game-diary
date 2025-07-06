import { useEffect, useState, useCallback } from 'react';

import { INTERNAL_PROXY_ENDPOINTS } from '@/lib/config/api.config';
import { MOCK_LIVE_GAMES } from '@/lib/mock/liveGamesMock';
import type { IGamesApiResponse } from '@/lib/types/externalApiTypes';
import type { IUseLiveGamesOptions } from '@/lib/types/hooks.types';

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

export function useLiveGames(options: IUseLiveGamesOptions = {}) {
  const { autoRefresh = true, refreshInterval = REFRESH_INTERVAL_MS, initialData } = options;

  const [liveGames, setLiveGames] = useState<IGamesApiResponse | null>(initialData ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveGames = useCallback(async () => {
    if (initialData) return; // Don't fetch if data is provided via prop

    try {
      setLoading(true);
      setError(null);

      // Use the server-side API route instead of calling external API directly
      const response = await fetch(`${INTERNAL_PROXY_ENDPOINTS.GAMES}?live=all`);

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
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      console.warn('Failed to fetch live games, using mock data:', error);
      setLiveGames(MOCK_LIVE_GAMES);
    } finally {
      setLoading(false);
    }
  }, [initialData]);

  useEffect(() => {
    if (!initialData) {
      void fetchLiveGames();

      // Refresh live games if autoRefresh is enabled
      if (autoRefresh) {
        const interval = setInterval(() => {
          void fetchLiveGames();
        }, refreshInterval);

        return () => clearInterval(interval);
      }
    }
  }, [fetchLiveGames, initialData, autoRefresh, refreshInterval]);

  // Always show data with mock data if no live games from API
  const games = liveGames?.response ?? MOCK_LIVE_GAMES.response;

  return {
    liveGames,
    games,
    loading,
    error,
    refetch: fetchLiveGames,
  };
}
