import { useEffect, useState, useCallback, useMemo } from 'react';

import { INTERNAL_PROXY_ENDPOINTS } from '@/lib/config/app.config';
import { isTestOrCIEnvironment } from '@/lib/utils/e2e-test-setup';
import { isMockModeEnabled } from '@/lib/utils/mock-mode';
import type {
  IGamesApiResponse,
  IUseLiveGamesOptions,
  IUseLiveGamesReturn,
  IGameResponse,
  IExternalGame,
} from '@/types';

// Constants for adaptive polling
const FREQUENT_POLLING_INTERVAL_MS = 30000; // 30 seconds when games are live
const REDUCED_POLLING_INTERVAL_MS = 300000; // 5 minutes when no live games
const RESUME_FREQUENT_POLLING_AFTER_MS = 600000; // Resume frequent polling after 10 minutes of no games

// Helper function to transform external API games to internal format
function transformExternalGamesToInternal(games: IExternalGame[]): IGameResponse[] {
  return games
    .filter(game => {
      // Only include games with valid dates
      const gameDate = typeof game.date === 'string' ? game.date : game.date?.start;
      return gameDate && gameDate.trim() !== '' && !isNaN(new Date(gameDate).getTime());
    })
    .map(game => ({
      id: game.season ? `${game.season}-${game.id.toString()}` : game.id.toString(),
      date:
        typeof game.date === 'string' ? { start: game.date } : { start: game.date?.start || '' },
      home_team: game.teams?.home?.name || '',
      away_team: game.teams?.visitors?.name || '',
      home_score: game.scores?.home?.points || 0,
      away_score: game.scores?.visitors?.points || 0,
      status:
        typeof game.status === 'string'
          ? { short: game.status }
          : { short: game.status?.short || '', long: game.status?.long, clock: game.status?.clock },
      teams: game.teams
        ? {
            home: {
              id: game.teams.home?.id?.toString() || '',
              name: game.teams.home?.name || '',
              nickname: game.teams.home?.nickname || '',
              code: game.teams.home?.code || '',
              logo: game.teams.home?.logo || '',
            },
            visitors: {
              id: game.teams.visitors?.id?.toString() || '',
              name: game.teams.visitors?.name || '',
              nickname: game.teams.visitors?.nickname || '',
              code: game.teams.visitors?.code || '',
              logo: game.teams.visitors?.logo || '',
            },
          }
        : undefined,
      scores: game.scores
        ? {
            home: {
              points: game.scores.home?.points || 0,
            },
            visitors: {
              points: game.scores.visitors?.points || 0,
            },
          }
        : undefined,
      season: game.season,
      stage: typeof game.stage === 'string' ? parseInt(game.stage) || 0 : game.stage || 0,
      nugget: game.nugget,
      arena: game.arena
        ? {
            name: game.arena.name || '',
            city: game.arena.city || '',
            state: game.arena.state || '',
          }
        : undefined,
      periods: game.periods
        ? {
            current: game.periods.current || 0,
            total: game.periods.total || 0,
          }
        : undefined,
    }))
    .filter((game, index, array) => {
      // Deduplicate by ID - keep only the first occurrence
      return array.findIndex(g => g.id === game.id) === index;
    });
}

// Singleton to manage global polling state
let globalPollingInterval: NodeJS.Timeout | null = null;
const globalPollingSubscribers = new Set<() => void>();
let _globalLastFetch = 0;

// Global polling management functions
function startGlobalPolling(interval: number) {
  if (globalPollingInterval) {
    clearInterval(globalPollingInterval);
  }

  globalPollingInterval = setInterval(() => {
    _globalLastFetch = Date.now();
    // Notify all subscribers
    globalPollingSubscribers.forEach(callback => callback());
  }, interval);

  if (process.env.NODE_ENV === 'development') {
    console.log(`🌍 Global polling started: ${interval / 1000}s interval`);
  }
}

function stopGlobalPolling() {
  if (globalPollingInterval) {
    clearInterval(globalPollingInterval);
    globalPollingInterval = null;
    if (process.env.NODE_ENV === 'development') {
      console.log('🌍 Global polling stopped');
    }
  }
}

function subscribeToGlobalPolling(callback: () => void) {
  globalPollingSubscribers.add(callback);
  return () => {
    globalPollingSubscribers.delete(callback);
  };
}

function isGamesApiResponse(data: unknown): data is IGamesApiResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'results' in data &&
    'response' in data &&
    Array.isArray((data as IGamesApiResponse).response)
  );
}

