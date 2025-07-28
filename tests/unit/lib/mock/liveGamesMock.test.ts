import { describe, it, expect } from 'vitest';

import { createMockLiveGames, MOCK_LIVE_GAMES } from '@src/lib/mock/liveGamesMock';
import type { IGameResponse } from '@src/lib/types';

describe('liveGamesMock', () => {
  describe('MOCK_LIVE_GAMES', () => {
    it('should have the correct structure', () => {
      expect(MOCK_LIVE_GAMES).toHaveProperty('get');
      expect(MOCK_LIVE_GAMES).toHaveProperty('parameters');
      expect(MOCK_LIVE_GAMES).toHaveProperty('errors');
      expect(MOCK_LIVE_GAMES).toHaveProperty('results');
      expect(MOCK_LIVE_GAMES).toHaveProperty('response');
    });

    it('should have correct API response structure', () => {
      expect(MOCK_LIVE_GAMES.get).toBe('games');
      expect(MOCK_LIVE_GAMES.parameters).toEqual({
        league: '12',
        season: '2023-24',
        date: '2024-12-23',
      });
      expect(MOCK_LIVE_GAMES.errors).toEqual([]);
      expect(MOCK_LIVE_GAMES.results).toBe(8);
      expect(Array.isArray(MOCK_LIVE_GAMES.response)).toBe(true);
    });

    it('should have 8 games in response', () => {
      expect(MOCK_LIVE_GAMES.response).toHaveLength(8);
    });

    it('should have valid game data structure', () => {
      const firstGame = MOCK_LIVE_GAMES.response[0];
      expect(firstGame).toHaveProperty('id');
      expect(firstGame).toHaveProperty('league');
      expect(firstGame).toHaveProperty('season');
      expect(firstGame).toHaveProperty('date');
      expect(firstGame).toHaveProperty('stage');
      expect(firstGame).toHaveProperty('status');
      expect(firstGame).toHaveProperty('periods');
      expect(firstGame).toHaveProperty('arena');
      expect(firstGame).toHaveProperty('teams');
      expect(firstGame).toHaveProperty('scores');
      expect(firstGame).toHaveProperty('officials');
      expect(firstGame).toHaveProperty('timesTied');
      expect(firstGame).toHaveProperty('leadChanges');
    });

    it('should have correct team structure', () => {
      const firstGame = MOCK_LIVE_GAMES.response[0];
      expect(firstGame.teams).toHaveProperty('home');
      expect(firstGame.teams).toHaveProperty('visitors');

      expect(firstGame.teams.home).toHaveProperty('id');
      expect(firstGame.teams.home).toHaveProperty('name');
      expect(firstGame.teams.home).toHaveProperty('nickname');
      expect(firstGame.teams.home).toHaveProperty('code');
      expect(firstGame.teams.home).toHaveProperty('logo');

      expect(firstGame.teams.visitors).toHaveProperty('id');
      expect(firstGame.teams.visitors).toHaveProperty('name');
      expect(firstGame.teams.visitors).toHaveProperty('nickname');
      expect(firstGame.teams.visitors).toHaveProperty('code');
      expect(firstGame.teams.visitors).toHaveProperty('logo');
    });

    it('should have correct scores structure', () => {
      const firstGame = MOCK_LIVE_GAMES.response[0];
      expect(firstGame.scores).toHaveProperty('home');
      expect(firstGame.scores).toHaveProperty('visitors');

      expect(firstGame.scores.home).toHaveProperty('win');
      expect(firstGame.scores.home).toHaveProperty('loss');
      expect(firstGame.scores.home).toHaveProperty('series');
      expect(firstGame.scores.home).toHaveProperty('linescore');
      expect(firstGame.scores.home).toHaveProperty('points');

      expect(firstGame.scores.visitors).toHaveProperty('win');
      expect(firstGame.scores.visitors).toHaveProperty('loss');
      expect(firstGame.scores.visitors).toHaveProperty('series');
      expect(firstGame.scores.visitors).toHaveProperty('linescore');
      expect(firstGame.scores.visitors).toHaveProperty('points');
    });

    it('should have correct status structure', () => {
      const firstGame = MOCK_LIVE_GAMES.response[0];
      expect(firstGame.status).toHaveProperty('clock');
      expect(firstGame.status).toHaveProperty('halftime');
      expect(firstGame.status).toHaveProperty('short');
      expect(firstGame.status).toHaveProperty('long');
    });

    it('should have specific game data', () => {
      // Test first game: BOS @ NYK
      const knicksCelticsGame = MOCK_LIVE_GAMES.response[0];
      expect(knicksCelticsGame.teams.visitors.code).toBe('BOS');
      expect(knicksCelticsGame.teams.home.code).toBe('NYK');
      expect(knicksCelticsGame.scores.visitors.points).toBe(95);
      expect(knicksCelticsGame.scores.home.points).toBe(85);
      expect(knicksCelticsGame.status.short).toBe('Q3');
      expect(knicksCelticsGame.status.clock).toBe('5:30');

      // Test second game: LAL @ GSW
      const warriorsLakersGame = MOCK_LIVE_GAMES.response[1];
      expect(warriorsLakersGame.teams.visitors.code).toBe('LAL');
      expect(warriorsLakersGame.teams.home.code).toBe('GSW');
      expect(warriorsLakersGame.scores.visitors.points).toBe(84);
      expect(warriorsLakersGame.scores.home.points).toBe(83);
      expect(warriorsLakersGame.status.short).toBe('Q4');
      expect(warriorsLakersGame.status.clock).toBe('2:15');
    });

    it('should have halftime game', () => {
      const halftimeGame = MOCK_LIVE_GAMES.response[2]; // PHI @ MIA
      expect(halftimeGame.status.halftime).toBe(true);
      expect(halftimeGame.status.short).toBe('HT');
      expect(halftimeGame.status.clock).toBeUndefined();
    });
  });

  describe('createMockLiveGames', () => {
    it('should return the same data as MOCK_LIVE_GAMES', () => {
      const mockData = createMockLiveGames();
      expect(mockData).toEqual(MOCK_LIVE_GAMES);
    });

    it('should return valid IGamesApiResponse', () => {
      const mockData = createMockLiveGames();
      expect(mockData).toHaveProperty('get');
      expect(mockData).toHaveProperty('parameters');
      expect(mockData).toHaveProperty('errors');
      expect(mockData).toHaveProperty('results');
      expect(mockData).toHaveProperty('response');
    });

    it('should have correct response type', () => {
      const mockData = createMockLiveGames();
      expect(Array.isArray(mockData.response)).toBe(true);
      expect(mockData.response.length).toBe(8);

      // Check that each game has the correct structure
      mockData.response.forEach((game: IGameResponse) => {
        expect(game).toHaveProperty('id');
        expect(game).toHaveProperty('teams');
        expect(game).toHaveProperty('scores');
        expect(game).toHaveProperty('status');
      });
    });

    it('should have consistent data across calls', () => {
      const firstCall = createMockLiveGames();
      const secondCall = createMockLiveGames();
      expect(firstCall).toEqual(secondCall);
    });
  });

  describe('Game data validation', () => {
    it('should have valid team codes', () => {
      MOCK_LIVE_GAMES.response.forEach((game: IGameResponse) => {
        expect(game.teams.home.code).toMatch(/^[A-Z]{3}$/);
        expect(game.teams.visitors.code).toMatch(/^[A-Z]{3}$/);
      });
    });

    it('should have valid scores', () => {
      MOCK_LIVE_GAMES.response.forEach((game: IGameResponse) => {
        expect(typeof game.scores.home.points).toBe('number');
        expect(typeof game.scores.visitors.points).toBe('number');
        expect(game.scores.home.points).toBeGreaterThanOrEqual(0);
        expect(game.scores.visitors.points).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have valid status values', () => {
      MOCK_LIVE_GAMES.response.forEach((game: IGameResponse) => {
        expect(typeof game.status.halftime).toBe('boolean');
        expect(typeof game.status.short).toBe('string');
        expect(typeof game.status.long).toBe('string');

        // Clock can be string or undefined
        if (game.status.clock !== undefined) {
          expect(typeof game.status.clock).toBe('string');
        }
      });
    });

    it('should have valid quarter indicators', () => {
      MOCK_LIVE_GAMES.response.forEach((game: IGameResponse) => {
        const validQuarters = ['Q1', 'Q2', 'Q3', 'Q4', 'HT'];
        expect(validQuarters).toContain(game.status.short);
      });
    });

    it('should have valid arena data', () => {
      MOCK_LIVE_GAMES.response.forEach((game: IGameResponse) => {
        expect(game.arena).toHaveProperty('name');
        expect(game.arena).toHaveProperty('city');
        expect(typeof game.arena.name).toBe('string');
        expect(typeof game.arena.city).toBe('string');
      });
    });
  });
});
