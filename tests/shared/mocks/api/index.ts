import {
  createMockUser,
  createMockGameLog,
  createMockFriendship,
} from '@tests/shared/utils/test-data';

// API response mocks for different endpoints
export const mockApiResponses = {
  // User-related API responses
  users: {
    list: {
      status: 200,
      data: [
        createMockUser({
          id: 'user-1',
          email: 'user1@example.com',
          username: 'user1',
          isAdmin: true,
        }),
        createMockUser({
          id: 'user-2',
          email: 'user2@example.com',
          username: 'user2',
          isAdmin: false,
        }),
        createMockUser({
          id: 'user-3',
          email: 'user3@example.com',
          username: 'user3',
          isAdmin: false,
        }),
      ],
    },
    get: {
      status: 200,
      data: createMockUser({
        id: 'user-1',
        email: 'user1@example.com',
        username: 'user1',
        isAdmin: true,
      }),
    },
    create: {
      status: 201,
      data: createMockUser({
        id: 'new-user',
        email: 'new@example.com',
        username: 'newuser',
        isAdmin: false,
      }),
    },
    update: {
      status: 200,
      data: createMockUser({
        id: 'user-1',
        email: 'updated@example.com',
        username: 'updateduser',
        isAdmin: true,
      }),
    },
    delete: {
      status: 204,
      data: null,
    },
    error: {
      status: 400,
      error: 'Invalid user data',
    },
    notFound: {
      status: 404,
      error: 'User not found',
    },
  },

  // Game log-related API responses
  gameLogs: {
    list: {
      status: 200,
      data: [
        createMockGameLog({
          id: 'gamelog-1',
          user_id: 'user-1',
          game_id: 'game-1',
          notes: 'Great game!',
        }),
        createMockGameLog({
          id: 'gamelog-2',
          user_id: 'user-2',
          game_id: 'game-2',
          notes: 'Amazing performance!',
        }),
        createMockGameLog({
          id: 'gamelog-3',
          user_id: 'user-1',
          game_id: 'game-3',
          notes: 'Solid defense',
        }),
      ],
    },
    get: {
      status: 200,
      data: createMockGameLog({
        id: 'gamelog-1',
        user_id: 'user-1',
        game_id: 'game-1',
        notes: 'Great game!',
      }),
    },
    create: {
      status: 201,
      data: createMockGameLog({
        id: 'new-gamelog',
        user_id: 'user-1',
        game_id: 'game-4',
        notes: 'New game log',
      }),
    },
    update: {
      status: 200,
      data: createMockGameLog({
        id: 'gamelog-1',
        user_id: 'user-1',
        game_id: 'game-1',
        notes: 'Updated notes',
      }),
    },
    delete: {
      status: 204,
      data: null,
    },
    error: {
      status: 400,
      error: 'Invalid game log data',
    },
    notFound: {
      status: 404,
      error: 'Game log not found',
    },
  },

  // Friendship-related API responses
  friendships: {
    list: {
      status: 200,
      data: [
        createMockFriendship({
          id: 'friendship-1',
          user_id: 'user-1',
          friend_id: 'user-2',
          status: 'accepted',
        }),
        createMockFriendship({
          id: 'friendship-2',
          user_id: 'user-1',
          friend_id: 'user-3',
          status: 'pending',
        }),
      ],
    },
    create: {
      status: 201,
      data: createMockFriendship({
        id: 'new-friendship',
        user_id: 'user-1',
        friend_id: 'user-4',
        status: 'pending',
      }),
    },
    update: {
      status: 200,
      data: createMockFriendship({
        id: 'friendship-2',
        user_id: 'user-1',
        friend_id: 'user-3',
        status: 'accepted',
      }),
    },
    delete: {
      status: 204,
      data: null,
    },
  },

  // Search API responses
  search: {
    success: {
      status: 200,
      data: {
        results: [
          { id: 'result-1', type: 'user', title: 'User 1', description: 'User description' },
          {
            id: 'result-2',
            type: 'game-log',
            title: 'Game Log 1',
            description: 'Game log description',
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
      },
    },
    empty: {
      status: 200,
      data: {
        results: [],
        total: 0,
        page: 1,
        limit: 10,
      },
    },
    error: {
      status: 400,
      error: 'Invalid search query',
    },
  },

  // Health check API responses
  health: {
    success: {
      status: 200,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'healthy',
          external_services: 'healthy',
        },
        response_time: 45,
        version: '1.0.0',
        environment: 'test',
      },
    },
    degraded: {
      status: 200,
      data: {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'healthy',
          external_services: 'degraded',
        },
        response_time: 150,
        version: '1.0.0',
        environment: 'test',
      },
    },
    error: {
      status: 503,
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'unhealthy',
          external_services: 'unhealthy',
        },
        response_time: 5000,
        version: '1.0.0',
        environment: 'test',
      },
    },
  },

  // GraphQL API responses
  graphql: {
    users: {
      status: 200,
      data: {
        data: {
          users: [
            createMockUser({
              id: 'user-1',
              email: 'user1@example.com',
              username: 'user1',
              isAdmin: true,
            }),
            createMockUser({
              id: 'user-2',
              email: 'user2@example.com',
              username: 'user2',
              isAdmin: false,
            }),
          ],
        },
      },
    },
    user: {
      status: 200,
      data: {
        data: {
          user: createMockUser({
            id: 'user-1',
            email: 'user1@example.com',
            username: 'user1',
            isAdmin: true,
          }),
        },
      },
    },
    error: {
      status: 200,
      data: {
        errors: [
          {
            message: 'Field "invalidField" of type "User" must have a selection of subfields.',
            locations: [{ line: 2, column: 3 }],
            path: ['user'],
          },
        ],
      },
    },
    malformed: {
      status: 400,
      data: {
        errors: [
          {
            message: 'Syntax Error: Unexpected Name "invalid"',
            locations: [{ line: 1, column: 1 }],
          },
        ],
      },
    },
  },

  // External API responses (for sports data, etc.)
  external: {
    nbaGames: {
      status: 200,
      data: {
        games: [
          {
            id: 'game-1',
            home_team: 'Lakers',
            away_team: 'Warriors',
            home_score: 105,
            away_score: 98,
            status: 'final',
            date: '2024-01-15T20:00:00Z',
          },
          {
            id: 'game-2',
            home_team: 'Celtics',
            away_team: 'Heat',
            home_score: 112,
            away_score: 108,
            status: 'final',
            date: '2024-01-15T19:30:00Z',
          },
        ],
      },
    },
    nbaTeams: {
      status: 200,
      data: {
        teams: [
          { id: 'team-1', name: 'Los Angeles Lakers', city: 'Los Angeles', conference: 'Western' },
          {
            id: 'team-2',
            name: 'Golden State Warriors',
            city: 'San Francisco',
            conference: 'Western',
          },
          { id: 'team-3', name: 'Boston Celtics', city: 'Boston', conference: 'Eastern' },
        ],
      },
    },
    error: {
      status: 429,
      error: 'Rate limit exceeded',
    },
  },
};

// Mock fetch function for unit tests
export const createMockFetch = (responses: Record<string, any> = mockApiResponses) => {
  return vi.fn().mockImplementation((url: string, options?: any) => {
    // Determine which mock response to return based on URL
    let response;

    if (url.includes('/api/users')) {
      if (options?.method === 'POST') {
        response = responses.users.create;
      } else if (url.includes('/api/users/')) {
        response = responses.users.get;
      } else {
        response = responses.users.list;
      }
    } else if (url.includes('/api/game-logs')) {
      if (options?.method === 'POST') {
        response = responses.gameLogs.create;
      } else if (url.includes('/api/game-logs/')) {
        response = responses.gameLogs.get;
      } else {
        response = responses.gameLogs.list;
      }
    } else if (url.includes('/api/search')) {
      response = responses.search.success;
    } else if (url.includes('/api/health')) {
      response = responses.health.success;
    } else if (url.includes('/api/graphql')) {
      response = responses.graphql.users;
    } else {
      response = responses.users.error;
    }

    return Promise.resolve({
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      json: async () => response.data || response,
    });
  });
};

// Mock API client for testing
export const createMockApiClient = () => {
  return {
    fetch: createMockFetch(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
};
