'use client';

import { useState, useEffect, useCallback } from 'react';

import type { ITeamsApiResponse, ITeamResponse, IUseNBATeamsOptions } from '@/lib/types';
import { isTestOrCIEnvironment } from '@/lib/utils/e2e-test-setup';

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

      // Use mock data in development if API_MOCK_MODE is enabled, or in test environments
      const useMockData =
        !forceRealData &&
        ((typeof window !== 'undefined' && window.__API_MOCK_MODE__) ||
          (process.env.NODE_ENV === 'development' && process.env.API_MOCK_MODE === 'true') ||
          isTestOrCIEnvironment());

      const endpoint = useMockData
        ? '/api/mock-server?action=mock-data&type=nba-teams'
        : '/api/proxy/teams?league=standard';

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as unknown;

      // Handle mock server response format
      if (useMockData && typeof data === 'object' && data !== null && 'data' in data) {
        const mockData = (data as { data: unknown }).data;
        if (isTeamsApiResponse(mockData)) {
          setTeams(mockData.response || []);
        } else {
          setTeams([]);
        }
        return;
      }

      // Handle regular API response
      if (isTeamsApiResponse(data)) {
        // Filter out All-Star teams and non-NBA franchise teams for cleaner display
        const nbaTeams = (data.response || []).filter(team => !team.allStar && team.nbaFranchise);
        setTeams(nbaTeams);
      } else {
        setTeams([]);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      setTeams([]);
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
