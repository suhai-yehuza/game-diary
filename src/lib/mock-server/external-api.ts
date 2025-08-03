import { API_CONFIG } from '@src/lib/config/app.config';
import { mockDataProvider } from '@src/lib/mock';
import type { ExternalAPIResponse } from '@src/lib/types';

// Mock external API endpoints based on API_CONFIG
const MOCK_ENDPOINTS: Record<string, string> = {
  // Live games
  'games/live': 'live-games',
  'games/live/league/{league}': 'live-games',

  // Core endpoints from API_CONFIG
  [API_CONFIG.endpoints.GAMES]: 'nba-games',
  [API_CONFIG.endpoints.TEAMS]: 'nba-teams',
  [API_CONFIG.endpoints.PLAYERS]: 'nba-players',
  [API_CONFIG.endpoints.STANDINGS]: 'nba-standings',
  [API_CONFIG.endpoints.SEASONS]: 'nba-seasons',
  [API_CONFIG.endpoints.LEAGUES]: 'nba-leagues',

  // Statistics endpoints from API_CONFIG
  [API_CONFIG.endpoints.GAME_STATISTICS]: 'nba-game-statistics',
  [API_CONFIG.endpoints.TEAM_STATISTICS]: 'nba-team-statistics',
  [API_CONFIG.endpoints.PLAYER_STATISTICS]: 'nba-player-statistics',

  // GraphQL endpoint
  graphql: 'graphql',
};

// Mock error responses
const MOCK_ERRORS = {
  rate_limit_exceeded: {
    error: 'Rate limit exceeded',
    message: 'Too many requests. Please try again later.',
    code: 429,
  },
  api_key_invalid: {
    error: 'Invalid API key',
    message: 'The provided API key is invalid or expired.',
    code: 401,
  },
  server_error: {
    error: 'Internal server error',
    message: 'An unexpected error occurred. Please try again.',
    code: 500,
  },
  not_found: {
    error: 'Not found',
    message: 'The requested resource was not found.',
    code: 404,
  },
  bad_request: {
    error: 'Bad request',
    message: 'The request was malformed or missing required parameters.',
    code: 400,
  },
};

// Simulate API response delays
function simulateAPIDelay(): Promise<void> {
  const delay = Math.random() * 200 + 50; // 50-250ms delay
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Generate realistic error responses
function generateErrorResponse(errorType: keyof typeof MOCK_ERRORS): ExternalAPIResponse {
  const error = MOCK_ERRORS[errorType];
  return {
    success: false,
    error: error.message,
    timestamp: new Date().toISOString(),
    latency: Math.random() * 100 + 50,
  };
}

// Generate successful API response
function generateSuccessResponse(data: unknown): ExternalAPIResponse {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    latency: Math.random() * 200 + 100,
  };
}

// Generate mock GraphQL response
function generateMockGraphQLResponse(params?: Record<string, unknown>) {
  // Mock GraphQL response based on the query
  const query = params?.query as string;

  if (query?.includes('users')) {
    return {
      data: {
        users: [
          { id: 'user_1', email: 'test@example.com', username: 'testuser' },
          { id: 'user_2', email: 'admin@example.com', username: 'admin' },
        ],
      },
    };
  }

  if (query?.includes('gameLogs')) {
    return {
      data: {
        gameLogs: [
          { id: 'log_1', title: 'Great Game!', content: 'Amazing performance' },
          { id: 'log_2', title: 'Tough Loss', content: 'We will bounce back' },
        ],
      },
    };
  }

  // Default response
  return {
    data: {
      message: 'Mock GraphQL response',
      timestamp: new Date().toISOString(),
    },
  };
}

