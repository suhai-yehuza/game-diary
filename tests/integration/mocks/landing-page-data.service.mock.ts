import { vi } from 'vitest';
import type { ILandingPageData } from '@/types';

// Mock data for integration tests
const mockLandingPageData: ILandingPageData = {
  id: 'landing-page-data',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  trendingContent: {
    topGameLogs: [],
    mostActiveGameLog: null,
  },
  latestResults: {
    latestGames: [],
    latestFinishedGame: null,
  },
  recentGames: [],
  popularGames: [],
  timestamp: new Date().toISOString(),
  source: 'mock',
};

// Mock for LandingPageDataService to prevent Redis/DB calls in integration tests
export const mockLandingPageDataService = {
  getLandingPageDataWithGranularCache: vi.fn().mockResolvedValue(mockLandingPageData),
  debugDatabaseContent: vi.fn().mockResolvedValue({
    totalGameLogs: 0,
    publicGameLogs: 0,
    totalComments: 0,
    totalReactions: 0,
    sampleGameLogs: [],
  }),
  getCacheStats: vi.fn().mockReturnValue({
    trendingContent: { key: 'mock-trending', ttl: 300, tags: ['mock'] },
    latestResults: { key: 'mock-latest', ttl: 300, tags: ['mock'] },
    recentGames: { key: 'mock-recent', ttl: 300, tags: ['mock'] },
    popularGames: { key: 'mock-popular', ttl: 300, tags: ['mock'] },
  }),
};

// Setup function to apply the mock
export function setupLandingPageDataServiceMock() {
  vi.mock('@/lib/services/landing-page-data.service', () => ({
    LandingPageDataService: vi.fn().mockImplementation(() => mockLandingPageDataService),
  }));
}
