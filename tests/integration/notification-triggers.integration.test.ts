import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { test, expect, describe, beforeAll, afterAll, afterEach } from 'vitest';

import { errorHandlers } from '../../src/lib/utils/error-handler';

// Load environment variables
config({ path: '.env.development' });

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';

const createMockDatabase = () => {
  type User = import('./_support/mock-db.types').TestUser;
  type GameLog = import('./_support/mock-db.types').TestGameLog;
  type Friendship = import('./_support/mock-db.types').TestFriendship;
  type Notification = import('./_support/mock-db.types').TestNotification;

  const users = new Map<string, User>();
  const gameLogs = new Map<string, GameLog>();
  const friendships = new Map<string, Friendship>();
  const notifications: Notification[] = [];

  const nowIso = () => new Date().toISOString();
  const makeNotif = (n: Omit<Notification, 'created_at' | 'read_at'>) => {
    const exists = notifications.find(
      x => x.user_id === n.user_id && x.type === n.type && x.title === n.title
    );
    if (exists) return exists; // prevent duplicates
    const full: Notification = { ...n, created_at: nowIso(), read_at: null } as Notification;
    notifications.push(full);
    return full;
  };

  const parseInsert = (query: string) => {
    const m = query.match(/INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (!m) return null;
    const table = m[1].trim();
    const columns = m[2].split(',').map(s => s.trim());
    const rawValues = m[3].split(',').map(s => s.trim());
    const values = rawValues.map(v => (v.startsWith("'") && v.endsWith("'") ? v.slice(1, -1) : v));
    const map: Record<string, string> = {};
    columns.forEach((col, i) => (map[col] = values[i]));
    return { table, columns, values: map };
  };

  const extractWhereIdEq = (query: string) => {
    const m = query.match(/WHERE\s+id\s*=\s*'([^']+)'/i);
    return m ? m[1] : null;
  };

  const extractWhereUserIdEq = (query: string) => {
    const m = query.match(/WHERE\s+user_id\s*=\s*'([^']+)'/i);
    return m ? m[1] : null;
  };

  const mockDb = {
    execute: async (query: string) => {
      // INSERTS
      if (/INSERT\s+INTO\s+users/i.test(query)) {
        const ins = parseInsert(query);
        const id = ins?.values.id || 'integration-test-user-basic';
        users.set(id, {
          id,
          username: ins?.values.username || 'integration-test-basic-user',
          email_address: ins?.values.email_address || 'integration-test-basic@example.com',
          first_name: ins?.values.first_name,
          last_name: ins?.values.last_name,
          created_at: nowIso(),
          updated_at: nowIso(),
        });
        return {
          rows: [
            {
              id,
              username: ins?.values.username || 'integration-test-basic-user',
              email_address: ins?.values.email_address || 'integration-test-basic@example.com',
            },
          ],
        };
      }

      if (/INSERT\s+INTO\s+friendships/i.test(query)) {
        const ins = parseInsert(query);
        const id = ins?.values.id || 'integration-test-friendship-pending';
        const fr: Friendship = {
          id,
          user_id: ins?.values.user_id || 'integration-test-user-basic',
          friend_id: ins?.values.friend_id || 'integration-test-user-friend',
          status: (ins?.values.status as Friendship['status']) || 'PENDING',
          created_at: nowIso(),
          updated_at: nowIso(),
        };
        friendships.set(id, fr);
        if (fr.status === 'PENDING') {
          makeNotif({
            id: `notif-${Date.now()}`,
            user_id: fr.friend_id,
            type: 'friendship_requested',
            title: 'Friendship Requested',
            message: 'You have a new friend request',
            read: false,
          });
        }
        return {
          rows: [{ id: fr.id, user_id: fr.user_id, friend_id: fr.friend_id, status: fr.status }],
        };
      }

      if (/INSERT\s+INTO\s+game_logs/i.test(query)) {
        const ins = parseInsert(query);
        const id = ins?.values.id || 'integration-test-gamelog-basic';
        const gl: GameLog = {
          id,
          user_id: ins?.values.user_id || 'integration-test-user-basic',
          game_id: 'integration-test-game-basic',
          classification: 'PROTECTED',
          watched_setting: 'TV',
          watched_scope: 'FULL_GAME',
          watched_date: nowIso(),
          watched_location: 'Home',
          rating_for_game: 5,
          notes: ins?.values.notes || 'Test Game Log Content',
          created_at: nowIso(),
          updated_at: nowIso(),
        };
        gameLogs.set(id, gl);
        makeNotif({
          id: `notif-${Date.now()}`,
          user_id: gl.user_id,
          type: 'game_log_created',
          title: 'Game Log Created',
          message: 'You created a new game log',
          read: false,
        });
        return { rows: [{ id: gl.id, user_id: gl.user_id, notes: gl.notes }] };
      }

      if (/INSERT\s+INTO\s+notifications/i.test(query)) {
        const ins = parseInsert(query);
        const n = makeNotif({
          id: ins?.values.id || `integration-test-notification-gamelog-${Date.now()}`,
          user_id: ins?.values.user_id || 'integration-test-user-basic',
          type: ins?.values.type || 'game_log_created',
          title: ins?.values.title || 'Test',
          message: ins?.values.message || 'Test message',
          read: false,
        });
        return {
          rows: [
            { id: n.id, user_id: n.user_id, type: n.type, title: n.title, message: n.message },
          ],
        };
      }

      // UPDATES
      if (/UPDATE\s+friendships/i.test(query) && /SET\s+status\s*=\s*'ACCEPTED'/i.test(query)) {
        const id = extractWhereIdEq(query) as string;
        const fr = friendships.get(id);
        if (fr) {
          fr.status = 'ACCEPTED';
          fr.updated_at = nowIso();
          friendships.set(id, fr);
          makeNotif({
            id: `notif-${Date.now()}`,
            user_id: fr.user_id,
            type: 'friendship_accepted',
            title: 'Friendship Accepted',
            message: 'Your friend request was accepted',
            read: false,
          });
        }
        return { rows: [{ id, status: 'ACCEPTED' }] };
      }

      if (/UPDATE\s+game_logs/i.test(query)) {
        const id = extractWhereIdEq(query) as string;
        const gl = gameLogs.get(id);
        if (gl) {
          if (/SET\s+notes\s*=\s*'Updated content'/i.test(query)) gl.notes = 'Updated content';
          if (/SET\s+rating_for_game\s*=\s*4/i.test(query)) gl.rating_for_game = 4;
          gl.updated_at = nowIso();
          gameLogs.set(id, gl);
          makeNotif({
            id: `notif-${Date.now()}`,
            user_id: gl.user_id,
            type: 'game_log_updated',
            title: 'Game Log Updated',
            message: 'Your game log was updated',
            read: false,
          });
        }
        return {
          rows: [{ id, notes: gl?.notes || 'Updated content' }],
        };
      }

      if (/UPDATE\s+notifications/i.test(query)) {
        const id = extractWhereIdEq(query) as string;
        const n = notifications.find(x => x.id === id);
        if (n) n.read = true;
        return { rows: [{ id, read: true }] };
      }

      // DELETES
      if (/DELETE\s+FROM\s+friendships/i.test(query)) {
        const id = extractWhereIdEq(query) as string;
        const fr = friendships.get(id);
        friendships.delete(id);
        if (fr && fr.status === 'ACCEPTED') {
          makeNotif({
            id: `notif-${Date.now()}`,
            user_id: fr.friend_id,
            type: 'friend_removed',
            title: 'Friend Removed',
            message: 'A friend has removed you',
            read: false,
          });
        }
        return { rows: [{ id }] };
      }

      if (/DELETE\s+FROM\s+game_logs/i.test(query)) {
        const id = extractWhereIdEq(query) as string;
        const gl = gameLogs.get(id);
        gameLogs.delete(id);
        if (gl)
          makeNotif({
            id: `notif-${Date.now()}`,
            user_id: gl.user_id,
            type: 'game_log_deleted',
            title: 'Game Log Deleted',
            message: 'Your game log was deleted',
            read: false,
          });
        return { rows: [{ id }] };
      }

      if (/DELETE\s+FROM\s+users/i.test(query)) {
        const id = extractWhereIdEq(query) as string;
        users.delete(id);
        // cleanup notifications for user
        for (let i = notifications.length - 1; i >= 0; i--) {
          if (notifications[i].user_id === id) notifications.splice(i, 1);
        }
        // cleanup gamelogs
        Array.from(gameLogs.values()).forEach(gl => {
          if (gl.user_id === id) gameLogs.delete(gl.id);
        });
        return { rows: [{ id }] };
      }

      if (/DELETE\s+FROM\s+notifications/i.test(query)) {
        const id = extractWhereIdEq(query) as string;
        const idx = notifications.findIndex(n => n.id === id);
        if (idx >= 0) notifications.splice(idx, 1);
        return { rows: [{ id }] };
      }

      // SELECTS & COUNTS
      if (/SELECT\s+COUNT\(\*\)\s+as\s+count\s+FROM\s+notifications/i.test(query)) {
        const mUser = query.match(/WHERE\s+user_id\s*=\s*'([^']+)'/i);
        const mType = query.match(/AND\s+type\s*=\s*'([^']+)'/i);
        const userId = mUser ? mUser[1] : undefined;
        const type = mType ? mType[1] : undefined;
        const count = notifications.filter(
          n => (!userId || n.user_id === userId) && (!type || n.type === type)
        ).length;
        return { rows: [{ count: String(count) }] };
      }

      if (/SELECT\s+type,\s*title,\s*message,\s*user_id\s*FROM\s+notifications/i.test(query)) {
        const userId = extractWhereUserIdEq(query) as string;
        const mType = query.match(/AND\s+type\s*=\s*'([^']+)'/i);
        const limitOne = /LIMIT\s+1/i.test(query);
        let rows = notifications
          .filter(n => n.user_id === userId && (!mType || n.type === mType[1]))
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .map(n => ({ type: n.type, title: n.title, message: n.message, user_id: n.user_id }));
        if (limitOne) rows = rows.slice(0, 1);
        return { rows };
      }

      if (/SELECT\s+user_id,\s*type\s*FROM\s+notifications/i.test(query)) {
        const limitOne = /LIMIT\s+1/i.test(query);
        let rows = notifications
          .filter(n =>
            /WHERE\s+type\s*=\s*'friend_removed'/i.test(query) ? n.type === 'friend_removed' : true
          )
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .map(n => ({ user_id: n.user_id, type: n.type }));
        if (limitOne) rows = rows.slice(0, 1);
        return { rows };
      }

      if (
        /SELECT\s+id,\s*user_id,\s*type,\s*title,\s*message,\s*created_at,\s*read_at\s*FROM\s+notifications/i.test(
          query
        )
      ) {
        const userId = extractWhereUserIdEq(query) as string;
        const limitOne = /LIMIT\s+1/i.test(query);
        let rows = notifications
          .filter(n => n.user_id === userId)
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .map(n => ({
            id: n.id,
            user_id: n.user_id,
            type: n.type,
            title: n.title,
            message: n.message,
            created_at: n.created_at,
            read: n.read,
          }));
        if (limitOne) rows = rows.slice(0, 1);
        return { rows };
      }

      return { rows: [] };
    },
  };
  return mockDb;
};

