import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useLiveGames } from '@/hooks/use-live-games';
import { MOCK_LIVE_GAMES } from '@/lib/mock/liveGamesMock';
import type { IGamesApiResponse, IGameResponse } from '@/lib/types/externalApiTypes';

// Mock fetch globally
global.fetch = vi.fn();

// Mock the API config
vi.mock('@/lib/config/api.config', () => ({
  INTERNAL_PROXY_ENDPOINTS: {
    GAMES: '/api/proxy/games',
  },
}));

// Mock the mock data
vi.mock('@/lib/mock/liveGamesMock', () => ({
  MOCK_LIVE_GAMES: {
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
          home: { id: 1, name: 'Home Team', nickname: 'Home', code: 'HOME', logo: 'logo.png' },
          visitors: { id: 2, name: 'Away Team', nickname: 'Away', code: 'AWAY', logo: 'logo.png' },
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
        date: { start: '2024-01-01T22:00:00Z' },
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
          home: { id: 3, name: 'Home Team 2', nickname: 'Home2', code: 'HOME2', logo: 'logo2.png' },
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
  },
}));

// Helper function to create valid game data
const createMockGame = (id: number, homeTeam: string, awayTeam: string): IGameResponse => ({
  id,
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
      id: id * 2 - 1,
      name: homeTeam,
      nickname: homeTeam,
      code: homeTeam.toUpperCase(),
      logo: 'logo.png',
    },
    visitors: {
      id: id * 2,
      name: awayTeam,
      nickname: awayTeam,
      code: awayTeam.toUpperCase(),
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
});

const createMockGamesResponse = (games: IGameResponse[]): IGamesApiResponse => ({
  get: '/games',
  parameters: {},
  errors: [],
  results: games.length,
  response: games,
});

