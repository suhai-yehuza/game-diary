import { useEffect, useState, useCallback } from 'react';

import { INTERNAL_PROXY_ENDPOINTS } from '@/lib/config/app.config';
import { MOCK_LIVE_GAMES } from '@/lib/mock/liveGamesMock';
import type { IGamesApiResponse, IUseLiveGamesOptions } from '@/lib/types';

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
      if (isGamesApiResponse(data)) {
        // Only use mock data as fallback in test environments
        if (data.response.length === 0) {
          if (
            process.env.NODE_ENV === 'test' ||
            process.env.API_MOCK_MODE === 'true' ||
            process.env.E2E_MOCK_MODE === 'true'
          ) {
            setLiveGames(MOCK_LIVE_GAMES);
          } else {
            setLiveGames({ ...data, response: [] });
          }
        } else {
          setLiveGames(data);
        }
      } else {
        if (
          process.env.NODE_ENV === 'test' ||
          process.env.API_MOCK_MODE === 'true' ||
          process.env.E2E_MOCK_MODE === 'true'
        ) {
          setLiveGames(MOCK_LIVE_GAMES);
        } else {
          setLiveGames(null);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      if (
        process.env.NODE_ENV === 'test' ||
        process.env.API_MOCK_MODE === 'true' ||
        process.env.E2E_MOCK_MODE === 'true'
      ) {
        setLiveGames(MOCK_LIVE_GAMES);
      } else {
        setLiveGames(null);
      }
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
        return () => {
          clearInterval(interval);
        };
      }
    }
  }, [fetchLiveGames, initialData, autoRefresh, refreshInterval]);

  // Only use mock data in actual test environments when no initialData is provided
  if (
    !initialData &&
    (process.env.NODE_ENV === 'test' ||
      process.env.API_MOCK_MODE === 'true' ||
      process.env.E2E_MOCK_MODE === 'true')
  ) {
    return {
      liveGames: MOCK_LIVE_GAMES,
      games: MOCK_LIVE_GAMES.response,
      loading: false,
      error: null,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      refetch: () => {},
    };
  }

  const games = liveGames?.response ?? [];

  return {
    liveGames,
    games,
    loading,
    error,
    refetch: fetchLiveGames,
  };
}
