import { mockDataProvider } from '@src/lib/mock';

/**
 * Mock data configuration for E2E tests
 * Provides utilities to enable/disable mock mode and inject mock data
 */

export interface IMockConfig {
  enableMockMode: boolean;
  mockDataTypes: string[];
  apiEndpoints: string[];
  skipPostDeployVerification: boolean;
}

export class E2EMockConfig {
  private static instance: E2EMockConfig;
  private readonly config: IMockConfig;

  private constructor() {
    this.config = {
      enableMockMode: this.shouldEnableMockMode(),
      mockDataTypes: ['liveGames', 'nbaGames', 'nbaTeams', 'nbaPlayers', 'nbaStandings'],
      apiEndpoints: [
        '/api/proxy/games',
        '/api/proxy/teams',
        '/api/proxy/players',
        '/api/proxy/standings',
        '/api/proxy/seasons',
        '/api/proxy/leagues',
        '/api/graphql',
      ],
      skipPostDeployVerification: true,
    };
  }

  static getInstance(): E2EMockConfig {
    if (!E2EMockConfig.instance) {
      E2EMockConfig.instance = new E2EMockConfig();
    }
    return E2EMockConfig.instance;
  }

  private shouldEnableMockMode(): boolean {
    // Enable mock mode for all e2e tests except post-deployment verification
    const isPostDeployVerification = process.env.E2E_POST_DEPLOY_VERIFICATION === 'true';
    const isMockModeEnabled = process.env.MOCK_MODE === 'true';
    const isMockModeDisabled = process.env.MOCK_MODE === 'false';

    // If explicitly disabled, don't enable mock mode
    if (isMockModeDisabled) {
      return false;
    }

    // If post-deployment verification, don't enable mock mode
    if (isPostDeployVerification) {
      return false;
    }

    // Enable mock mode for CI or when explicitly enabled
    return isMockModeEnabled || process.env.CI === 'true';
  }

  enableMockMode(): void {
    this.config.enableMockMode = true;
    mockDataProvider.enableMockMode();
  }

  disableMockMode(): void {
    this.config.enableMockMode = false;
    mockDataProvider.disableMockMode();
  }

  isMockModeEnabled(): boolean {
    return this.config.enableMockMode && mockDataProvider.isMockModeEnabled();
  }

  getMockData(): any {
    if (!this.isMockModeEnabled()) {
      return {};
    }
    return mockDataProvider.getAllMockData();
  }

  getConfig(): IMockConfig {
    return { ...this.config };
  }

  // Setup mock data for a specific test
  setupMockData(testName?: string): void {
    if (!this.isMockModeEnabled()) {
      return;
    }

    console.log(`🔧 Setting up mock data for test: ${testName || 'unknown'}`);

    // Enable mock mode globally
    this.enableMockMode();

    // Log mock data types being used
    console.log(`📊 Using mock data types: ${this.config.mockDataTypes.join(', ')}`);
  }

  // Cleanup mock data after test
  cleanupMockData(): void {
    if (!this.isMockModeEnabled()) {
      return;
    }

    console.log('🧹 Cleaning up mock data');
    // Any cleanup needed for mock data
  }

  // Get specific mock data by type
  getMockDataByType(type: string): any {
    if (!this.isMockModeEnabled()) {
      return null;
    }

    const mockData = this.getMockData();
    return mockData[type] || null;
  }

  // Check if a specific API endpoint should be mocked
  shouldMockEndpoint(endpoint: string): boolean {
    if (!this.isMockModeEnabled()) {
      return false;
    }

    return this.config.apiEndpoints.some(apiEndpoint => endpoint.includes(apiEndpoint));
  }
}

// Export singleton instance
export const e2eMockConfig = E2EMockConfig.getInstance();

// Utility functions for test setup
export function setupMockDataForTest(testName?: string): void {
  e2eMockConfig.setupMockData(testName);
}

export function cleanupMockDataAfterTest(): void {
  e2eMockConfig.cleanupMockData();
}

export function getMockData(): any {
  return e2eMockConfig.getMockData();
}

export function getMockDataByType(type: string): any {
  return e2eMockConfig.getMockDataByType(type);
}

export function isMockModeEnabled(): boolean {
  return e2eMockConfig.isMockModeEnabled();
}
