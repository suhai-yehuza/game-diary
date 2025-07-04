#!/usr/bin/env tsx

/**
 * Simplified test script to validate seeding dependencies and data integrity
 *
 * This script checks:
 * 1. Prerequisites are met (external API data exists)
 * 2. User data exists and has reasonable counts
 * 3. Auto-generated data (notifications, game ratings) exist
 * 4. Comment depth constraints are valid
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';

import { schema } from '@/lib/db/schema';

interface ValidationResult {
  test: string;
  passed: boolean;
  message: string;
  count?: number;
}

async function validateSeedingDependencies(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';
  if (!databaseUrl) {
    throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
  }

  const sqlClient = neon(databaseUrl);
  const db = drizzle(sqlClient, { schema });

  console.log('🔍 Validating seeding dependencies and data integrity...\n');

  const results: ValidationResult[] = [];

  try {
    // Test 1: Check prerequisites (external API data)
    console.log('📊 Checking prerequisites...');
    const teams = await db.select().from(schema.teams);
    const games = await db.select().from(schema.nba_games);
    const players = await db.select().from(schema.nba_players);

    results.push({
      test: 'External API Data - Teams',
      passed: teams.length > 0,
      message:
        teams.length > 0
          ? `Found ${teams.length} teams`
          : 'No teams found - run seed:external first',
      count: teams.length,
    });

    results.push({
      test: 'External API Data - Games',
      passed: games.length > 0,
      message:
        games.length > 0
          ? `Found ${games.length} games`
          : 'No games found - run seed:external first',
      count: games.length,
    });

    results.push({
      test: 'External API Data - Players',
      passed: players.length > 0,
      message:
        players.length > 0
          ? `Found ${players.length} players`
          : 'No players found - run seed:external first',
      count: players.length,
    });

    // Test 2: Check user data exists
    console.log('👥 Checking user data...');
    const users = await db.select().from(schema.users);
    const friendships = await db.select().from(schema.friendships);
    const gameLogs = await db.select().from(schema.game_logs);
    const comments = await db.select().from(schema.comments);
    const reactions = await db.select().from(schema.reactions);

    results.push({
      test: 'User Data - Users',
      passed: users.length > 0,
      message:
        users.length > 0 ? `Found ${users.length} users` : 'No users found - run seed:user first',
      count: users.length,
    });

    results.push({
      test: 'User Data - Friendships',
      passed: friendships.length > 0,
      message:
        friendships.length > 0 ? `Found ${friendships.length} friendships` : 'No friendships found',
      count: friendships.length,
    });

    results.push({
      test: 'User Data - Game Logs',
      passed: gameLogs.length > 0,
      message: gameLogs.length > 0 ? `Found ${gameLogs.length} game logs` : 'No game logs found',
      count: gameLogs.length,
    });

    results.push({
      test: 'User Data - Comments',
      passed: comments.length > 0,
      message: comments.length > 0 ? `Found ${comments.length} comments` : 'No comments found',
      count: comments.length,
    });

    results.push({
      test: 'User Data - Reactions',
      passed: reactions.length > 0,
      message: reactions.length > 0 ? `Found ${reactions.length} reactions` : 'No reactions found',
      count: reactions.length,
    });

    // Test 3: Check auto-generated data
    console.log('🔔 Checking auto-generated data...');
    const notifications = await db.select().from(schema.notifications);
    const gameRatings = await db.select().from(schema.game_ratings);

    results.push({
      test: 'Auto-Generated - Notifications',
      passed: notifications.length > 0,
      message:
        notifications.length > 0
          ? `Found ${notifications.length} notifications (auto-generated)`
          : 'No notifications found - triggers may not be working',
      count: notifications.length,
    });

    results.push({
      test: 'Auto-Generated - Game Ratings',
      passed: gameRatings.length > 0,
      message:
        gameRatings.length > 0
          ? `Found ${gameRatings.length} game ratings (auto-generated)`
          : 'No game ratings found - triggers may not be working',
      count: gameRatings.length,
    });

    // Test 4: Check comment depth constraints
    console.log('💬 Checking comment depth constraints...');

    // Comments with invalid depth (> 5)
    const invalidDepthComments = await db
      .select()
      .from(schema.comments)
      .where(sql`depth > 5`);

    results.push({
      test: 'Comment Depth - Max Depth',
      passed: invalidDepthComments.length === 0,
      message:
        invalidDepthComments.length === 0
          ? 'All comments have valid depth (≤ 5)'
          : `Found ${invalidDepthComments.length} comments with invalid depth (> 5)`,
      count: invalidDepthComments.length,
    });

    // Comments with negative depth
    const negativeDepthComments = await db
      .select()
      .from(schema.comments)
      .where(sql`depth < 0`);

    results.push({
      test: 'Comment Depth - Min Depth',
      passed: negativeDepthComments.length === 0,
      message:
        negativeDepthComments.length === 0
          ? 'All comments have valid depth (≥ 0)'
          : `Found ${negativeDepthComments.length} comments with negative depth`,
      count: negativeDepthComments.length,
    });

    // Test 5: Check game log uniqueness
    console.log('📝 Checking game log uniqueness...');

    // Check for duplicate game logs (should be 0 due to unique constraint)
    const duplicateGameLogs = (await db.execute(sql`
      SELECT user_id, game_id, COUNT(*) as count
      FROM game_logs
      GROUP BY user_id, game_id
      HAVING COUNT(*) > 1
    `)) as any;

    results.push({
      test: 'Game Log Uniqueness - No Duplicates',
      passed: duplicateGameLogs.rows.length === 0,
      message:
        duplicateGameLogs.rows.length === 0
          ? 'No duplicate game logs found (unique constraint working)'
          : `Found ${duplicateGameLogs.rows.length} duplicate game log combinations`,
      count: duplicateGameLogs.rows.length,
    });

    // Test 6: Check reaction uniqueness
    console.log('👍 Checking reaction uniqueness...');

    // Check for duplicate reactions (should be 0 due to unique constraint)
    const duplicateReactions = (await db.execute(sql`
      SELECT user_id, target_type, target_id, emoji, COUNT(*) as count
      FROM reactions
      GROUP BY user_id, target_type, target_id, emoji
      HAVING COUNT(*) > 1
    `)) as any;

    results.push({
      test: 'Reaction Uniqueness - No Duplicates',
      passed: duplicateReactions.rows.length === 0,
      message:
        duplicateReactions.rows.length === 0
          ? 'No duplicate reactions found (unique constraint working)'
          : `Found ${duplicateReactions.rows.length} duplicate reaction combinations`,
      count: duplicateReactions.rows.length,
    });

    // Test 7: Check comment depth distribution
    console.log('📊 Checking comment depth distribution...');
    const depthDistribution = await db
      .select({
        depth: schema.comments.depth,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(schema.comments)
      .groupBy(schema.comments.depth)
      .orderBy(schema.comments.depth);

    console.log('   Comment depth distribution:');
    for (const row of depthDistribution) {
      console.log(`     Depth ${row.depth}: ${row.count} comments`);
    }

    // Test 8: Check data relationships (simple counts)
    console.log('🔗 Checking data relationships...');

    // Check if we have more game logs than users (reasonable expectation)
    const avgGameLogsPerUser = gameLogs.length / users.length;
    results.push({
      test: 'Data Relationships - Game Logs per User',
      passed: avgGameLogsPerUser >= 1,
      message: `Average ${avgGameLogsPerUser.toFixed(1)} game logs per user`,
      count: Math.round(avgGameLogsPerUser * 10) / 10,
    });

    // Check if we have more comments than game logs (reasonable expectation)
    const avgCommentsPerGameLog = comments.length / gameLogs.length;
    results.push({
      test: 'Data Relationships - Comments per Game Log',
      passed: avgCommentsPerGameLog >= 0.5,
      message: `Average ${avgCommentsPerGameLog.toFixed(1)} comments per game log`,
      count: Math.round(avgCommentsPerGameLog * 10) / 10,
    });

    // Check if we have reactions
    const avgReactionsPerGameLog = reactions.length / gameLogs.length;
    results.push({
      test: 'Data Relationships - Reactions per Game Log',
      passed: avgReactionsPerGameLog >= 0.5,
      message: `Average ${avgReactionsPerGameLog.toFixed(1)} reactions per game log`,
      count: Math.round(avgReactionsPerGameLog * 10) / 10,
    });

    // Print results
    console.log('\n📋 Validation Results:\n');
    let passedCount = 0;
    let totalCount = results.length;

    for (const result of results) {
      const status = result.passed ? '✅' : '❌';
      const countInfo = result.count !== undefined ? ` (${result.count})` : '';
      console.log(`${status} ${result.test}${countInfo}`);
      console.log(`   ${result.message}`);
      if (result.passed) passedCount++;
    }

    console.log(`\n📊 Summary: ${passedCount}/${totalCount} tests passed`);

    if (passedCount === totalCount) {
      console.log('🎉 All validation tests passed! Seeding dependencies are satisfied.');
    } else {
      console.log('⚠️  Some validation tests failed. Please check the issues above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during validation:', error);
    throw error;
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  validateSeedingDependencies()
    .then(() => {
      console.log('✅ Validation script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Validation script failed:', error);
      process.exit(1);
    });
}
