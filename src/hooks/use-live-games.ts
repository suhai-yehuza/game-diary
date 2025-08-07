import { useEffect, useState, useCallback } from 'react';

import { INTERNAL_PROXY_ENDPOINTS } from '@/lib/config/app.config';
import type { IGamesApiResponse, IUseLiveGamesOptions } from '@/lib/types';
import { isTestOrCIEnvironment } from '@/lib/utils/e2e-test-setup';

// Constants
const REFRESH_INTERVAL_MS = 30000;

function isGamesApiResponse(data: unknown): data is IGamesApiResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'results' in data &&
    'response' in data &&
    Array.isArray((data as IGamesApiResponse).response)
  );
}

export function useLiveGames(options: IUseLiveGamesOptions = {}) {
  const { autoRefresh = true, refreshInterval = REFRESH_INTERVAL_MS, initialData } = options;

  const [liveGames, setLiveGames] = useState<IGamesApiResponse | null>(initialData ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveGames = useCallback(async () => {
    if (initialData) return; // Don't fetch if data is provided via prop

    try {
      setLoading(true);
      setError(null);

      // In test environments, use mock server endpoint
      const endpoint = isTestOrCIEnvironment()
        ? '/api/mock-server?action=mock-data&type=live-games'
        : `${INTERNAL_PROXY_ENDPOINTS.GAMES}?live=all`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as unknown;

      // Handle mock server response format
      if (isTestOrCIEnvironment() && typeof data === 'object' && data !== null && 'data' in data) {
        const mockData = (data as { data: unknown }).data;
        if (isGamesApiResponse(mockData)) {
          setLiveGames(mockData);
        } else {
          setLiveGames(null);
        }
        return;
      }

      // Handle regular API response
      if (isGamesApiResponse(data)) {
        setLiveGames(data);
      } else {
        setLiveGames(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      setLiveGames(null);
    } finally {
      setLoading(false);
    }
  }, [initialData]);

  useEffect(() => {
    if (!initialData) {
      void fetchLiveGames();
      // Refresh live games if autoRefresh is enabled
      if (autoRefresh) {
        const interval = setInterval(() => {
          void fetchLiveGames();
        }, refreshInterval);
        return () => {
          clearInterval(interval);
        };
      }
    }
  }, [fetchLiveGames, initialData, autoRefresh, refreshInterval]);

  const games = liveGames?.response ?? [];

  return {
    liveGames,
    games,
    loading,
    error,
    refetch: fetchLiveGames,
  };
}
