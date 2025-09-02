import { vi } from 'vitest';

/**
 * Shared Redis service mock for use across multiple test files
 * This provides a consistent mock configuration for the Redis service
 * and improves maintainability by centralizing the mock setup.
 */
export const createRedisServiceMock = () => ({
  redisService: {
    set: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(true),
    clear: vi.fn().mockResolvedValue(undefined),
    testConnection: vi.fn().mockResolvedValue(false),
    getStats: vi.fn().mockReturnValue({
      memorySize: 0,
      redisAvailable: false,
    }),
  },
});

/**
 * Setup Redis service mock for a test file
 * Call this function to mock the Redis service module
 */
export const setupRedisServiceMock = () => {
  // Cache mock removed
};

/**
 * Reset all Redis service mocks
 * Call this in beforeEach or afterEach to ensure clean state
 * Note: This is a simplified version that doesn't require accessing the mocked module
 */
export const resetRedisServiceMocks = () => {
  // Clear all mocks - this will reset all vi.fn() mocks
  vi.clearAllMocks();
};

/**
 * Configure Redis service mock with custom return values
 * Use this to set up specific mock behaviors for individual tests
 * Note: This requires the mock to be set up first via setupRedisServiceMock()
 */
export const configureRedisServiceMock = (_config: {
  set?: any;
  get?: any;
  delete?: any;
  clear?: any;
  testConnection?: any;
  getStats?: any;
}) => {
  // This function would need to be implemented differently
  // For now, we'll use a simpler approach
  console.warn('configureRedisServiceMock: This function needs to be implemented with vi.mocked()');
};
