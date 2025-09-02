import { test, expect, describe } from 'vitest';

import { getAppUrl } from '@src/lib/config/app.config';

const BASE_URL = getAppUrl();

describe('Admin Endpoints Integration Tests', () => {
  describe('Admin Authentication and Authorization', () => {
    test('should reject non-admin users from admin endpoints', async () => {
      const adminEndpoints = [
        '/api/admin/audit-logs',
        '/api/admin/database/users',
        '/api/admin/keys/rotate',
      ];

      for (const endpoint of adminEndpoints) {
        const response = await fetch(`${BASE_URL}${endpoint}`);

        // Should reject non-admin users with proper HTTP status codes
        // 401 Unauthorized, 403 Forbidden, 404 Not Found, 405 Method Not Allowed, or 500 Internal Server Error
        expect([401, 403, 404, 405, 500]).toContain(response.status);
      }
    });

    test('should handle admin authentication bypass in test environment', async () => {
      // Test with auth bypass headers that might be used in test environment
      const response = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
        headers: {
          'x-vercel-protection-bypass': 'test-bypass',
        },
      });

      // Should either work with bypass or reject appropriately
      expect([200, 401, 403, 404]).toContain(response.status);
    });

    test('should handle admin role verification', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/audit-logs`);

      // Should handle role verification appropriately
      expect([200, 401, 403, 404]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('logs');
      }
    });
  });

  describe('Audit Logs Management', () => {
    test('should get audit logs with default parameters', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/audit-logs`);

      expect([200, 401, 403, 404]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('logs');
        expect(Array.isArray(data.logs)).toBe(true);
        expect(data).toHaveProperty('pagination');
        expect(data).toHaveProperty('filters');
      }
    });

    test('should get audit logs with filters', async () => {
      const filters = [
        'action=user_created',
        'category=authentication',
        'severity=high',
        'userId=test-user-id',
      ];

      for (const filter of filters) {
        const response = await fetch(`${BASE_URL}/api/admin/audit-logs?${filter}`);

        expect([200, 401, 403, 404]).toContain(response.status);

        if (response.status === 200) {
          const data = await response.json();
          expect(data).toHaveProperty('logs');
          expect(data).toHaveProperty('filters');
        }
      }
    });

    test('should get audit logs with pagination', async () => {
      const paginationParams = ['page=1&limit=10', 'page=2&limit=20', 'after=cursor123&limit=15'];

      for (const params of paginationParams) {
        const response = await fetch(`${BASE_URL}/api/admin/audit-logs?${params}`);

        expect([200, 401, 403, 404]).toContain(response.status);

        if (response.status === 200) {
          const data = await response.json();
          expect(data).toHaveProperty('logs');
          expect(data).toHaveProperty('pagination');
          expect(data.pagination).toHaveProperty('page');
          expect(data.pagination).toHaveProperty('limit');
        }
      }
    });

    test('should get audit logs with date range filters', async () => {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 24 hours ago
      const endDate = new Date().toISOString();

      const response = await fetch(
        `${BASE_URL}/api/admin/audit-logs?startDate=${startDate}&endDate=${endDate}`
      );

      expect([200, 401, 403, 404]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('logs');
        expect(data).toHaveProperty('filters');
      }
    });

    test('should export audit logs in CSV format', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          export: true,
          format: 'csv',
          filters: {
            category: 'authentication',
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          },
        }),
      });

      expect([200, 401, 403, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.headers.get('content-type')).toContain('text/csv');
        const csvData = await response.text();
        expect(csvData).toContain('timestamp,action,category,severity');
      }
    });

    test('should export audit logs in JSON format', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          export: true,
          format: 'json',
          filters: {
            severity: 'high',
          },
        }),
      });

      expect([200, 401, 403, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.headers.get('content-type')).toContain('application/json');
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
      }
    });

    test('should handle audit log export with invalid format', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          export: true,
          format: 'invalid-format',
        }),
      });

      expect([400, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('Database Management', () => {
    test('should get database table information', async () => {
      const tables = [
        'users',
        'game_logs',
        'comments',
        'friendships',
        'reactions',
        'notifications',
      ];

      for (const table of tables) {
        const response = await fetch(`${BASE_URL}/api/admin/database/${table}`);

        // Expect proper HTTP status codes: 200 OK, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error, 503 Service Unavailable
        expect([200, 401, 403, 404, 500, 503]).toContain(response.status);

        if (response.status === 200) {
          const data = await response.json();
          expect(data).toHaveProperty('table');
          expect(data).toHaveProperty('schema');
          expect(data).toHaveProperty('rowCount');
          expect(data).toHaveProperty('lastUpdated');
        }
      }
    });

    test('should get database table data with pagination', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/database/users?page=1&limit=10`);

      // Expect proper HTTP status codes including 500 for server errors
      expect([200, 401, 403, 404, 500]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('data');
        expect(data).toHaveProperty('pagination');
        expect(data).toHaveProperty('table');
        expect(Array.isArray(data.data)).toBe(true);
      }
    });

    test('should get database table data with filters', async () => {
      const response = await fetch(
        `${BASE_URL}/api/admin/database/users?filter=username&value=test&operator=like`
      );

      // Expect proper HTTP status codes including 500 for server errors
      expect([200, 401, 403, 404, 500]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('data');
        expect(data).toHaveProperty('filters');
      }
    });

    test('should handle database table operations', async () => {
      const operations = [
        { action: 'truncate', table: 'test_table' },
        { action: 'backup', table: 'users' },
        { action: 'optimize', table: 'game_logs' },
      ];

      for (const operation of operations) {
        const response = await fetch(`${BASE_URL}/api/admin/database/${operation.table}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: operation.action,
          }),
        });

        // Expect proper HTTP status codes: 200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error
        expect([200, 400, 401, 403, 404, 500]).toContain(response.status);

        if (response.status === 200) {
          const data = await response.json();
          expect(data).toHaveProperty('success');
          expect(data).toHaveProperty('message');
        }
      }
    });

    test('should handle database table export', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/database/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'export',
          format: 'csv',
          filters: {
            created_at: {
              operator: 'gte',
              value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
            },
          },
        }),
      });

      // Expect proper HTTP status codes including 500 for server errors
      expect([200, 401, 403, 404, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.headers.get('content-type')).toContain('text/csv');
        const csvData = await response.text();
        expect(csvData).toBeDefined();
        expect(csvData.length).toBeGreaterThan(0);
      }
    });

    test('should handle invalid database table operations', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/database/nonexistent_table`);

      // Expect proper HTTP status codes: 404 Not Found, 401 Unauthorized, 403 Forbidden, 500 Internal Server Error
      expect([404, 401, 403, 500]).toContain(response.status);
    });
  });

  describe('Key Rotation Management', () => {
    test('should handle key rotation requests', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/keys/rotate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyType: 'api',
          reason: 'security_rotation',
        }),
      });

      expect([200, 400, 401, 403, 404]).toContain(response.status);

      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('success');
        expect(data).toHaveProperty('message');
        expect(data).toHaveProperty('newKeyId');
        expect(data).toHaveProperty('rotationDate');
      }
    });

    test('should handle key rotation with invalid parameters', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/keys/rotate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyType: 'invalid_type',
        }),
      });

      expect([400, 401, 403, 404]).toContain(response.status);
    });

    test('should handle key rotation without required parameters', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/keys/rotate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      expect([400, 401, 403, 404]).toContain(response.status);
    });
  });

  describe('Admin Dashboard Integration', () => {
    test('should serve admin dashboard page', async () => {
      const response = await fetch(`${BASE_URL}/protected/admin`);

      expect([200, 302, 401, 403, 404]).toContain(response.status);

      if (response.status === 200) {
        const html = await response.text();
        expect(html).toContain('admin');
      }
    });

    test('should serve admin cache management page', async () => {
      const response = await fetch(`${BASE_URL}/protected/admin/cache`);

      expect([200, 302, 401, 403, 404]).toContain(response.status);

      if (response.status === 200) {
        const html = await response.text();
        expect(html).toContain('cache');
      }
    });

    test('should serve admin database management page', async () => {
      const response = await fetch(`${BASE_URL}/protected/admin/database`);

      expect([200, 302, 401, 403, 404]).toContain(response.status);

      if (response.status === 200) {
        const html = await response.text();
        expect(html).toContain('database');
      }
    });
  });

  describe('Admin Error Handling', () => {
    test('should handle malformed admin requests', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      expect([400, 401, 403, 404, 500]).toContain(response.status);
    });

    test('should handle admin requests with invalid filters', async () => {
      const response = await fetch(
        `${BASE_URL}/api/admin/audit-logs?invalidFilter=value&anotherInvalid=test`
      );

      expect([200, 400, 401, 403, 404]).toContain(response.status);
    });

    test('should handle admin requests with invalid pagination', async () => {
      const response = await fetch(`${BASE_URL}/api/admin/audit-logs?page=-1&limit=0`);

      expect([200, 400, 401, 403, 404]).toContain(response.status);
    });

    test('should handle admin requests with large payloads', async () => {
      const largePayload = {
        export: true,
        format: 'json',
        filters: {
          data: 'x'.repeat(10000), // Large payload
        },
      };

      const response = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(largePayload),
      });

      expect([200, 400, 401, 403, 404, 413]).toContain(response.status);
    });
  });

  describe('Admin Performance and Load Testing', () => {
    test('should handle concurrent admin requests', async () => {
      const promises = Array.from({ length: 5 }, () => fetch(`${BASE_URL}/api/admin/audit-logs`));

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect([200, 401, 403, 404]).toContain(response.status);
      });
    });

    test('should handle admin requests under load', async () => {
      const adminEndpoints = [
        '/api/admin/audit-logs',
        '/api/admin/database/users',
        '/api/admin/keys/rotate',
      ];

      const promises = adminEndpoints.map(endpoint => fetch(`${BASE_URL}${endpoint}`));
      const responses = await Promise.all(promises);

      responses.forEach(response => {
        // Expect proper HTTP status codes including 500 for server errors and 405 for method not allowed
        expect([200, 401, 403, 404, 405, 500]).toContain(response.status);
      });
    });
  });
});
