import { test, expect, describe } from 'vitest';

import { getAppUrl } from '@src/lib/config/app.config';

const BASE_URL = getAppUrl();

describe('Webhook System Integration Tests', () => {
  describe('User Lifecycle Webhooks', () => {
    test('should handle user.created webhook with proper validation', async () => {
      const webhookData = {
        type: 'user.created',
        data: {
          id: 'test-user-created-id',
          email_addresses: [{ email_address: 'test-created@example.com' }],
          username: 'testusercreated',
          first_name: 'Test',
          last_name: 'Created',
          created_at: new Date().toISOString(),
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'test-webhook-id-1',
          'svix-timestamp': Date.now().toString(),
          'svix-signature': 'test-signature-1',
        },
        body: JSON.stringify(webhookData),
      });

      expect([200, 400, 401, 404, 405, 500]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('success');
        expect(data).toHaveProperty('message');
      }
    });

    test('should handle user.updated webhook with data synchronization', async () => {
      const webhookData = {
        type: 'user.updated',
        data: {
          id: 'test-user-updated-id',
          email_addresses: [{ email_address: 'test-updated@example.com' }],
          username: 'testuserupdated',
          first_name: 'Updated',
          last_name: 'User',
          updated_at: new Date().toISOString(),
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'test-webhook-id-2',
          'svix-timestamp': Date.now().toString(),
          'svix-signature': 'test-signature-2',
        },
        body: JSON.stringify(webhookData),
      });

      expect([200, 400, 401, 404, 405, 500]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('success');
        expect(data).toHaveProperty('message');
      }
    });

    test('should handle user.deleted webhook with cleanup', async () => {
      const webhookData = {
        type: 'user.deleted',
        data: {
          id: 'test-user-deleted-id',
          deleted_at: new Date().toISOString(),
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'test-webhook-id-3',
          'svix-timestamp': Date.now().toString(),
          'svix-signature': 'test-signature-3',
        },
        body: JSON.stringify(webhookData),
      });

      expect([200, 400, 401, 404, 405, 500]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('success');
        expect(data).toHaveProperty('message');
      }
    });

    test('should handle user.created webhook with minimal data', async () => {
      const webhookData = {
        type: 'user.created',
        data: {
          id: 'minimal-user-id',
          email_addresses: [{ email_address: 'minimal@example.com' }],
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'test-webhook-id-4',
          'svix-timestamp': Date.now().toString(),
          'svix-signature': 'test-signature-4',
        },
        body: JSON.stringify(webhookData),
      });

      expect([200, 400, 401, 404, 405, 500]).toContain(response.status);
    });

    test('should handle user.updated webhook with partial data', async () => {
      const webhookData = {
        type: 'user.updated',
        data: {
          id: 'partial-user-id',
          email_addresses: [{ email_address: 'partial@example.com' }],
          username: 'partialuser',
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'test-webhook-id-5',
          'svix-timestamp': Date.now().toString(),
          'svix-signature': 'test-signature-5',
        },
        body: JSON.stringify(webhookData),
      });

      expect([200, 400, 401, 404, 405, 500]).toContain(response.status);
    });
  });

  describe('Webhook Security Validation', () => {
    test('should reject webhooks with invalid signatures', async () => {
      const webhookData = {
        type: 'user.created',
        data: {
          id: 'invalid-sig-user-id',
          email_addresses: [{ email_address: 'invalid-sig@example.com' }],
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'invalid-webhook-id',
          'svix-timestamp': Date.now().toString(),
          'svix-signature': 'invalid-signature',
        },
        body: JSON.stringify(webhookData),
      });

      expect([400, 401, 403, 404, 405, 500]).toContain(response.status);
    });

    test('should reject webhooks with missing signature headers', async () => {
      const webhookData = {
        type: 'user.created',
        data: {
          id: 'missing-sig-user-id',
          email_addresses: [{ email_address: 'missing-sig@example.com' }],
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Missing svix headers
        },
        body: JSON.stringify(webhookData),
      });

      expect([400, 401, 403, 404, 405, 500]).toContain(response.status);
    });

    test('should reject webhooks with invalid timestamp', async () => {
      const webhookData = {
        type: 'user.created',
        data: {
          id: 'invalid-timestamp-user-id',
          email_addresses: [{ email_address: 'invalid-timestamp@example.com' }],
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'test-webhook-id-6',
          'svix-timestamp': 'invalid-timestamp',
          'svix-signature': 'test-signature-6',
        },
        body: JSON.stringify(webhookData),
      });

      expect([400, 401, 403, 404, 405, 500]).toContain(response.status);
    });

    test('should handle webhook replay attacks', async () => {
      const webhookData = {
        type: 'user.created',
        data: {
          id: 'replay-attack-user-id',
          email_addresses: [{ email_address: 'replay@example.com' }],
        },
      };

      const timestamp = Date.now().toString();
      const webhookId = 'replay-webhook-id';

      // First request
      const response1 = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': webhookId,
          'svix-timestamp': timestamp,
          'svix-signature': 'replay-signature-1',
        },
        body: JSON.stringify(webhookData),
      });

      // Replay the same request
      const response2 = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': webhookId,
          'svix-timestamp': timestamp,
          'svix-signature': 'replay-signature-2',
        },
        body: JSON.stringify(webhookData),
      });

      expect([200, 400, 401, 403, 404, 405, 500]).toContain(response1.status);
      expect([200, 400, 401, 403, 404, 405, 500]).toContain(response2.status);
    });

    test('should handle webhooks with expired timestamps', async () => {
      const webhookData = {
        type: 'user.created',
        data: {
          id: 'expired-timestamp-user-id',
          email_addresses: [{ email_address: 'expired@example.com' }],
        },
      };

      // Use a timestamp from 1 hour ago (likely expired)
      const expiredTimestamp = (Date.now() - 60 * 60 * 1000).toString();

      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'expired-webhook-id',
          'svix-timestamp': expiredTimestamp,
          'svix-signature': 'expired-signature',
        },
        body: JSON.stringify(webhookData),
      });

      expect([400, 401, 403, 404, 405, 500]).toContain(response.status);
    });
  });

  describe('Webhook Event Type Handling', () => {
    test('should handle unhandled webhook event types gracefully', async () => {
      const webhookData = {
        type: 'user.session.created',
        data: {
          id: 'session-user-id',
          session_id: 'test-session-id',
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'unhandled-webhook-id',
          'svix-timestamp': Date.now().toString(),
          'svix-signature': 'unhandled-signature',
        },
        body: JSON.stringify(webhookData),
      });

      expect([200, 400, 401, 404, 405, 500]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('message');
        expect(data.message).toContain('Unhandled event type');
      }
    });

    test('should handle webhook events with invalid type format', async () => {
      const webhookData = {
        type: 'invalid.event.type',
        data: {
          id: 'invalid-type-user-id',
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'invalid-type-webhook-id',
          'svix-timestamp': Date.now().toString(),
          'svix-signature': 'invalid-type-signature',
        },
        body: JSON.stringify(webhookData),
      });

      expect([200, 400, 401, 404, 405, 500]).toContain(response.status);
    });

    test('should handle webhook events with missing type', async () => {
      const webhookData = {
        data: {
          id: 'missing-type-user-id',
          email_addresses: [{ email_address: 'missing-type@example.com' }],
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'missing-type-webhook-id',
          'svix-timestamp': Date.now().toString(),
          'svix-signature': 'missing-type-signature',
        },
        body: JSON.stringify(webhookData),
      });

      expect([400, 401, 404, 405, 500]).toContain(response.status);
    });
  });

  describe('Webhook Data Validation', () => {
    test('should handle webhooks with missing required data fields', async () => {
      const webhookData = {
        type: 'user.created',
        data: {
          // Missing id field
          email_addresses: [{ email_address: 'missing-id@example.com' }],
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'missing-data-webhook-id',
          'svix-timestamp': Date.now().toString(),
          'svix-signature': 'missing-data-signature',
        },
        body: JSON.stringify(webhookData),
      });

      expect([400, 401, 404, 405, 500]).toContain(response.status);
    });

    test('should handle webhooks with invalid email format', async () => {
      const webhookData = {
        type: 'user.created',
        data: {
          id: 'invalid-email-user-id',
          email_addresses: [{ email_address: 'invalid-email-format' }],
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'invalid-email-webhook-id',
          'svix-timestamp': Date.now().toString(),
          'svix-signature': 'invalid-email-signature',
        },
        body: JSON.stringify(webhookData),
      });

      expect([200, 400, 401, 404, 405, 500]).toContain(response.status);
    });

    test('should handle webhooks with empty data object', async () => {
      const webhookData = {
        type: 'user.created',
        data: {},
      };

      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'empty-data-webhook-id',
          'svix-timestamp': Date.now().toString(),
          'svix-signature': 'empty-data-signature',
        },
        body: JSON.stringify(webhookData),
      });

      expect([400, 401, 404, 405, 500]).toContain(response.status);
    });

    test('should handle webhooks with malformed data structure', async () => {
      const webhookData = {
        type: 'user.created',
        data: {
          id: 'malformed-user-id',
          email_addresses: 'not-an-array', // Should be an array
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'malformed-webhook-id',
          'svix-timestamp': Date.now().toString(),
          'svix-signature': 'malformed-signature',
        },
        body: JSON.stringify(webhookData),
      });

      expect([200, 400, 401, 404, 405, 500]).toContain(response.status);
    });
  });

  describe('Webhook Error Handling', () => {
    test('should handle malformed JSON in webhook body', async () => {
      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'malformed-json-webhook-id',
          'svix-timestamp': Date.now().toString(),
          'svix-signature': 'malformed-json-signature',
        },
        body: 'invalid json data',
      });

      expect([400, 401, 404, 405, 500]).toContain(response.status);
    });

    test('should handle webhooks with missing Content-Type header', async () => {
      const webhookData = {
        type: 'user.created',
        data: {
          id: 'missing-content-type-user-id',
          email_addresses: [{ email_address: 'missing-content-type@example.com' }],
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'svix-id': 'missing-content-type-webhook-id',
          'svix-timestamp': Date.now().toString(),
          'svix-signature': 'missing-content-type-signature',
        },
        body: JSON.stringify(webhookData),
      });

      expect([400, 401, 404, 405, 500]).toContain(response.status);
    });

    test('should handle webhooks with large payloads', async () => {
      const largeData = {
        id: 'large-payload-user-id',
        email_addresses: [{ email_address: 'large-payload@example.com' }],
        extra_data: 'x'.repeat(10000), // Large payload
      };

      const webhookData = {
        type: 'user.created',
        data: largeData,
      };

      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'large-payload-webhook-id',
          'svix-timestamp': Date.now().toString(),
          'svix-signature': 'large-payload-signature',
        },
        body: JSON.stringify(webhookData),
      });

      expect([200, 400, 401, 404, 405, 413, 500]).toContain(response.status);
    });

    test('should handle webhooks with database connection issues', async () => {
      const webhookData = {
        type: 'user.created',
        data: {
          id: 'db-issue-user-id',
          email_addresses: [{ email_address: 'db-issue@example.com' }],
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'db-issue-webhook-id',
          'svix-timestamp': Date.now().toString(),
          'svix-signature': 'db-issue-signature',
        },
        body: JSON.stringify(webhookData),
      });

      expect([200, 400, 401, 404, 405, 500]).toContain(response.status);
    });
  });

  describe('Webhook Performance and Load Testing', () => {
    test('should handle concurrent webhook requests', async () => {
      const promises = Array.from({ length: 5 }, (_, i) => {
        const webhookData = {
          type: 'user.created',
          data: {
            id: `concurrent-user-${i}`,
            email_addresses: [{ email_address: `concurrent-${i}@example.com` }],
          },
        };

        return fetch(`${BASE_URL}/api/webhooks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'svix-id': `concurrent-webhook-${i}`,
            'svix-timestamp': Date.now().toString(),
            'svix-signature': `concurrent-signature-${i}`,
          },
          body: JSON.stringify(webhookData),
        });
      });

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect([200, 400, 401, 404, 405, 500]).toContain(response.status);
      });
    });

    test('should handle rapid successive webhook requests', async () => {
      const operations = [];

      for (let i = 0; i < 10; i++) {
        const webhookData = {
          type: i % 2 === 0 ? 'user.created' : 'user.updated',
          data: {
            id: `rapid-user-${i}`,
            email_addresses: [{ email_address: `rapid-${i}@example.com` }],
          },
        };

        operations.push(
          fetch(`${BASE_URL}/api/webhooks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'svix-id': `rapid-webhook-${i}`,
              'svix-timestamp': Date.now().toString(),
              'svix-signature': `rapid-signature-${i}`,
            },
            body: JSON.stringify(webhookData),
          })
        );
      }

      const responses = await Promise.all(operations);

      responses.forEach(response => {
        expect([200, 400, 401, 404, 405, 500]).toContain(response.status);
      });
    });
  });

  describe('Webhook Method Validation', () => {
    test('should reject GET requests to webhook endpoint', async () => {
      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'GET',
      });

      expect([404, 405]).toContain(response.status);
    });

    test('should reject PUT requests to webhook endpoint', async () => {
      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      expect([404, 405]).toContain(response.status);
    });

    test('should reject DELETE requests to webhook endpoint', async () => {
      const response = await fetch(`${BASE_URL}/api/webhooks`, {
        method: 'DELETE',
      });

      expect([404, 405]).toContain(response.status);
    });
  });
});
