import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { errorHandlers } from '../../src/lib/utils/error-handler';

/**
 * Centralized cleanup utility for integration tests
 * Ensures consistent cleanup across all database and notification tests
 */

export interface CleanupOptions {
  /** Whether to use real database (true) or mock (false) */
  usingRealDatabase: boolean;
  /** Database connection instance */
  db: any;
  /** Additional test data patterns to clean up */
  additionalPatterns?: string[];
}

/**
 * Comprehensive cleanup function that removes all test data
 * Cleans up in reverse dependency order to avoid foreign key constraint issues
 */
export async function cleanupTestData(options: CleanupOptions): Promise<void> {
  const { usingRealDatabase, db, additionalPatterns = [] } = options;

  if (!usingRealDatabase) {
    console.log('🧹 Skipping cleanup - using mock database');
    return;
  }

  try {
    console.log('🧹 Starting comprehensive test data cleanup...');

    // Define cleanup patterns - order matters (reverse dependency order)
    const cleanupQueries = [
      // Notifications (depends on users, friendships, game_logs)
      {
        table: 'notifications',
        patterns: [
          "user_id LIKE 'test-%'",
          "id LIKE 'test-%'",
          "user_id LIKE 'integration-test%'",
          "id LIKE 'integration-test%'",
          "target_id LIKE 'test-%'",
          "target_id LIKE 'integration-test%'",
          ...additionalPatterns.filter(p => p.includes('notification')),
        ],
      },
      // Friendships (depends on users)
      {
        table: 'friendships',
        patterns: [
          "user_id LIKE 'test-%'",
          "friend_id LIKE 'test-%'",
          "id LIKE 'test-%'",
          "user_id LIKE 'integration-test%'",
          "friend_id LIKE 'integration-test%'",
          "id LIKE 'integration-test%'",
          ...additionalPatterns.filter(p => p.includes('friendship')),
        ],
      },
      // Game logs (depends on users, basketball_games)
      {
        table: 'game_logs',
        patterns: [
          "user_id LIKE 'test-%'",
          "id LIKE 'test-%'",
          "user_id LIKE 'integration-test%'",
          "id LIKE 'integration-test%'",
          ...additionalPatterns.filter(p => p.includes('game_log')),
        ],
      },
      // Public comments and reactions (depends on users, need special handling)
      {
        table: 'public_comments',
        patterns: [
          "user_id LIKE 'test-%'",
          "id LIKE 'test-%'",
          "user_id LIKE 'integration-test%'",
          "id LIKE 'integration-test%'",
          "anonymous_name LIKE 'test-%'",
          "anonymous_name LIKE 'integration-test%'",
          ...additionalPatterns.filter(p => p.includes('public_comment')),
        ],
      },
      {
        table: 'public_reactions',
        patterns: [
          "user_id LIKE 'test-%'",
          "id LIKE 'test-%'",
          "user_id LIKE 'integration-test%'",
          "id LIKE 'integration-test%'",
          "anonymous_name LIKE 'test-%'",
          "anonymous_name LIKE 'integration-test%'",
          ...additionalPatterns.filter(p => p.includes('public_reaction')),
        ],
      },
      // Basketball games (depends on basketball_teams)
      {
        table: 'basketball_games',
        patterns: [
          "id LIKE 'test-%'",
          "id LIKE 'integration-test-%'",
          "id LIKE 'integration-test-game-%'",
          ...additionalPatterns.filter(p => p.includes('basketball_game')),
        ],
      },
      // Basketball teams (independent)
      {
        table: 'basketball_teams',
        patterns: [
          "id LIKE 'test-%'",
          "id LIKE 'home-%'",
          "id LIKE 'away-%'",
          "id LIKE 'integration-test-%'",
          "id IN ('integration-test-team-home', 'integration-test-team-away')",
          ...additionalPatterns.filter(p => p.includes('basketball_team')),
        ],
      },
      // Users (independent - clean up last)
      {
        table: 'users',
        patterns: [
          "id LIKE 'test-%'",
          "id LIKE 'integration-test%'",
          "id LIKE 'perf-user-%'",
          ...additionalPatterns.filter(p => p.includes('user') && !p.includes('user_id')),
        ],
      },
    ];

    // Execute cleanup queries
    for (const { table, patterns } of cleanupQueries) {
      if (patterns.length === 0) continue;

      const whereClause = patterns.join(' OR ');
      const query = `DELETE FROM ${table} WHERE ${whereClause}`;

      try {
        const result = await db.execute(query);
        const deletedCount = result.rowCount || 0;
        if (deletedCount > 0) {
          console.log(`  ✅ Cleaned ${deletedCount} records from ${table}`);
        }
      } catch (error) {
        console.warn(`  ⚠️ Warning cleaning ${table}:`, error);
        // Continue with other tables even if one fails
      }
    }

    console.log('✅ Test data cleanup completed successfully');
  } catch (error) {
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'Integration Test Cleanup',
      action: 'Comprehensive test data cleanup',
    });
    console.error('❌ Error during test data cleanup:', error);
    throw error; // Re-throw to ensure test failure if cleanup fails
  }
}

/**
 * Pre-test cleanup function
 * Ensures clean state before running any database/notification tests
 */
