'use client';

import { useState, useEffect, useCallback } from 'react';

import type { ITeamsApiResponse, ITeamResponse, IUseNBATeamsOptions } from '@/lib/types';
import { isTestOrCIEnvironment } from '@/lib/utils/e2e-test-setup';
import { errorHandlers } from '@/lib/utils/error-handler';
import { isMockModeEnabled } from '@/lib/utils/mock-mode';

function isTeamsApiResponse(data: unknown): data is ITeamsApiResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'response' in data &&
    Array.isArray((data as ITeamsApiResponse).response)
  );
}

export function useNBATeams(options: IUseNBATeamsOptions = {}) {
  const { skip = false, forceRealData = false } = options;

  const [teams, setTeams] = useState<ITeamResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    if (skip) return;

    try {
      setLoading(true);
      setError(null);

      // Use mock data in development if MOCK_MODE is enabled, or in test environments
      const useMockData = !forceRealData && (isMockModeEnabled() || isTestOrCIEnvironment());

      if (useMockData) {
        // Handle mock data
        const response = await fetch('/api/mock-server?action=mock-data&type=nba-teams');
        if (!response.ok) {
          throw new Error(`Mock API request failed: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as unknown;
        if (typeof data === 'object' && data !== null && 'data' in data) {
          const mockData = (data as { data: unknown }).data;
          if (isTeamsApiResponse(mockData)) {
            setTeams(mockData.response || []);
          } else {
            setTeams([]);
          }
        }
        return;
      }

      // Cache logic removed - fetch directly from database API
      console.log('🏀 Fetching teams from database API...');
      const dbResponse = await fetch('/api/teams');
      if (!dbResponse.ok) {
        throw new Error(
          `Database API request failed: ${dbResponse.status} ${dbResponse.statusText}`
        );
      }

      const dbData = (await dbResponse.json()) as unknown;
      if (isTeamsApiResponse(dbData)) {
        // Use all teams from database - let users filter as needed
        const allTeams = dbData.response || [];
        console.log(`✅ Loaded ${allTeams.length} teams from database`);
        setTeams(allTeams);
      } else {
        setTeams([]);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      setTeams([]);
      errorHandlers.api(error, { component: 'useNBATeams', action: 'fetchTeams' });
    } finally {
      setLoading(false);
    }
  }, [skip, forceRealData]);

  const refetch = useCallback(() => {
    void fetchTeams();
  }, [fetchTeams]);

  useEffect(() => {
    void fetchTeams();
  }, [fetchTeams]);

  return {
    teams,
    loading,
    error,
    refetch,
  };
}
