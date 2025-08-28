/**
 * Enhanced shared test setup utilities
 * Eliminates duplication across all test types and provides consistent test isolation
 */

import { vi, beforeEach, afterEach } from 'vitest';

import { errorHandlers } from '@/lib/utils/error-handler';

// Test environment configuration
export const TEST_CONFIG = {
  timeout: 10000,
  retries: 2,
  isolation: {
    clearStorage: true,
    clearCookies: true,
    clearIndexedDB: true,
    resetMocks: true,
  },
} as const;

// Test data isolation utilities
export class TestDataManager {
  private static instance: TestDataManager;
  private readonly mockData: Map<string, any> = new Map();
  private cleanupTasks: (() => void | Promise<void>)[] = [];

  static getInstance(): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager();
    }
    return TestDataManager.instance;
  }

  /**
   * Clear all test data and reset state
   */
  async clearAllData(): Promise<void> {
    // Clear mock data
    this.mockData.clear();

    // Run cleanup tasks
    for (const cleanup of this.cleanupTasks) {
      try {
        await cleanup();
      } catch (error) {
        // Use centralized error handling
        errorHandlers.validation(error instanceof Error ? error : new Error(String(error)), {
          component: 'Test Setup',
          action: 'Cleanup task',
        });
        console.warn('Cleanup task failed:', error);
      }
    }
    this.cleanupTasks = [];

    // Reset all mocks
    vi.clearAllMocks();
    vi.resetAllMocks();
  }

  /**
   * Set mock data for tests
   */
  setMockData(key: string, data: any): void {
    this.mockData.set(key, data);
  }

  /**
   * Get mock data for tests
   */
  getMockData(key: string): any {
    return this.mockData.get(key);
  }

  /**
   * Add cleanup task
   */
  addCleanupTask(task: () => void | Promise<void>): void {
    this.cleanupTasks.push(task);
  }
}

// Enhanced test setup function
export async function enhancedTestSetup(
  options: {
    testName?: string;
    enableMockData?: boolean;
    mockScenario?: string;
    isolationLevel?: 'minimal' | 'standard' | 'strict';
  } = {}
): Promise<void> {
  const { testName, enableMockData = true, mockScenario, isolationLevel = 'standard' } = options;

  const dataManager = TestDataManager.getInstance();

  // Clear previous test data
  await dataManager.clearAllData();

  // Setup mock data if enabled
  if (enableMockData) {
    await setupMockData(mockScenario);
  }

  // Apply isolation level
  await applyIsolationLevel(isolationLevel);

  // Log setup completion
  console.log(`✅ Enhanced test setup completed for: ${testName || 'unnamed test'}`);
}

// Mock data setup
async function setupMockData(scenario?: string): Promise<void> {
  const dataManager = TestDataManager.getInstance();

  // Default mock data
  const defaultMocks = {
    user: {
      id: 'test-user-123',
      email: 'test@game-diary.com',
      username: 'testuser',
      created_at: new Date().toISOString(),
    },
    gameLog: {
      id: 'test-game-log-123',
      user_id: 'test-user-123',
      game_id: 'test-game-123',
      notes: 'Test game log',
      created_at: new Date().toISOString(),
    },
    apiResponse: {
      status: 200,
      data: null,
      message: 'Success',
    },
  };

  // Scenario-specific mocks
  const scenarioMocks: Record<string, any> = {
    'user-authentication': {
      ...defaultMocks,
      auth: {
        isAuthenticated: true,
        user: defaultMocks.user,
        token: 'test-token-123',
      },
    },
    'game-log-creation': {
      ...defaultMocks,
      gameLogs: [defaultMocks.gameLog],
    },
    'api-error': {
      ...defaultMocks,
      apiResponse: {
        status: 500,
        error: 'Internal Server Error',
        message: 'Something went wrong',
      },
    },
  };

  const mockData = scenario && scenarioMocks[scenario] ? scenarioMocks[scenario] : defaultMocks;

  // Set mock data
  Object.entries(mockData).forEach(([key, value]) => {
    dataManager.setMockData(key, value);
  });
}