export function useLiveGames(options: IUseLiveGamesOptions = {}): IUseLiveGamesReturn {
  const { autoRefresh = true, refreshInterval, initialData } = options;

  const [liveGames, setLiveGames] = useState<IGamesApiResponse | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData && autoRefresh);
  const [error, setError] = useState<string | null>(null);
  const [lastLiveGamesFound, setLastLiveGamesFound] = useState<number | null>(null);

  const fetchLiveGames = useCallback(async () => {
    if (initialData) return; // Don't fetch if data is provided via prop

    try {
      setLoading(true);
      setError(null);

      // Use mock data in development if MOCK_MODE is enabled, or in test environments
      const useMockData = isMockModeEnabled() || isTestOrCIEnvironment();
      const endpoint = useMockData
        ? '/api/mock-server?action=mock-data&type=live-games'
        : `${INTERNAL_PROXY_ENDPOINTS.GAMES}?live=all`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Handle mock server response format
      if (useMockData && typeof data === 'object' && data !== null && 'data' in data) {
        const mockData = (data as { data: unknown }).data;
        if (isGamesApiResponse(mockData)) {
          setLiveGames(mockData);
          // Track when live games are found
          if (mockData.response && mockData.response.length > 0) {
            setLastLiveGamesFound(Date.now());
          }
        } else {
          setLiveGames(null);
        }
        return;
      }

      // Handle regular API response
      if (isGamesApiResponse(data)) {
        setLiveGames(data);
        // Track when live games are found
        if (data.response && data.response.length > 0) {
          setLastLiveGamesFound(Date.now());
        }
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

  // Helper function to determine polling interval based on live games status
  const getAdaptivePollingInterval = useMemo(() => {
    // If user provided a custom refresh interval, use that
    if (refreshInterval) {
      return refreshInterval;
    }

    const now = Date.now();
    const hasLiveGames = liveGames?.response && liveGames.response.length > 0;

    if (hasLiveGames) {
      // Games are live - use frequent polling
      return FREQUENT_POLLING_INTERVAL_MS;
    }

    // No live games - check if we should resume frequent polling
    if (lastLiveGamesFound) {
      const timeSinceLastLiveGames = now - lastLiveGamesFound;
      if (timeSinceLastLiveGames < RESUME_FREQUENT_POLLING_AFTER_MS) {
        // Recently had live games - use frequent polling to catch new ones
        return FREQUENT_POLLING_INTERVAL_MS;
      }
    }

    // No live games for a while - use reduced polling
    return REDUCED_POLLING_INTERVAL_MS;
  }, [refreshInterval, liveGames?.response, lastLiveGamesFound]);

  // Subscribe to global polling
  useEffect(() => {
    if (!initialData && autoRefresh) {
      // Initial fetch
      void fetchLiveGames();

      // Subscribe to global polling
      const unsubscribe = subscribeToGlobalPolling(() => {
        void fetchLiveGames();
      });

      return unsubscribe;
    }
  }, [fetchLiveGames, initialData, autoRefresh]);

  // Manage global polling interval
  useEffect(() => {
    if (!initialData && autoRefresh) {
      const currentInterval = getAdaptivePollingInterval;

      // Start or update global polling
      startGlobalPolling(currentInterval);

      return () => {
        // Only stop global polling if this is the last subscriber
        if (globalPollingSubscribers.size === 1) {
          stopGlobalPolling();
        }
      };
    }
  }, [getAdaptivePollingInterval, initialData, autoRefresh]);

  // Log polling interval changes for debugging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = getAdaptivePollingInterval;
      const hasLiveGames = liveGames?.response && liveGames.response.length > 0;
      console.log(
        `🔄 Live Games Polling: ${hasLiveGames ? 'FREQUENT' : 'REDUCED'} (${interval / 1000}s interval)`
      );
    }
  }, [getAdaptivePollingInterval, liveGames?.response]);

  const games = useMemo(() => {
    return liveGames?.response ? transformExternalGamesToInternal(liveGames.response) : [];
  }, [liveGames?.response]);

  // Helper function to format time since last live games
  const getTimeSinceLastLiveGames = useCallback(() => {
    if (!lastLiveGamesFound) return null;
    const now = Date.now();
    const diff = now - lastLiveGamesFound;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s ago`;
  }, [lastLiveGamesFound]);

  const liveGamesTransformed = useMemo(() => {
    return liveGames?.response ? transformExternalGamesToInternal(liveGames.response) : null;
  }, [liveGames?.response]);

  return {
    liveGames: liveGamesTransformed,
    games: games,
    loading,
    error,
    refetch: fetchLiveGames,
    // Additional info for adaptive polling
    hasLiveGames: games.length > 0,
    currentPollingInterval: getAdaptivePollingInterval,
    timeSinceLastLiveGames: getTimeSinceLastLiveGames(),
  };
}
