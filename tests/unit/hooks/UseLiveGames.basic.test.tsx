import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useLiveGames } from '@/hooks/use-live-games';
import { MOCK_LIVE_GAMES } from '@/lib/mock/liveGamesMock';
import type { IGamesApiResponse } from '@/types';

// Mock the utility functions that determine mock mode
vi.mock('@/lib/utils/mock-mode', () => ({
  isMockModeEnabled: () => true,
}));

vi.mock('@/lib/utils/e2e-test-setup', () => ({
  isTestOrCIEnvironment: () => true,
}));

// Mock fetch globally
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ data: MOCK_LIVE_GAMES }),
});

// Mock the API config
vi.mock('@/lib/config/app.config', () => ({
  INTERNAL_PROXY_ENDPOINTS: {
    GAMES: '/api/proxy/games',
  },
}));

describe('useLiveGames', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization with initial data', () => {
    it('initializes with provided initial data', () => {
      const initialData: IGamesApiResponse = {
        get: '/games',
        parameters: {},
        errors: [],
        results: 1,
        response: [
          {
            id: 1,
            league: 'NBA',
            season: 2024,
            date: { start: '2024-01-01T20:00:00Z' },
            stage: 1,
            status: {
              clock: '12:00',
              halftime: false,
              short: 'Q1',
              long: '1st Quarter',
            },
            periods: { current: 1, total: 4, endOfPeriod: false },
            arena: { name: 'Test Arena', city: 'Test City' },
            teams: {
              home: {
                id: 1,
                name: 'Home Team',
                nickname: 'Home',
                code: 'HOME',
                logo: 'logo.png',
              },
              visitors: {
                id: 2,
                name: 'Away Team',
                nickname: 'Away',
                code: 'AWAY',
                logo: 'logo.png',
              },
            },
            scores: {
              home: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [0], points: 0 },
              visitors: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [0], points: 0 },
            },
            officials: [],
            timesTied: 0,
            leadChanges: 0,
          },
        ],
      };

      const { result } = renderHook(() => useLiveGames({ initialData }));

      // liveGames should be the transformed internal format
      expect(result.current.liveGames).toEqual([
        {
          id: '2024-1',
          date: { start: '2024-01-01T20:00:00Z' },
          home_team: 'Home Team',
          away_team: 'Away Team',
          home_score: 0,
          away_score: 0,
          status: { short: 'Q1', long: '1st Quarter', clock: '12:00' },
          teams: {
            home: {
              id: '1',
              name: 'Home Team',
              nickname: 'Home',
              code: 'HOME',
              logo: 'logo.png',
            },
            visitors: {
              id: '2',
              name: 'Away Team',
              nickname: 'Away',
              code: 'AWAY',
              logo: 'logo.png',
            },
          },
          scores: { home: { points: 0 }, visitors: { points: 0 } },
          season: 2024,
          stage: 1,
          nugget: undefined,
          arena: { name: 'Test Arena', city: 'Test City', state: '' },
          periods: { current: 1, total: 4 },
        },
      ]);
      // games should also be the transformed internal format
      expect(result.current.games).toEqual([
        {
          id: '2024-1',
          date: { start: '2024-01-01T20:00:00Z' },
          home_team: 'Home Team',
          away_team: 'Away Team',
          home_score: 0,
          away_score: 0,
          status: { short: 'Q1', long: '1st Quarter', clock: '12:00' },
          teams: {
            home: {
              id: '1',
              name: 'Home Team',
              nickname: 'Home',
              code: 'HOME',
              logo: 'logo.png',
            },
            visitors: {
              id: '2',
              name: 'Away Team',
              nickname: 'Away',
              code: 'AWAY',
              logo: 'logo.png',
            },
          },
          scores: { home: { points: 0 }, visitors: { points: 0 } },
          season: 2024,
          stage: 1,
          nugget: undefined,
          arena: { name: 'Test Arena', city: 'Test City', state: '' },
          periods: { current: 1, total: 4 },
        },
      ]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.refetch).toBe('function');
    });

    it('does not fetch data when initial data is provided', () => {
      const initialData: IGamesApiResponse = {
        get: '/games',
        parameters: {},
        errors: [],
        results: 0,
        response: [],
      };

      renderHook(() => useLiveGames({ initialData }));

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('options handling', () => {
    it('accepts autoRefresh option', () => {
      const { result } = renderHook(() => useLiveGames({ autoRefresh: false }));

      expect(result.current.liveGames).toBeNull();
      expect(result.current.games).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('accepts refreshInterval option', () => {
      const { result } = renderHook(() => useLiveGames({ refreshInterval: 10000 }));

      expect(result.current.liveGames).toBeNull();
      expect(result.current.games).toEqual([]);
      expect(result.current.loading).toBe(true); // Loading when autoRefresh is true (default)
      expect(result.current.error).toBeNull();
    });

    it('accepts both autoRefresh and refreshInterval options', () => {
      const { result } = renderHook(() =>
        useLiveGames({ autoRefresh: true, refreshInterval: 15000 })
      );

      expect(result.current.liveGames).toBeNull();
      expect(result.current.games).toEqual([]);
      expect(result.current.loading).toBe(true); // Loading when autoRefresh is true
      expect(result.current.error).toBeNull();
    });
  });

  describe('return values', () => {
    it('provides a refetch function', () => {
      const { result } = renderHook(() => useLiveGames());

      expect(typeof result.current.refetch).toBe('function');
      expect(result.current.refetch).toBeInstanceOf(Function);
    });

    it('returns correct initial state', () => {
      const { result } = renderHook(() => useLiveGames());

      expect(result.current.liveGames).toBeNull();
      expect(result.current.games).toEqual([]);
      expect(result.current.loading).toBe(true); // Loading when autoRefresh is true (default)
      expect(result.current.error).toBeNull();
      expect(result.current.hasLiveGames).toBe(false);
      expect(typeof result.current.currentPollingInterval).toBe('number');
      expect(result.current.timeSinceLastLiveGames).toBeNull();
    });

    it('returns games array even when liveGames is null', () => {
      const { result } = renderHook(() => useLiveGames());

      expect(Array.isArray(result.current.games)).toBe(true);
      expect(result.current.games).toEqual([]);
    });
  });

  describe('data consistency', () => {
    it('returns games from liveGames when available', () => {
      const initialData: IGamesApiResponse = {
        get: '/games',
        parameters: {},
        errors: [],
        results: 2,
        response: [
          {
            id: 1,
            league: 'NBA',
            season: 2024,
            date: { start: '2024-01-01T20:00:00Z' },
            stage: 1,
            status: {
              clock: '12:00',
              halftime: false,
              short: 'Q1',
              long: '1st Quarter',
            },
            periods: { current: 1, total: 4, endOfPeriod: false },
            arena: { name: 'Test Arena', city: 'Test City' },
            teams: {
              home: {
                id: 1,
                name: 'Home Team',
                nickname: 'Home',
                code: 'HOME',
                logo: 'logo.png',
              },
              visitors: {
                id: 2,
                name: 'Away Team',
                nickname: 'Away',
                code: 'AWAY',
                logo: 'logo.png',
              },
            },
            scores: {
              home: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [0], points: 0 },
              visitors: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [0], points: 0 },
            },
            officials: [],
            timesTied: 0,
            leadChanges: 0,
          },
          {
            id: 2,
            league: 'NBA',
            season: 2024,
            date: { start: '2024-01-01T21:00:00Z' },
            stage: 1,
            status: {
              clock: '12:00',
              halftime: false,
              short: 'Q1',
              long: '1st Quarter',
            },
            periods: { current: 1, total: 4, endOfPeriod: false },
            arena: { name: 'Test Arena 2', city: 'Test City 2' },
            teams: {
              home: {
                id: 3,
                name: 'Home Team 2',
                nickname: 'Home2',
                code: 'HOME2',
                logo: 'logo2.png',
              },
              visitors: {
                id: 4,
                name: 'Away Team 2',
                nickname: 'Away2',
                code: 'AWAY2',
                logo: 'logo2.png',
              },
            },
            scores: {
              home: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [0], points: 0 },
              visitors: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [0], points: 0 },
            },
            officials: [],
            timesTied: 0,
            leadChanges: 0,
          },
        ],
      };

      const { result } = renderHook(() => useLiveGames({ initialData }));

      // liveGames should be the transformed internal format
      expect(result.current.liveGames).toEqual([
        {
          id: '2024-1',
          date: { start: '2024-01-01T20:00:00Z' },
          home_team: 'Home Team',
          away_team: 'Away Team',
          home_score: 0,
          away_score: 0,
          status: { short: 'Q1', long: '1st Quarter', clock: '12:00' },
          teams: {
            home: {
              id: '1',
              name: 'Home Team',
              nickname: 'Home',
              code: 'HOME',
              logo: 'logo.png',
            },
            visitors: {
              id: '2',
              name: 'Away Team',
              nickname: 'Away',
              code: 'AWAY',
              logo: 'logo.png',
            },
          },
          scores: { home: { points: 0 }, visitors: { points: 0 } },
          season: 2024,
          stage: 1,
          nugget: undefined,
          arena: { name: 'Test Arena', city: 'Test City', state: '' },
          periods: { current: 1, total: 4 },
        },
        {
          id: '2024-2',
          date: { start: '2024-01-01T21:00:00Z' },
          home_team: 'Home Team 2',
          away_team: 'Away Team 2',
          home_score: 0,
          away_score: 0,
          status: { short: 'Q1', long: '1st Quarter', clock: '12:00' },
          teams: {
            home: {
              id: '3',
              name: 'Home Team 2',
              nickname: 'Home2',
              code: 'HOME2',
              logo: 'logo2.png',
            },
            visitors: {
              id: '4',
              name: 'Away Team 2',
              nickname: 'Away2',
              code: 'AWAY2',
              logo: 'logo2.png',
            },
          },
          scores: { home: { points: 0 }, visitors: { points: 0 } },
          season: 2024,
          stage: 1,
          nugget: undefined,
          arena: { name: 'Test Arena 2', city: 'Test City 2', state: '' },
          periods: { current: 1, total: 4 },
        },
      ]);
      // games should also be the transformed internal format
      expect(result.current.games).toEqual([
        {
          id: '2024-1',
          date: { start: '2024-01-01T20:00:00Z' },
          home_team: 'Home Team',
          away_team: 'Away Team',
          home_score: 0,
          away_score: 0,
          status: { short: 'Q1', long: '1st Quarter', clock: '12:00' },
          teams: {
            home: {
              id: '1',
              name: 'Home Team',
              nickname: 'Home',
              code: 'HOME',
              logo: 'logo.png',
            },
            visitors: {
              id: '2',
              name: 'Away Team',
              nickname: 'Away',
              code: 'AWAY',
              logo: 'logo.png',
            },
          },
          scores: { home: { points: 0 }, visitors: { points: 0 } },
          season: 2024,
          stage: 1,
          nugget: undefined,
          arena: { name: 'Test Arena', city: 'Test City', state: '' },
          periods: { current: 1, total: 4 },
        },
        {
          id: '2024-2',
          date: { start: '2024-01-01T21:00:00Z' },
          home_team: 'Home Team 2',
          away_team: 'Away Team 2',
          home_score: 0,
          away_score: 0,
          status: { short: 'Q1', long: '1st Quarter', clock: '12:00' },
          teams: {
            home: {
              id: '3',
              name: 'Home Team 2',
              nickname: 'Home2',
              code: 'HOME2',
              logo: 'logo2.png',
            },
            visitors: {
              id: '4',
              name: 'Away Team 2',
              nickname: 'Away2',
              code: 'AWAY2',
              logo: 'logo2.png',
            },
          },
          scores: { home: { points: 0 }, visitors: { points: 0 } },
          season: 2024,
          stage: 1,
          nugget: undefined,
          arena: { name: 'Test Arena 2', city: 'Test City 2', state: '' },
          periods: { current: 1, total: 4 },
        },
      ]);
      expect(result.current.games).toHaveLength(2);
      expect(result.current.hasLiveGames).toBe(true);
    });
  });
});
