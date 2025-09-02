// Centralized mock data exports and provider
import { isMockModeEnabled } from '@/lib/utils/mock-mode';

export * from './liveGamesMock';
export * from './nbaGamesMock';
export * from './nbaGameStatisticsMock';
export * from './nbaLeaguesMock';
export * from './nbaPlayerStatisticsMock';
export * from './nbaSeasonsMock';
export * from './nbaTeamStatisticsMock';
export * from './nbaStandingsMock';
export * from './nbaPlayersMock';
export * from './nbaTeamsMock';

// Mock data provider for E2E tests
export class MockDataProvider {
  private static instance: MockDataProvider;
  private mockMode = false;

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): MockDataProvider {
    if (!MockDataProvider.instance) {
      MockDataProvider.instance = new MockDataProvider();
    }
    return MockDataProvider.instance;
  }

  enableMockMode(): void {
    this.mockMode = true;
  }

  disableMockMode(): void {
    this.mockMode = false;
  }

  isMockModeEnabled(): boolean {
    return this.mockMode || isMockModeEnabled();
  }

  // Get all available mock data
  async getAllMockData() {
    return {
      liveGames: await this.getLiveGamesMock(),
      nbaGames: await this.getNbaGamesMock(),
      nbaGameStatistics: await this.getNbaGameStatisticsMock(),
      nbaLeagues: await this.getNbaLeaguesMock(),
      nbaPlayerStatistics: await this.getNbaPlayerStatisticsMock(),
      nbaSeasons: await this.getNbaSeasonsMock(),
      nbaTeamStatistics: await this.getNbaTeamStatisticsMock(),
      nbaStandings: await this.getNbaStandingsMock(),
      nbaPlayers: await this.getNbaPlayersMock(),
      nbaTeams: await this.getNbaTeamsMock(),
    };
  }

  // Individual mock data getters (using dynamic imports to avoid circular dependencies)
  async getLiveGamesMock() {
    const { createMockLiveGames } = await import('./liveGamesMock');
    return createMockLiveGames();
  }

  async getNbaGamesMock() {
    const { MOCK_NBA_GAMES } = await import('./nbaGamesMock');
    return MOCK_NBA_GAMES;
  }

  async getNbaGameStatisticsMock() {
    const { MOCK_NBA_GAME_STATISTICS } = await import('./nbaGameStatisticsMock');
    return MOCK_NBA_GAME_STATISTICS;
  }

  async getNbaLeaguesMock() {
    const { MOCK_NBA_LEAGUES } = await import('./nbaLeaguesMock');
    return MOCK_NBA_LEAGUES;
  }

  async getNbaPlayerStatisticsMock() {
    const { MOCK_NBA_PLAYER_STATISTICS } = await import('./nbaPlayerStatisticsMock');
    return MOCK_NBA_PLAYER_STATISTICS;
  }

  async getNbaSeasonsMock() {
    const { MOCK_NBA_SEASONS } = await import('./nbaSeasonsMock');
    return MOCK_NBA_SEASONS;
  }

  async getNbaTeamStatisticsMock() {
    const { MOCK_NBA_TEAM_STATISTICS } = await import('./nbaTeamStatisticsMock');
    return MOCK_NBA_TEAM_STATISTICS;
  }

  async getNbaStandingsMock() {
    const { MOCK_NBA_STANDINGS } = await import('./nbaStandingsMock');
    return MOCK_NBA_STANDINGS;
  }

  async getNbaPlayersMock() {
    const { MOCK_NBA_PLAYERS } = await import('./nbaPlayersMock');
    return MOCK_NBA_PLAYERS;
  }

  async getNbaTeamsMock() {
    const { MOCK_NBA_TEAMS } = await import('./nbaTeamsMock');
    return MOCK_NBA_TEAMS;
  }
}

// Export singleton instance
export const mockDataProvider = MockDataProvider.getInstance();
