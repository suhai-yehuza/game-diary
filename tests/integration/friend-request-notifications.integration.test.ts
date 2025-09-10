import { test, expect, describe, beforeAll, afterAll } from 'vitest';
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { enableNotificationTriggers } from '@scripts/seeding-notification-bypass';

// Load environment variables
config({ path: '.env.development' });

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';

describe('Friend Request Notifications Integration Tests', () => {
  let db: any;
  let usingRealDatabase = false;

  beforeAll(async () => {
    if (!databaseUrl) {
      console.warn('[Friend Request Tests] No DATABASE_URL found. Skipping database tests.');
      return;
    }

    try {
      const sql = neon(databaseUrl);
      const realDb = drizzle(sql) as any;
      await realDb.execute('SELECT 1');
      db = realDb;
      usingRealDatabase = true;
      console.log('[Friend Request Tests] Using Neon database for tests');

      // Ensure notification triggers are enabled for notification tests
      console.log('🔄 Ensuring notification triggers are enabled for friend request tests...');
      await enableNotificationTriggers();
    } catch (err) {
      console.warn('[Friend Request Tests] Failed to connect to database:', err);
      return;
    }
  });

  afterAll(async () => {
    if (usingRealDatabase) {
      // Clean up test data
      try {
        await db.execute(`DELETE FROM notifications WHERE user_id LIKE 'test-friend-%'`);
        await db.execute(
          `DELETE FROM friendships WHERE user_id LIKE 'test-friend-%' OR friend_id LIKE 'test-friend-%'`
        );
        await db.execute(`DELETE FROM users WHERE id LIKE 'test-friend-%'`);
      } catch (err) {
        console.warn('Cleanup failed:', err);
      }
    }
  });

  test('should create notification when friend request is sent', async () => {
    if (!usingRealDatabase) {
      console.log('Skipping test - no database connection');
      return;
    }

    const timestamp = Date.now();
    const requesterId = `test-friend-requester-${timestamp}`;
    const recipientId = `test-friend-recipient-${timestamp}`;
    const friendshipId = `test-friendship-${timestamp}`;

    // Create test users
    await db.execute(`
      INSERT INTO users (id, username, email_address, first_name, last_name, created_at, updated_at)
      VALUES
        ('${requesterId}', 'requester${timestamp}', 'requester${timestamp}@example.com', 'Test', 'Requester', NOW(), NOW()),
        ('${recipientId}', 'recipient${timestamp}', 'recipient${timestamp}@example.com', 'Test', 'Recipient', NOW(), NOW())
    `);

    // Send friend request (this should trigger notification)
    await db.execute(`
      INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
      VALUES ('${friendshipId}', '${requesterId}', '${recipientId}', 'PENDING', NOW(), NOW())
    `);

    // Check if notification was created
    const notificationResult = (await db.execute(`
      SELECT id, user_id, type, title, message, target_id, target_type
      FROM notifications
      WHERE user_id = '${recipientId}' AND type = 'friend_request'
    `)) as unknown as { rows: Array<any> };

    expect(notificationResult.rows).toHaveLength(1);
    expect(notificationResult.rows[0].user_id).toBe(recipientId);
    expect(notificationResult.rows[0].type).toBe('friend_request');
    expect(notificationResult.rows[0].title).toBe('Friend Request');
    expect(notificationResult.rows[0].message).toContain(
      'Test Requester sent you a friend request'
    );
    expect(notificationResult.rows[0].target_id).toBe(friendshipId);
    expect(notificationResult.rows[0].target_type).toBe('friendship');
  });

  test('should create notification when friend request is accepted', async () => {
    if (!usingRealDatabase) {
      console.log('Skipping test - no database connection');
      return;
    }

    const timestamp = Date.now();
    const requesterId = `test-friend-accept-requester-${timestamp}`;
    const recipientId = `test-friend-accept-recipient-${timestamp}`;
    const friendshipId = `test-friendship-accept-${timestamp}`;

    // Clean up any existing test data first
    await db.execute(`DELETE FROM friendships WHERE id = '${friendshipId}'`);
    await db.execute(`DELETE FROM users WHERE id IN ('${requesterId}', '${recipientId}')`);

    // Create test users one by one to ensure proper creation
    await db.execute(`
      INSERT INTO users (id, username, email_address, first_name, last_name, created_at, updated_at)
      VALUES ('${requesterId}', 'acceptrequester${timestamp}', 'acceptrequester${timestamp}@example.com', 'Test', 'Requester', NOW(), NOW())
    `);

    await db.execute(`
      INSERT INTO users (id, username, email_address, first_name, last_name, created_at, updated_at)
      VALUES ('${recipientId}', 'acceptrecipient${timestamp}', 'acceptrecipient${timestamp}@example.com', 'Test', 'Recipient', NOW(), NOW())
    `);

    // Wait a moment to ensure users are committed
    await new Promise(resolve => setTimeout(resolve, 200));

    // Verify users were created
    const userCheck = (await db.execute(`
      SELECT id FROM users WHERE id IN ('${requesterId}', '${recipientId}')
    `)) as unknown as { rows: Array<{ id: string }> };

    expect(userCheck.rows).toHaveLength(2);

    // Send friend request
    await db.execute(`
      INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
      VALUES ('${friendshipId}', '${requesterId}', '${recipientId}', 'PENDING', NOW(), NOW())
    `);

    // Accept friend request (this should trigger notification)
    await db.execute(`
      UPDATE friendships
      SET status = 'ACCEPTED', updated_at = NOW()
      WHERE id = '${friendshipId}'
    `);

    // Check if acceptance notification was created
    const notificationResult = (await db.execute(`
      SELECT id, user_id, type, title, message, target_id, target_type
      FROM notifications
      WHERE user_id = '${requesterId}' AND type = 'friend_accepted'
    `)) as unknown as { rows: Array<any> };

    expect(notificationResult.rows).toHaveLength(1);
    expect(notificationResult.rows[0].user_id).toBe(requesterId);
    expect(notificationResult.rows[0].type).toBe('friend_accepted');
    expect(notificationResult.rows[0].title).toBe('Friend Request Accepted');
    expect(notificationResult.rows[0].message).toContain(
      'Test Recipient accepted your friend request'
    );
    expect(notificationResult.rows[0].target_id).toBe(friendshipId);
    expect(notificationResult.rows[0].target_type).toBe('friendship');
  });

  test('should create notification when accepted friendship is removed', async () => {
    if (!usingRealDatabase) {
      console.log('Skipping test - no database connection');
      return;
    }

    const timestamp = Date.now();
    const requesterId = `test-friend-remove-requester-${timestamp}`;
    const recipientId = `test-friend-remove-recipient-${timestamp}`;
    const friendshipId = `test-friendship-remove-${timestamp}`;

    // Create test users
    await db.execute(`
      INSERT INTO users (id, username, email_address, first_name, last_name, created_at, updated_at)
      VALUES
        ('${requesterId}', 'removerequester${timestamp}', 'removerequester${timestamp}@example.com', 'Test', 'Requester', NOW(), NOW()),
        ('${recipientId}', 'removerecipient${timestamp}', 'removerecipient${timestamp}@example.com', 'Test', 'Recipient', NOW(), NOW())
    `);

    // Send and accept friend request
    await db.execute(`
      INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
      VALUES ('${friendshipId}', '${requesterId}', '${recipientId}', 'ACCEPTED', NOW(), NOW())
    `);

    // Remove friendship (this should trigger notification)
    await db.execute(`DELETE FROM friendships WHERE id = '${friendshipId}'`);

    // Check if removal notification was created
    const notificationResult = (await db.execute(`
      SELECT id, user_id, type, title, message, target_id, target_type
      FROM notifications
      WHERE user_id = '${recipientId}' AND type = 'friend_removed'
    `)) as unknown as { rows: Array<any> };

    expect(notificationResult.rows).toHaveLength(1);
    expect(notificationResult.rows[0].user_id).toBe(recipientId);
    expect(notificationResult.rows[0].type).toBe('friend_removed');
    expect(notificationResult.rows[0].title).toBe('Friend Removed');
    expect(notificationResult.rows[0].message).toContain('Test Requester removed you as a friend');
    expect(notificationResult.rows[0].target_id).toBe(friendshipId);
    expect(notificationResult.rows[0].target_type).toBe('friendship');
  });

  test('should NOT create notification when pending friendship is removed', async () => {
    if (!usingRealDatabase) {
      console.log('Skipping test - no database connection');
      return;
    }

    const timestamp = Date.now();
    const requesterId = `test-friend-cancel-requester-${timestamp}`;
    const recipientId = `test-friend-cancel-recipient-${timestamp}`;
    const friendshipId = `test-friendship-cancel-${timestamp}`;

    // Create test users
    await db.execute(`
      INSERT INTO users (id, username, email_address, first_name, last_name, created_at, updated_at)
      VALUES
        ('${requesterId}', 'cancelrequester${timestamp}', 'cancelrequester${timestamp}@example.com', 'Test', 'Requester', NOW(), NOW()),
        ('${recipientId}', 'cancelrecipient${timestamp}', 'cancelrecipient${timestamp}@example.com', 'Test', 'Recipient', NOW(), NOW())
    `);

    // Send friend request
    await db.execute(`
      INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
      VALUES ('${friendshipId}', '${requesterId}', '${recipientId}', 'PENDING', NOW(), NOW())
    `);

    // Get notification count before deletion
    const beforeCount = (await db.execute(`
      SELECT COUNT(*) as count FROM notifications WHERE user_id = '${recipientId}'
    `)) as unknown as { rows: Array<{ count: string }> };
    const beforeNotificationCount = parseInt(beforeCount.rows[0].count);

    // Remove pending friendship (this should NOT trigger notification)
    await db.execute(`DELETE FROM friendships WHERE id = '${friendshipId}'`);

    // Get notification count after deletion
    const afterCount = (await db.execute(`
      SELECT COUNT(*) as count FROM notifications WHERE user_id = '${recipientId}'
    `)) as unknown as { rows: Array<{ count: string }> };
    const afterNotificationCount = parseInt(afterCount.rows[0].count);

    // Should not have created a notification for pending friendship removal
    // The count should remain the same (no additional notification created)
    expect(afterNotificationCount).toBe(beforeNotificationCount);

    // Also verify no friend_removed notification was created
    const friendRemovedCount = (await db.execute(`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = '${recipientId}' AND type = 'friend_removed'
    `)) as unknown as { rows: Array<{ count: string }> };
    expect(parseInt(friendRemovedCount.rows[0].count)).toBe(0);
  });
});
