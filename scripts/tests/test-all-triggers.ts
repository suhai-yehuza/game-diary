#!/usr/bin/env tsx

import 'dotenv-flow/config';

import { sql } from 'drizzle-orm';
import { neon } from '@neondatabase/serverless';

import { logger } from '../../src/lib/utils/logger';
import { createDatabaseClient } from '@src/lib/db';
import { generateId } from '@src/lib/utils/id-generator';

// Check if we're in CI and handle missing DATABASE_URL gracefully
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
if (isCI && !process.env.DATABASE_URL) {
  logger.warn('⚠️ DATABASE_URL not found in CI environment. Skipping trigger tests.');
  logger.info('✅ Trigger tests skipped in CI environment (no DATABASE_URL available)');
  process.exit(0);
}

// Configure neon for better stability
import { neonConfig } from '@neondatabase/serverless';
neonConfig.wsProxy = host => `${host}:5432/v1`;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = true;
neonConfig.pipelineConnect = false;

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
  error?: string;
}

class TriggerValidator {
  private db: ReturnType<typeof createDatabaseClient>;
  private results: TestResult[] = [];
  private environment: string;

  constructor(environment = 'development') {
    this.environment = environment;
    this.db = createDatabaseClient({ env: environment });
  }

  // Static method for global cleanup
  static async globalCleanup(environment = 'development') {
    const db = createDatabaseClient({ env: environment });
    await db.execute(
      sql`DELETE FROM game_logs WHERE id LIKE 'testtrig_%' OR user_id LIKE 'testtrig_%'`
    );
    await db.execute(sql`DELETE FROM game_ratings WHERE game_id LIKE 'testtrig_%'`);
    await db.execute(sql`DELETE FROM users WHERE id LIKE 'testtrig_%'`);
  }

  private async getTestUsers(): Promise<{ user1Id: string; user2Id: string }> {
    const users = (await this.db.execute(sql`
      SELECT id FROM users ORDER BY created_at ASC LIMIT 2
    `)) as any;
    if (!users.rows || users.rows.length < 2) {
      throw new Error('Not enough users in database. Please seed at least two users.');
    }
    return { user1Id: users.rows[0].id, user2Id: users.rows[1].id };
  }

  private async getTestGame(): Promise<string> {
    // Always use two test teams with string IDs
    const homeTeamId = 'test_team_1';
    const awayTeamId = 'test_team_2';

    // Insert test teams if they do not exist
    await this.db.execute(sql`
      INSERT INTO teams (id, name, nickname, code, city, nba_franchise, created_at, updated_at)
      VALUES (${homeTeamId}, 'Test Home Team', 'THT', 'THT', 'Test City', true, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `);
    await this.db.execute(sql`
      INSERT INTO teams (id, name, nickname, code, city, nba_franchise, created_at, updated_at)
      VALUES (${awayTeamId}, 'Test Away Team', 'TAT', 'TAT', 'Test City', true, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `);

    // Create a unique test NBA game id (max 20 chars)
    const gameId = `ttg_${generateId().replace(/-/g, '').slice(0, 16)}`; // 'ttg_' + 16 chars = 19 chars, fits varchar(20)

    // Insert a test NBA game with error logging
    try {
      await this.db.execute(sql`
        INSERT INTO nba_games (id, game_type, date, home_team_id, away_team_id, status, created_at, updated_at)
        VALUES (${gameId}, 'nba', NOW(), ${homeTeamId}, ${awayTeamId}, 'Final', NOW(), NOW())
      `);
    } catch (error: any) {
      console.error('nba_games insert error:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error detail:', error.detail);
      throw error;
    }

    return gameId;
  }

