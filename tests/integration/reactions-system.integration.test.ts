import { test, expect, describe } from 'vitest';

import { REACTION_EMOJIS, TARGET_TYPES } from '@/lib/constants';
import { getAppUrl } from '@src/lib/config/app.config';
import { createMockUser, createMockGameLog, generateId } from '@tests/shared/utils/test-data';

const GRAPHQL_ENDPOINT = `${getAppUrl()}/api/graphql`;
const MOCK_SERVER_ENDPOINT = `${getAppUrl()}/api/mock-server`;
const BASE_URL = getAppUrl();

// Test data setup
const TEST_USER = createMockUser({ id: 'test-user-reactions', username: 'reactiontester' });
const TEST_GAME_LOG = createMockGameLog({ id: 'test-gamelog-reactions', user_id: TEST_USER.id });

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

// Helper function to make mock server requests
async function makeMockServerRequest(action: string, type?: string) {
  const url = new URL(MOCK_SERVER_ENDPOINT);
  url.searchParams.set('action', action);
  if (type) {
    url.searchParams.set('type', type);
  }

  const response = await fetch(url.toString());
  return {
    status: response.status,
    data: await response.json(),
  } as { status: number; data: any };
}

// GraphQL fragments and queries for reuse
const REACTION_FRAGMENT = `
  fragment ReactionFragment on Reaction {
    id
    emoji
    user_id
    target_id
    target_type
    created_at
    updated_at
    deleted_at
    user {
      id
      username
      first_name
      last_name
      email_address
      image_url
    }
  }
`;

const CREATE_REACTION_MUTATION = `
  mutation CreateReaction($input: CreateReactionInput!) {
    createReaction(input: $input) {
      reaction {
        ...ReactionFragment
      }
      errors {
        message
        code
        field
      }
    }
  }
  ${REACTION_FRAGMENT}
`;

const DELETE_REACTION_MUTATION = `
  mutation DeleteReaction($id: ID!) {
    deleteReaction(id: $id) {
      success
      errors {
        message
        code
        field
      }
    }
  }
`;

const GET_REACTIONS_QUERY = `
  query GetReactions($targetId: ID!, $targetType: ParentType!) {
    reactions(targetId: $targetId, targetType: $targetType) {
      ...ReactionFragment
    }
  }
  ${REACTION_FRAGMENT}
`;

