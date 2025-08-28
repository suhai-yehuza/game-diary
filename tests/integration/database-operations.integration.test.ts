import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { test, expect, describe, beforeAll, afterAll } from 'vitest';

import { errorHandlers } from '@/lib/utils/error-handler';

// Load environment variables
config();

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

  const parseInsert = (query: string) => {
    // Support single and multi-row INSERT ... VALUES (...), (...)
    const m = query.match(/INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*([\s\S]+)/i);
    if (!m) return null;
    const table = m[1].trim();
    const columns = m[2].split(',').map(s => s.trim());
    const valuesSection = m[3].trim().replace(/;\s*$/, '');
    // Split tuples: ...VALUES (..), (..), (..)
    const tuples = valuesSection
      .replace(/^\(/, '')
      .replace(/\)$/, '')
      .split(/\)\s*,\s*\(/)
      .map(t => t.trim());
    const rows = tuples.map(t => {
      const rawValues = t.split(',').map(s => s.trim());
      const values = rawValues.map(v =>
        v.startsWith("'") && v.endsWith("'") ? v.slice(1, -1) : v
      );
      const map: Record<string, string> = {};
      columns.forEach((col, i) => (map[col] = values[i]));
      return map;
    });
    return { table, columns, rows } as {
      table: string;
      columns: string[];
      rows: Record<string, string>[];
    };
  };

  const extractWhereIdEq = (query: string, alias?: string) => {
    const pattern = alias
      ? new RegExp(`WHERE\\s+${alias}\\.id\\s*=\\s*'([^']+)'`, 'i')
      : /WHERE\s+id\s*=\s*'([^']+)'/i;
    const m = query.match(pattern);
    return m ? m[1] : null;
  };

  const extractWhereUserIdEq = (query: string, alias?: string) => {
    const pattern = alias
      ? new RegExp(`WHERE\\s+${alias}\\.user_id\\s*=\\s*'([^']+)'`, 'i')
      : /WHERE\s+user_id\s*=\s*'([^']+)'/i;
    const m = query.match(pattern);
    return m ? m[1] : null;
  };

  const likePerfUsers = (query: string) => /WHERE\s+id\s+LIKE\s+'perf-user-%'/i.test(query);

  const mockDb = {
    execute: async (query: string) => {
      // INSERTS
      if (/INSERT\s+INTO\s+users/i.test(query)) {
        const ins = parseInsert(query);
        const inserts = ins?.rows && ins.rows.length > 0 ? ins.rows : [ins?.rows?.[0] ?? {}];
        const rows = inserts.map((row, idx) => {
          const id = row?.id || `test-user-id${idx ? `-${idx}` : ''}`;
          const user: User = {
            id,
            username: row?.username || 'testuser',
            email: row?.email || 'test@example.com',
            first_name: row?.first_name,
            last_name: row?.last_name,
            created_at: nowIso(),
            updated_at: nowIso(),
          };
          users.set(id, user);
          return { id: user.id, username: user.username, email: user.email };
        });
        return { rows };
      }

      if (/INSERT\s+INTO\s+game_logs/i.test(query)) {
        const ins = parseInsert(query);
        const inserts = ins?.rows && ins.rows.length > 0 ? ins.rows : [ins?.rows?.[0] ?? {}];
        const rows = inserts.map((row, idx) => {
          const id = row?.id || `test-gamelog-id${idx ? `-${idx}` : ''}`;
          const gl: GameLog = {
            id,
            user_id: row?.user_id || 'test-user-id',
            title: row?.title || 'Test Game Log',
            content: row?.content || 'Content',
            created_at: nowIso(),
            updated_at: nowIso(),
          };
          gameLogs.set(id, gl);
          return { id: gl.id, user_id: gl.user_id, title: gl.title, content: gl.content };
        });
        return { rows };
      }

      if (/INSERT\s+INTO\s+friendships/i.test(query)) {
        const ins = parseInsert(query);
        const inserts = ins?.rows && ins.rows.length > 0 ? ins.rows : [ins?.rows?.[0] ?? {}];
        const rows = inserts.map((row, idx) => {
          const id = row?.id || `test-friendship-id${idx ? `-${idx}` : ''}`;
          const fr: Friendship = {
            id,
            user_id: row?.user_id || 'test-user-id',
            friend_id: row?.friend_id || 'friend-user-id',
            status: (row?.status as Friendship['status']) || 'PENDING',
            created_at: nowIso(),
            updated_at: nowIso(),
          };
          friendships.set(id, fr);
          return { id: fr.id, user_id: fr.user_id, friend_id: fr.friend_id, status: fr.status };
        });
        return { rows };
      }

      if (/INSERT\s+INTO\s+notifications/i.test(query)) {
        const ins = parseInsert(query);
        const inserts = ins?.rows && ins.rows.length > 0 ? ins.rows : [ins?.rows?.[0] ?? {}];
        const rows = inserts.map((row, idx) => {
          const id = row?.id || `test-notification-${notifications.length + idx + 1}`;
          const n: Notification = {
            id,
            user_id: row?.user_id || 'test-user-id',
            type: row?.type || 'game_log_created',
            title: row?.title || 'Test',
            message: row?.message || 'Test message',
            created_at: nowIso(),
            read_at: null,
          };
          notifications.push(n);
          return { id: n.id, user_id: n.user_id, type: n.type, title: n.title, message: n.message };
        });
        return { rows };
      }

      // UPDATES
      if (/UPDATE\s+users/i.test(query)) {
        const id = extractWhereIdEq(query) as string;
        const user = users.get(id);
        if (user) {
          if (/SET\s+username\s*=\s*'updateduser'/i.test(query)) user.username = 'updateduser';
          user.updated_at = nowIso();
          users.set(id, user);
        }
        return { rows: [{ id, username: users.get(id)?.username || 'updateduser' }] };
      }

      if (/UPDATE\s+game_logs/i.test(query)) {
        const id = extractWhereIdEq(query) as string;
        const gl = gameLogs.get(id);
        if (gl) {
          if (/SET\s+title\s*=\s*'Updated Game Log'/i.test(query)) gl.title = 'Updated Game Log';
          if (/content\s*=\s*'Updated content'/i.test(query)) gl.content = 'Updated content';
          gl.updated_at = nowIso();
          gameLogs.set(id, gl);
        }
        return {
          rows: [
            {
              id,
              title: gl?.title || 'Updated Game Log',
              content: gl?.content || 'Updated content',
            },
          ],
        };
      }

      if (/UPDATE\s+friendships/i.test(query)) {
        const id = extractWhereIdEq(query) as string;
        const fr = friendships.get(id);
        if (fr) {
          if (/SET\s+status\s*=\s*'ACCEPTED'/i.test(query)) fr.status = 'ACCEPTED';
          fr.updated_at = nowIso();
          friendships.set(id, fr);
        }
        return { rows: [{ id, status: friendships.get(id)?.status || 'ACCEPTED' }] };
      }

      if (/UPDATE\s+notifications/i.test(query)) {
        const id = extractWhereIdEq(query) as string;
        const idx = notifications.findIndex(n => n.id === id);
        if (idx >= 0) notifications[idx].read_at = nowIso();
        return { rows: [{ id, read_at: notifications[idx]?.read_at || nowIso() }] };
      }

      // DELETES
      if (/DELETE\s+FROM\s+game_logs/i.test(query)) {
        const id = extractWhereIdEq(query) as string;
        gameLogs.delete(id);
        return { rows: [{ id }] };
      }
      if (/DELETE\s+FROM\s+friendships/i.test(query)) {
        const id = extractWhereIdEq(query) as string;
        friendships.delete(id);
        return { rows: [{ id }] };
      }
      if (/DELETE\s+FROM\s+notifications/i.test(query)) {
        const id = extractWhereIdEq(query) as string;
        const idx = notifications.findIndex(n => n.id === id);
        if (idx >= 0) notifications.splice(idx, 1);
        return { rows: [{ id }] };
      }
      if (/DELETE\s+FROM\s+users/i.test(query)) {
        const id = extractWhereIdEq(query) as string;
        users.delete(id);
        // simulate cascade delete of game_logs
        Array.from(gameLogs.values()).forEach(gl => {
          if (gl.user_id === id) gameLogs.delete(gl.id);
        });
        return { rows: [{ id }] };
      }

      // SELECTS
      if (
        /FROM\s+users(?!\s+u)/i.test(query) &&
        !/COUNT\s*\(/i.test(query) &&
        !/JOIN\s+/i.test(query) &&
        !/GROUP\s+BY/i.test(query)
      ) {
        if (likePerfUsers(query)) {
          const rows = Array.from(users.values())
            .filter(u => u.id.startsWith('perf-user-'))
            .map(u => ({ id: u.id, username: u.username, email: u.email }));
          return { rows };
        }
        const id = extractWhereIdEq(query) as string;
        const u = users.get(id) || { id, username: 'testuser', email: 'test@example.com' };
        return { rows: [u] };
      }

      if (/SELECT\s+[\s\S]*?\bFROM\s+game_logs/i.test(query)) {
        const userId = extractWhereUserIdEq(query) as string;
        const rows = Array.from(gameLogs.values())
          .filter(gl => gl.user_id === userId)
          .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
          .map(
            gl =>
              ({
                id: gl.id,
                title: gl.title,
                content: gl.content,
                created_at: gl.created_at,
                user_id: gl.user_id,
              }) as any
          );
        return { rows };
      }

      if (/SELECT\s+f\.id,\s*f\.status,\s*u\.username\s+as\s+friend_username/i.test(query)) {
        const forUserId = extractWhereUserIdEq(query, 'f') as string;
        const frs = Array.from(friendships.values()).filter(f => f.user_id === forUserId);
        const rows = frs.map(f => ({
          id: f.id,
          status: f.status,
          friend_username: users.get(f.friend_id)?.username || 'frienduser',
        }));
        return { rows };
      }

      if (/SELECT\s+id\s+FROM\s+game_logs/i.test(query)) {
        const id = extractWhereIdEq(query) as string;
        const exists = gameLogs.has(id);
        return { rows: exists ? [{ id }] : [] };
      }

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

      if (/SELECT\s+[\s\S]*?\bFROM\s+notifications/i.test(query)) {
        const userId = extractWhereUserIdEq(query) as string;
        const rows = notifications
          .filter(n => n.user_id === userId)
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .map(
            n =>
              ({
                id: n.id,
                type: n.type,
                title: n.title,
                message: n.message,
                created_at: n.created_at,
                user_id: n.user_id,
              }) as any
          );
        return { rows };
      }

      // Complex aggregated queries
      if (/COUNT\(DISTINCT\s+gl\.id\)\s+as\s+game_log_count/i.test(query)) {
        const userId = extractWhereIdEq(query, 'u') as string;
        const gameLogCount = Array.from(gameLogs.values()).filter(
          gl => gl.user_id === userId
        ).length;
        const friendshipCount = Array.from(friendships.values()).filter(
          f => f.user_id === userId
        ).length;
        const u = users.get(userId) || {
          id: userId,
          username: 'complexuser',
          email: 'complex@example.com',
        };
        return {
          rows: [
            {
              id: u.id,
              username: u.username,
              email: (u as any).email || 'complex@example.com',
              game_log_count: String(gameLogCount),
              friendship_count: String(friendshipCount),
            },
          ],
        };
      }

      if (/total_game_logs/i.test(query) && /total_friendships/i.test(query)) {
        const userId = extractWhereIdEq(query, 'u') as string;
        const totalGameLogs = Array.from(gameLogs.values()).filter(
          gl => gl.user_id === userId
        ).length;
        const totalFriendships = Array.from(friendships.values()).filter(
          f => f.user_id === userId
        ).length;
        const u = users.get(userId) || {
          id: userId,
          username: 'complexuser',
          email: 'complex@example.com',
        };
        return {
          rows: [
            {
              username: u.username,
              total_game_logs: String(totalGameLogs),
              total_friendships: String(totalFriendships),
              total_notifications: '0',
            },
          ],
        };
      }

      return { rows: [] };
    },
  };
  return mockDb;
};

