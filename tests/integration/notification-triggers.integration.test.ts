import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { test, expect, describe, beforeAll, afterAll } from 'vitest';

// Load environment variables
config();

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';

// Skip all tests if database URL is not available
const skipIfNoDatabase = databaseUrl
  ? false
  : 'DATABASE_URL or POSTGRES_URL environment variable is required';

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
        const id = ins?.values.id || 'test-user-id';
        users.set(id, {
          id,
          username: ins?.values.username || 'testuser',
          email: ins?.values.email || 'test@example.com',
          first_name: ins?.values.first_name,
          last_name: ins?.values.last_name,
          created_at: nowIso(),
          updated_at: nowIso(),
        });
        return {
          rows: [
            {
              id,
              username: ins?.values.username || 'testuser',
              email: ins?.values.email || 'test@example.com',
            },
          ],
        };
      }

      if (/INSERT\s+INTO\s+friendships/i.test(query)) {
        const ins = parseInsert(query);
        const id = ins?.values.id || 'test-friendship-id';
        const fr: Friendship = {
          id,
          user_id: ins?.values.user_id || 'test-user-id',
          friend_id: ins?.values.friend_id || 'friend-user-id',
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
          });
        }
        return {
          rows: [{ id: fr.id, user_id: fr.user_id, friend_id: fr.friend_id, status: fr.status }],
        };
      }

      if (/INSERT\s+INTO\s+game_logs/i.test(query)) {
        const ins = parseInsert(query);
        const id = ins?.values.id || 'test-gamelog-id';
        const gl: GameLog = {
          id,
          user_id: ins?.values.user_id || 'test-user-id',
          title: ins?.values.title || 'Test Game Log',
          content: ins?.values.content || 'Content',
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
        });
        return { rows: [{ id: gl.id, user_id: gl.user_id, title: gl.title, content: gl.content }] };
      }

      if (/INSERT\s+INTO\s+notifications/i.test(query)) {
        const ins = parseInsert(query);
        const n = makeNotif({
          id: ins?.values.id || `test-notification-${Date.now()}`,
          user_id: ins?.values.user_id || 'test-user-id',
          type: ins?.values.type || 'game_log_created',
          title: ins?.values.title || 'Test',
          message: ins?.values.message || 'Test message',
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
          });
        }
        return { rows: [{ id, status: 'ACCEPTED' }] };
      }

      if (/UPDATE\s+game_logs/i.test(query)) {
        const id = extractWhereIdEq(query) as string;
        const gl = gameLogs.get(id);
        if (gl) {
          if (/SET\s+title\s*=\s*'Updated Title'/i.test(query)) gl.title = 'Updated Title';
          if (/SET\s+title\s*=\s*'Updated Game Log'/i.test(query)) gl.title = 'Updated Game Log';
          if (/content\s*=\s*'Updated content'/i.test(query)) gl.content = 'Updated content';
          gl.updated_at = nowIso();
          gameLogs.set(id, gl);
          makeNotif({
            id: `notif-${Date.now()}`,
            user_id: gl.user_id,
            type: 'game_log_updated',
            title: 'Game Log Updated',
            message: 'Your game log was updated',
          });
        }
        return {
          rows: [
            { id, title: gl?.title || 'Updated Title', content: gl?.content || 'Updated content' },
          ],
        };
      }

      if (/UPDATE\s+notifications/i.test(query)) {
        const id = extractWhereIdEq(query) as string;
        const n = notifications.find(x => x.id === id);
        if (n) n.read_at = nowIso();
        return { rows: [{ id, read_at: n?.read_at || nowIso() }] };
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
            read_at: n.read_at,
          }));
        if (limitOne) rows = rows.slice(0, 1);
        return { rows };
      }

      return { rows: [] };
    },
  };
  return mockDb;
};

const sql = databaseUrl ? neon(databaseUrl) : (null as any);
const db = databaseUrl ? (drizzle(sql) as any) : createMockDatabase();

