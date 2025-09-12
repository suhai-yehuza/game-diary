import { useState, useCallback, useEffect } from 'react';

import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import type { IStandingsApiResponse, IUseStandingsOptions, IUseStandingsResult } from '@/types';

export function useStandings(options: IUseStandingsOptions = {}): IUseStandingsResult {
  const [standings, setStandings] = useState<IStandingsApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = useCallback(async () => {
    if (options.skip) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (options.season) {
        params.append('season', options.season);
      }
      if (options.conference) {
        params.append('conference', options.conference);
      }
      if (options.division) {
        params.append('division', options.division);
      }
      if (options.team) {
        params.append('team', options.team);
      }
      if (options.league) {
        params.append('league', options.league);
      }

      const queryString = params.toString();
      const url = `/api/standings${queryString ? `?${queryString}` : ''}`;

      logger.info('Fetching standings', { url, options });

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch standings');
      }

      setStandings(result.data);
      logger.info('Standings fetched successfully', {
        resultsCount: result.data?.results || 0,
        season: options.season,
        conference: options.conference,
        division: options.division,
        team: options.team,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch standings';
      setError(errorMessage);

      errorHandlers.api(err instanceof Error ? err : new Error(String(err)), {
        component: 'useStandings',
        action: 'fetchStandings',
      });

      logger.error('Error fetching standings', {
        error: errorMessage,
        options,
      });
    } finally {
      setLoading(false);
    }
  }, [options]);

  // Fetch standings when options change
  useEffect(() => {
    void fetchStandings();
  }, [fetchStandings]);

  return {
    standings,
    loading,
    error,
    refetch: fetchStandings,
  };
}
