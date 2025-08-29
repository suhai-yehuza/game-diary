import { useState, useEffect, useCallback } from 'react';

import type { IGameResponse, IGamesApiResponse, ILatestGamesOptions } from '@/lib/types';
import { isMockModeEnabled } from '@/lib/utils/mock-mode';
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

function isGamesApiResponse(data: unknown): data is IGamesApiResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'response' in data &&
    Array.isArray((data as { response: unknown }).response)
  );
}

export function useLatestGames(options: ILatestGamesOptions = {}) {
  const { limit: _limit = 20, skip = false, forceRealData = false, seasons } = options;
  const latestSeason = getLatestNbaSeason();

  const [latestGames, setLatestGames] = useState<IGameResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestGames = useCallback(async () => {
    if (skip) return;

    try {
      setLoading(true);
      setError(null);

      // Use mock data in development if MOCK_MODE is enabled, or in test environments
      // But force real data if forceRealData is true
      const useMockData = forceRealData ? false : isMockModeEnabled() || isTestOrCIEnvironment();

      let allGames: IGameResponse[] = [];

      if (useMockData) {
        // For mock data, fetch from mock endpoint
        const response = await fetch('/api/mock-server?action=mock-data&type=nba-games');
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as unknown;
        if (typeof data === 'object' && data !== null && 'data' in data) {
          const mockData = (data as { data: unknown }).data;
          if (isGamesApiResponse(mockData)) {
            allGames = mockData.response || [];
          }
        }
      } else {
        // For real data, fetch from specified seasons or default to latest season
        const seasonsToFetch = seasons && seasons.length > 0 ? seasons : [latestSeason];

        // Fetch games from all specified seasons
        const seasonPromises = seasonsToFetch.map(async season => {
          const response = await fetch(`/api/proxy/games?season=${season}&league=standard`);
          if (!response.ok) {
            throw new Error(
              `API request failed for season ${season}: ${response.status} ${response.statusText}`
            );
          }

          const data = (await response.json()) as unknown;
          if (isGamesApiResponse(data)) {
            return data.response || [];
          }
          return [];
        });

        const seasonResults = await Promise.all(seasonPromises);
        allGames = seasonResults.flat();
      }

      // Sort games by date (most recent first)
      const sortedGames = allGames.sort((a, b) => {
        const dateA = new Date(a.date.start).getTime();
        const dateB = new Date(b.date.start).getTime();
        return dateB - dateA; // Descending order
      });

      // Apply limit if specified
      const limitedGames = _limit ? sortedGames.slice(0, _limit) : sortedGames;

      setLatestGames(limitedGames);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setLatestGames([]);
    } finally {
      setLoading(false);
    }
  }, [latestSeason, skip, forceRealData, seasons, _limit]);

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
