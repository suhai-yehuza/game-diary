import { useState, useEffect, useCallback } from 'react';

import type { INBAHubCounts, IUseNBAHubCountsReturn } from '@/types';

/**
 * Custom hook for NBA Hub counts
 * Provides cached counts for games, teams, and players
 * Leverages the server-side hybrid cache (Redis + in-memory)
 */
export function useNBAHubCounts(): IUseNBAHubCountsReturn {
  const [counts, setCounts] = useState<INBAHubCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [source, setSource] = useState<'cache' | 'database' | null>(null);

  const fetchCounts = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Always fetch from API - the API handles the hybrid caching
      // If forceRefresh is true, we'll bypass browser cache
      const url = '/api/nba-hub/counts';
      const options: RequestInit = forceRefresh
        ? {
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache',
            },
          }
        : {};

      const response = await fetch(url, options);
      const data = await response.json();

      if (data.success) {
        setCounts(data.counts);
        setLastUpdated(new Date());
        setSource(data.source || 'database');

        console.log(
          `📊 NBA Hub counts updated: ${data.counts.totalGames} games, ${data.counts.totalTeams} teams, ${data.counts.totalPlayers} players (source: ${data.source})`
        );
      } else {
        throw new Error(data.error || 'Failed to fetch counts');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching NBA Hub counts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    void fetchCounts();
  }, [fetchCounts]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('🔍 Hook state changed:', {
      counts: counts ? '✅ Has data' : '❌ No data',
      loading,
      error,
      source,
      lastUpdated: lastUpdated?.toISOString(),
    });
  }, [counts, loading, error, source, lastUpdated]);

  // Refresh function for manual updates
  const refresh = useCallback(async () => {
    await fetchCounts(true);
  }, [fetchCounts]);

  return {
    counts: counts || { totalGames: 0, totalTeams: 0, totalPlayers: 0, liveGames: 0 },
    loading,
    error,
    refresh,
    lastUpdated: lastUpdated || undefined,
    source: source || undefined,
  };
}
