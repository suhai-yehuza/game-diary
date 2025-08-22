import { useState, useEffect, useCallback } from 'react';

import type { IGameResponse, IGamesApiResponse } from '@/lib/types';
import { getLatestNbaSeason } from '@/lib/utils/nba-season';

// Helper function to detect test environment
function isTestOrCIEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'test' ||
    process.env.CI === 'true' ||
    process.env.VITEST === 'true' ||
    (typeof window !== 'undefined' && Boolean(window.__PLAYWRIGHT_TEST__))
  );
}

export interface ILatestGamesOptions {
  limit?: number;
  skip?: boolean;
  forceRealData?: boolean;
}

function isGamesApiResponse(data: unknown): data is IGamesApiResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'response' in data &&
    Array.isArray((data as { response: unknown }).response)
  );
}

export function useLatestGames(options: ILatestGamesOptions = {}) {
  const { limit = 20, skip = false, forceRealData = false } = options;
  const latestSeason = getLatestNbaSeason();

  const [latestGames, setLatestGames] = useState<IGameResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestGames = useCallback(async () => {
    if (skip) return;

    try {
      setLoading(true);
      setError(null);

      // Use mock data in development if API_MOCK_MODE is enabled, or in test environments
      // But force real data if forceRealData is true
      const useMockData = forceRealData
        ? false
        : (typeof window !== 'undefined' && window.__API_MOCK_MODE__) ||
          (process.env.NODE_ENV === 'development' && process.env.API_MOCK_MODE === 'true') ||
          isTestOrCIEnvironment();

      const endpoint = useMockData
        ? '/api/mock-server?action=mock-data&type=nba-games'
        : `/api/proxy/games?season=${latestSeason}&league=standard`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as unknown;

      let games: IGameResponse[] = [];

      // Handle mock server response format
      if (useMockData && typeof data === 'object' && data !== null && 'data' in data) {
        const mockData = (data as { data: unknown }).data;
        if (isGamesApiResponse(mockData)) {
          games = mockData.response || [];
        }
      } else {
        // Handle regular API response
        if (isGamesApiResponse(data)) {
          games = data.response || [];
        }
      }

      // Sort games by date (most recent first) and limit
      const sortedGames = games
        .sort((a, b) => {
          const dateA = new Date(a.date.start).getTime();
          const dateB = new Date(b.date.start).getTime();
          return dateB - dateA; // Descending order
        })
        .slice(0, limit);

      setLatestGames(sortedGames);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setLatestGames([]);
    } finally {
      setLoading(false);
    }
  }, [latestSeason, limit, skip, forceRealData]);

  useEffect(() => {
    void fetchLatestGames();
  }, [fetchLatestGames]);

  const refetch = useCallback(() => {
    void fetchLatestGames();
  }, [fetchLatestGames]);

  return {
    latestGames,
    loading,
    error,
    refetch,
    season: latestSeason,
  };
}
