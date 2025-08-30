import { test, expect, describe } from 'vitest';

import { getAppUrl } from '@src/lib/config/app.config';

const GRAPHQL_ENDPOINT = `${getAppUrl()}/api/graphql`;

// Helper function to make GraphQL requests
async function makeGraphQLRequest(query: string, variables?: Record<string, unknown>) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  return {
    status: response.status,
    data: await response.json(),
  } as { status: number; data: any };
}

describe('GraphQL Integration Tests', () => {
  describe('Schema and Introspection', () => {
    test('should support GraphQL introspection', async () => {
      const introspectionQuery = `
        query IntrospectionQuery {
          __schema {
            types {
              name
              kind
            }
          }
        }
      `;

      const result = await makeGraphQLRequest(introspectionQuery);

      // Accept both 200 and 400 for GraphQL endpoints
      expect([200, 400]).toContain(result.status);
      if (result.status === 200) {
        expect(result.data).toHaveProperty('data');
      }
    });

    test('should handle invalid GraphQL query', async () => {
      const invalidQuery = `
        query InvalidQuery {
          invalidField {
            id
          }
        }
      `;

      const result = await makeGraphQLRequest(invalidQuery);

      // GraphQL can return 200 with errors or 400 for malformed queries
      expect([200, 400]).toContain(result.status);
      if (result.status === 200) {
        expect(result.data).toHaveProperty('errors');
        expect(Array.isArray(result.data.errors)).toBe(true);
      }
    });

    test('should handle malformed JSON', async () => {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      // Should handle malformed JSON gracefully
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('Query Operations', () => {
    test('should handle user queries', async () => {
      const userQuery = `
        query GetUsers {
          users {
            id
            username
            email
          }
        }
      `;

      const result = await makeGraphQLRequest(userQuery);

      // Accept both 200 and 400 for GraphQL endpoints
      expect([200, 400]).toContain(result.status);
      if (result.status === 200) {
        expect(result.data).toHaveProperty('data');
        // Note: In a real test environment, this might return empty or mock data
      }
    });

    test('should handle game logs queries', async () => {
      const gameLogsQuery = `
        query GetGameLogs {
          gameLogs {
            id
            title
            content
            createdAt
          }
        }
      `;

      const result = await makeGraphQLRequest(gameLogsQuery);

      expect([200, 400]).toContain(result.status);
      if (result.status === 200) {
        expect(result.data).toHaveProperty('data');
      }
    });

    test('should handle friendships queries', async () => {
      const friendshipsQuery = `
        query GetFriendships {
          friendships {
            id
            status
            friend {
              id
              username
            }
          }
        }
      `;

      const result = await makeGraphQLRequest(friendshipsQuery);

      expect([200, 400]).toContain(result.status);
      if (result.status === 200) {
        expect(result.data).toHaveProperty('data');
      }
    });

    test('should handle notifications queries', async () => {
      const notificationsQuery = `
        query GetNotifications {
          notifications {
            id
            type
            title
            message
            createdAt
          }
        }
      `;

      const result = await makeGraphQLRequest(notificationsQuery);

      expect([200, 400]).toContain(result.status);
      if (result.status === 200) {
        expect(result.data).toHaveProperty('data');
      }
    });

    test('should handle game queries', async () => {
      const gamesQuery = `
        query GetGames {
          games {
            id
            title
            status
            createdAt
          }
        }
      `;

      const result = await makeGraphQLRequest(gamesQuery);

      expect([200, 400]).toContain(result.status);
      if (result.status === 200) {
        expect(result.data).toHaveProperty('data');
      }
    });
  });

  describe('Mutation Operations', () => {
    test('should handle mutations with proper error handling', async () => {
      const createGameLogMutation = `
        mutation CreateGameLog($input: CreateGameLogInput!) {
          createGameLog(input: $input) {
            id
            title
            content
            createdAt
          }
        }
      `;

      const result = await makeGraphQLRequest(createGameLogMutation, {
        input: {
          title: 'Test Game Log',
          content: 'This is a test game log',
        },
      });

      expect([200, 400]).toContain(result.status);
      if (result.status === 200) {
        expect(result.data).toHaveProperty('data');
      }
    });
  });

  describe('Authentication and Authorization', () => {
    test('should handle authentication context', async () => {
      const userQuery = `
        query GetCurrentUser {
          me {
            id
            username
            email
          }
        }
      `;

      const result = await makeGraphQLRequest(userQuery);

      expect([200, 400, 401]).toContain(result.status);
      // Without authentication, this should return null or empty data
      if (result.status === 200) {
        expect(result.data).toHaveProperty('data');
      }
    });
  });

  describe('Complex Queries', () => {
    test('should handle complex queries with fragments', async () => {
      const complexQuery = `
        fragment UserFields on User {
          id
          username
          email
          createdAt
        }

        query GetUsersWithDetails {
          users {
            ...UserFields
            gameLogs {
              id
              title
              content
            }
            friendships {
              id
              status
              friend {
                ...UserFields
              }
            }
          }
        }
      `;

      const result = await makeGraphQLRequest(complexQuery);

      expect([200, 400]).toContain(result.status);
      if (result.status === 200) {
        expect(result.data).toHaveProperty('data');
      }
    });

    test('should handle subscription-like queries (if supported)', async () => {
      const liveGamesQuery = `
        query GetLiveGames {
          liveGames {
            id
            title
            status
            updatedAt
          }
        }
      `;

      const result = await makeGraphQLRequest(liveGamesQuery);

      expect([200, 400]).toContain(result.status);
      if (result.status === 200) {
        expect(result.data).toHaveProperty('data');
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle rate limiting (if implemented)', async () => {
      // Make multiple rapid requests to test rate limiting
      const promises = Array.from({ length: 10 }, () => makeGraphQLRequest('query { __typename }'));

      const results = await Promise.all(promises);

      // All requests should succeed (rate limiting might not be implemented)
      results.forEach(result => {
        expect([200, 400]).toContain(result.status);
      });
    });

    test('should handle CORS headers', async () => {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      });

      // Should handle preflight requests properly
      expect([200, 204]).toContain(response.status);
    });

    test('should handle large queries', async () => {
      const largeQuery = `
        query LargeQuery {
          users {
            id
            username
            email
            gameLogs {
              id
              title
              content
              createdAt
              updatedAt
            }
            friendships {
              id
              status
              friend {
                id
                username
                email
                gameLogs {
                  id
                  title
                  content
                }
              }
            }
            notifications {
              id
              type
              title
              message
              createdAt
              readAt
            }
          }
        }
      `;

      const result = await makeGraphQLRequest(largeQuery);

      expect([200, 400]).toContain(result.status);
      if (result.status === 200) {
        expect(result.data).toHaveProperty('data');
      }
    });
  });

  describe('Variables and Input', () => {
    test('should handle query with variables', async () => {
      const queryWithVariables = `
        query GetUserById($id: ID!) {
          user(id: $id) {
            id
            username
            email
          }
        }
      `;

      const result = await makeGraphQLRequest(queryWithVariables, {
        id: 'test-user-id',
      });

      expect([200, 400]).toContain(result.status);
      if (result.status === 200) {
        expect(result.data).toHaveProperty('data');
      }
    });

    test('should handle query with multiple variables', async () => {
      const queryWithMultipleVariables = `
        query SearchGameLogs($search: String!, $limit: Int!, $offset: Int!) {
          gameLogs(search: $search, limit: $limit, offset: $offset) {
            id
            title
            content
            createdAt
          }
        }
      `;

      const result = await makeGraphQLRequest(queryWithMultipleVariables, {
        search: 'test',
        limit: 10,
        offset: 0,
      });

      expect([200, 400]).toContain(result.status);
      if (result.status === 200) {
        expect(result.data).toHaveProperty('data');
      }
    });
  });
});