describe('useLiveGames', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization with initial data', () => {
    it('initializes with provided initial data', () => {
      const initialData = createMockGamesResponse([
        createMockGame(999, 'Initial Team', 'Away Team'),
      ]);

      const { result } = renderHook(() => useLiveGames({ initialData }));

      expect(result.current.liveGames).toEqual(initialData);
      expect(result.current.games).toEqual(initialData.response);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.refetch).toBe('function');
    });

    it('does not fetch data when initial data is provided', () => {
      const initialData = createMockGamesResponse([
        createMockGame(999, 'Initial Team', 'Away Team'),
      ]);

      renderHook(() => useLiveGames({ initialData }));

      // Should not call fetch when initial data is provided
      expect(fetch).not.toHaveBeenCalled();
    });

    it('returns games from initial data when available', () => {
      const initialData = createMockGamesResponse([
        createMockGame(1, 'Live Team 1', 'Away Team 1'),
        createMockGame(2, 'Live Team 2', 'Away Team 2'),
      ]);

      const { result } = renderHook(() => useLiveGames({ initialData }));

      expect(result.current.liveGames).toEqual(initialData);
      expect(result.current.games).toEqual(initialData.response);
      expect(result.current.games).toHaveLength(2);
    });
  });

  describe('initialization without initial data', () => {
    it('initializes with default state when no initial data provided', () => {
      const { result } = renderHook(() => useLiveGames());

      expect(result.current.liveGames).toBeNull();
      expect(result.current.games).toEqual(MOCK_LIVE_GAMES.response);
      expect(result.current.loading).toBe(true); // changed from false to true
      expect(result.current.error).toBeNull();
      expect(typeof result.current.refetch).toBe('function');
    });

    it('always returns games array even when liveGames is null', () => {
      const { result } = renderHook(() => useLiveGames());

      expect(result.current.liveGames).toBeNull();
      expect(result.current.games).toEqual(MOCK_LIVE_GAMES.response);
      expect(result.current.games).toHaveLength(2);
    });
  });

  describe('options handling', () => {
    it('accepts autoRefresh option', () => {
      const { result } = renderHook(() => useLiveGames({ autoRefresh: false }));

      expect(result.current.liveGames).toBeNull();
      expect(result.current.games).toEqual(MOCK_LIVE_GAMES.response);
      expect(result.current.loading).toBe(true); // changed from false to true
      expect(result.current.error).toBeNull();
    });

    it('accepts refreshInterval option', () => {
      const { result } = renderHook(() => useLiveGames({ refreshInterval: 10000 }));

      expect(result.current.liveGames).toBeNull();
      expect(result.current.games).toEqual(MOCK_LIVE_GAMES.response);
      expect(result.current.loading).toBe(true); // changed from false to true
      expect(result.current.error).toBeNull();
    });

    it('accepts both autoRefresh and refreshInterval options', () => {
      const { result } = renderHook(() =>
        useLiveGames({ autoRefresh: true, refreshInterval: 15000 })
      );

      expect(result.current.liveGames).toBeNull();
      expect(result.current.games).toEqual(MOCK_LIVE_GAMES.response);
      expect(result.current.loading).toBe(true); // changed from false to true
      expect(result.current.error).toBeNull();
    });
  });

  describe('refetch function', () => {
    it('provides a refetch function', () => {
      const { result } = renderHook(() => useLiveGames());

      expect(typeof result.current.refetch).toBe('function');
      expect(result.current.refetch).toBeInstanceOf(Function);
    });

    it('refetch function is callable', () => {
      const { result } = renderHook(() => useLiveGames());

      // Should not throw when called
      expect(() => result.current.refetch()).not.toThrow();
    });
  });

  describe('data consistency', () => {
    it('returns games from liveGames when available', () => {
      const initialData = createMockGamesResponse([
        createMockGame(1, 'Live Team 1', 'Away Team 1'),
        createMockGame(2, 'Live Team 2', 'Away Team 2'),
        createMockGame(3, 'Live Team 3', 'Away Team 3'),
      ]);

      const { result } = renderHook(() => useLiveGames({ initialData }));

      expect(result.current.liveGames).toEqual(initialData);
      expect(result.current.games).toEqual(initialData.response);
      expect(result.current.games).toHaveLength(3);
    });

    it('falls back to mock data when liveGames is null', () => {
      const { result } = renderHook(() => useLiveGames());

      expect(result.current.liveGames).toBeNull();
      expect(result.current.games).toEqual(MOCK_LIVE_GAMES.response);
      expect(result.current.games).toHaveLength(2);
    });

    it('handles empty response array', () => {
      const emptyData = createMockGamesResponse([]);

      const { result } = renderHook(() => useLiveGames({ initialData: emptyData }));

      expect(result.current.liveGames).toEqual(emptyData);
      expect(result.current.games).toEqual([]);
      expect(result.current.games).toHaveLength(0);
    });
  });

  describe('mock data structure', () => {
    it('mock data has correct structure', () => {
      expect(MOCK_LIVE_GAMES).toHaveProperty('get');
      expect(MOCK_LIVE_GAMES).toHaveProperty('parameters');
      expect(MOCK_LIVE_GAMES).toHaveProperty('errors');
      expect(MOCK_LIVE_GAMES).toHaveProperty('results');
      expect(MOCK_LIVE_GAMES).toHaveProperty('response');
      expect(Array.isArray(MOCK_LIVE_GAMES.response)).toBe(true);
    });

    it('mock games have required properties', () => {
      const mockGame = MOCK_LIVE_GAMES.response[0];

      expect(mockGame).toHaveProperty('id');
      expect(mockGame).toHaveProperty('league');
      expect(mockGame).toHaveProperty('season');
      expect(mockGame).toHaveProperty('date');
      expect(mockGame).toHaveProperty('stage');
      expect(mockGame).toHaveProperty('status');
      expect(mockGame).toHaveProperty('periods');
      expect(mockGame).toHaveProperty('arena');
      expect(mockGame).toHaveProperty('teams');
      expect(mockGame).toHaveProperty('scores');
      expect(mockGame).toHaveProperty('officials');
      expect(mockGame).toHaveProperty('timesTied');
      expect(mockGame).toHaveProperty('leadChanges');
    });
  });
});
