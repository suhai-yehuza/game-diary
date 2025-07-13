import { test, expect } from '@playwright/test';

import { setupTestDatabase, cleanupTestDatabase } from '../../../tests/e2e/utils/test-database';
import { createTestUser, loginAsUser } from '../../../tests/e2e/utils/auth-helpers';

test.describe('Security Features', () => {
  test.beforeAll(async () => {
    await setupTestDatabase();
  });

  test.afterAll(async () => {
    await cleanupTestDatabase();
  });

  test.describe('Data Encryption', () => {
    test.skip('should encrypt sensitive user data in database', async ({ page }) => {
      // Create a test user with sensitive data
      const testUser = await createTestUser({
        email: 'encryption-test@example.com',
        phone: '+1-555-123-4567',
      });

      // Login as the user
      await loginAsUser(page, testUser);

      // Navigate to user profile
      await page.goto('/protected/user');

      // Verify sensitive data is displayed correctly to the user
      await expect(page.locator('[data-testid="user-email"]')).toContainText(
        'encryption-test@example.com'
      );
      await expect(page.locator('[data-testid="user-phone"]')).toContainText('+1-555-123-4567');

      // Check database directly to verify data is encrypted
      const dbResult = await page.evaluate(async () => {
        const response = await fetch('/api/admin/database/users', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.json();
      });

      // Verify the data in database is encrypted (should be JSON strings, not plain text)
      const userRecord = dbResult.find((user: any) => user.id === testUser.id);
      expect(userRecord).toBeDefined();

      // Email should be encrypted (JSON string)
      expect(userRecord.email_address).toMatch(/^\{.*"iv".*"content".*"tag".*\}$/);
      expect(userRecord.email_address).not.toContain('encryption-test@example.com');

      // Phone should be encrypted (JSON string)
      expect(userRecord.phone_number).toMatch(/^\{.*"iv".*"content".*"tag".*\}$/);
      expect(userRecord.phone_number).not.toContain('+1-555-123-4567');
    });

    test.skip('should decrypt data only for authenticated user', async ({ page }) => {
      // Create two test users
      const user1 = await createTestUser({
        email: 'user1@example.com',
        phone: '+1-555-111-1111',
      });
      const user2 = await createTestUser({
        email: 'user2@example.com',
        phone: '+1-555-222-2222',
      });

      // Login as user1
      await loginAsUser(page, user1);

      // Navigate to user list or search
      await page.goto('/protected/user');

      // Verify user1 can see their own sensitive data
      await expect(page.locator('[data-testid="user-email"]')).toContainText('user1@example.com');
      await expect(page.locator('[data-testid="user-phone"]')).toContainText('+1-555-111-1111');

      // Verify user1 cannot see user2's sensitive data (should be null or masked)
      // This would require navigating to a page that shows other users
      // For now, we'll test the API directly
      const apiResult = await page.evaluate(async userId => {
        const response = await fetch(`/api/user/${userId}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.json();
      }, user2.id);

      // User1 should not see user2's sensitive data
      expect(apiResult.email_address).toBeNull();
      expect(apiResult.phone_number).toBeNull();
    });
  });

  test.describe('Row-Level Security (RLS)', () => {
    test.skip('should enforce RLS policies on user data access', async ({ page }) => {
      // Create test users
      const user1 = await createTestUser({ email: 'rls-user1@example.com' });
      const user2 = await createTestUser({ email: 'rls-user2@example.com' });

      // Login as user1
      await loginAsUser(page, user1);

      // Test that user1 can only access their own data through API
      const ownData = await page.evaluate(async userId => {
        const response = await fetch(`/api/user/${userId}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.json();
      }, user1.id);

      expect(ownData.id).toBe(user1.id);
      expect(ownData.email_address).toBe('rls-user1@example.com');

      // Test that user1 cannot access user2's data
      const otherData = await page.evaluate(async userId => {
        const response = await fetch(`/api/user/${userId}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.json();
      }, user2.id);

      // Should return null or empty result due to RLS
      expect(otherData).toBeNull();
    });

    test.skip('should handle RLS context properly', async ({ page }) => {
      const testUser = await createTestUser({ email: 'rls-context@example.com' });

      // Login as user
      await loginAsUser(page, testUser);

      // Test API calls with proper RLS context
      const result = await page.evaluate(async () => {
        const response = await fetch('/api/user/me', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.json();
      });

      expect(result.id).toBe(testUser.id);
      expect(result.email_address).toBe('rls-context@example.com');
    });
  });

  test.describe('GraphQL Security', () => {
    test.skip('should protect sensitive data in GraphQL queries', async ({ page }) => {
      const user1 = await createTestUser({ email: 'graphql-user1@example.com' });
      const user2 = await createTestUser({ email: 'graphql-user2@example.com' });

      // Login as user1
      await loginAsUser(page, user1);

      // Test GraphQL query for own user
      const ownUserQuery = `
        query {
          me {
            id
            email_address
            phone_number
          }
        }
      `;

      const ownResult = await page.evaluate(async query => {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        return response.json();
      }, ownUserQuery);

      expect(ownResult.data.me.id).toBe(user1.id);
      expect(ownResult.data.me.email_address).toBe('graphql-user1@example.com');

      // Test GraphQL query for other user
      const otherUserQuery = `
        query {
          user(id: "${user2.id}") {
            id
            email_address
            phone_number
          }
        }
      `;

      const otherResult = await page.evaluate(async query => {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        return response.json();
      }, otherUserQuery);

      // Should return user data but with null sensitive fields
      expect(otherResult.data.user.id).toBe(user2.id);
      expect(otherResult.data.user.email_address).toBeNull();
      expect(otherResult.data.user.phone_number).toBeNull();
    });
  });

  test.describe('Key Management', () => {
    test.skip('should handle key rotation properly', async ({ page }) => {
      const testUser = await createTestUser({ email: 'key-rotation@example.com' });

      // Login as user
      await loginAsUser(page, testUser);

      // Verify user can access their data before key rotation
      const beforeRotation = await page.evaluate(async () => {
        const response = await fetch('/api/user/me', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.json();
      });

      expect(beforeRotation.email_address).toBe('key-rotation@example.com');

      // Simulate key rotation (this would typically be done via admin interface)
      // For testing, we'll just verify the system handles it gracefully
      const keyRotationResult = await page.evaluate(async () => {
        const response = await fetch('/api/admin/keys/rotate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        return response.json();
      });

      // After key rotation, user should still be able to access their data
      const afterRotation = await page.evaluate(async () => {
        const response = await fetch('/api/user/me', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.json();
      });

      expect(afterRotation.email_address).toBe('key-rotation@example.com');
    });
  });

  test.describe('Audit Logging', () => {
    test.skip('should log sensitive data access', async ({ page }) => {
      const testUser = await createTestUser({ email: 'audit-test@example.com' });

      // Login as user
      await loginAsUser(page, testUser);

      // Access sensitive data
      await page.goto('/protected/user');

      // Check audit logs (this would typically be done via admin interface)
      const auditLogs = await page.evaluate(async () => {
        const response = await fetch('/api/admin/audit-logs', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.json();
      });

      // Verify audit logs contain the access event
      const accessLog = auditLogs.find(
        (log: any) => log.user_id === testUser.id && log.action === 'sensitive_data_accessed'
      );

      expect(accessLog).toBeDefined();
      expect(accessLog.success).toBe(true);
    });

    test.skip('should log failed access attempts', async ({ page }) => {
      // Try to access user data without authentication
      const unauthorizedResult = await page.evaluate(async () => {
        const response = await fetch('/api/user/me', {
          headers: { 'Content-Type': 'application/json' },
        });
        return { status: response.status, data: await response.json() };
      });

      expect(unauthorizedResult.status).toBe(401);

      // Check audit logs for failed access
      const auditLogs = await page.evaluate(async () => {
        const response = await fetch('/api/admin/audit-logs', {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.json();
      });

      const failedAccessLog = auditLogs.find(
        (log: any) => log.action === 'sensitive_data_accessed' && log.success === false
      );

      expect(failedAccessLog).toBeDefined();
    });
  });

  test.describe('API Security', () => {
    test.skip('should validate input data', async ({ page }) => {
      // Test with invalid email format
      const invalidEmailResult = await page.evaluate(async () => {
        const response = await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'invalid-email',
            phone: '+1-555-123-4567',
          }),
        });
        return { status: response.status, data: await response.json() };
      });

      expect(invalidEmailResult.status).toBe(400);
      expect(invalidEmailResult.data.error).toContain('email');
    });

    test.skip('should rate limit API requests', async ({ page }) => {
      const requests = Array.from({ length: 100 }, () =>
        page.evaluate(async () => {
          const response = await fetch('/api/user/me', {
            headers: { 'Content-Type': 'application/json' },
          });
          return response.status;
        })
      );

      const results = await Promise.all(requests);
      const rateLimited = results.filter(status => status === 429);

      // Should have some rate limited requests
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});
