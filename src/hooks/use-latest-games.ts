import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import { isMockModeEnabled } from '@/lib/utils/mock-mode';
import { getRecentNbaSeasons } from '@/lib/utils/nba-season';
import type { IGameResponse, IGamesApiResponse, ILatestGamesOptions } from '@/types';

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
  const {
    limit: _limit = 20,
    skip = false,
    forceRealData = false,
    seasons,
    forceRefresh = false,
  } = options;
  const latestSeason = getRecentNbaSeasons(1)[0]; // Assuming the first season is the latest

  const [latestGames, setLatestGames] = useState<IGameResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStatus, setCacheStatus] = useState<'cached' | 'fresh' | 'none'>('none');
  const [note] = useState<string | undefined>(
    'Loading data with rate limiting... This may take a moment.'
  );

  // Memoize seasons to prevent unnecessary re-renders
  const memoizedSeasons = useMemo(() => seasons, [seasons?.join(',')]);

  // Track if fetch has been called to prevent multiple calls
  const fetchCalledRef = useRef(false);

  // Reset fetch flag when dependencies change
  useEffect(() => {
    fetchCalledRef.current = false;
  }, [skip, forceRealData, memoizedSeasons, latestSeason, _limit, forceRefresh]);

  const fetchLatestGames = useCallback(async () => {
    if (skip || fetchCalledRef.current) return;

    fetchCalledRef.current = true;

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

        const data = await response.json();
        if (typeof data === 'object' && data !== null && 'data' in data) {
          const mockData = (data as { data: unknown }).data;
          if (isGamesApiResponse(mockData)) {
            allGames = (mockData.response || []) as IGameResponse[];
          }
        }
        setCacheStatus('none');
      } else {
        // Fetch from cached API with cache bypass option
        const bypassParam = forceRefresh ? '&bypass-cache=true' : '';
        logger.info('🎮 Fetching games from cached API...', {
          seasons: memoizedSeasons,
          forceRefresh,
          bypassParam,
        });

        const seasonsToFetch =
          memoizedSeasons && memoizedSeasons.length > 0 ? memoizedSeasons : [latestSeason];

        // Always use the merged cache for optimal performance
        // Client-side filtering will handle season-specific views
        logger.info('Using merged games cache for optimal performance', {
          seasons: seasonsToFetch,
        });

        try {
          const mergedResponse = await fetch(
            `/api/games?season=all&limit=${_limit || 20000}${bypassParam}`
          );

          if (mergedResponse.ok) {
            const mergedData = await mergedResponse.json();
            if (
              isGamesApiResponse(mergedData) &&
              mergedData.response &&
              mergedData.response.length > 0
            ) {
              allGames = mergedData.response as IGameResponse[];
              // Loaded ${allGames.length} games from merged cache

              // Determine cache status based on forceRefresh flag
              setCacheStatus(forceRefresh ? 'fresh' : 'cached');

              logger.info('Games loaded', {
                count: allGames.length,
                season: latestSeason,
                cacheStatus: forceRefresh ? 'fresh' : 'cached',
              });
            }
          }
        } catch (_error) {
          logger.info('Merged cache failed', { seasons: seasonsToFetch });
          // Fallback to empty games array
          allGames = [];
        }

        // Determine cache status based on forceRefresh flag
        setCacheStatus(forceRefresh ? 'fresh' : 'cached');

        logger.info('games loaded', {
          count: allGames.length,
          seasons: seasonsToFetch,
          cacheStatus: forceRefresh ? 'fresh' : 'cached',
        });
      }

      // Sort games by date (most recent first)
      const sortedGames = allGames.sort((a, b) => {
        const dateA = typeof a.date === 'string' ? new Date(a.date) : new Date(a.date.start);
        const dateB = typeof b.date === 'string' ? new Date(b.date) : new Date(b.date.start);
        return dateB.getTime() - dateA.getTime(); // Descending order
      });

      // Apply limit if specified
      const limitedGames = _limit ? sortedGames.slice(0, _limit) : sortedGames;

      setLatestGames(limitedGames);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      setLatestGames([]);
      setCacheStatus('none');
      errorHandlers.api(error, { component: 'useLatestGames', action: 'fetchLatestGames' });
    } finally {
      setLoading(false);
    }
  }, [skip, forceRealData, memoizedSeasons, latestSeason, _limit, forceRefresh]);

  const refetch = useCallback(() => {
    void fetchLatestGames();
  }, [fetchLatestGames]);

  const refreshCache = useCallback(() => {
    void fetchLatestGames();
  }, [fetchLatestGames]);

  useEffect(() => {
    void fetchLatestGames();
  }, [fetchLatestGames]);

  return {
    latestGames,
    loading,
    error,
    cacheStatus,
    note,
    refetch,
    refreshCache,
  };
}
