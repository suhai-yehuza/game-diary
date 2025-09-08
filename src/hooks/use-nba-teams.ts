'use client';

import { useState, useEffect, useCallback } from 'react';

import { isTestOrCIEnvironment } from '@/lib/utils/e2e-test-setup';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import { isMockModeEnabled } from '@/lib/utils/mock-mode';
import type { ITeamsApiResponse, ITeamResponse, IUseNBATeamsOptions } from '@/types';

function isTeamsApiResponse(data: unknown): data is ITeamsApiResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'response' in data &&
    Array.isArray((data as ITeamsApiResponse).response)
  );
}

export function useNBATeams(options: IUseNBATeamsOptions = {}) {
  const { skip = false, forceRealData = false, forceRefresh = false } = options;

  const [teams, setTeams] = useState<ITeamResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStatus, setCacheStatus] = useState<'cached' | 'fresh' | 'none'>('none');

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

        const data = await response.json();
        if (isTeamsApiResponse(data)) {
          setTeams(data.response || []);
          setCacheStatus('none');
        } else {
          setTeams([]);
          setCacheStatus('none');
        }
        return;
      }

      // Fetch from cached API with cache bypass option
      try {
        const bypassParam = forceRefresh ? '?bypass-cache=true' : '';
        logger.info('🏀 Fetching teams from cached API...', { forceRefresh, bypassParam });

        const dbResponse = await fetch(`/api/teams${bypassParam}`);
        if (!dbResponse.ok) {
          throw new Error(
            `Database API request failed: ${dbResponse.status} ${dbResponse.statusText}`
          );
        }

        const dbData = await dbResponse.json();
        if (isTeamsApiResponse(dbData)) {
          // Use all teams from database - let users filter as needed
          const allTeams = dbData.response || [];
          console.log(`✅ Loaded ${allTeams.length} teams from database`);
          setTeams(allTeams);

          // Determine cache status based on response headers or forceRefresh flag
          const cacheHit = dbResponse.headers.get('x-cache') === 'HIT' || !forceRefresh;
          setCacheStatus(cacheHit ? 'cached' : 'fresh');

          logger.info('Teams loaded', {
            count: allTeams.length,
            forceRefresh,
          });
        } else {
          setTeams([]);
          setCacheStatus('none');
        }
      } catch (dbError) {
        // Handle database fetch errors specifically
        console.error('Database fetch error:', dbError);
        throw dbError;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      setTeams([]);
      setCacheStatus('none');
      errorHandlers.api(error, { component: 'useNBATeams', action: 'fetchTeams' });
    } finally {
      setLoading(false);
    }
  }, [skip, forceRealData, forceRefresh]);

  const refetch = useCallback(() => {
    void fetchTeams();
  }, [fetchTeams]);

  const refreshCache = useCallback(() => {
    void fetchTeams();
  }, [fetchTeams]);

  useEffect(() => {
    void fetchTeams();
  }, [fetchTeams]);

  return {
    teams,
    loading,
    error,
    cacheStatus,
    refetch,
    refreshCache,
  };
}
