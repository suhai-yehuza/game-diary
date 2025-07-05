#!/usr/bin/env tsx

import { neon, neonConfig } from '@neondatabase/serverless';
import { logger } from '@lib/core/logger';

// Configure neon for better stability
neonConfig.wsProxy = host => `${host}:5432/v1`;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = true;
neonConfig.pipelineConnect = false;
neonConfig.fetchFunction = (input: RequestInfo | URL, init?: RequestInit) => {
  const options = {
    ...init,
    signal: AbortSignal.timeout(30000), // 30 second timeout
    keepalive: true,
  };
  return fetch(input, options);
};

// Create a single SQL client instance for raw SQL operations
const sqlClient = neon(process.env.DATABASE_URL!);

async function testCascadeDelete(): Promise<void> {
  const testUserId = 'test-user-cascade-delete';
  const testFriendId = 'test-friend-cascade-delete';
  const testGameId = 'test-game-cascade-delete';

  try {
    logger.info('Starting cascade delete test...');

    // Clean up any existing test data
    await cleanupTestData(testUserId, testFriendId, testGameId);

    // Create test data
    logger.info('Creating test data...');

    // Create test users
    await sqlClient`
      INSERT INTO users (id, username, first_name, last_name, email_address)
      VALUES
        (${testUserId}, 'testuser', 'Test', 'User', 'test@example.com'),
        (${testFriendId}, 'testfriend', 'Test', 'Friend', 'friend@example.com')
    `;

    // Create test game
    await sqlClient`
      INSERT INTO nba_games (id, date, home_team_id, away_team_id, status)
      VALUES (${testGameId}, NOW(), 'team1', 'team2', 'Final')
    `;

    // Create test game log
    await sqlClient`
      INSERT INTO game_logs (id, user_id, game_id, watched_date, rating_for_game)
      VALUES (gen_random_uuid()::text, ${testUserId}, ${testGameId}, NOW(), 5)
    `;

    // Create test friendship
    await sqlClient`
      INSERT INTO friendships (id, user_id, friend_id, status)
      VALUES (gen_random_uuid()::text, ${testUserId}, ${testFriendId}, 'Accepted')
    `;

    // Create test comment
    await sqlClient`
      INSERT INTO comments (id, user_id, parent_id, parent_type, content)
      VALUES (gen_random_uuid()::text, ${testUserId}, ${testGameId}, 'game_log', 'Test comment')
    `;

    // Create test reaction
    await sqlClient`
      INSERT INTO reactions (id, user_id, target_id, target_type, emoji)
      VALUES (gen_random_uuid()::text, ${testUserId}, ${testGameId}, 'game_log', '👍')
    `;

    // Create test notification
    await sqlClient`
      INSERT INTO notifications (id, user_id, type, title, message)
      VALUES (gen_random_uuid()::text, ${testUserId}, 'test', 'Test Notification', 'Test message')
    `;

    // Verify test data was created
    logger.info('Verifying test data was created...');
    const counts = await getRecordCounts(testUserId);
    logger.info('Record counts before deletion:', counts);

    // Delete the test user
    logger.info('Deleting test user...');
    await sqlClient`DELETE FROM users WHERE id = ${testUserId}`;

    // Verify all related records were deleted
    logger.info('Verifying cascade delete worked...');
    const countsAfter = await getRecordCounts(testUserId);
    logger.info('Record counts after deletion:', countsAfter);

    // Check that all counts are 0
    const allZero = Object.values(countsAfter).every(count => count === 0);
    if (allZero) {
      logger.info('✅ Cascade delete test PASSED - All related records were deleted');
    } else {
      logger.error('❌ Cascade delete test FAILED - Some records were not deleted');
      logger.error('Remaining records:', countsAfter);
    }

    // Clean up remaining test data
    await cleanupTestData(testUserId, testFriendId, testGameId);
  } catch (error) {
    logger.error('Error during cascade delete test:', error);
    // Clean up on error
    await cleanupTestData(testUserId, testFriendId, testGameId);
    throw error;
  }
}

async function getRecordCounts(userId: string): Promise<Record<string, number>> {
  const gameLogsCount = await sqlClient`
    SELECT COUNT(*) as count FROM game_logs WHERE user_id = ${userId}
  `;

  const friendshipsCount = await sqlClient`
    SELECT COUNT(*) as count FROM friendships WHERE user_id = ${userId} OR friend_id = ${userId}
  `;

  const commentsCount = await sqlClient`
    SELECT COUNT(*) as count FROM comments WHERE user_id = ${userId}
  `;

  const reactionsCount = await sqlClient`
    SELECT COUNT(*) as count FROM reactions WHERE user_id = ${userId}
  `;

  const notificationsCount = await sqlClient`
    SELECT COUNT(*) as count FROM notifications WHERE user_id = ${userId}
  `;

  return {
    game_logs: Number(gameLogsCount[0]?.count || 0),
    friendships: Number(friendshipsCount[0]?.count || 0),
    comments: Number(commentsCount[0]?.count || 0),
    reactions: Number(reactionsCount[0]?.count || 0),
    notifications: Number(notificationsCount[0]?.count || 0),
  };
}

async function cleanupTestData(userId: string, friendId: string, gameId: string): Promise<void> {
  try {
    // Delete in reverse order to avoid foreign key constraint issues
    await sqlClient`DELETE FROM notifications WHERE user_id IN (${userId}, ${friendId})`;
    await sqlClient`DELETE FROM reactions WHERE user_id IN (${userId}, ${friendId})`;
    await sqlClient`DELETE FROM comments WHERE user_id IN (${userId}, ${friendId})`;
    await sqlClient`DELETE FROM friendships WHERE user_id IN (${userId}, ${friendId}) OR friend_id IN (${userId}, ${friendId})`;
    await sqlClient`DELETE FROM game_logs WHERE user_id IN (${userId}, ${friendId})`;
    await sqlClient`DELETE FROM users WHERE id IN (${userId}, ${friendId})`;
    await sqlClient`DELETE FROM nba_games WHERE id = ${gameId}`;
  } catch (error) {
    logger.warn('Error during cleanup (this is usually expected):', error);
  }
}

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testCascadeDelete()
    .then(() => {
      logger.info('Test completed successfully');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Test failed:', error);
      process.exit(1);
    });
}

export { testCascadeDelete };