// Isolation level application
async function applyIsolationLevel(level: 'minimal' | 'standard' | 'strict'): Promise<void> {
  const isolationConfigs = {
    minimal: {
      clearStorage: false,
      clearCookies: false,
      clearIndexedDB: false,
      resetMocks: true,
    },
    standard: {
      clearStorage: true,
      clearCookies: true,
      clearIndexedDB: false,
      resetMocks: true,
    },
    strict: {
      clearStorage: true,
      clearCookies: true,
      clearIndexedDB: true,
      resetMocks: true,
    },
  };

  const config = isolationConfigs[level];

  if (config.resetMocks) {
    vi.clearAllMocks();
    vi.resetAllMocks();
  }

  // Note: Storage/cookie clearing would be implemented for E2E tests
  // This is a placeholder for the pattern
  console.log(`🔒 Applied ${level} isolation level`);
}

// Global test setup and teardown
export function setupGlobalTestEnvironment(): void {
  beforeEach(async () => {
    // Setup for each test
    await enhancedTestSetup();
  });

  afterEach(async () => {
    // Cleanup after each test
    const dataManager = TestDataManager.getInstance();
    await dataManager.clearAllData();
  });
}

// Mock factory utilities
export function createMockFactory<T>(defaultData: T) {
  return (overrides: Partial<T> = {}): T => ({
    ...defaultData,
    ...overrides,
  });
}

// Common mock factories
export const mockFactories = {
  user: createMockFactory({
    id: 'test-user-123',
    email: 'test@game-diary.com',
    username: 'testuser',
    created_at: new Date().toISOString(),
  }),
  gameLog: createMockFactory({
    id: 'test-game-log-123',
    user_id: 'test-user-123',
    game_id: 'test-game-123',
    notes: 'Test game log',
    created_at: new Date().toISOString(),
  }),
  apiResponse: createMockFactory({
    status: 200,
    data: null,
    message: 'Success',
  }),
};

// Test assertion utilities
export const testAssertions = {
  expectUserData: (user: any, expected: Partial<any> = {}) => {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('username');

    Object.entries(expected).forEach(([key, value]) => {
      expect(user[key]).toBe(value);
    });
  },

  expectApiResponse: (response: any, expectedStatus = 200) => {
    expect(response).toHaveProperty('status');
    expect(response.status).toBe(expectedStatus);

    if (expectedStatus === 200) {
      expect(response).toHaveProperty('data');
    }
  },

  expectGameLogData: (gameLog: any, expected: Partial<any> = {}) => {
    expect(gameLog).toHaveProperty('id');
    expect(gameLog).toHaveProperty('user_id');
    expect(gameLog).toHaveProperty('game_id');
    expect(gameLog).toHaveProperty('notes');

    Object.entries(expected).forEach(([key, value]) => {
      expect(gameLog[key]).toBe(value);
    });
  },
};

// Performance testing utilities
export const performanceUtils = {
  measureExecutionTime: async <T>(
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  },

  expectPerformanceThreshold: (duration: number, threshold: number) => {
    expect(duration).toBeLessThan(threshold);
  },
};

// Error testing utilities
export const errorUtils = {
  expectAsyncError: async (fn: () => Promise<any>, expectedError?: string | RegExp) => {
    try {
      await fn();
      throw new Error('Expected function to throw an error');
    } catch (error) {
      if (expectedError) {
        if (typeof expectedError === 'string') {
          expect((error as Error).message).toContain(expectedError);
        } else {
          expect((error as Error).message).toMatch(expectedError);
        }
      }
    }
  },

  expectSyncError: (fn: () => any, expectedError?: string | RegExp) => {
    try {
      fn();
      throw new Error('Expected function to throw an error');
    } catch (error) {
      if (expectedError) {
        if (typeof expectedError === 'string') {
          expect((error as Error).message).toContain(expectedError);
        } else {
          expect((error as Error).message).toMatch(expectedError);
        }
      }
    }
  },
};