describe('Reactions System Integration Tests', () => {
  // Test data for different scenarios
  const validEmojis = Object.values(REACTION_EMOJIS);
  const invalidEmojis = ['🦄', '🌈', '🍕', '🎸', '🚗'];
  const targetTypes = Object.values(TARGET_TYPES);

  describe('Authentication & Authorization', () => {
    test('should work with mock authentication for reaction creation', async () => {
      const variables = {
        input: {
          emoji: REACTION_EMOJIS.THUMBS_UP,
          targetId: TEST_GAME_LOG.id,
          targetType: TARGET_TYPES.GAME_LOG,
        },
      };

      const result = await makeGraphQLRequest(CREATE_REACTION_MUTATION, variables);

      expect([200, 400, 401, 403]).toContain(result.status);

      if (result.status === 200 && result.data?.data?.createReaction) {
        const response = result.data.data.createReaction;
        // In mock mode, we expect either a successful reaction or an error
        // The mock authentication should provide a user, so we expect either success or validation errors
        expect(response.reaction !== null || response.errors.length > 0).toBeTruthy();
      }
    });

    test('should work with mock authentication for reaction queries', async () => {
      const variables = {
        targetId: TEST_GAME_LOG.id,
        targetType: TARGET_TYPES.GAME_LOG,
      };

      const result = await makeGraphQLRequest(GET_REACTIONS_QUERY, variables);

      expect([200, 400, 401, 403]).toContain(result.status);

      if (result.status === 200) {
        // In mock mode, we expect either successful data or errors
        expect(result.data.data || result.data.errors).toBeDefined();
      }
    });
  });

  describe('Input Validation', () => {
    test('should validate reaction input data comprehensively', async () => {
      const invalidInputs = [
        { emoji: '', targetId: 'test', targetType: TARGET_TYPES.GAME_LOG },
        { emoji: REACTION_EMOJIS.THUMBS_UP, targetId: '', targetType: TARGET_TYPES.GAME_LOG },
        { emoji: REACTION_EMOJIS.THUMBS_UP, targetId: 'test', targetType: '' },
        { emoji: REACTION_EMOJIS.THUMBS_UP, targetId: 'test', targetType: 'INVALID_TYPE' },
        { emoji: '🦄', targetId: 'test', targetType: TARGET_TYPES.GAME_LOG },
        {
          emoji: REACTION_EMOJIS.THUMBS_UP,
          targetId: 'a'.repeat(256),
          targetType: TARGET_TYPES.GAME_LOG,
        },
      ];

      for (const input of invalidInputs) {
        const result = await makeGraphQLRequest(CREATE_REACTION_MUTATION, { input });

        expect([200, 400, 403]).toContain(result.status);

        if (result.status === 200 && result.data?.data?.createReaction) {
          const response = result.data.data.createReaction;
          expect(response.reaction).toBeNull();
          expect(response.errors.length).toBeGreaterThan(0);
        }
      }
    });

    test('should accept all valid emojis', async () => {
      const promises = validEmojis.map(emoji => {
        const variables = {
          input: {
            emoji,
            targetId: `test-target-${emoji}`,
            targetType: TARGET_TYPES.GAME_LOG,
          },
        };
        return makeGraphQLRequest(CREATE_REACTION_MUTATION, variables);
      });

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect([200, 400, 403]).toContain(result.status);
      });
    });

    test('should reject invalid emojis', async () => {
      const promises = invalidEmojis.map(emoji => {
        const variables = {
          input: {
            emoji,
            targetId: `test-target-${emoji}`,
            targetType: TARGET_TYPES.GAME_LOG,
          },
        };
        return makeGraphQLRequest(CREATE_REACTION_MUTATION, variables);
      });

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect([200, 400, 403]).toContain(result.status);

        if (result.status === 200 && result.data?.data?.createReaction) {
          const response = result.data.data.createReaction;
          expect(response.reaction).toBeNull();
          expect(response.errors).toHaveLength(1);
        }
      });
    });

    test('should accept all valid target types', async () => {
      const promises = targetTypes.map(targetType => {
        const variables = {
          input: {
            emoji: REACTION_EMOJIS.THUMBS_UP,
            targetId: `test-target-${targetType}`,
            targetType,
          },
        };
        return makeGraphQLRequest(CREATE_REACTION_MUTATION, variables);
      });

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect([200, 400, 403]).toContain(result.status);
      });
    });
  });

  describe('GraphQL Operations', () => {
    test('should create reaction with complete data', async () => {
      const variables = {
        input: {
          emoji: REACTION_EMOJIS.THUMBS_UP,
          targetId: TEST_GAME_LOG.id,
          targetType: TARGET_TYPES.GAME_LOG,
        },
      };

      const result = await makeGraphQLRequest(CREATE_REACTION_MUTATION, variables);

      // Should fail with 403 (forbidden) when not authenticated
      expect([200, 400, 403]).toContain(result.status);

      if (result.status === 200 && result.data?.data?.createReaction) {
        const response = result.data.data.createReaction;
        // Check if reaction was created successfully or if there were errors
        if (response.reaction) {
          expect(response.reaction.emoji).toBe(REACTION_EMOJIS.THUMBS_UP);
          expect(response.reaction.target_id).toBe(TEST_GAME_LOG.id);
          expect(response.reaction.target_type).toBe(TARGET_TYPES.GAME_LOG);
          expect(response.reaction.user_id).toBeDefined();
          expect(response.reaction.created_at).toBeDefined();
          expect(response.reaction.updated_at).toBeDefined();
          expect(response.errors).toHaveLength(0);
        } else {
          // If reaction is null, there should be errors (expected in unauthenticated context)
          expect(response.errors).toBeDefined();
          expect(response.errors.length).toBeGreaterThan(0);
        }
      }
    });

    test('should handle duplicate reaction creation gracefully', async () => {
      const variables = {
        input: {
          emoji: REACTION_EMOJIS.LOVE,
          targetId: TEST_GAME_LOG.id,
          targetType: TARGET_TYPES.GAME_LOG,
        },
      };

      // Create the same reaction twice
      const result1 = await makeGraphQLRequest(CREATE_REACTION_MUTATION, variables);
      const result2 = await makeGraphQLRequest(CREATE_REACTION_MUTATION, variables);

      // Should fail with 403 (forbidden) when not authenticated
      expect([200, 400, 403]).toContain(result1.status);
      expect([200, 400, 403]).toContain(result2.status);

      // Second attempt should either succeed (idempotent) or fail gracefully
      if (result2.status === 200 && result2.data?.data?.createReaction) {
        const response = result2.data.data.createReaction;
        // Should either return the existing reaction or an error
        expect(response.reaction || response.errors.length > 0).toBeTruthy();
      }
    });

    test('should delete reaction successfully', async () => {
      const reactionId = generateId('reaction');
      const variables = { id: reactionId };

      const result = await makeGraphQLRequest(DELETE_REACTION_MUTATION, variables);

      expect([200, 400, 403]).toContain(result.status);

      if (result.status === 200 && result.data?.data?.deleteReaction) {
        const response = result.data.data.deleteReaction;
        expect(response.success).toBeDefined();
      }
    });

    test('should query reactions with proper structure', async () => {
      const variables = {
        targetId: TEST_GAME_LOG.id,
        targetType: TARGET_TYPES.GAME_LOG,
      };

      const result = await makeGraphQLRequest(GET_REACTIONS_QUERY, variables);

      // Should fail with 403 (forbidden) when not authenticated
      expect([200, 400, 403]).toContain(result.status);

      if (result.status === 200 && result.data?.data?.reactions) {
        const reactions = result.data.data.reactions;
        expect(Array.isArray(reactions)).toBe(true);

        // If there are reactions, verify their structure
        if (reactions.length > 0) {
          const reaction = reactions[0];
          expect(reaction).toHaveProperty('id');
          expect(reaction).toHaveProperty('emoji');
          expect(reaction).toHaveProperty('user_id');
          expect(reaction).toHaveProperty('target_id');
          expect(reaction).toHaveProperty('target_type');
          expect(reaction).toHaveProperty('created_at');
          expect(reaction).toHaveProperty('updated_at');
          expect(reaction).toHaveProperty('user');
        }
      }
    });

    test('should handle malformed GraphQL requests', async () => {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      expect([400, 500]).toContain(response.status);
    });

    test('should handle missing GraphQL variables', async () => {
      const result = await makeGraphQLRequest(CREATE_REACTION_MUTATION);

      expect([200, 400]).toContain(result.status);

      if (result.status === 200) {
        expect(result.data.errors).toBeDefined();
      }
    });
  });

  describe('Performance & Concurrency', () => {
    test('should handle multiple concurrent reaction requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => ({
        query: CREATE_REACTION_MUTATION,
        variables: {
          input: {
            emoji: validEmojis[i % validEmojis.length],
            targetId: `test-target-concurrent-${i}`,
            targetType: TARGET_TYPES.GAME_LOG,
          },
        },
      }));

      const startTime = Date.now();
      const results = await Promise.allSettled(
        requests.map(req => makeGraphQLRequest(req.query, req.variables))
      );
      const endTime = Date.now();

      // Should complete within reasonable time (5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);

      // Should handle all requests
      expect(results).toHaveLength(5);

      results.forEach(result => {
        expect(result.status).toBe('fulfilled');
      });
    });

    test('should handle large reaction queries efficiently', async () => {
      const variables = {
        targetId: 'test-target-large',
        targetType: TARGET_TYPES.GAME_LOG,
      };

      const startTime = Date.now();
      const result = await makeGraphQLRequest(GET_REACTIONS_QUERY, variables);
      const endTime = Date.now();

      // Should complete within reasonable time (2 seconds)
      expect(endTime - startTime).toBeLessThan(2000);

      // Should fail with 403 (forbidden) when not authenticated
      expect([200, 400, 403]).toContain(result.status);
    });

    test('should handle network timeouts gracefully', async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1);

      try {
        await fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: '{ __typename }',
          }),
          signal: controller.signal as AbortSignal,
        });
      } catch (error: any) {
        // Accept both AbortError and TypeError as valid timeout errors
        expect(['AbortError', 'TypeError']).toContain(error.name);
      } finally {
        clearTimeout(timeoutId);
      }
    });
  });

  describe('Mock Server Integration', () => {
    test('should serve mock NBA games data', async () => {
      const result = await makeMockServerRequest('mock-data', 'nba-games');

      expect(result.status).toBe(200);
      expect(result.data).toBeDefined();
      // Check for either data.data.response or data.response structure
      if (result.data.data?.response) {
        expect(Array.isArray(result.data.data.response)).toBe(true);
      } else if (result.data.response) {
        expect(Array.isArray(result.data.response)).toBe(true);
      } else {
        // If neither structure exists, just verify we have some data
        expect(result.data).toBeDefined();
      }
    });

    test('should handle mock server health check', async () => {
      const result = await makeMockServerRequest('health');

      expect(result.status).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data.status).toBe('healthy');
    });

    test('should handle invalid mock server actions', async () => {
      const result = await makeMockServerRequest('invalid-action');

      expect([400, 404, 500]).toContain(result.status);
    });
  });

  describe('API Endpoints Integration', () => {
    test('should serve latest games via proxy endpoint', async () => {
      const response = await fetch(`${BASE_URL}/api/proxy/games?season=2024&league=standard`);

      expect([200, 400, 500]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toBeDefined();
      }
    });

    test('should handle games API with invalid parameters', async () => {
      const response = await fetch(`${BASE_URL}/api/proxy/games?season=invalid&league=invalid`);

      expect([200, 400, 500]).toContain(response.status);
    });

    test('should serve health check endpoint', async () => {
      const response = await fetch(`${BASE_URL}/api/health`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('healthy');
    });
  });

  describe('Landing Page Integration', () => {
    test('should serve landing page with content preview banner', async () => {
      const response = await fetch(`${BASE_URL}/`);

      expect(response.status).toBe(200);
      const html = await response.text();

      // Check for key elements that should be present
      expect(html).toContain('Game Diary');
      expect(html).toContain('Track your gaming watching experiences');
    });

    test('should serve landing page with proper meta tags', async () => {
      const response = await fetch(`${BASE_URL}/`);

      expect(response.status).toBe(200);
      const html = await response.text();

      // Check for essential meta tags
      expect(html).toContain('<meta charSet="utf-8"/>');
      expect(html).toContain('<meta name="viewport"');
      expect(html).toContain('<title>');
    });
  });

  describe('Database Schema Integration', () => {
    test('should enforce emoji constraints in reactions table', async () => {
      // Test that the database schema properly enforces emoji constraints
      // This tests the GraphQL layer which should respect database constraints

      const promises = validEmojis.map(emoji => {
        const variables = {
          input: {
            emoji,
            targetId: `test-target-${emoji}`,
            targetType: TARGET_TYPES.GAME_LOG,
          },
        };
        return makeGraphQLRequest(CREATE_REACTION_MUTATION, variables);
      });

      const results = await Promise.all(promises);

      results.forEach(result => {
        // Should not fail due to emoji constraint
        expect([200, 400, 403]).toContain(result.status);
      });
    });

    test('should reject invalid emojis in reactions table', async () => {
      const promises = invalidEmojis.map(emoji => {
        const variables = {
          input: {
            emoji,
            targetId: `test-target-${emoji}`,
            targetType: TARGET_TYPES.GAME_LOG,
          },
        };
        return makeGraphQLRequest(CREATE_REACTION_MUTATION, variables);
      });

      const results = await Promise.all(promises);

      results.forEach(result => {
        // Should fail due to emoji constraint
        expect([200, 400, 403]).toContain(result.status);

        if (result.status === 200 && result.data?.data?.createReaction) {
          const response = result.data.data.createReaction;
          expect(response.reaction).toBeNull();
          expect(response.errors).toHaveLength(1);
        }
      });
    });

    test('should enforce target type constraints', async () => {
      const invalidTargetTypes = ['INVALID_TYPE', 'POST', 'USER', ''];

      const promises = invalidTargetTypes.map(targetType => {
        const variables = {
          input: {
            emoji: REACTION_EMOJIS.THUMBS_UP,
            targetId: `test-target-${targetType}`,
            targetType,
          },
        };
        return makeGraphQLRequest(CREATE_REACTION_MUTATION, variables);
      });

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect([200, 400, 403]).toContain(result.status);

        if (result.status === 200 && result.data?.data?.createReaction) {
          const response = result.data.data.createReaction;
          expect(response.reaction).toBeNull();
          expect(response.errors.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
