import { describe, it, expect } from 'vitest';

import {
  getTeamDisplay,
  filterAndSortGameLogs,
} from '@/app/components/game-logs/utils/gameLogsUtils';
import { CLASSIFICATION } from '@/types';
import type { IGameLog } from '@/types';

describe('gameLogsUtils', () => {
  describe('getTeamDisplay', () => {
    it('returns formatted team display with date', () => {
      const game = {
        id: 'game-1',
        date: '2024-01-15',
        status: { short: '', long: 'Finished' },
        teams: {
          home: {
            id: 'lakers',
            name: 'Lakers',
            code: 'LAL',
            nickname: 'Lakers',
            logo: null,
          },
          away: {
            id: 'warriors',
            name: 'Warriors',
            code: 'GSW',
            nickname: 'Warriors',
            logo: null,
          },
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = getTeamDisplay(game);
      // The actual date formatting depends on the timezone, so we'll check for the pattern
      expect(result).toMatch(/^GSW @ LAL on \w{3}, Jan 1[45], 2024$/);
    });

    it('returns formatted team display without date', () => {
      const game = {
        id: 'game-1',
        date: '2024-01-15',
        status: { short: '', long: 'Finished' },
        teams: {
          home: {
            id: 'lakers',
            name: 'Lakers',
            code: 'LAL',
            nickname: 'Lakers',
            logo: null,
          },
          away: {
            id: 'warriors',
            name: 'Warriors',
            code: 'GSW',
            nickname: 'Warriors',
            logo: null,
          },
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = getTeamDisplay(game, false);
      expect(result).toBe('GSW @ LAL');
    });

    it('uses nickname when code is not available', () => {
      const game = {
        id: 'game-1',
        date: '2024-01-15',
        status: { short: '', long: 'Finished' },
        teams: {
          home: {
            id: 'lakers',
            name: 'Lakers',
            nickname: 'Lakers',
            // No code property - so it should use nickname
            logo: null,
          },
          away: {
            id: 'warriors',
            name: 'Warriors',
            nickname: 'Warriors',
            // No code property - so it should use nickname
            logo: null,
          },
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = getTeamDisplay(game);
      // The actual date formatting depends on the timezone, so we'll check for the pattern
      expect(result).toMatch(/^Warriors @ Lakers on \w{3}, Jan 1[45], 2024$/);
    });

    it('uses name when code and nickname are not available', () => {
      const game = {
        id: 'game-1',
        date: '2024-01-15',
        status: { short: '', long: 'Finished' },
        teams: {
          home: {
            id: 'lakers',
            name: 'Lakers',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          away: {
            id: 'warriors',
            name: 'Warriors',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = getTeamDisplay(game);
      // The actual date formatting depends on the timezone, so we'll check for the pattern
      expect(result).toMatch(/^Warriors @ Lakers on \w{3}, Jan 1[45], 2024$/);
    });

    it('handles invalid date gracefully', () => {
      const game = {
        id: 'game-1',
        date: 'invalid-date',
        status: { short: '', long: 'Finished' },
        teams: {
          home: {
            id: 'lakers',
            name: 'Lakers',
            code: 'LAL',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          away: {
            id: 'warriors',
            name: 'Warriors',
            code: 'GSW',
            all_star: false,
            nba_franchise: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = getTeamDisplay(game);
      expect(result).toBe('GSW @ LAL');
    });

    it('returns "Unknown Teams" for null game', () => {
      const result = getTeamDisplay(undefined);
      expect(result).toBe('Unknown Teams');
    });

    it('returns "Unknown Teams" for invalid game object', () => {
      const result = getTeamDisplay({} as any);
      expect(result).toBe('Unknown Teams');
    });

    it('returns "Unknown Teams" for game without team properties', () => {
      const result = getTeamDisplay({ id: 'game-1' } as any);
      expect(result).toBe('Unknown Teams');
    });

    it('handles teams with visitors/home structure (database format)', () => {
      const game = {
        id: 'game-1',
        date: '2024-01-15',
        status: { short: '', long: 'Finished' },
        teams: {
          home: {
            id: 25,
            name: 'Oklahoma City Thunder',
            code: 'OKC',
            nickname: 'Thunder',
            logo: 'https://example.com/thunder.png',
          },
          visitors: {
            id: 15,
            name: 'Indiana Pacers',
            code: 'IND',
            nickname: 'Pacers',
            logo: 'https://example.com/pacers.png',
          },
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = getTeamDisplay(game, false);
      expect(result).toBe('IND @ OKC');
    });
  });

  describe('filterAndSortGameLogs', () => {
    const mockGameLogs: IGameLog[] = [
      {
        id: 'log-1',
        game_id: 'game-1',

        classification: CLASSIFICATION.PUBLIC,
        rating_for_game: 4,
        notes: 'Great game!',
        tags: ['exciting', 'close'],
        watched_setting: 'Home',
        watched_scope: 'Full Game',
        watched_date: '2024-01-15',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        game: {
          id: 'game-1',
          date: '2024-01-15',
          status: { short: '', long: 'Finished' },
          teams: {
            home: {
              id: 'lakers',
              name: 'Lakers',
              code: 'LAL',
              nickname: 'Lakers',
              logo: null,
            },
            away: {
              id: 'warriors',
              name: 'Warriors',
              code: 'GSW',
              nickname: 'Warriors',
              logo: null,
            },
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        user: {
          id: 'user-1',
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
        },
      },
      {
        id: 'log-2',
        game_id: 'game-2',

        classification: CLASSIFICATION.PRIVATE,
        rating_for_game: 2,
        notes: 'Boring game',
        tags: ['slow', 'boring'],
        watched_setting: 'Away',
        watched_scope: 'Highlights',
        watched_date: '2024-01-16',
        created_at: '2024-01-16T10:00:00Z',
        updated_at: '2024-01-16T10:00:00Z',
        game: {
          id: 'game-2',
          date: '2024-01-16',
          status: { short: '', long: 'Finished' },
          teams: {
            home: {
              id: 'celtics',
              name: 'Celtics',
              code: 'BOS',
              nickname: 'Celtics',
              logo: null,
            },
            away: {
              id: 'heat',
              name: 'Heat',
              code: 'MIA',
              nickname: 'Heat',
              logo: null,
            },
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        user: {
          id: 'user-2',
          username: 'user2',
          first_name: 'User',
          last_name: 'Two',
        },
      },
    ];

    it('returns all logs when no search term or sort config', () => {
      const result = filterAndSortGameLogs(mockGameLogs, '', 'all', null);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('log-1');
      expect(result[1].id).toBe('log-2');
    });

    it('filters by search term in all fields', () => {
      const result = filterAndSortGameLogs(mockGameLogs, 'exciting', 'all', null);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('log-1');
    });

    it('filters by classification', () => {
      const result = filterAndSortGameLogs(mockGameLogs, 'public', 'classification', null);
      expect(result).toHaveLength(1);
      expect(result[0].classification).toBe(CLASSIFICATION.PUBLIC);
    });

    it('filters by watched setting', () => {
      const result = filterAndSortGameLogs(mockGameLogs, 'home', 'watched_setting', null);
      expect(result).toHaveLength(1);
      expect(result[0].watched_setting).toBe('Home');
    });

    it('filters by watched scope', () => {
      const result = filterAndSortGameLogs(mockGameLogs, 'highlights', 'watched_scope', null);
      expect(result).toHaveLength(1);
      expect(result[0].watched_scope).toBe('Highlights');
    });

    it('filters by notes', () => {
      const result = filterAndSortGameLogs(mockGameLogs, 'boring', 'notes', null);
      expect(result).toHaveLength(1);
      expect(result[0].notes).toBe('Boring game');
    });

    it('filters by tags', () => {
      const result = filterAndSortGameLogs(mockGameLogs, 'slow', 'tags', null);
      expect(result).toHaveLength(1);
      expect(result[0].tags).toContain('slow');
    });

    it('filters by team', () => {
      const result = filterAndSortGameLogs(mockGameLogs, 'LAL', 'team', null);
      expect(result).toHaveLength(1);
      expect(result[0].game?.teams?.home?.name).toBe('Lakers');
    });

    it('sorts by rating in ascending order', () => {
      const result = filterAndSortGameLogs(mockGameLogs, '', 'all', {
        field: 'rating_for_game',
        direction: 'asc',
      });
      expect(result[0].rating_for_game).toBe(2);
      expect(result[1].rating_for_game).toBe(4);
    });

    it('sorts by rating in descending order', () => {
      const result = filterAndSortGameLogs(mockGameLogs, '', 'all', {
        field: 'rating_for_game',
        direction: 'desc',
      });
      expect(result[0].rating_for_game).toBe(4);
      expect(result[1].rating_for_game).toBe(2);
    });

    it('sorts by created_at in ascending order', () => {
      const result = filterAndSortGameLogs(mockGameLogs, '', 'all', {
        field: 'created_at',
        direction: 'asc',
      });
      expect(result[0].created_at).toBe('2024-01-15T10:00:00Z');
      expect(result[1].created_at).toBe('2024-01-16T10:00:00Z');
    });

    it('sorts by classification in ascending order', () => {
      const result = filterAndSortGameLogs(mockGameLogs, '', 'all', {
        field: 'classification',
        direction: 'asc',
      });
      expect(result[0].classification).toBe(CLASSIFICATION.PRIVATE);
      expect(result[1].classification).toBe(CLASSIFICATION.PUBLIC);
    });

    it('handles case-insensitive search', () => {
      const result = filterAndSortGameLogs(mockGameLogs, 'EXCITING', 'all', null);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('log-1');
    });

    it('handles empty logs array', () => {
      const result = filterAndSortGameLogs([], 'test', 'all', null);
      expect(result).toHaveLength(0);
    });

    it('handles logs with missing optional fields', () => {
      const logsWithMissingFields = [
        {
          ...mockGameLogs[0],
          notes: undefined,
          tags: undefined,
          watched_setting: undefined,
          watched_scope: undefined,
        },
      ];

      const result = filterAndSortGameLogs(logsWithMissingFields, 'test', 'all', null);
      expect(result).toHaveLength(0); // Should not match any search term
    });

    it('combines filtering and sorting', () => {
      const result = filterAndSortGameLogs(mockGameLogs, 'game', 'all', {
        field: 'rating_for_game',
        direction: 'desc',
      });
      expect(result).toHaveLength(2); // Both logs contain "game" in notes
      expect(result[0].rating_for_game).toBe(4); // Higher rating first
      expect(result[1].rating_for_game).toBe(2);
    });
  });
});
