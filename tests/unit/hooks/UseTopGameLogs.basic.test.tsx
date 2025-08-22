import { useQuery } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useTopGameLogs } from '@/hooks/use-top-game-logs';
import type { IGameLog } from '@/lib/types';

// Mock Apollo Client
vi.mock('@apollo/client', () => ({
  useQuery: vi.fn(),
  gql: vi.fn(() => ({})),
}));

// Helper function to create mock game log data
const createMockGameLog = (
  id: string,
  commentCount = 0,
  reactionCount = 0,
  rating = 5
): IGameLog => ({
  id,

  game_id: 'game123',
  classification: 'PUBLIC',
  rating_for_game: rating,
  totalCommentCount: commentCount,
  totalReactionCount: reactionCount,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),

  user: {
    id: 'user123',
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',

    image_url: undefined,
  },
  game: {
    id: 'game123',
    date: new Date().toISOString(),
    home_team_id: 'team1',
    away_team_id: 'team2',
    game_type: 'REGULAR',
    status: 'FINISHED',
    home_team_score: 100,
    away_team_score: 95,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),

    home_team: {
      id: 'team1',
      name: 'Home Team',
      nickname: 'Home',
      code: 'HOME',
      logo: 'https://example.com/home-logo.png',
      all_star: false,
      nba_franchise: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    away_team: {
      id: 'team2',
      name: 'Away Team',
      nickname: 'Away',
      code: 'AWAY',
      logo: 'https://example.com/away-logo.png',
      all_star: false,
      nba_franchise: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
});

const createMockQueryResult = (gameLogs: IGameLog[]) => ({
  data: {
    gameLogs: {
      edges: gameLogs.map(gameLog => ({ node: gameLog })),
    },
  },
  loading: false,
  error: null,
  refetch: vi.fn(),
});

describe('useTopGameLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should be a function', () => {
      expect(typeof useTopGameLogs).toBe('function');
    });

    it('should return expected properties', () => {
      (useQuery as any).mockReturnValue(createMockQueryResult([]));

      const { result } = renderHook(() => useTopGameLogs());

      expect(result.current).toHaveProperty('topGameLogs');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('refetch');
    });

    it('should have correct default values', () => {
      (useQuery as any).mockReturnValue(createMockQueryResult([]));

      const { result } = renderHook(() => useTopGameLogs());

      expect(result.current.topGameLogs).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Query configuration', () => {
    it('should call useQuery with correct default parameters', () => {
      (useQuery as any).mockReturnValue(createMockQueryResult([]));

      renderHook(() => useTopGameLogs());

      expect(useQuery).toHaveBeenCalledWith(
        expect.anything(), // GET_GAME_LOGS query
        {
          variables: {
            filters: {
              classification: 'PUBLIC',
            },
            pagination: {
              first: 100,
            },
          },
          skip: false,
        }
      );
    });

    it('should use custom limit when provided', () => {
      (useQuery as any).mockReturnValue(createMockQueryResult([]));

      renderHook(() => useTopGameLogs({ limit: 50 }));

      expect(useQuery).toHaveBeenCalledWith(expect.anything(), {
        variables: {
          filters: {
            classification: 'PUBLIC',
          },
          pagination: {
            first: 50,
          },
        },
        skip: false,
      });
    });

    it('should skip query when skip is true', () => {
      (useQuery as any).mockReturnValue(createMockQueryResult([]));

      renderHook(() => useTopGameLogs({ skip: true }));

      expect(useQuery).toHaveBeenCalledWith(expect.anything(), {
        variables: {
          filters: {
            classification: 'PUBLIC',
          },
          pagination: {
            first: 100,
          },
        },
        skip: true,
      });
    });
  });

  describe('Data processing and sorting', () => {
    it('should return empty array when no data', () => {
      (useQuery as any).mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useTopGameLogs());

      expect(result.current.topGameLogs).toEqual([]);
    });

    it('should return empty array when no edges', () => {
      (useQuery as any).mockReturnValue({
        data: { gameLogs: { edges: null } },
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useTopGameLogs());

      expect(result.current.topGameLogs).toEqual([]);
    });

    it('should sort game logs by total activity (comments + reactions)', () => {
      const gameLogs = [
        createMockGameLog('1', 5, 10), // Activity: 15
        createMockGameLog('2', 20, 5), // Activity: 25
        createMockGameLog('3', 8, 8), // Activity: 16
        createMockGameLog('4', 30, 0), // Activity: 30
      ];

      (useQuery as any).mockReturnValue(createMockQueryResult(gameLogs as any));

      const { result } = renderHook(() => useTopGameLogs());

      expect(result.current.topGameLogs).toHaveLength(4);
      expect(result.current.topGameLogs[0].id).toBe('4'); // Highest activity (30)
      expect(result.current.topGameLogs[1].id).toBe('2'); // Second highest (25)
      expect(result.current.topGameLogs[2].id).toBe('3'); // Third highest (16)
      expect(result.current.topGameLogs[3].id).toBe('1'); // Lowest activity (15)
    });

    it('should handle game logs with null activity counts', () => {
      const gameLogs = [
        createMockGameLog('1', 5, 10),
        {
          ...createMockGameLog('2', 20, 5),
          totalCommentCount: null,
          totalReactionCount: null,
        },
        createMockGameLog('3', 8, 8),
      ];

      (useQuery as any).mockReturnValue(createMockQueryResult(gameLogs as any));

      const { result } = renderHook(() => useTopGameLogs());

      expect(result.current.topGameLogs).toHaveLength(3);
      expect(result.current.topGameLogs[0].id).toBe('3'); // Activity: 16
      expect(result.current.topGameLogs[1].id).toBe('1'); // Activity: 15
      expect(result.current.topGameLogs[2].id).toBe('2'); // Activity: 0 (null counts)
    });

    it('should handle game logs with undefined activity counts', () => {
      const gameLogs = [
        createMockGameLog('1', 5, 10),
        {
          ...createMockGameLog('2', 20, 5),
          totalCommentCount: undefined,
          totalReactionCount: undefined,
        },
        createMockGameLog('3', 8, 8),
      ];

      (useQuery as any).mockReturnValue(createMockQueryResult(gameLogs as any));

      const { result } = renderHook(() => useTopGameLogs());

      expect(result.current.topGameLogs).toHaveLength(3);
      expect(result.current.topGameLogs[0].id).toBe('3'); // Activity: 16
      expect(result.current.topGameLogs[1].id).toBe('1'); // Activity: 15
      expect(result.current.topGameLogs[2].id).toBe('2'); // Activity: 0 (undefined counts)
    });
  });

  describe('Loading and error states', () => {
    it('should handle loading state', () => {
      (useQuery as any).mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useTopGameLogs());

      expect(result.current.loading).toBe(true);
      expect(result.current.topGameLogs).toEqual([]);
    });

    it('should handle error state', () => {
      const mockError = new Error('GraphQL error');
      (useQuery as any).mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useTopGameLogs());

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('GraphQL error');
      expect(result.current.topGameLogs).toEqual([]);
    });

    it('should handle error with null message', () => {
      const mockError = { message: null };
      (useQuery as any).mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useTopGameLogs());

      expect(result.current.error).toBeNull();
    });
  });

  describe('Refetch functionality', () => {
    it('should return refetch function from useQuery', () => {
      const mockRefetch = vi.fn();
      (useQuery as any).mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => useTopGameLogs());

      expect(result.current.refetch).toBe(mockRefetch);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty edges array', () => {
      (useQuery as any).mockReturnValue({
        data: { gameLogs: { edges: [] } },
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useTopGameLogs());

      expect(result.current.topGameLogs).toEqual([]);
    });

    it('should handle malformed edge data', () => {
      (useQuery as any).mockReturnValue({
        data: {
          gameLogs: {
            edges: [
              { node: createMockGameLog('1', 5, 10) },
              { node: createMockGameLog('2', 8, 8) },
            ],
          },
        },
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useTopGameLogs());

      // Should handle valid nodes only
      expect(result.current.topGameLogs).toHaveLength(2);
      expect(result.current.topGameLogs[0].id).toBe('2'); // Higher activity
      expect(result.current.topGameLogs[1].id).toBe('1'); // Lower activity
    });

    it('should handle game logs with zero activity', () => {
      const gameLogs = [
        createMockGameLog('1', 0, 0), // No activity
        createMockGameLog('2', 1, 0), // Some activity
        createMockGameLog('3', 0, 1), // Some activity
      ];

      (useQuery as any).mockReturnValue(createMockQueryResult(gameLogs as any));

      const { result } = renderHook(() => useTopGameLogs());

      expect(result.current.topGameLogs).toHaveLength(3);
      expect(result.current.topGameLogs[0].id).toBe('2'); // Activity: 1
      expect(result.current.topGameLogs[1].id).toBe('3'); // Activity: 1
      expect(result.current.topGameLogs[2].id).toBe('1'); // Activity: 0
    });

    it('should handle very large activity numbers', () => {
      const gameLogs = [
        createMockGameLog('1', 1000, 500), // Activity: 1500
        createMockGameLog('2', 999999, 1), // Activity: 1000000
        createMockGameLog('3', 500, 1000), // Activity: 1500
      ];

      (useQuery as any).mockReturnValue(createMockQueryResult(gameLogs as any));

      const { result } = renderHook(() => useTopGameLogs());

      expect(result.current.topGameLogs).toHaveLength(3);
      expect(result.current.topGameLogs[0].id).toBe('2'); // Highest activity
      expect(result.current.topGameLogs[1].id).toBe('1'); // Second highest
      expect(result.current.topGameLogs[2].id).toBe('3'); // Third highest
    });
  });

  describe('Performance considerations', () => {
    it('should handle large number of game logs efficiently', () => {
      const gameLogs = Array.from({ length: 1000 }, (_, i) =>
        createMockGameLog(
          `log-${i}`,
          Math.floor(Math.random() * 100),
          Math.floor(Math.random() * 50)
        )
      );

      (useQuery as any).mockReturnValue(createMockQueryResult(gameLogs as any));

      const { result } = renderHook(() => useTopGameLogs());

      expect(result.current.topGameLogs).toHaveLength(1000);
      // Verify they are sorted in descending order
      for (let i = 1; i < result.current.topGameLogs.length; i++) {
        const prevActivity =
          (result.current.topGameLogs[i - 1].totalCommentCount || 0) +
          (result.current.topGameLogs[i - 1].totalReactionCount || 0);
        const currentActivity =
          (result.current.topGameLogs[i].totalCommentCount || 0) +
          (result.current.topGameLogs[i].totalReactionCount || 0);
        expect(prevActivity).toBeGreaterThanOrEqual(currentActivity);
      }
    });
  });
});