export function createMockExternalAPI() {
  let requestCount = 0;
  let errorCount = 0;

  return {
    // Make an external API call
    async call(endpoint: string, params?: Record<string, unknown>): Promise<ExternalAPIResponse> {
      await simulateAPIDelay();
      requestCount++;

      // Simulate occasional errors (5% error rate)
      if (Math.random() < 0.05) {
        errorCount++;
        const errorTypes = Object.keys(MOCK_ERRORS) as Array<keyof typeof MOCK_ERRORS>;
        const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
        return generateErrorResponse(randomError);
      }

      // Map endpoint to mock data type
      const mockDataType = MOCK_ENDPOINTS[endpoint];
      if (!mockDataType) {
        return generateErrorResponse('not_found');
      }

      try {
        // Get mock data based on endpoint
        let mockData: unknown;
        switch (mockDataType) {
          case 'nba-games':
            mockData = await mockDataProvider.getNbaGamesMock();
            break;
          case 'nba-teams':
            mockData = await mockDataProvider.getNbaTeamsMock();
            break;
          case 'nba-players':
            mockData = await mockDataProvider.getNbaPlayersMock();
            break;
          case 'nba-standings':
            mockData = await mockDataProvider.getNbaStandingsMock();
            break;
          case 'nba-statistics':
            mockData = await mockDataProvider.getNbaGameStatisticsMock();
            break;
          case 'live-games':
            mockData = await mockDataProvider.getLiveGamesMock();
            break;
          case 'nba-seasons':
            mockData = await mockDataProvider.getNbaSeasonsMock();
            break;
          case 'nba-leagues':
            mockData = await mockDataProvider.getNbaLeaguesMock();
            break;
          case 'graphql':
            mockData = generateMockGraphQLResponse(params);
            break;
          default:
            return generateErrorResponse('not_found');
        }

        // Apply filters if provided
        if (params?.filter && Array.isArray(mockData)) {
          mockData = mockData.filter(item => {
            const recordItem = item as Record<string, unknown>;
            return Object.entries(params.filter as Record<string, unknown>).every(
              ([key, value]) => {
                return recordItem[key] === value;
              }
            );
          });
        }

        // Apply search if provided
        if (params?.search && Array.isArray(mockData)) {
          const searchTerm = (params.search as string).toLowerCase();
          mockData = mockData.filter(item => {
            const recordItem = item as Record<string, unknown>;
            // Search in name, title, or other text fields
            return Object.values(recordItem).some(value => {
              if (typeof value === 'string') {
                return value.toLowerCase().includes(searchTerm);
              }
              return false;
            });
          });
        }

        // Apply pagination if provided
        if (params?.limit || params?.offset) {
          const limit = (params.limit as number) || 10;
          const offset = (params.offset as number) || 0;
          if (Array.isArray(mockData)) {
            mockData = mockData.slice(offset, offset + limit);
          }
        }

        return generateSuccessResponse(mockData);
      } catch (_error) {
        errorCount++;
        return generateErrorResponse('server_error');
      }
    },

    // Get API statistics
    getStats() {
      return {
        totalRequests: requestCount,
        errorCount,
        successRate: requestCount > 0 ? ((requestCount - errorCount) / requestCount) * 100 : 100,
        averageLatency: 150, // Mock average latency
      };
    },

    // Reset API statistics
    reset() {
      requestCount = 0;
      errorCount = 0;
    },

    // Simulate specific error conditions
    simulateError(errorType: keyof typeof MOCK_ERRORS) {
      return generateErrorResponse(errorType);
    },

    // Test endpoint functionality
    testEndpoint: async (endpoint: string) => {
      const mockData = await mockDataProvider.getLiveGamesMock();
      return {
        endpoint,
        status: 'success',
        data: mockData,
        timestamp: new Date().toISOString(),
      };
    },

    // Get available endpoints
    getAvailableEndpoints() {
      return Object.keys(MOCK_ENDPOINTS);
    },

    // Simulate network timeout
    async simulateTimeout(): Promise<ExternalAPIResponse> {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second timeout
      return {
        success: false,
        error: 'Request timeout',
        timestamp: new Date().toISOString(),
        latency: 5000,
      };
    },

    // Simulate rate limiting
    async simulateRateLimit(): Promise<ExternalAPIResponse> {
      await simulateAPIDelay();
      return generateErrorResponse('rate_limit_exceeded');
    },

    // Simulate invalid API key
    async simulateInvalidKey(): Promise<ExternalAPIResponse> {
      await simulateAPIDelay();
      return generateErrorResponse('api_key_invalid');
    },

    // Handle GET requests
    get: async (endpoint: string, query?: Record<string, unknown>) => {
      const mockData = await mockDataProvider.getLiveGamesMock();

      if (Array.isArray(mockData)) {
        let filteredData: unknown[] = mockData;

        // Apply filters if provided
        if (query?.filter) {
          filteredData = filteredData.filter(item => {
            const recordItem = item as Record<string, unknown>;
            const filterKey = String(query.filter);
            const filterValue = query.value;
            return recordItem[filterKey] === filterValue;
          });
        }

        // Apply pagination
        const limit = query?.limit;
        const offset = query?.offset;

        if (typeof limit === 'number') {
          filteredData = filteredData.slice(0, limit);
        }

        if (typeof offset === 'number') {
          filteredData = filteredData.slice(offset);
        }

        return {
          success: true,
          data: filteredData,
          count: filteredData.length,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: false,
        error: 'No data available',
        timestamp: new Date().toISOString(),
      };
    },
  };
}
