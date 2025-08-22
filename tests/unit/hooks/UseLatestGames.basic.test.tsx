import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useLatestGames } from '@/hooks/use-latest-games';
import type { IGameResponse, IGamesApiResponse } from '@/lib/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment variables
vi.mock('@/lib/utils/nba-season', () => ({
  getLatestNbaSeason: vi.fn(() => '2024'),
}));

// Mock window.__API_MOCK_MODE__
const _mockWindow = {
  __API_MOCK_MODE__: false,
  __PLAYWRIGHT_TEST__: false,
};

Object.defineProperty(window, '__API_MOCK_MODE__', {
  value: false,
  writable: true,
});

Object.defineProperty(window, '__PLAYWRIGHT_TEST__', {
  value: false,
  writable: true,
});

// Helper function to create mock game data
const createMockGame = (id: number, date: string, status: string): IGameResponse => ({
  id,
  league: 'NBA',
  season: 2024,
  date: {
    start: date,
    end: new Date(new Date(date).getTime() + 2 * 60 * 60 * 1000).toISOString(),
    duration: '2:00',
  },
  stage: 2,
  status: {
    clock: undefined,
    halftime: false,
    short: status,
    long: status === 'FT' ? 'Finished' : 'Live',
  },
  periods: {
    current: 4,
    total: 4,
    endOfPeriod: false,
  },
  arena: {
    name: 'Test Arena',
    city: 'Test City',
    state: 'TS',
    country: 'USA',
  },
  teams: {
    home: {
      id: 583,
      name: 'Test Home Team',
      nickname: 'Home',
      code: 'HOME',
      logo: 'https://example.com/home-logo.png',
    },
    visitors: {
      id: 584,
      name: 'Test Away Team',
      nickname: 'Away',
      code: 'AWAY',
      logo: 'https://example.com/away-logo.png',
    },
  },
  scores: {
    home: {
      win: 15,
      loss: 12,
      series: { win: 0, loss: 0 },
      linescore: [25, 30, 28, 27],
      points: 110,
    },
    visitors: {
      win: 14,
      loss: 13,
      series: { win: 0, loss: 0 },
      linescore: [28, 25, 30, 25],
      points: 108,
    },
  },
  officials: ['Official 1', 'Official 2', 'Official 3'],
  timesTied: 5,
  leadChanges: 8,
});

const createMockApiResponse = (games: IGameResponse[]): IGamesApiResponse => ({
  get: 'games',
  parameters: {
    season: '2024',
    league: 'standard',
  },
  errors: [],
  results: games.length,
  response: games,
});

