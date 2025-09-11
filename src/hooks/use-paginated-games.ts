import { useState, useEffect, useCallback } from 'react';

import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import { isMockModeEnabled } from '@/lib/utils/mock-mode';
import type {
  IGameResponse,
  IPaginatedGamesOptions,
  IPaginatedGamesResponse,
  IPaginatedGamesReturn,
} from '@/types';

// Helper function to detect test environment
function isTestOrCIEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'test' ||
    process.env.CI === 'true' ||
    process.env.VITEST === 'true' ||
    (typeof window !== 'undefined' && Boolean(window.__PLAYWRIGHT_TEST__))
  );
}

export function usePaginatedGames(options: IPaginatedGamesOptions = {}): IPaginatedGamesReturn {
  const {
    season = 'all',
    status = 'all',
    page = 1,
    limit = 50,
    skip = false,
    forceRefresh = false,
  } = options;

  const [games, setGames] = useState<IGameResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<IPaginatedGamesResponse['pagination'] | null>(null);
  const [cacheInfo, setCacheInfo] = useState<IPaginatedGamesResponse['cacheInfo'] | null>(null);

  // State for dynamic parameters
  const [currentPage, setCurrentPage] = useState(page);
  const [currentStatus, setCurrentStatus] = useState<
    'all' | 'finished' | 'live' | 'scheduled' | 'cancelled'
  >(status);
  const [currentSeason, setCurrentSeason] = useState(season);
  const [currentLimit, setCurrentLimit] = useState(limit);

  // Sync internal state with props
  useEffect(() => {
    setCurrentPage(page);
    setCurrentStatus(status);
    setCurrentSeason(season);
    setCurrentLimit(limit);
  }, [page, status, season, limit]);

  const fetchGames = useCallback(async () => {
    if (skip) return;

    try {
      setLoading(true);
      setError(null);

      // Use mock data in development if MOCK_MODE is enabled, or in test environments
      const useMockData = isMockModeEnabled() || isTestOrCIEnvironment();

      if (useMockData) {
        // For mock data, fetch from mock endpoint
        const response = await fetch('/api/mock-server?action=mock-data&type=nba-games');
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (typeof data === 'object' && data !== null && 'data' in data) {
          const mockData = (data as { data: unknown }).data;
          if (typeof mockData === 'object' && mockData !== null && 'response' in mockData) {
            const mockGames = (mockData as { response: IGameResponse[] }).response;

            // Simulate pagination for mock data
            const startIndex = (currentPage - 1) * currentLimit;
            const endIndex = startIndex + currentLimit;
            const paginatedGames = mockGames.slice(startIndex, endIndex);

            setGames(paginatedGames);
            setPagination({
              page: currentPage,
              limit: currentLimit,
              totalCount: mockGames.length,
              totalPages: Math.ceil(mockGames.length / currentLimit),
              hasNextPage: endIndex < mockGames.length,
              hasPrevPage: currentPage > 1,
            });
            setCacheInfo({
              hit: false,
              key: 'mock-data',
              ttl: 0,
              status: 'mock',
            });
          }
        }
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        season: currentSeason,
        status: currentStatus,
        page: currentPage.toString(),
        limit: currentLimit.toString(),
      });

      if (forceRefresh) {
        params.append('bypass-cache', 'true');
      }

      const response = await fetch(`/api/games?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: IPaginatedGamesResponse = await response.json();

      if (data.success) {
        // Use new data format, fallback to response for backward compatibility
        const gamesData = data.data || data.response || [];
        setGames(gamesData);
        setPagination(data.pagination);
        setCacheInfo(data.cacheInfo);

        logger.info('Paginated games fetched successfully', {
          season: currentSeason,
          status: currentStatus,
          page: currentPage,
          limit: currentLimit,
          count: gamesData.length,
          totalCount: data.pagination.totalCount,
          cacheHit: data.cacheInfo.hit,
        });
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);

      errorHandlers.api(err instanceof Error ? err : new Error(String(err)), {
        component: 'usePaginatedGames',
        action: 'fetchGames',
        metadata: {
          season: currentSeason,
          status: currentStatus,
          page: currentPage,
          limit: currentLimit,
        },
      });

      logger.error('Failed to fetch paginated games', {
        error: errorMessage,
        season: currentSeason,
        status: currentStatus,
        page: currentPage,
        limit: currentLimit,
      });
    } finally {
      setLoading(false);
    }
  }, [skip, currentSeason, currentStatus, currentPage, currentLimit, forceRefresh]);

  // Fetch games when parameters change
  useEffect(() => {
    void fetchGames();
  }, [fetchGames]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, currentSeason, currentStatus, currentLimit]);

  // Memoized setters to prevent unnecessary re-renders
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setStatus = useCallback(
    (status: 'all' | 'finished' | 'live' | 'scheduled' | 'cancelled') => {
      setCurrentStatus(status);
    },
    []
  );

  const setSeason = useCallback((season: string) => {
    setCurrentSeason(season);
  }, []);

  const setLimit = useCallback((limit: number) => {
    setCurrentLimit(limit);
  }, []);

  return {
    games,
    loading,
    error,
    pagination,
    cacheInfo,
    refetch: fetchGames,
    setPage,
    setStatus,
    setSeason,
    setLimit,
  };
}