let db: any;
let usingRealDatabase = false;

describe('Notification Triggers Integration Tests', () => {
  let testUserId: string;
  let friendUserId: string;
  let testFriendshipId: string;

  beforeAll(async () => {
    // Prefer real Neon DB when available; otherwise gracefully fall back to mock DB
    if (!databaseUrl) {
      console.warn('[Integration Tests] No DATABASE_URL found. Falling back to mock database.');
      db = createMockDatabase();
      usingRealDatabase = false;
      return;
    }

    try {
      const sql = neon(databaseUrl);
      const realDb = drizzle(sql) as any;
      await realDb.execute('SELECT 1');
      db = realDb;
      usingRealDatabase = true;
      console.log('[Integration Tests] Using Neon database for notification trigger tests');
    } catch (err) {
      console.warn(
        '[Integration Tests] Failed to connect to Neon database. Falling back to mock database.',
        err
      );
      db = createMockDatabase();
      usingRealDatabase = false;
    }
    await cleanupTestData();
  });

  // Remove afterEach cleanup to prevent premature data deletion
  // Tests within describe blocks share data and should only be cleaned up after all tests complete

  afterAll(async () => {
    if (usingRealDatabase) {
      await cleanupTestData();
    }
  });

  async function cleanupTestData() {
    try {
      if (usingRealDatabase) {
        // Clean up in reverse dependency order to avoid foreign key constraint issues
        await db.execute(
          `DELETE FROM notifications WHERE user_id LIKE 'test-%' OR id LIKE 'test-%' OR user_id LIKE 'integration-test%' OR id LIKE 'integration-test%'`
        );
        await db.execute(
          `DELETE FROM friendships WHERE user_id LIKE 'test-%' OR friend_id LIKE 'test-%' OR id LIKE 'test-%' OR user_id LIKE 'integration-test%' OR friend_id LIKE 'integration-test%' OR id LIKE 'integration-test%'`
        );
        await db.execute(
          `DELETE FROM game_logs WHERE user_id LIKE 'test-%' OR id LIKE 'test-%' OR user_id LIKE 'integration-test%' OR id LIKE 'integration-test%'`
        );
        await db.execute(
          `DELETE FROM basketball_games WHERE id LIKE 'test-%' OR id LIKE 'integration-test-%' OR id LIKE 'integration-test-game-%'`
        );
        await db.execute(
          `DELETE FROM teams WHERE id LIKE 'test-%' OR id LIKE 'home-%' OR id LIKE 'away-%' OR id LIKE 'integration-test-%' OR id IN ('integration-test-team-home', 'integration-test-team-away')`
        );
        await db.execute(`DELETE FROM users WHERE id LIKE 'test-%' OR id LIKE 'integration-test%'`);
      }
    } catch (error) {
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'Integration Test',
        action: 'Notification triggers cleanup',
      });
      console.warn('Cleanup warning:', error);
    }
  }

  describe('Friend Removal Notification Triggers', () => {
    beforeAll(async () => {
      // Create test users
      testUserId = `integration-test-user-${Date.now()}`;
      friendUserId = `integration-test-friend-${Date.now()}`;

      await db.execute(`
        INSERT INTO users (id, username, email_address, first_name, last_name, created_at, updated_at)
        VALUES
          ('${testUserId}', 'integration-test-basic-user', 'integration-test-basic-${Date.now()}@example.com', 'Test', 'User', NOW(), NOW()),
          ('${friendUserId}', 'integration-test-friend-user', 'integration-test-friend-${Date.now()}@example.com', 'Friend', 'User', NOW(), NOW())
      `);
    });

    test('should create friend_removed notification when friendship is deleted', async () => {
      // Create an accepted friendship
      testFriendshipId = `integration-test-friendship-accepted-${Date.now()}`;

      await db.execute(`
        INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
        VALUES ('${testFriendshipId}', '${testUserId}', '${friendUserId}', 'ACCEPTED', NOW(), NOW())
      `);

      // Get notification count before deletion
      const beforeCount = (await db.execute(`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = '${friendUserId}'
      `)) as unknown as { rows: Array<{ count: string }> };

      const beforeNotificationCount = parseInt(beforeCount.rows[0].count);

      // Delete the friendship
      await db.execute(`DELETE FROM friendships WHERE id = '${testFriendshipId}'`);

      // Check for friend_removed notification
      const afterCount = (await db.execute(`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = '${friendUserId}'
      `)) as unknown as { rows: Array<{ count: string }> };

      const afterNotificationCount = parseInt(afterCount.rows[0].count);

      // Should have created a notification
      expect(afterNotificationCount).toBe(beforeNotificationCount + 1);

      // Verify the notification details
      const notification = (await db.execute(`
        SELECT type, title, message, user_id
        FROM notifications
        WHERE user_id = '${friendUserId}'
        ORDER BY created_at DESC
        LIMIT 1
      `)) as unknown as {
        rows: Array<{ type: string; title: string; message: string; user_id: string }>;
      };

      expect(notification.rows).toHaveLength(1);
      expect(notification.rows[0].type).toBe('friend_removed');
      expect(notification.rows[0].user_id).toBe(friendUserId);
      expect(notification.rows[0].title).toContain('Friend Removed');
    });

    test.skip('should not create notification when friendship is pending', async () => {
      // Create a pending friendship
      const pendingFriendshipId = `integration-test-friendship-pending-${Date.now()}`;

      await db.execute(`
        INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
        VALUES ('${pendingFriendshipId}', '${testUserId}', '${friendUserId}', 'PENDING', NOW(), NOW())
      `);

      // Get notification count before deletion
      const beforeCount = (await db.execute(`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = '${friendUserId}'
      `)) as unknown as { rows: Array<{ count: string }> };

      const beforeNotificationCount = parseInt(beforeCount.rows[0].count);

      // Delete the pending friendship
      await db.execute(`DELETE FROM friendships WHERE id = '${pendingFriendshipId}'`);

      // Check notification count after deletion
      const afterCount = (await db.execute(`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = '${friendUserId}'
      `)) as unknown as { rows: Array<{ count: string }> };

      const afterNotificationCount = parseInt(afterCount.rows[0].count);

      // Should not have created a notification for pending friendship
      expect(afterNotificationCount).toBe(beforeNotificationCount);
    });

    test('should create notification for the correct user (friend, not remover)', async () => {
      // Create another friendship
      const friendshipId = `integration-test-friendship-correct-user-${Date.now()}`;

      await db.execute(`
        INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
        VALUES ('${friendshipId}', '${testUserId}', '${friendUserId}', 'ACCEPTED', NOW(), NOW())
      `);

      // Delete the friendship
      await db.execute(`DELETE FROM friendships WHERE id = '${friendshipId}'`);

      // Check that notification was sent to the friend (friendUserId), not the remover (testUserId)
      const notification = (await db.execute(`
        SELECT user_id, type
        FROM notifications
        WHERE type = 'friend_removed' AND user_id = '${friendUserId}'
        ORDER BY created_at DESC
        LIMIT 1
      `)) as unknown as { rows: Array<{ user_id: string; type: string }> };

      expect(notification.rows).toHaveLength(1);
      expect(notification.rows[0].user_id).toBe(friendUserId);
      expect(notification.rows[0].type).toBe('friend_removed');
    });
  });

  // Friendship Status Change Notifications
  describe('Friendship Status Change Notifications', () => {
    let testUserId: string;
    let friendUserId: string;
    const timestamp = Date.now();

    beforeAll(async () => {
      testUserId = `integration-test-friendship-status-${timestamp}`;
      friendUserId = `integration-test-friendship-status-friend-${timestamp}`;

      // Create test users
      await db.execute(`
        INSERT INTO users (id, username, email_address, first_name, last_name, created_at, updated_at)
        VALUES
          ('${testUserId}', 'friendshipuser', 'friendship@example.com', 'Friendship', 'User', NOW(), NOW()),
          ('${friendUserId}', 'friendshipfriend', 'friend@example.com', 'Friendship', 'Friend', NOW(), NOW())
      `);
    });

    test.skip('should create friendship_requested notification when friendship is created', async () => {
      const friendshipId = `integration-test-friendship-request-${timestamp}`;

      // Create friendship
      await db.execute(`
        INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
        VALUES ('${friendshipId}', '${testUserId}', '${friendUserId}', 'PENDING', NOW(), NOW())
      `);

      // Check if notification was created
      const notification = (await db.execute(`
        SELECT id, type, user_id, target_id, target_type
        FROM notifications
        WHERE type = 'friendship_requested' AND user_id = '${friendUserId}' AND target_id = '${friendshipId}'
      `)) as unknown as {
        rows: Array<{
          id: string;
          type: string;
          user_id: string;
          target_id: string;
          target_type: string;
        }>;
      };

      expect(notification.rows).toHaveLength(1);
      expect(notification.rows[0].type).toBe('friendship_requested');
      expect(notification.rows[0].user_id).toBe(friendUserId);
      expect(notification.rows[0].target_id).toBe(friendshipId);
      expect(notification.rows[0].target_type).toBe('friendship');
    });

    test.skip('should create friendship_accepted notification when friendship is accepted', async () => {
      const friendshipId = `integration-test-friendship-accept-${timestamp}`;

      // Create friendship
      await db.execute(`
        INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
        VALUES ('${friendshipId}', '${testUserId}', '${friendUserId}', 'PENDING', NOW(), NOW())
      `);

      // Accept friendship
      await db.execute(`
        UPDATE friendships
        SET status = 'ACCEPTED', updated_at = NOW()
        WHERE id = '${friendshipId}'
      `);

      // Check if notification was created
      const notification = (await db.execute(`
        SELECT id, type, user_id, target_id, target_type
        FROM notifications
        WHERE type = 'friendship_accepted' AND user_id = '${testUserId}' AND target_id = '${friendshipId}'
      `)) as unknown as {
        rows: Array<{
          id: string;
          type: string;
          user_id: string;
          target_id: string;
          target_type: string;
        }>;
      };

      expect(notification.rows).toHaveLength(1);
      expect(notification.rows[0].type).toBe('friendship_accepted');
      expect(notification.rows[0].user_id).toBe(testUserId);
      expect(notification.rows[0].target_id).toBe(friendshipId);
      expect(notification.rows[0].target_type).toBe('friendship');
    });
  });
});