describe('useLatestGames', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();

    // Reset window mocks
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, '__API_MOCK_MODE__', {
        value: false,
        writable: true,
      });
      Object.defineProperty(window, '__PLAYWRIGHT_TEST__', {
        value: false,
        writable: true,
      });
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic functionality', () => {
    it('should be a function', () => {
      expect(typeof useLatestGames).toBe('function');
    });

    it('should return expected properties', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockApiResponse([]),
      });

      const { result } = renderHook(() => useLatestGames());

      expect(result.current).toHaveProperty('latestGames');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refetch');
      expect(result.current).toHaveProperty('season');
    });

    it('should have correct default values', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockApiResponse([]),
      });

      const { result } = renderHook(() => useLatestGames());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.latestGames).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.season).toBe('2024');
    });
  });

  describe('Data fetching', () => {
    it('should fetch games successfully', async () => {
      const mockGames = [
        createMockGame(1, '2024-12-23T19:30:00.000Z', 'FT'),
        createMockGame(2, '2024-12-22T19:30:00.000Z', 'FT'),
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockApiResponse(mockGames),
      });

      const { result } = renderHook(() => useLatestGames({ forceRealData: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.latestGames).toHaveLength(2);
      expect(result.current.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith('/api/proxy/games?season=2024&league=standard');
    });

    it('should sort games by date (most recent first)', async () => {
      const mockGames = [
        createMockGame(1, '2024-12-20T19:30:00.000Z', 'FT'), // Oldest
        createMockGame(2, '2024-12-23T19:30:00.000Z', 'FT'), // Newest
        createMockGame(3, '2024-12-22T19:30:00.000Z', 'FT'), // Middle
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockApiResponse(mockGames),
      });

      const { result } = renderHook(() => useLatestGames());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.latestGames[0].id).toBe(2); // Newest first
      expect(result.current.latestGames[1].id).toBe(3); // Middle
      expect(result.current.latestGames[2].id).toBe(1); // Oldest last
    });

    it('should limit results based on limit option', async () => {
      const mockGames = Array.from({ length: 10 }, (_, i) =>
        createMockGame(i + 1, `2024-12-${20 + i}T19:30:00.000Z`, 'FT')
      );

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockApiResponse(mockGames),
      });

      const { result } = renderHook(() => useLatestGames({ limit: 5 }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.latestGames).toHaveLength(5);
    });
  });

  describe('Error handling', () => {
    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const { result } = renderHook(() => useLatestGames());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('API request failed: 500 Internal Server Error');
      expect(result.current.latestGames).toEqual([]);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useLatestGames());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.latestGames).toEqual([]);
    });

    it('should handle invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => 'invalid json',
      });

      const { result } = renderHook(() => useLatestGames());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.latestGames).toEqual([]);
    });
  });

  describe('Options and configuration', () => {
    it('should skip fetching when skip is true', () => {
      const { result } = renderHook(() => useLatestGames({ skip: true }));

      expect(result.current.loading).toBe(false);
      expect(result.current.latestGames).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should use mock data when API_MOCK_MODE is enabled', async () => {
      Object.defineProperty(window, '__API_MOCK_MODE__', {
        value: true,
        writable: true,
      });

      const mockGames = [createMockGame(1, '2024-12-23T19:30:00.000Z', 'FT')];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: createMockApiResponse(mockGames) }),
      });

      const { result } = renderHook(() => useLatestGames());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/mock-server?action=mock-data&type=nba-games');
    });

    it('should force real data when forceRealData is true', async () => {
      Object.defineProperty(window, '__API_MOCK_MODE__', {
        value: true,
        writable: true,
      });

      const mockGames = [createMockGame(1, '2024-12-23T19:30:00.000Z', 'FT')];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockApiResponse(mockGames),
      });

      const { result } = renderHook(() => useLatestGames({ forceRealData: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/proxy/games?season=2024&league=standard');
    });

    it('should use mock data in test environment', async () => {
      const _originalEnv = process.env.NODE_ENV;
      vi.stubEnv('NODE_ENV', 'test');

      const mockGames = [createMockGame(1, '2024-12-23T19:30:00.000Z', 'FT')];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: createMockApiResponse(mockGames) }),
      });

      const { result } = renderHook(() => useLatestGames());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/mock-server?action=mock-data&type=nba-games');

      // Restore original environment
      vi.unstubAllEnvs();
    });
  });

  describe('Refetch functionality', () => {
    it('should refetch data when refetch is called', async () => {
      const mockGames1 = [createMockGame(1, '2024-12-23T19:30:00.000Z', 'FT')];
      const mockGames2 = [createMockGame(2, '2024-12-24T19:30:00.000Z', 'FT')];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockApiResponse(mockGames1),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => createMockApiResponse(mockGames2),
        });

      const { result } = renderHook(() => useLatestGames());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.latestGames[0].id).toBe(1);

      await act(async () => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.latestGames[0].id).toBe(2);
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty response array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockApiResponse([]),
      });

      const { result } = renderHook(() => useLatestGames());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.latestGames).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle games with missing date information', async () => {
      const mockGames = [
        {
          ...createMockGame(1, '2024-12-23T19:30:00.000Z', 'FT'),
          date: '2024-12-23T19:30:00.000Z', // String date instead of object
        },
        createMockGame(2, '2024-12-22T19:30:00.000Z', 'FT'),
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockApiResponse(mockGames as any),
      });

      const { result } = renderHook(() => useLatestGames());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.latestGames).toHaveLength(2);
      expect(result.current.error).toBeNull();
    });

    it('should handle SSR environment', async () => {
      const mockGames = [createMockGame(1, '2024-12-23T19:30:00.000Z', 'FT')];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createMockApiResponse(mockGames),
      });

      const { result } = renderHook(() => useLatestGames({ forceRealData: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.latestGames).toHaveLength(1);
    });
  });
});