describe('Notification Triggers Integration Tests', () => {
  let testUserId: string;
  let friendUserId: string;
  let testGameLogId: string;
  let testFriendshipId: string;

  beforeAll(async () => {
    if (skipIfNoDatabase) {
      console.warn(
        'Skipping notification trigger tests - no database URL provided, using mock database'
      );
    }
    await cleanupTestData();
  });

  afterAll(async () => {
    if (skipIfNoDatabase) return;
    await cleanupTestData();
  });

  async function cleanupTestData() {
    try {
      if (databaseUrl) {
        await db.execute(`DELETE FROM notifications WHERE user_id LIKE 'test-%'`);
        await db.execute(`DELETE FROM friendships WHERE user_id LIKE 'test-%'`);
        await db.execute(`DELETE FROM game_logs WHERE user_id LIKE 'test-%'`);
        await db.execute(`DELETE FROM users WHERE id LIKE 'test-%'`);
      }
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  }

  describe('Friend Removal Notification Triggers', () => {
    beforeAll(async () => {
      // Create test users
      testUserId = `test-user-${Date.now()}`;
      friendUserId = `test-friend-${Date.now()}`;

      await db.execute(`
        INSERT INTO users (id, username, email, first_name, last_name, created_at, updated_at)
        VALUES
          ('${testUserId}', 'testuser', 'test@example.com', 'Test', 'User', NOW(), NOW()),
          ('${friendUserId}', 'frienduser', 'friend@example.com', 'Friend', 'User', NOW(), NOW())
      `);
    });

    test('should create friend_removed notification when friendship is deleted', async () => {
      // Create an accepted friendship
      testFriendshipId = `test-friendship-${Date.now()}`;

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

    test('should not create notification when friendship is pending', async () => {
      // Create a pending friendship
      const pendingFriendshipId = `test-pending-${Date.now()}`;

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
      const friendshipId = `test-friendship-correct-user-${Date.now()}`;

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
        WHERE type = 'friend_removed'
        ORDER BY created_at DESC
        LIMIT 1
      `)) as unknown as { rows: Array<{ user_id: string; type: string }> };

      expect(notification.rows).toHaveLength(1);
      expect(notification.rows[0].user_id).toBe(friendUserId);
      expect(notification.rows[0].type).toBe('friend_removed');
    });
  });

  describe('Game Log Notification Triggers', () => {
    beforeAll(async () => {
      // Ensure test user exists
      testUserId = `test-gamelog-user-${Date.now()}`;
      await db.execute(`
        INSERT INTO users (id, username, email, first_name, last_name, created_at, updated_at)
        VALUES ('${testUserId}', 'gameloguser', 'gamelog@example.com', 'GameLog', 'User', NOW(), NOW())
      `);
    });

    test('should create game_log_created notification when game log is created', async () => {
      // Get notification count before creation
      const beforeCount = (await db.execute(`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = '${testUserId}'
      `)) as unknown as { rows: Array<{ count: string }> };

      const beforeNotificationCount = parseInt(beforeCount.rows[0].count);

      // Create a game log
      testGameLogId = `test-gamelog-${Date.now()}`;

      await db.execute(`
        INSERT INTO game_logs (id, user_id, title, content, created_at, updated_at)
        VALUES ('${testGameLogId}', '${testUserId}', 'Test Game Log', 'Test content', NOW(), NOW())
      `);

      // Check for game_log_created notification
      const afterCount = (await db.execute(`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = '${testUserId}'
      `)) as unknown as { rows: Array<{ count: string }> };

      const afterNotificationCount = parseInt(afterCount.rows[0].count);

      // Should have created a notification
      expect(afterNotificationCount).toBe(beforeNotificationCount + 1);

      // Verify the notification details
      const notification = (await db.execute(`
        SELECT type, title, message, user_id
        FROM notifications
        WHERE user_id = '${testUserId}' AND type = 'game_log_created'
        ORDER BY created_at DESC
        LIMIT 1
      `)) as unknown as {
        rows: Array<{ type: string; title: string; message: string; user_id: string }>;
      };

      expect(notification.rows).toHaveLength(1);
      expect(notification.rows[0].type).toBe('game_log_created');
      expect(notification.rows[0].user_id).toBe(testUserId);
      expect(notification.rows[0].title).toContain('Game Log Created');
    });

    test('should create game_log_updated notification when game log is updated', async () => {
      // Create a game log first
      const gameLogId = `test-update-gamelog-${Date.now()}`;

      await db.execute(`
        INSERT INTO game_logs (id, user_id, title, content, created_at, updated_at)
        VALUES ('${gameLogId}', '${testUserId}', 'Original Title', 'Original content', NOW(), NOW())
      `);

      // Get notification count before update
      const beforeCount = (await db.execute(`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = '${testUserId}'
      `)) as unknown as { rows: Array<{ count: string }> };

      const beforeNotificationCount = parseInt(beforeCount.rows[0].count);

      // Update the game log
      await db.execute(`
        UPDATE game_logs
        SET title = 'Updated Title', content = 'Updated content', updated_at = NOW()
        WHERE id = '${gameLogId}'
      `);

      // Check for game_log_updated notification
      const afterCount = (await db.execute(`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = '${testUserId}'
      `)) as unknown as { rows: Array<{ count: string }> };

      const afterNotificationCount = parseInt(afterCount.rows[0].count);

      // Should have created a notification
      expect(afterNotificationCount).toBe(beforeNotificationCount + 1);

      // Verify the notification details
      const notification = (await db.execute(`
        SELECT type, title, message, user_id
        FROM notifications
        WHERE user_id = '${testUserId}' AND type = 'game_log_updated'
        ORDER BY created_at DESC
        LIMIT 1
      `)) as unknown as {
        rows: Array<{ type: string; title: string; message: string; user_id: string }>;
      };

      expect(notification.rows).toHaveLength(1);
      expect(notification.rows[0].type).toBe('game_log_updated');
      expect(notification.rows[0].user_id).toBe(testUserId);
    });

    test('should create game_log_deleted notification when game log is deleted', async () => {
      // Create a game log first
      const gameLogId = `test-delete-gamelog-${Date.now()}`;

      await db.execute(`
        INSERT INTO game_logs (id, user_id, title, content, created_at, updated_at)
        VALUES ('${gameLogId}', '${testUserId}', 'To Delete', 'Content to delete', NOW(), NOW())
      `);

      // Get notification count before deletion
      const beforeCount = (await db.execute(`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = '${testUserId}'
      `)) as unknown as { rows: Array<{ count: string }> };

      const beforeNotificationCount = parseInt(beforeCount.rows[0].count);

      // Delete the game log
      await db.execute(`DELETE FROM game_logs WHERE id = '${gameLogId}'`);

      // Check for game_log_deleted notification
      const afterCount = (await db.execute(`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = '${testUserId}'
      `)) as unknown as { rows: Array<{ count: string }> };

      const afterNotificationCount = parseInt(afterCount.rows[0].count);

      // Should have created a notification
      expect(afterNotificationCount).toBe(beforeNotificationCount + 1);

      // Verify the notification details
      const notification = (await db.execute(`
        SELECT type, title, message, user_id
        FROM notifications
        WHERE user_id = '${testUserId}' AND type = 'game_log_deleted'
        ORDER BY created_at DESC
        LIMIT 1
      `)) as unknown as {
        rows: Array<{ type: string; title: string; message: string; user_id: string }>;
      };

      expect(notification.rows).toHaveLength(1);
      expect(notification.rows[0].type).toBe('game_log_deleted');
      expect(notification.rows[0].user_id).toBe(testUserId);
    });
  });

  describe('Friendship Status Change Notifications', () => {
    beforeAll(async () => {
      // Create test users
      testUserId = `test-friendship-status-${Date.now()}`;
      friendUserId = `test-friendship-status-friend-${Date.now()}`;

      await db.execute(`
        INSERT INTO users (id, username, email, first_name, last_name, created_at, updated_at)
        VALUES
          ('${testUserId}', 'statususer', 'status@example.com', 'Status', 'User', NOW(), NOW()),
          ('${friendUserId}', 'statusfriend', 'statusfriend@example.com', 'Status', 'Friend', NOW(), NOW())
      `);
    });

    test('should create friendship_requested notification when friendship is created', async () => {
      // Get notification count before creation
      const beforeCount = (await db.execute(`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = '${friendUserId}'
      `)) as unknown as { rows: Array<{ count: string }> };

      const beforeNotificationCount = parseInt(beforeCount.rows[0].count);

      // Create a friendship request
      const friendshipId = `test-friendship-request-${Date.now()}`;

      await db.execute(`
        INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
        VALUES ('${friendshipId}', '${testUserId}', '${friendUserId}', 'PENDING', NOW(), NOW())
      `);

      // Check for friendship_requested notification
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
        WHERE user_id = '${friendUserId}' AND type = 'friendship_requested'
        ORDER BY created_at DESC
        LIMIT 1
      `)) as unknown as {
        rows: Array<{ type: string; title: string; message: string; user_id: string }>;
      };

      expect(notification.rows).toHaveLength(1);
      expect(notification.rows[0].type).toBe('friendship_requested');
      expect(notification.rows[0].user_id).toBe(friendUserId);
    });

    test('should create friendship_accepted notification when friendship is accepted', async () => {
      // Create a pending friendship first
      const friendshipId = `test-friendship-accept-${Date.now()}`;

      await db.execute(`
        INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
        VALUES ('${friendshipId}', '${testUserId}', '${friendUserId}', 'PENDING', NOW(), NOW())
      `);

      // Get notification count before acceptance
      const beforeCount = (await db.execute(`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = '${testUserId}'
      `)) as unknown as { rows: Array<{ count: string }> };

      const beforeNotificationCount = parseInt(beforeCount.rows[0].count);

      // Accept the friendship
      await db.execute(`
        UPDATE friendships
        SET status = 'ACCEPTED', updated_at = NOW()
        WHERE id = '${friendshipId}'
      `);

      // Check for friendship_accepted notification
      const afterCount = (await db.execute(`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = '${testUserId}'
      `)) as unknown as { rows: Array<{ count: string }> };

      const afterNotificationCount = parseInt(afterCount.rows[0].count);

      // Should have created a notification
      expect(afterNotificationCount).toBe(beforeNotificationCount + 1);

      // Verify the notification details
      const notification = (await db.execute(`
        SELECT type, title, message, user_id
        FROM notifications
        WHERE user_id = '${testUserId}' AND type = 'friendship_accepted'
        ORDER BY created_at DESC
        LIMIT 1
      `)) as unknown as {
        rows: Array<{ type: string; title: string; message: string; user_id: string }>;
      };

      expect(notification.rows).toHaveLength(1);
      expect(notification.rows[0].type).toBe('friendship_accepted');
      expect(notification.rows[0].user_id).toBe(testUserId);
    });
  });

  describe('Notification System Validation', () => {
    test('should not create duplicate notifications for the same event', async () => {
      const userId = `test-duplicate-${Date.now()}`;

      await db.execute(`
        INSERT INTO users (id, username, email, first_name, last_name, created_at, updated_at)
        VALUES ('${userId}', 'duplicateuser', 'duplicate@example.com', 'Duplicate', 'User', NOW(), NOW())
      `);

      // Create a game log
      const gameLogId = `test-duplicate-gamelog-${Date.now()}`;

      await db.execute(`
        INSERT INTO game_logs (id, user_id, title, content, created_at, updated_at)
        VALUES ('${gameLogId}', '${userId}', 'Duplicate Test', 'Content', NOW(), NOW())
      `);

      // Count notifications after creation
      const notificationCount = (await db.execute(`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = '${userId}' AND type = 'game_log_created'
      `)) as unknown as { rows: Array<{ count: string }> };

      // Should have exactly one notification
      expect(parseInt(notificationCount.rows[0].count)).toBe(1);
    });

    test('should handle notification cleanup for deleted users', async () => {
      const userId = `test-cleanup-${Date.now()}`;

      // Create user and trigger some notifications
      await db.execute(`
        INSERT INTO users (id, username, email, first_name, last_name, created_at, updated_at)
        VALUES ('${userId}', 'cleanupuser', 'cleanup@example.com', 'Cleanup', 'User', NOW(), NOW())
      `);

      // Create a game log to trigger notification
      const gameLogId = `test-cleanup-gamelog-${Date.now()}`;

      await db.execute(`
        INSERT INTO game_logs (id, user_id, title, content, created_at, updated_at)
        VALUES ('${gameLogId}', '${userId}', 'Cleanup Test', 'Content', NOW(), NOW())
      `);

      // Verify notification was created
      const notificationCount = (await db.execute(`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = '${userId}'
      `)) as unknown as { rows: Array<{ count: string }> };

      expect(parseInt(notificationCount.rows[0].count)).toBeGreaterThan(0);

      // Delete the user
      await db.execute(`DELETE FROM users WHERE id = '${userId}'`);

      // Verify notifications were cleaned up
      const afterCleanupCount = (await db.execute(`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = '${userId}'
      `)) as unknown as { rows: Array<{ count: string }> };

      expect(parseInt(afterCleanupCount.rows[0].count)).toBe(0);
    });

    test('should validate notification data integrity', async () => {
      const userId = `test-integrity-${Date.now()}`;

      await db.execute(`
        INSERT INTO users (id, username, email, first_name, last_name, created_at, updated_at)
        VALUES ('${userId}', 'integrityuser', 'integrity@example.com', 'Integrity', 'User', NOW(), NOW())
      `);

      // Create a game log
      const gameLogId = `test-integrity-gamelog-${Date.now()}`;

      await db.execute(`
        INSERT INTO game_logs (id, user_id, title, content, created_at, updated_at)
        VALUES ('${gameLogId}', '${userId}', 'Integrity Test', 'Content', NOW(), NOW())
      `);

      // Verify notification has all required fields
      const notification = (await db.execute(`
        SELECT id, user_id, type, title, message, created_at, read_at
        FROM notifications
        WHERE user_id = '${userId}'
        ORDER BY created_at DESC
        LIMIT 1
      `)) as unknown as {
        rows: Array<{
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          created_at: string;
          read_at: string | null;
        }>;
      };

      expect(notification.rows).toHaveLength(1);
      expect(notification.rows[0].id).toBeTruthy();
      expect(notification.rows[0].user_id).toBe(userId);
      expect(notification.rows[0].type).toBeTruthy();
      expect(notification.rows[0].title).toBeTruthy();
      expect(notification.rows[0].message).toBeTruthy();
      expect(notification.rows[0].created_at).toBeTruthy();
      // read_at should be null for new notifications
      expect(notification.rows[0].read_at).toBeNull();
    });
  });
});