export async function preTestCleanup(
  databaseUrl?: string
): Promise<{ db: any; usingRealDatabase: boolean }> {
  console.log('🔧 Running pre-test cleanup...');

  if (!databaseUrl) {
    console.warn('⚠️ No DATABASE_URL found. Skipping pre-test cleanup.');
    return { db: null, usingRealDatabase: false };
  }

  try {
    const sql = neon(databaseUrl);
    const db = drizzle(sql) as any;

    // Test connection
    await db.execute('SELECT 1');
    console.log('✅ Database connection established for cleanup');

    // Run comprehensive cleanup
    await cleanupTestData({ usingRealDatabase: true, db });

    return { db, usingRealDatabase: true };
  } catch (error) {
    console.warn('⚠️ Failed to connect to database for pre-test cleanup:', error);
    return { db: null, usingRealDatabase: false };
  }
}

/**
 * Post-test cleanup function
 * Ensures clean state after running tests
 */
export async function postTestCleanup(options: CleanupOptions): Promise<void> {
  console.log('🧹 Running post-test cleanup...');
  await cleanupTestData(options);
}

/**
 * Comprehensive post-test cleanup function
 * Runs multiple cleanup passes to ensure all test data is removed
 */
export async function comprehensivePostTestCleanup(options: CleanupOptions): Promise<void> {
  const { usingRealDatabase, db } = options;

  if (!usingRealDatabase) {
    console.log('🧹 Skipping post-test cleanup - using mock database');
    return;
  }

  try {
    console.log('🧹 Running comprehensive post-test cleanup...');

    // Run initial cleanup
    await cleanupTestData(options);

    // Check if cleanup was successful
    const stillNeedsCleanup = await needsCleanup(db);

    if (stillNeedsCleanup) {
      console.log('🔄 First cleanup pass incomplete - running second pass...');
      await cleanupTestData(options);

      // Check again after second pass
      const stillNeedsCleanupAfterSecond = await needsCleanup(db);
      if (stillNeedsCleanupAfterSecond) {
        console.warn('⚠️ Some test data may still remain after cleanup attempts');
      } else {
        console.log('✅ Second cleanup pass successful');
      }
    } else {
      console.log('✅ Post-test cleanup completed successfully');
    }
  } catch (error) {
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'Integration Test Cleanup',
      action: 'Comprehensive post-test cleanup',
    });
    console.error('❌ Error during comprehensive post-test cleanup:', error);
    throw error;
  }
}

/**
 * Cleanup function specifically for notification tests
 * Includes notification trigger management
 */
export async function cleanupNotificationTests(options: CleanupOptions): Promise<void> {
  const { usingRealDatabase, db } = options;

  if (!usingRealDatabase) {
    console.log('🧹 Skipping notification cleanup - using mock database');
    return;
  }

  try {
    console.log('🧹 Cleaning up notification test data...');

    // Clean up notification-specific data
    await cleanupTestData({
      ...options,
      additionalPatterns: [
        "user_id LIKE 'test-friend-%'",
        "id LIKE 'test-friend-%'",
        "target_id LIKE 'test-friend-%'",
      ],
    });

    console.log('✅ Notification test cleanup completed');
  } catch (error) {
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'Integration Test Cleanup',
      action: 'Notification test cleanup',
    });
    console.error('❌ Error during notification test cleanup:', error);
    throw error;
  }
}

/**
 * Utility to check if cleanup is needed
 * Returns true if there's test data in the database
 */
export async function needsCleanup(db: any): Promise<boolean> {
  if (!db) return false;

  try {
    const result = await db.execute(`
      SELECT COUNT(*) as count FROM (
        SELECT 1 FROM users WHERE id LIKE 'test-%' OR id LIKE 'integration-test%'
        UNION ALL
        SELECT 1 FROM notifications WHERE user_id LIKE 'test-%' OR id LIKE 'test-%' OR user_id LIKE 'integration-test%' OR id LIKE 'integration-test%'
        UNION ALL
        SELECT 1 FROM friendships WHERE user_id LIKE 'test-%' OR friend_id LIKE 'test-%' OR id LIKE 'test-%' OR user_id LIKE 'integration-test%' OR friend_id LIKE 'integration-test%' OR id LIKE 'integration-test%'
        UNION ALL
        SELECT 1 FROM game_logs WHERE user_id LIKE 'test-%' OR id LIKE 'test-%' OR user_id LIKE 'integration-test%' OR id LIKE 'integration-test%'
        UNION ALL
        SELECT 1 FROM public_comments WHERE user_id LIKE 'test-%' OR id LIKE 'test-%' OR user_id LIKE 'integration-test%' OR id LIKE 'integration-test%' OR anonymous_name LIKE 'test-%' OR anonymous_name LIKE 'integration-test%'
        UNION ALL
        SELECT 1 FROM public_reactions WHERE user_id LIKE 'test-%' OR id LIKE 'test-%' OR user_id LIKE 'integration-test%' OR id LIKE 'integration-test%' OR anonymous_name LIKE 'test-%' OR anonymous_name LIKE 'integration-test%'
        UNION ALL
        SELECT 1 FROM basketball_games WHERE id LIKE 'test-%' OR id LIKE 'integration-test-%' OR id LIKE 'integration-test-game-%'
        UNION ALL
        SELECT 1 FROM basketball_teams WHERE id LIKE 'test-%' OR id LIKE 'home-%' OR id LIKE 'away-%' OR id LIKE 'integration-test-%' OR id IN ('integration-test-team-home', 'integration-test-team-away')
      ) as test_data
    `);

    const count = result.rows?.[0]?.count || 0;
    return count > 0;
  } catch (error) {
    console.warn('⚠️ Error checking cleanup needs:', error);
    return true; // Assume cleanup is needed if we can't check
  }
}