  async runAllTests(): Promise<void> {
    logger.info('🧪 Starting Comprehensive Trigger Validation...\n');

    const tests = [
      { name: 'Game Ratings - Insert', test: this.testGameRatingsInsert.bind(this) },
      { name: 'Game Ratings - Update', test: this.testGameRatingsUpdate.bind(this) },
      { name: 'Game Ratings - Delete', test: this.testGameRatingsDelete.bind(this) },
      { name: 'Comment Notifications - Game Log', test: this.testCommentOnGameLog.bind(this) },
      { name: 'Comment Notifications - Reply', test: this.testCommentReply.bind(this) },
      { name: 'Comment Notifications - Self Comment', test: this.testSelfComment.bind(this) },
      { name: 'Reaction Notifications - Game Log', test: this.testReactionOnGameLog.bind(this) },
      { name: 'Reaction Notifications - Comment', test: this.testReactionOnComment.bind(this) },
      { name: 'Reaction Notifications - Self Reaction', test: this.testSelfReaction.bind(this) },
      { name: 'Friendship Notifications - Request', test: this.testFriendRequest.bind(this) },
      { name: 'Friendship Notifications - Accept', test: this.testFriendAccept.bind(this) },
      { name: 'Friendship Notifications - Reject', test: this.testFriendReject.bind(this) },
      { name: 'Friendship Notifications - Remove', test: this.testFriendRemove.bind(this) },
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.test);
    }