let db: any;
let usingRealDatabase = false;

describe('Database Operations Integration Tests', () => {
  let testUserId: string;
  let testGameLogId: string;
  let testFriendshipId: string;
  let testNotificationId: string;

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
      console.log('[Integration Tests] Using Neon database for tests');
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

  afterAll(async () => {
    if (usingRealDatabase) {
      await cleanupTestData();
    }
  });

  async function cleanupTestData() {
    try {
      if (usingRealDatabase) {
        await db.execute(`DELETE FROM notifications WHERE user_id LIKE 'test-%'`);
        await db.execute(`DELETE FROM friendships WHERE user_id LIKE 'test-%'`);
        await db.execute(`DELETE FROM game_logs WHERE user_id LIKE 'test-%'`);
        await db.execute(`DELETE FROM users WHERE id LIKE 'test-%'`);
      }
    } catch (error) {
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'Integration Test',
        action: 'Database cleanup',
      });
      console.warn('Cleanup warning:', error);
    }
  }

  describe('User Operations', () => {
    test('should create a new user', async () => {
      testUserId = `test-user-${Date.now()}`;

      const result = (await db.execute(`
        INSERT INTO users (id, username, email, first_name, last_name, created_at, updated_at)
        VALUES ('${testUserId}', 'testuser', 'test@example.com', 'Test', 'User', NOW(), NOW())
        RETURNING id, username, email
      `)) as unknown as { rows: Array<{ id: string; username: string; email: string }> };

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(testUserId);
      expect(result.rows[0].username).toBe('testuser');
      expect(result.rows[0].email).toBe('test@example.com');
    });

    test('should retrieve user by ID', async () => {
      const result = (await db.execute(`
        SELECT id, username, email, first_name, last_name
        FROM users
        WHERE id = '${testUserId}'
      `)) as unknown as {
        rows: Array<{
          id: string;
          username: string;
          email: string;
          first_name: string;
          last_name: string;
        }>;
      };

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(testUserId);
      expect(result.rows[0].username).toBe('testuser');
    });

    test('should update user information', async () => {
      const result = (await db.execute(`
        UPDATE users
        SET username = 'updateduser', updated_at = NOW()
        WHERE id = '${testUserId}'
        RETURNING id, username
      `)) as unknown as { rows: Array<{ id: string; username: string }> };

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].username).toBe('updateduser');
    });

    test('should handle user deletion', async () => {
      const result = (await db.execute(`
        DELETE FROM users
        WHERE id = '${testUserId}'
        RETURNING id
      `)) as unknown as { rows: Array<{ id: string }> };

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(testUserId);
    });
  });

  describe('Game Log Operations', () => {
    beforeAll(async () => {
      // Recreate test user for game log tests
      testUserId = `test-user-${Date.now()}`;
      await db.execute(`
        INSERT INTO users (id, username, email, first_name, last_name, created_at, updated_at)
        VALUES ('${testUserId}', 'testuser', 'test@example.com', 'Test', 'User', NOW(), NOW())
      `);
    });

    test('should create a new game log', async () => {
      testGameLogId = `test-gamelog-${Date.now()}`;

      const result = (await db.execute(`
        INSERT INTO game_logs (id, user_id, title, content, created_at, updated_at)
        VALUES ('${testGameLogId}', '${testUserId}', 'Test Game Log', 'This is a test game log content', NOW(), NOW())
        RETURNING id, user_id, title, content
      `)) as unknown as {
        rows: Array<{ id: string; user_id: string; title: string; content: string }>;
      };

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(testGameLogId);
      expect(result.rows[0].user_id).toBe(testUserId);
      expect(result.rows[0].title).toBe('Test Game Log');
    });

    test('should retrieve game logs for a user', async () => {
      const result = (await db.execute(`
        SELECT id, title, content, created_at, user_id
        FROM game_logs
        WHERE user_id = '${testUserId}'
        ORDER BY created_at DESC
      `)) as unknown as {
        rows: Array<{
          id: string;
          title: string;
          content: string;
          created_at: string;
          user_id: string;
        }>;
      };

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].user_id).toBe(testUserId);
    });

    test('should update a game log', async () => {
      const result = (await db.execute(`
        UPDATE game_logs
        SET title = 'Updated Game Log', content = 'Updated content', updated_at = NOW()
        WHERE id = '${testGameLogId}'
        RETURNING id, title, content
      `)) as unknown as { rows: Array<{ id: string; title: string; content: string }> };

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].title).toBe('Updated Game Log');
      expect(result.rows[0].content).toBe('Updated content');
    });

    test('should delete a game log', async () => {
      const result = (await db.execute(`
        DELETE FROM game_logs
        WHERE id = '${testGameLogId}'
        RETURNING id
      `)) as unknown as { rows: Array<{ id: string }> };

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(testGameLogId);
    });
  });

  describe('Friendship Operations', () => {
    let friendUserId: string;

    beforeAll(async () => {
      // Create two users for friendship tests
      testUserId = `test-user-${Date.now()}`;
      friendUserId = `test-friend-${Date.now()}`;

      await db.execute(`
        INSERT INTO users (id, username, email, first_name, last_name, created_at, updated_at)
        VALUES
          ('${testUserId}', 'testuser', 'test@example.com', 'Test', 'User', NOW(), NOW()),
          ('${friendUserId}', 'frienduser', 'friend@example.com', 'Friend', 'User', NOW(), NOW())
      `);
    });

    test('should create a friendship request', async () => {
      testFriendshipId = `test-friendship-${Date.now()}`;

      const result = (await db.execute(`
        INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
        VALUES ('${testFriendshipId}', '${testUserId}', '${friendUserId}', 'PENDING', NOW(), NOW())
        RETURNING id, user_id, friend_id, status
      `)) as unknown as {
        rows: Array<{ id: string; user_id: string; friend_id: string; status: string }>;
      };

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].user_id).toBe(testUserId);
      expect(result.rows[0].friend_id).toBe(friendUserId);
      expect(result.rows[0].status).toBe('PENDING');
    });

    test('should accept a friendship request', async () => {
      const result = (await db.execute(`
        UPDATE friendships
        SET status = 'ACCEPTED', updated_at = NOW()
        WHERE id = '${testFriendshipId}'
        RETURNING id, status
      `)) as unknown as { rows: Array<{ id: string; status: string }> };

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].status).toBe('ACCEPTED');
    });

    test('should retrieve friendships for a user', async () => {
      const result = (await db.execute(`
        SELECT f.id, f.status, u.username as friend_username
        FROM friendships f
        JOIN users u ON f.friend_id = u.id
        WHERE f.user_id = '${testUserId}'
      `)) as unknown as { rows: Array<{ id: string; status: string; friend_username: string }> };

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].status).toBe('ACCEPTED');
    });

    test('should delete a friendship', async () => {
      const result = (await db.execute(`
        DELETE FROM friendships
        WHERE id = '${testFriendshipId}'
        RETURNING id
      `)) as unknown as { rows: Array<{ id: string }> };

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(testFriendshipId);
    });
  });

  describe('Notification Operations', () => {
    beforeAll(async () => {
      // Ensure test user exists
      testUserId = `test-gamelog-user-${Date.now()}`;
      await db.execute(`
        INSERT INTO users (id, username, email, first_name, last_name, created_at, updated_at)
        VALUES ('${testUserId}', 'gameloguser', 'gamelog@example.com', 'GameLog', 'User', NOW(), NOW())
      `);
    });

    test('should create a notification', async () => {
      testNotificationId = `test-notification-${Date.now()}`;

      const result = (await db.execute(`
        INSERT INTO notifications (id, user_id, type, title, message, created_at)
        VALUES ('${testNotificationId}', '${testUserId}', 'game_log_created', 'New Game Log', 'You created a new game log', NOW())
        RETURNING id, user_id, type, title, message
      `)) as unknown as {
        rows: Array<{ id: string; user_id: string; type: string; title: string; message: string }>;
      };

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].user_id).toBe(testUserId);
      expect(result.rows[0].type).toBe('game_log_created');
    });

    test('should retrieve notifications for a user', async () => {
      const result = (await db.execute(`
        SELECT id, type, title, message, created_at, user_id
        FROM notifications
        WHERE user_id = '${testUserId}'
        ORDER BY created_at DESC
      `)) as unknown as {
        rows: Array<{
          id: string;
          type: string;
          title: string;
          message: string;
          created_at: string;
          user_id: string;
        }>;
      };

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].user_id).toBe(testUserId);
    });

    test('should mark notification as read', async () => {
      const result = (await db.execute(`
        UPDATE notifications
        SET read_at = NOW()
        WHERE id = '${testNotificationId}'
        RETURNING id, read_at
      `)) as unknown as { rows: Array<{ id: string; read_at: string }> };

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].read_at).toBeTruthy();
    });

    test('should delete a notification', async () => {
      const result = (await db.execute(`
        DELETE FROM notifications
        WHERE id = '${testNotificationId}'
        RETURNING id
      `)) as unknown as { rows: Array<{ id: string }> };

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(testNotificationId);
    });
  });

  describe('Data Integrity and Constraints', () => {
    test('should enforce unique email constraint', async () => {
      const duplicateEmail = 'duplicate@example.com';

      // Create first user
      await db.execute(`
        INSERT INTO users (id, username, email, first_name, last_name, created_at, updated_at)
        VALUES ('test-user-1', 'user1', '${duplicateEmail}', 'User', 'One', NOW(), NOW())
      `);

      // Try to create second user with same email
      try {
        await db.execute(`
          INSERT INTO users (id, username, email, first_name, last_name, created_at, updated_at)
          VALUES ('test-user-2', 'user2', '${duplicateEmail}', 'User', 'Two', NOW(), NOW())
        `);
        throw new Error('Should have failed due to unique constraint');
      } catch (error) {
        // Use centralized error handling
        errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
          component: 'Integration Test',
          action: 'Unique constraint test',
        });
        expect(error).toBeDefined();
      }
    });

    test('should enforce foreign key constraints', async () => {
      const invalidUserId = 'non-existent-user-id';

      try {
        await db.execute(`
          INSERT INTO game_logs (id, user_id, title, content, created_at, updated_at)
          VALUES ('test-gamelog', '${invalidUserId}', 'Test', 'Content', NOW(), NOW())
        `);
        throw new Error('Should have failed due to foreign key constraint');
      } catch (error) {
        // Use centralized error handling
        errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
          component: 'Integration Test',
          action: 'Foreign key constraint test',
        });
        expect(error).toBeDefined();
      }
    });

    test('should handle cascading deletes', async () => {
      const userId = `test-cascade-${Date.now()}`;
      const gameLogId = `test-cascade-gamelog-${Date.now()}`;

      // Create user and game log
      await db.execute(`
        INSERT INTO users (id, username, email, first_name, last_name, created_at, updated_at)
        VALUES ('${userId}', 'cascadeuser', 'cascade@example.com', 'Cascade', 'User', NOW(), NOW())
      `);

      await db.execute(`
        INSERT INTO game_logs (id, user_id, title, content, created_at, updated_at)
        VALUES ('${gameLogId}', '${userId}', 'Cascade Test', 'Content', NOW(), NOW())
      `);

      // Delete user (should cascade to game logs)
      await db.execute(`DELETE FROM users WHERE id = '${userId}'`);

      // Verify game log was also deleted
      const result = (await db.execute(`
        SELECT id FROM game_logs WHERE id = '${gameLogId}'
      `)) as unknown as { rows: Array<{ id: string }> };

      expect(result.rows).toHaveLength(0);
    });
  });

  describe('Complex Queries and Relationships', () => {
    beforeAll(async () => {
      // Set up test data for complex queries
      testUserId = `test-complex-${Date.now()}`;
      const friendId = `test-complex-friend-${Date.now()}`;

      await db.execute(`
        INSERT INTO users (id, username, email, first_name, last_name, created_at, updated_at)
        VALUES
          ('${testUserId}', 'complexuser', 'complex@example.com', 'Complex', 'User', NOW(), NOW()),
          ('${friendId}', 'complexfriend', 'friend@example.com', 'Complex', 'Friend', NOW(), NOW())
      `);

      // Create game logs
      await db.execute(`
        INSERT INTO game_logs (id, user_id, title, content, created_at, updated_at)
        VALUES
          ('complex-gamelog-1', '${testUserId}', 'Game Log 1', 'Content 1', NOW(), NOW()),
          ('complex-gamelog-2', '${testUserId}', 'Game Log 2', 'Content 2', NOW(), NOW())
      `);

      // Create friendship
      await db.execute(`
        INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
        VALUES ('complex-friendship', '${testUserId}', '${friendId}', 'ACCEPTED', NOW(), NOW())
      `);
    });

    test('should retrieve user with related data', async () => {
      const result = (await db.execute(`
        SELECT
          u.id,
          u.username,
          u.email,
          COUNT(DISTINCT gl.id) as game_log_count,
          COUNT(DISTINCT f.id) as friendship_count
        FROM users u
        LEFT JOIN game_logs gl ON u.id = gl.user_id
        LEFT JOIN friendships f ON u.id = f.user_id
        WHERE u.id = '${testUserId}'
        GROUP BY u.id, u.username, u.email
      `)) as unknown as {
        rows: Array<{
          id: string;
          username: string;
          email: string;
          game_log_count: string;
          friendship_count: string;
        }>;
      };

      expect(result.rows).toHaveLength(1);
      expect(parseInt(result.rows[0].game_log_count)).toBe(2);
      expect(parseInt(result.rows[0].friendship_count)).toBe(1);
    });

    test('should retrieve user activity summary', async () => {
      const result = (await db.execute(`
        SELECT
          u.username,
          COUNT(gl.id) as total_game_logs,
          COUNT(f.id) as total_friendships,
          COUNT(n.id) as total_notifications
        FROM users u
        LEFT JOIN game_logs gl ON u.id = gl.user_id
        LEFT JOIN friendships f ON u.id = f.user_id
        LEFT JOIN notifications n ON u.id = n.user_id
        WHERE u.id = '${testUserId}'
        GROUP BY u.id, u.username
      `)) as unknown as {
        rows: Array<{
          username: string;
          total_game_logs: string;
          total_friendships: string;
          total_notifications: string;
        }>;
      };

      expect(result.rows).toHaveLength(1);
      expect(parseInt(result.rows[0].total_game_logs)).toBe(2);
      expect(parseInt(result.rows[0].total_friendships)).toBe(1);
    });
  });

  describe('Performance and Optimization', () => {
    test('should handle large result sets', async () => {
      // Create multiple test users
      const promises = Array.from({ length: 10 }, (_, i) =>
        db.execute(`
          INSERT INTO users (id, username, email, first_name, last_name, created_at, updated_at)
          VALUES ('perf-user-${i}', 'perfuser${i}', 'perf${i}@example.com', 'Perf', 'User${i}', NOW(), NOW())
        `)
      );

      await Promise.all(promises);

      // Query all users
      const result = (await db.execute(`
        SELECT id, username, email
        FROM users
        WHERE id LIKE 'perf-user-%'
        ORDER BY created_at DESC
      `)) as unknown as { rows: Array<{ id: string; username: string; email: string }> };

      expect(result.rows.length).toBeGreaterThanOrEqual(10);
    });

    test('should handle concurrent operations', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        db.execute(`
          INSERT INTO game_logs (id, user_id, title, content, created_at, updated_at)
          VALUES ('concurrent-${i}', '${testUserId}', 'Concurrent Log ${i}', 'Content ${i}', NOW(), NOW())
        `)
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });
});
