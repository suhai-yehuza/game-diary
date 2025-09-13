import { useCallback, useEffect, useState } from 'react';

import { API_LIMITS } from '@/lib/constants';
import { isTestOrCIEnvironment } from '@/lib/utils/e2e-test-setup';
import { errorHandlers } from '@/lib/utils/error-handler';
import { isMockModeEnabled } from '@/lib/utils/mock-mode';
import type {
  IGameResponse,
  IHeadToHeadGamesApiResponse,
  IUseHeadToHeadGamesOptions,
} from '@/types';

export function useHeadToHeadGames(options: IUseHeadToHeadGamesOptions) {
  const {
    teamId,
    season,
    startDate,
    endDate,
    opponent,
    page = 1,
    limit = API_LIMITS.GAMES.DEFAULT,
    skip = false,
    forceRealData = false,
  } = options;

  const [games, setGames] = useState<IGameResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null>(null);

  const fetchHeadToHeadGames = useCallback(async () => {
    if (skip || !teamId) return;

    try {
      setLoading(true);
      setError(null);

      // Use mock data in development if MOCK_MODE is enabled, or in test environments
      const useMockData = !forceRealData && (isMockModeEnabled() || isTestOrCIEnvironment());

      if (useMockData) {
        // Handle mock data
        const response = await fetch('/api/mock-server?action=mock-data&type=nba-games');
        if (!response.ok) {
          throw new Error(`Mock API request failed: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as unknown;
        if (typeof data === 'object' && data !== null && 'data' in data) {
          const mockData = (data as { data: unknown }).data;
          if (Array.isArray(mockData)) {
            setGames(mockData as IGameResponse[]);
            setPagination({
              page: 1,
              limit: mockData.length,
              totalCount: mockData.length,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            });
          } else {
            setGames([]);
            setPagination(null);
          }
        }
        return;
      }

      // Fetch head-to-head games from API
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (season) {
        params.append('season', season);
      }
      if (startDate) {
        params.append('date', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }
      if (opponent) {
        params.append('opponent', opponent);
      }

      const endpoint = `/api/teams/${teamId}/head-to-head?${params.toString()}`;
      console.log('🔗 Calling head-to-head API endpoint:', endpoint);

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as IHeadToHeadGamesApiResponse;

      if (data.success && Array.isArray(data.data)) {
        setGames(data.data);
        setPagination(data.pagination);
        console.log(`✅ Loaded ${data.data.length} head-to-head games for team ${teamId}`);
      } else {
        setGames([]);
        setPagination(null);
        if (data.error) {
          setError(data.error);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      setGames([]);
      setPagination(null);
      errorHandlers.api(error, { component: 'useHeadToHeadGames', action: 'fetchHeadToHeadGames' });
    } finally {
      setLoading(false);
    }
  }, [teamId, season, startDate, endDate, opponent, page, limit, skip, forceRealData]);

  const refetch = useCallback(() => {
    void fetchHeadToHeadGames();
  }, [fetchHeadToHeadGames]);

  useEffect(() => {
    void fetchHeadToHeadGames();
  }, [fetchHeadToHeadGames]);

  return {
    games,
    loading,
    error,
    pagination,
    refetch,
  };
}