    this.printResults();
  }

  private async runTest(name: string, testFn: () => Promise<boolean>): Promise<void> {
    logger.info(`\n📋 Running: ${name}`);

    let passed = false;
    let details = '';
    let error = '';

    try {
      passed = await testFn();
      details = passed ? '✅ Test passed' : '❌ Test failed';
    } catch (err) {
      passed = false;
      error = err instanceof Error ? err.message : String(err);
      details = `❌ Test error: ${error}`;
    }

    this.results.push({
      name,
      passed,
      details,
      error: error || undefined,
    });

    logger.info(`   Result: ${details}\n`);
  }

  // ============================================================================
  // GAME RATINGS TRIGGER TESTS
  // ============================================================================

  private async testGameRatingsInsert(): Promise<boolean> {
    try {
      const gameId = await this.getTestGame();
      const userId1 = `testtrig_user_${generateId()}`;
      const userId2 = `testtrig_user_${generateId()}`;
      // Insert two users
      await this.db.execute(sql`
        INSERT INTO users (id, username, email_address, created_at, updated_at)
        VALUES (${userId1}, 'user1', ${userId1 + '@test.com'}, NOW(), NOW()),
               (${userId2}, 'user2', ${userId2 + '@test.com'}, NOW(), NOW())
      `);
      // Insert two game_logs for the same game, different users, different ratings
      await this.db.execute(sql`
        INSERT INTO game_logs (id, user_id, game_id, watched_date, rating_for_game, created_at, updated_at)
        VALUES
          (${generateId()}, ${userId1}, ${gameId}, NOW(), 4, NOW(), NOW()),
          (${generateId()}, ${userId2}, ${gameId}, NOW(), 2, NOW(), NOW())
      `);
      // Validate average and total ratings
      const ratings = (await this.db.execute(sql`
        SELECT average_rating, total_ratings FROM game_ratings WHERE game_id = ${gameId}
      `)) as any;
      const avg = parseFloat(ratings.rows[0]?.average_rating);
      const total = parseInt(ratings.rows[0]?.total_ratings, 10);
      if (avg === 3 && total === 2) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      throw e;
    }
  }

  private async testGameRatingsUpdate(): Promise<boolean> {
    try {
      const gameId = await this.getTestGame();
      const userId1 = `testtrig_user_${generateId()}`;
      const userId2 = `testtrig_user_${generateId()}`;
      // Insert two users
      await this.db.execute(sql`
        INSERT INTO users (id, username, email_address, created_at, updated_at)
        VALUES (${userId1}, 'user1', ${userId1 + '@test.com'}, NOW(), NOW()),
               (${userId2}, 'user2', ${userId2 + '@test.com'}, NOW(), NOW())
      `);
      // Insert two game_logs for the same game, different users, different ratings
      const logId1 = generateId();
      const logId2 = generateId();
      await this.db.execute(sql`
        INSERT INTO game_logs (id, user_id, game_id, watched_date, rating_for_game, created_at, updated_at)
        VALUES
          (${logId1}, ${userId1}, ${gameId}, NOW(), 4, NOW(), NOW()),
          (${logId2}, ${userId2}, ${gameId}, NOW(), 2, NOW(), NOW())
      `);
      // Update one rating
      await this.db.execute(sql`
        UPDATE game_logs SET rating_for_game = 5 WHERE id = ${logId1}
      `);
      // Validate average and total ratings
      const ratings = (await this.db.execute(sql`
        SELECT average_rating, total_ratings FROM game_ratings WHERE game_id = ${gameId}
      `)) as any;
      const avg = parseFloat(ratings.rows[0]?.average_rating);
      const total = parseInt(ratings.rows[0]?.total_ratings, 10);
      if (avg === 3.5 && total === 2) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      throw e;
    }
  }

  private async testGameRatingsDelete(): Promise<boolean> {
    try {
      const gameId = await this.getTestGame();
      const userId1 = `testtrig_user_${generateId()}`;
      const userId2 = `testtrig_user_${generateId()}`;
      // Insert two users
      await this.db.execute(sql`
        INSERT INTO users (id, username, email_address, created_at, updated_at)
        VALUES (${userId1}, 'user1', ${userId1 + '@test.com'}, NOW(), NOW()),
               (${userId2}, 'user2', ${userId2 + '@test.com'}, NOW(), NOW())
      `);
      // Insert two game_logs for the same game, different users, different ratings
      const logId1 = generateId();
      const logId2 = generateId();
      await this.db.execute(sql`
        INSERT INTO game_logs (id, user_id, game_id, watched_date, rating_for_game, created_at, updated_at)
        VALUES
          (${logId1}, ${userId1}, ${gameId}, NOW(), 4, NOW(), NOW()),
          (${logId2}, ${userId2}, ${gameId}, NOW(), 2, NOW(), NOW())
      `);
      // Delete one log
      await this.db.execute(sql`
        DELETE FROM game_logs WHERE id = ${logId1}
      `);
      // Validate average and total ratings
      const ratings = (await this.db.execute(sql`
        SELECT average_rating, total_ratings FROM game_ratings WHERE game_id = ${gameId}
      `)) as any;
      const avg = parseFloat(ratings.rows[0]?.average_rating);
      const total = parseInt(ratings.rows[0]?.total_ratings, 10);
      if (avg === 2 && total === 1) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      throw e;
    }
  }

  // ============================================================================
  // COMMENT NOTIFICATION TRIGGER TESTS
  // ============================================================================

  private async testCommentOnGameLog(): Promise<boolean> {
    const user1Id = `testtrig_user_${generateId()}`;
    const user2Id = `testtrig_user_${generateId()}`;
    const gameId = await this.getTestGame();
    const gameLogId = `testtrig_gamelog_${generateId()}`;
    const commentId = `test_comment_${generateId()}`;

    try {
      // Create test users
      await this.db.execute(sql`
        INSERT INTO users (id, username, email_address, created_at, updated_at)
        VALUES (${user1Id}, 'user1', ${user1Id + '@test.com'}, NOW(), NOW()),
               (${user2Id}, 'user2', ${user2Id + '@test.com'}, NOW(), NOW())
      `);

      // Create test game log
      await this.db.execute(sql`
        INSERT INTO game_logs (id, user_id, game_id, notes, rating_for_game, watched_date, created_at, updated_at)
        VALUES (${gameLogId}, ${user1Id}, ${gameId}, 'Test game log', 5, NOW(), NOW(), NOW())
      `);

      // Get notification count before
      const beforeCount = (await this.db.execute(sql`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user1Id}
      `)) as any;

      // Create comment
      await this.db.execute(sql`
        INSERT INTO comments (id, user_id, parent_id, parent_type, content, depth, created_at, updated_at)
        VALUES (${commentId}, ${user2Id}, ${gameLogId}, 'GAME_LOG', 'Great game!', 0, NOW(), NOW())
      `);

      // Check if notification was created
      const afterCount = (await this.db.execute(sql`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user1Id}
      `)) as any;

      if (afterCount.rows[0].count <= beforeCount.rows[0].count) {
        throw new Error('Notification was not created for comment on game log');
      }

      return true;
    } finally {
      // Cleanup
      await this.db.execute(sql`DELETE FROM comments WHERE id = ${commentId}`);
      await this.db.execute(sql`DELETE FROM game_logs WHERE id = ${gameLogId}`);
      await this.db.execute(sql`DELETE FROM users WHERE id IN (${user1Id}, ${user2Id})`);
    }
  }

  private async testCommentReply(): Promise<boolean> {
    const user1Id = `testtrig_user_${generateId()}`;
    const user2Id = `testtrig_user_${generateId()}`;
    const gameId = await this.getTestGame();
    const gameLogId = `testtrig_gamelog_${generateId()}`;
    const parentCommentId = `test_parent_comment_${generateId()}`;
    const replyId = `test_reply_${generateId()}`;

    try {
      // Create test users
      await this.db.execute(sql`
        INSERT INTO users (id, username, email_address, created_at, updated_at)
        VALUES (${user1Id}, 'user1', ${user1Id + '@test.com'}, NOW(), NOW()),
               (${user2Id}, 'user2', ${user2Id + '@test.com'}, NOW(), NOW())
      `);

      // Create test game log
      await this.db.execute(sql`
        INSERT INTO game_logs (id, user_id, game_id, notes, rating_for_game, watched_date, created_at, updated_at)
        VALUES (${gameLogId}, ${user1Id}, ${gameId}, 'Test game log', 5, NOW(), NOW(), NOW())
      `);

      // Create parent comment
      await this.db.execute(sql`
        INSERT INTO comments (id, user_id, parent_id, parent_type, content, depth, created_at, updated_at)
        VALUES (${parentCommentId}, ${user2Id}, ${gameLogId}, 'GAME_LOG', 'Parent comment', 0, NOW(), NOW())
      `);

      // Get notification count before
      const beforeCount = (await this.db.execute(sql`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user2Id}
      `)) as any;

      // Create reply
      await this.db.execute(sql`
        INSERT INTO comments (id, user_id, parent_id, parent_type, content, depth, created_at, updated_at)
        VALUES (${replyId}, ${user1Id}, ${parentCommentId}, 'COMMENT', 'Reply to comment', 1, NOW(), NOW())
      `);

      // Check if notification was created
      const afterCount = (await this.db.execute(sql`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user2Id}
      `)) as any;

      if (afterCount.rows[0].count <= beforeCount.rows[0].count) {
        throw new Error('Notification was not created for comment reply');
      }

      return true;
    } finally {
      // Cleanup
      await this.db.execute(sql`DELETE FROM comments WHERE id IN (${replyId}, ${parentCommentId})`);
      await this.db.execute(sql`DELETE FROM game_logs WHERE id = ${gameLogId}`);
      await this.db.execute(sql`DELETE FROM users WHERE id IN (${user1Id}, ${user2Id})`);
    }
  }

  private async testSelfComment(): Promise<boolean> {
    const user1Id = `testtrig_user_${generateId()}`;
    const gameId = await this.getTestGame();
    const gameLogId = `testtrig_gamelog_${generateId()}`;
    const commentId = `test_self_comment_${generateId()}`;

    try {
      // Create test user
      await this.db.execute(sql`
        INSERT INTO users (id, username, email_address, created_at, updated_at)
        VALUES (${user1Id}, 'user1', ${user1Id + '@test.com'}, NOW(), NOW())
      `);

      // Create test game log
      await this.db.execute(sql`
        INSERT INTO game_logs (id, user_id, game_id, notes, rating_for_game, watched_date, created_at, updated_at)
        VALUES (${gameLogId}, ${user1Id}, ${gameId}, 'Test game log', 5, NOW(), NOW(), NOW())
      `);

      // Get notification count before
      const beforeCount = (await this.db.execute(sql`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user1Id}
      `)) as any;

      // Create self-comment
      await this.db.execute(sql`
        INSERT INTO comments (id, user_id, parent_id, parent_type, content, depth, created_at, updated_at)
        VALUES (${commentId}, ${user1Id}, ${gameLogId}, 'GAME_LOG', 'Self comment', 0, NOW(), NOW())
      `);

      // Check that no notification was created
      const afterCount = (await this.db.execute(sql`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user1Id}
      `)) as any;

      if (afterCount.rows[0].count !== beforeCount.rows[0].count) {
        throw new Error('Notification was created for self-comment (should not happen)');
      }

      return true;
    } finally {
      // Cleanup
      await this.db.execute(sql`DELETE FROM comments WHERE id = ${commentId}`);
      await this.db.execute(sql`DELETE FROM game_logs WHERE id = ${gameLogId}`);
      await this.db.execute(sql`DELETE FROM users WHERE id = ${user1Id}`);
    }
  }

  // ============================================================================
  // REACTION NOTIFICATION TRIGGER TESTS
  // ============================================================================

  private async testReactionOnGameLog(): Promise<boolean> {
    const user1Id = `testtrig_user_${generateId()}`;
    const user2Id = `testtrig_user_${generateId()}`;
    const gameId = await this.getTestGame();
    const gameLogId = `testtrig_gamelog_${generateId()}`;
    const reactionId = `test_reaction_${generateId()}`;

    try {
      // Create test users
      await this.db.execute(sql`
        INSERT INTO users (id, username, email_address, created_at, updated_at)
        VALUES (${user1Id}, 'user1', ${user1Id + '@test.com'}, NOW(), NOW()),
               (${user2Id}, 'user2', ${user2Id + '@test.com'}, NOW(), NOW())
      `);

      // Create test game log
      await this.db.execute(sql`
        INSERT INTO game_logs (id, user_id, game_id, notes, rating_for_game, watched_date, created_at, updated_at)
        VALUES (${gameLogId}, ${user1Id}, ${gameId}, 'Test game log', 5, NOW(), NOW(), NOW())
      `);

      // Get notification count before
      const beforeCount = (await this.db.execute(sql`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user1Id}
      `)) as any;

      // Create reaction
      await this.db.execute(sql`
        INSERT INTO reactions (id, user_id, target_id, target_type, emoji, created_at, updated_at)
        VALUES (${reactionId}, ${user2Id}, ${gameLogId}, 'GAME_LOG', '👍', NOW(), NOW())
      `);

      // Check if notification was created
      const afterCount = (await this.db.execute(sql`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user1Id}
      `)) as any;

      if (afterCount.rows[0].count <= beforeCount.rows[0].count) {
        throw new Error('Notification was not created for reaction on game log');
      }

      return true;
    } finally {
      // Cleanup
      await this.db.execute(sql`DELETE FROM reactions WHERE id = ${reactionId}`);
      await this.db.execute(sql`DELETE FROM game_logs WHERE id = ${gameLogId}`);
      await this.db.execute(sql`DELETE FROM users WHERE id IN (${user1Id}, ${user2Id})`);
    }
  }

  private async testReactionOnComment(): Promise<boolean> {
    const user1Id = `testtrig_user_${generateId()}`;
    const user2Id = `testtrig_user_${generateId()}`;
    const gameId = await this.getTestGame();
    const gameLogId = `testtrig_gamelog_${generateId()}`;
    const commentId = `test_comment_${generateId()}`;
    const reactionId = `test_reaction_${generateId()}`;

    try {
      // Create test users
      await this.db.execute(sql`
        INSERT INTO users (id, username, email_address, created_at, updated_at)
        VALUES (${user1Id}, 'user1', ${user1Id + '@test.com'}, NOW(), NOW()),
               (${user2Id}, 'user2', ${user2Id + '@test.com'}, NOW(), NOW())
      `);

      // Create test game log
      await this.db.execute(sql`
        INSERT INTO game_logs (id, user_id, game_id, notes, rating_for_game, watched_date, created_at, updated_at)
        VALUES (${gameLogId}, ${user1Id}, ${gameId}, 'Test game log', 5, NOW(), NOW(), NOW())
      `);

      // Create test comment
      await this.db.execute(sql`
        INSERT INTO comments (id, user_id, parent_id, parent_type, content, depth, created_at, updated_at)
        VALUES (${commentId}, ${user1Id}, ${gameLogId}, 'GAME_LOG', 'Test comment', 0, NOW(), NOW())
      `);

      // Get notification count before
      const beforeCount = (await this.db.execute(sql`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user1Id}
      `)) as any;

      // Create reaction
      await this.db.execute(sql`
        INSERT INTO reactions (id, user_id, target_id, target_type, emoji, created_at, updated_at)
        VALUES (${reactionId}, ${user2Id}, ${commentId}, 'COMMENT', '❤️', NOW(), NOW())
      `);

      // Check if notification was created
      const afterCount = (await this.db.execute(sql`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user1Id}
      `)) as any;

      if (afterCount.rows[0].count <= beforeCount.rows[0].count) {
        throw new Error('Notification was not created for reaction on comment');
      }

      return true;
    } finally {
      // Cleanup
      await this.db.execute(sql`DELETE FROM reactions WHERE id = ${reactionId}`);
      await this.db.execute(sql`DELETE FROM comments WHERE id = ${commentId}`);
      await this.db.execute(sql`DELETE FROM game_logs WHERE id = ${gameLogId}`);
      await this.db.execute(sql`DELETE FROM users WHERE id IN (${user1Id}, ${user2Id})`);
    }
  }

  private async testSelfReaction(): Promise<boolean> {
    const user1Id = `testtrig_user_${generateId()}`;
    const gameId = await this.getTestGame();
    const gameLogId = `testtrig_gamelog_${generateId()}`;
    const reactionId = `test_self_reaction_${generateId()}`;

    try {
      // Create test user
      await this.db.execute(sql`
        INSERT INTO users (id, username, email_address, created_at, updated_at)
        VALUES (${user1Id}, 'user1', ${user1Id + '@test.com'}, NOW(), NOW())
      `);

      // Create test game log
      await this.db.execute(sql`
        INSERT INTO game_logs (id, user_id, game_id, notes, rating_for_game, watched_date, created_at, updated_at)
        VALUES (${gameLogId}, ${user1Id}, ${gameId}, 'Test game log', 5, NOW(), NOW(), NOW())
      `);

      // Get notification count before
      const beforeCount = (await this.db.execute(sql`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user1Id}
      `)) as any;

      // Create self-reaction
      await this.db.execute(sql`
        INSERT INTO reactions (id, user_id, target_id, target_type, emoji, created_at, updated_at)
        VALUES (${reactionId}, ${user1Id}, ${gameLogId}, 'GAME_LOG', '👍', NOW(), NOW())
      `);

      // Check that no notification was created
      const afterCount = (await this.db.execute(sql`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user1Id}
      `)) as any;

      if (afterCount.rows[0].count !== beforeCount.rows[0].count) {
        throw new Error('Notification was created for self-reaction (should not happen)');
      }

      return true;
    } finally {
      // Cleanup
      await this.db.execute(sql`DELETE FROM reactions WHERE id = ${reactionId}`);
      await this.db.execute(sql`DELETE FROM game_logs WHERE id = ${gameLogId}`);
      await this.db.execute(sql`DELETE FROM users WHERE id = ${user1Id}`);
    }
  }

  // ============================================================================
  // FRIENDSHIP NOTIFICATION TRIGGER TESTS
  // ============================================================================

  private async testFriendRequest(): Promise<boolean> {
    const user1Id = `testtrig_user_${generateId()}`;
    const user2Id = `testtrig_user_${generateId()}`;
    const friendshipId = `testtrig_friendship_${generateId()}`;

    try {
      // Create test users
      await this.db.execute(sql`
        INSERT INTO users (id, username, email_address, created_at, updated_at)
        VALUES (${user1Id}, 'user1', ${user1Id + '@test.com'}, NOW(), NOW()),
               (${user2Id}, 'user2', ${user2Id + '@test.com'}, NOW(), NOW())
      `);

      // Get notification count before
      const beforeCount = (await this.db.execute(sql`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user2Id}
      `)) as any;

      // Create friend request
      await this.db.execute(sql`
        INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
        VALUES (${friendshipId}, ${user1Id}, ${user2Id}, 'PENDING', NOW(), NOW())
      `);

      // Check if notification was created
      const afterCount = (await this.db.execute(sql`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user2Id}
      `)) as any;

      if (afterCount.rows[0].count <= beforeCount.rows[0].count) {
        throw new Error('Notification was not created for friend request');
      }

      return true;
    } finally {
      // Cleanup
      await this.db.execute(sql`DELETE FROM friendships WHERE id = ${friendshipId}`);
      await this.db.execute(
        sql`DELETE FROM notifications WHERE user_id IN (${user1Id}, ${user2Id})`
      );
      await this.db.execute(sql`DELETE FROM users WHERE id IN (${user1Id}, ${user2Id})`);
    }
  }

  private async testFriendAccept(): Promise<boolean> {
    const user1Id = `testtrig_user_${generateId()}`;
    const user2Id = `testtrig_user_${generateId()}`;
    const friendshipId = `testtrig_friendship_${generateId()}`;

    try {
      // Create test users
      await this.db.execute(sql`
        INSERT INTO users (id, username, email_address, created_at, updated_at)
        VALUES (${user1Id}, 'user1', ${user1Id + '@test.com'}, NOW(), NOW()),
               (${user2Id}, 'user2', ${user2Id + '@test.com'}, NOW(), NOW())
      `);

      // Create pending friend request first
      await this.db.execute(sql`
        INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
        VALUES (${friendshipId}, ${user1Id}, ${user2Id}, 'PENDING', NOW(), NOW())
      `);

      // Get notification count before
      const beforeCount = (await this.db.execute(sql`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user1Id}
      `)) as any;

      // Accept friend request
      await this.db.execute(sql`
        UPDATE friendships SET status = 'ACCEPTED' WHERE id = ${friendshipId}
      `);

      // Check if notification was created
      const afterCount = (await this.db.execute(sql`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user1Id}
      `)) as any;

      if (afterCount.rows[0].count <= beforeCount.rows[0].count) {
        throw new Error('Notification was not created for friend request acceptance');
      }

      return true;
    } finally {
      // Cleanup
      await this.db.execute(sql`DELETE FROM friendships WHERE id = ${friendshipId}`);
      await this.db.execute(
        sql`DELETE FROM notifications WHERE user_id IN (${user1Id}, ${user2Id})`
      );
      await this.db.execute(sql`DELETE FROM users WHERE id IN (${user1Id}, ${user2Id})`);
    }
  }

  private async testFriendReject(): Promise<boolean> {
    const user1Id = `testtrig_user_${generateId()}`;
    const user2Id = `testtrig_user_${generateId()}`;
    const friendshipId = `testtrig_friendship_${generateId()}`;

    try {
      // Create test users
      await this.db.execute(sql`
        INSERT INTO users (id, username, email_address, created_at, updated_at)
        VALUES (${user1Id}, 'user1', ${user1Id + '@test.com'}, NOW(), NOW()),
               (${user2Id}, 'user2', ${user2Id + '@test.com'}, NOW(), NOW())
      `);

      // Create pending friend request first
      await this.db.execute(sql`
        INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
        VALUES (${friendshipId}, ${user1Id}, ${user2Id}, 'PENDING', NOW(), NOW())
      `);

      // Get notification count before
      const beforeCount = (await this.db.execute(sql`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user1Id}
      `)) as any;

      // Reject friend request
      await this.db.execute(sql`
        UPDATE friendships SET status = 'REJECTED' WHERE id = ${friendshipId}
      `);

      // Check if notification was created
      const afterCount = (await this.db.execute(sql`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user1Id}
      `)) as any;

      if (afterCount.rows[0].count <= beforeCount.rows[0].count) {
        throw new Error('Notification was not created for friend request rejection');
      }

      return true;
    } finally {
      // Cleanup
      await this.db.execute(sql`DELETE FROM friendships WHERE id = ${friendshipId}`);
      await this.db.execute(
        sql`DELETE FROM notifications WHERE user_id IN (${user1Id}, ${user2Id})`
      );
      await this.db.execute(sql`DELETE FROM users WHERE id IN (${user1Id}, ${user2Id})`);
    }
  }

  private async testFriendRemove(): Promise<boolean> {
    const user1Id = `testtrig_user_${generateId()}`;
    const user2Id = `testtrig_user_${generateId()}`;
    const friendshipId = `testtrig_friendship_${generateId()}`;

    try {
      // Create test users
      await this.db.execute(sql`
        INSERT INTO users (id, username, email_address, created_at, updated_at)
        VALUES (${user1Id}, 'user1', ${user1Id + '@test.com'}, NOW(), NOW()),
               (${user2Id}, 'user2', ${user2Id + '@test.com'}, NOW(), NOW())
      `);

      // Create accepted friendship first
      await this.db.execute(sql`
        INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
        VALUES (${friendshipId}, ${user1Id}, ${user2Id}, 'ACCEPTED', NOW(), NOW())
      `);

      // Get notification count before
      const beforeCount = (await this.db.execute(sql`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user2Id}
      `)) as any;

      // Delete friendship to trigger friend_removed notification
      await this.db.execute(sql`
        DELETE FROM friendships WHERE id = ${friendshipId}
      `);

      // Check if notification was created
      const afterCount = (await this.db.execute(sql`
        SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user2Id}
      `)) as any;

      if (afterCount.rows[0].count <= beforeCount.rows[0].count) {
        throw new Error('Notification was not created for friend removal');
      }

      return true;
    } finally {
      // Cleanup
      await this.db.execute(
        sql`DELETE FROM notifications WHERE user_id IN (${user1Id}, ${user2Id})`
      );
      await this.db.execute(sql`DELETE FROM users WHERE id IN (${user1Id}, ${user2Id})`);
    }
  }

  // ============================================================================
  // RESULTS REPORTING
  // ============================================================================

  private printResults(): void {
    logger.info('\n' + '='.repeat(80));
    logger.info('📊 COMPREHENSIVE TRIGGER VALIDATION RESULTS');
    logger.info('='.repeat(80));

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    logger.info(`\n🎯 Summary: ${passed}/${total} tests passed (${failed} failed)`);

    if (passed === total) {
      logger.info('🎉 All triggers are working correctly!');
    } else {
      logger.info('⚠️  Some triggers need attention.');
    }

    logger.info('\n📋 Detailed Results:');
    logger.info('-'.repeat(80));

    this.results.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌';
      logger.info(`${index + 1}. ${status} ${result.name}`);
      logger.info(`   ${result.details}`);
      if (result.error) {
        logger.info(`   Error: ${result.error}`);
      }
      logger.info('');
    });

    if (failed > 0) {
      logger.info('🔧 Troubleshooting Tips:');
      logger.info('1. Check that all triggers are properly installed in the database');
      logger.info('2. Verify trigger functions are correctly defined');
      logger.info('3. Ensure database permissions allow trigger execution');
      logger.info('4. Check database logs for any trigger execution errors');
    }

    logger.info('='.repeat(80));
  }
}

// Main execution
async function main(): Promise<void> {
  try {
    // Parse environment from command line arguments
    let environment = 'development';
    for (const arg of process.argv) {
      if (arg.startsWith('--env=')) {
        environment = arg.split('=')[1];
        break;
      }
    }

    logger.info(`🧪 Running trigger tests for ${environment} environment`);

    const validator = new TriggerValidator(environment);
    await validator.runAllTests();
    // Global cleanup to remove any leftover test data
    // Consider adding ON DELETE CASCADE to your schema for users/game_logs if appropriate
    await TriggerValidator.globalCleanup(environment);
  } catch (error) {
    logger.error('❌ Trigger validation failed:');
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
