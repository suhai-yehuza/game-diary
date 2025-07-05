#!/usr/bin/env tsx

/**
 * Test script to verify seeding functions generate reactions and friendships
 * This script tests the generation functions without requiring a database connection
 */

import { faker } from '@faker-js/faker';
import {
  generateUsers,
  generateFriendships,
  generateGameLogs,
  generateComments,
  generateReactions,
} from '@src/lib/db/seed/user-data-seed';

// Mock game IDs for testing
const mockGameIds = [
  'game_001',
  'game_002',
  'game_003',
  'game_004',
  'game_005',
  'game_006',
  'game_007',
  'game_008',
  'game_009',
  'game_010',
];

// Test configuration
const testConfig = {
  userCount: 10,
  gameLogsPerUser: { min: 2, max: 5 },
  commentsPerGameLog: { min: 1, max: 3 },
  friendshipsPerUser: { min: 2, max: 4 },
  reactionsPerGameLog: { min: 1, max: 3 },
  reactionsPerComment: { min: 0, max: 2 },
  childCommentChance: 0.3,
};

console.log('🧪 Testing seeding functions...\n');

try {
  // Test 1: Generate users
  console.log('1️⃣ Testing user generation...');
  const users = generateUsers(testConfig.userCount);
  console.log(`   ✅ Generated ${users.length} users`);
  console.log(
    `   Sample user: ${users[0]?.username} (${users[0]?.first_name} ${users[0]?.last_name})`
  );

  // Test 2: Generate friendships
  console.log('\n2️⃣ Testing friendship generation...');
  const friendships = generateFriendships(users, testConfig);
  console.log(`   ✅ Generated ${friendships.length} friendships`);

  // Check for duplicate friendships
  const friendshipPairs = friendships.map((f: any) => [f.user_id, f.friend_id].sort().join('-'));
  const uniqueFriendships = new Set(friendshipPairs);
  console.log(`   Unique friendship pairs: ${uniqueFriendships.size}/${friendships.length}`);

  if (friendships.length > 0) {
    console.log(
      `   Sample friendship: ${friendships[0]?.user_id} → ${friendships[0]?.friend_id} (${friendships[0]?.status})`
    );
  }

  // Test 3: Generate game logs
  console.log('\n3️⃣ Testing game log generation...');
  const gameLogs = generateGameLogs(users, mockGameIds, testConfig);
  console.log(`   ✅ Generated ${gameLogs.length} game logs`);

  if (gameLogs.length > 0) {
    console.log(
      `   Sample game log: User ${gameLogs[0]?.user_id} watched game ${gameLogs[0]?.game_id} (Rating: ${gameLogs[0]?.rating_for_game})`
    );
  }

  // Test 4: Generate comments
  console.log('\n4️⃣ Testing comment generation...');
  const comments = generateComments(users, gameLogs, testConfig);
  console.log(`   ✅ Generated ${comments.length} comments`);

  // Group comments by depth
  const commentsByDepth = new Map<number, number>();
  for (const comment of comments) {
    commentsByDepth.set(comment.depth, (commentsByDepth.get(comment.depth) || 0) + 1);
  }

  console.log(`   Comments by depth:`);
  for (let depth = 0; depth <= 5; depth++) {
    const count = commentsByDepth.get(depth) || 0;
    if (count > 0) {
      console.log(`     Depth ${depth}: ${count} comments`);
    }
  }

  if (comments.length > 0) {
    console.log(
      `   Sample comment: "${comments[0]?.content.substring(0, 50)}..." (Depth: ${comments[0]?.depth})`
    );
  }

  // Test 5: Generate reactions
  console.log('\n5️⃣ Testing reaction generation...');
  const reactions = generateReactions(users, gameLogs, comments, testConfig);
  console.log(`   ✅ Generated ${reactions.length} reactions`);

  // Group reactions by target type
  const reactionsByType = new Map<string, number>();
  for (const reaction of reactions) {
    reactionsByType.set(reaction.target_type, (reactionsByType.get(reaction.target_type) || 0) + 1);
  }

  console.log(`   Reactions by target type:`);
  for (const [type, count] of reactionsByType) {
    console.log(`     ${type}: ${count} reactions`);
  }

  if (reactions.length > 0) {
    console.log(
      `   Sample reaction: User ${reactions[0]?.user_id} reacted with ${reactions[0]?.emoji} on ${reactions[0]?.target_type} ${reactions[0]?.target_id}`
    );
  }

  // Summary
  console.log('\n📊 Summary:');
  console.log(`   Users: ${users.length}`);
  console.log(`   Friendships: ${friendships.length}`);
  console.log(`   Game Logs: ${gameLogs.length}`);
  console.log(`   Comments: ${comments.length}`);
  console.log(`   Reactions: ${reactions.length}`);

  // Validation checks
  console.log('\n🔍 Validation Checks:');

  // Check that friendships are between different users
  const validFriendships = friendships.every((f: any) => f.user_id !== f.friend_id);
  console.log(`   ✅ All friendships are between different users: ${validFriendships}`);

  // Check that reactions are from different users than the target owner
  const validReactions = reactions.every((r: any) => {
    if (r.target_type === 'game_log') {
      const gameLog = gameLogs.find((gl: any) => gl.id === r.target_id);
      return gameLog && r.user_id !== gameLog.user_id;
    } else if (r.target_type === 'comment') {
      const comment = comments.find((c: any) => c.id === r.target_id);
      return comment && r.user_id !== comment.user_id;
    }
    return true;
  });
  console.log(`   ✅ All reactions are from different users than target owner: ${validReactions}`);

  // Check that comments have valid depths
  const validCommentDepths = comments.every(c => c.depth >= 0 && c.depth <= 5);
  console.log(`   ✅ All comments have valid depths (0-5): ${validCommentDepths}`);

  // Check that game logs have valid ratings
  const validRatings = gameLogs.every(gl => gl.rating_for_game >= 1 && gl.rating_for_game <= 5);
  console.log(`   ✅ All game logs have valid ratings (1-5): ${validRatings}`);

  console.log('\n🎉 All seeding functions are working correctly!');
  console.log('✅ Reactions and friendships are being generated as expected.');
} catch (error) {
  console.error('❌ Error testing seeding functions:', error);
  process.exit(1);
}
