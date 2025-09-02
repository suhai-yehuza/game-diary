'use client';

import { useState, useEffect, useCallback } from 'react';

import type { IPlayersApiResponse, IPlayerResponse, IUseNBAPlayersOptions } from '@/lib/types';
import { isTestOrCIEnvironment } from '@/lib/utils/e2e-test-setup';
import { errorHandlers } from '@/lib/utils/error-handler';
import { isMockModeEnabled } from '@/lib/utils/mock-mode';

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

      // Use mock data in development if MOCK_MODE is enabled, or in test environments
      const useMockData = !forceRealData && (isMockModeEnabled() || isTestOrCIEnvironment());

      if (useMockData) {
        // Handle mock data
        const response = await fetch('/api/mock-server?action=mock-data&type=nba-players');
        if (!response.ok) {
          throw new Error(`Mock API request failed: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as unknown;
        if (typeof data === 'object' && data !== null && 'data' in data) {
          const mockData = (data as { data: unknown }).data;
          if (isPlayersApiResponse(mockData)) {
            setPlayers(mockData.response || []);
          } else {
            setPlayers([]);
          }
        }
        return;
      }

      // Cache logic removed - fetch directly from database API
      console.log('👥 Fetching players from database API...');
      const params = new URLSearchParams({
        limit: '200', // Get more players by default
      });
      if (teamId) {
        params.append('team', teamId);
      }
      const endpoint = `/api/players?${params.toString()}`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Database API request failed: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as unknown;

      // Handle database API response
      if (isPlayersApiResponse(data)) {
        // Filter for active standard league players
        const activePlayers = (data.response || []).filter(
          player => player.leagues?.standard?.active !== false
        );
        console.log(`✅ Loaded ${activePlayers.length} players from database`);
        setPlayers(activePlayers);
      } else {
        setPlayers([]);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      setPlayers([]);
      errorHandlers.api(error, { component: 'useNBAPlayers', action: 'fetchPlayers' });
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
