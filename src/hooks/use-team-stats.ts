import { useCallback, useEffect, useState } from 'react';

import { isTestOrCIEnvironment } from '@/lib/utils/e2e-test-setup';
import { errorHandlers } from '@/lib/utils/error-handler';
import { isMockModeEnabled } from '@/lib/utils/mock-mode';
import type { ITeamStatsResponse, ITeamStatsApiResponse, IUseTeamStatsOptions } from '@/types';

export function useTeamStats(options: IUseTeamStatsOptions) {
  const { teamId, season, skip = false, forceRealData = false } = options;

  const [stats, setStats] = useState<ITeamStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamStats = useCallback(async () => {
    if (skip || !teamId) return;

    try {
      setLoading(true);
      setError(null);

      // Use mock data in development if MOCK_MODE is enabled, or in test environments
      const useMockData = !forceRealData && (isMockModeEnabled() || isTestOrCIEnvironment());

      if (useMockData) {
        // Handle mock data
        const response = await fetch('/api/mock-server?action=mock-data&type=nba-team-stats');
        if (!response.ok) {
          throw new Error(`Mock API request failed: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as unknown;
        if (typeof data === 'object' && data !== null && 'data' in data) {
          const mockData = (data as { data: unknown }).data;
          if (typeof mockData === 'object' && mockData !== null) {
            setStats(mockData as ITeamStatsResponse);
          } else {
            setStats(null);
          }
        }
        return;
      }

      // Fetch team statistics from API
      const params = new URLSearchParams();
      if (season) {
        params.append('season', season);
      }

      const endpoint = `/api/teams/${teamId}/stats?${params.toString()}`;
      console.log('🔗 Calling team stats API endpoint:', endpoint);

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as ITeamStatsApiResponse;

      if (data.success && data.data) {
        setStats(data.data);
        console.log(`✅ Loaded team stats for team ${teamId} in season ${season || 'current'}`);
      } else {
        setStats(null);
        if (data.error) {
          setError(data.error);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      setStats(null);
      errorHandlers.api(error, { component: 'useTeamStats', action: 'fetchTeamStats' });
    } finally {
      setLoading(false);
    }
  }, [teamId, season, skip, forceRealData]);

  const refetch = useCallback(() => {
    void fetchTeamStats();
  }, [fetchTeamStats]);

  useEffect(() => {
    void fetchTeamStats();
  }, [fetchTeamStats]);

  return {
    stats,
    loading,
    error,
    refetch,
  };
}
