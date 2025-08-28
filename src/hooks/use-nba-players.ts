'use client';

import { useState, useEffect, useCallback } from 'react';

import type { IPlayersApiResponse, IPlayerResponse, IUseNBAPlayersOptions } from '@/lib/types';
import { isTestOrCIEnvironment } from '@/lib/utils/e2e-test-setup';

function isPlayersApiResponse(data: unknown): data is IPlayersApiResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'response' in data &&
    Array.isArray((data as IPlayersApiResponse).response)
  );
}

export function useNBAPlayers(options: IUseNBAPlayersOptions = {}) {
  const { skip = false, forceRealData = false, teamId, season: _season = '2024' } = options;

  const [players, setPlayers] = useState<IPlayerResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = useCallback(async () => {
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

      let endpoint: string;
      if (useMockData) {
        endpoint = '/api/mock-server?action=mock-data&type=nba-players';
      } else {
        // Fetch from our database API instead of external proxy
        const params = new URLSearchParams({
          limit: '200', // Get more players by default
        });
        if (teamId) {
          params.append('team', teamId);
        }
        endpoint = `/api/players?${params.toString()}`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as unknown;

      // Handle mock server response format
      if (useMockData && typeof data === 'object' && data !== null && 'data' in data) {
        const mockData = (data as { data: unknown }).data;
        if (isPlayersApiResponse(mockData)) {
          setPlayers(mockData.response || []);
        } else {
          setPlayers([]);
        }
        return;
      }

      // Handle database API response
      if (isPlayersApiResponse(data)) {
        // Filter for active standard league players
        const activePlayers = (data.response || []).filter(
          player => player.leagues?.standard?.active !== false
        );
        setPlayers(activePlayers);
      } else {
        setPlayers([]);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, [skip, forceRealData, teamId]);

  const refetch = useCallback(() => {
    void fetchPlayers();
  }, [fetchPlayers]);

  useEffect(() => {
    void fetchPlayers();
  }, [fetchPlayers]);

  return {
    players,
    loading,
    error,
    refetch,
  };
}
