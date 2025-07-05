#!/usr/bin/env tsx

/**
 * Test script to verify notification triggers work correctly
 *
 * This script tests the notification triggers for:
 * - Comment notifications (when someone comments on your game log/comment)
 * - Reaction notifications (when someone reacts to your content)
 *
 * Usage: tsx scripts/test-notification-triggers.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config();

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

interface TestUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
}

interface TestGameLog {
  id: string;
  user_id: string;
  notes: string;
}

interface TestComment {
  id: string;
  user_id: string;
  parent_id: string;
  parent_type: string;
  content: string;
}

interface TestReaction {
  id: string;
  user_id: string;
  target_id: string;
  target_type: string;
  emoji: string;
}

interface TestNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  target_id: string;
  target_type: string;
  created_at: Date;
}

async function testNotificationTriggers() {
  console.log('🧪 Testing Notification Triggers...\n');

  try {
    // Test 1: Comment on Game Log
    console.log('📝 Test 1: Comment on Game Log');
    await testCommentOnGameLog();
    console.log('✅ Comment on Game Log test passed\n');

    // Test 2: Reply to Comment
    console.log('💬 Test 2: Reply to Comment');
    await testReplyToComment();
    console.log('✅ Reply to Comment test passed\n');

    // Test 3: Reaction on Game Log
    console.log('👍 Test 3: Reaction on Game Log');
    await testReactionOnGameLog();
    console.log('✅ Reaction on Game Log test passed\n');

    // Test 4: Reaction on Comment
    console.log('❤️ Test 4: Reaction on Comment');
    await testReactionOnComment();
    console.log('✅ Reaction on Comment test passed\n');

    // Test 5: Self-Interaction Prevention
    console.log('🚫 Test 5: Self-Interaction Prevention');
    await testSelfInteractionPrevention();
    console.log('✅ Self-Interaction Prevention test passed\n');

    console.log('🎉 All notification trigger tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function testCommentOnGameLog() {
  // Create test users
  const user1 = await createTestUser('testuser1', 'John', 'Doe');
  const user2 = await createTestUser('testuser2', 'Jane', 'Smith');

  // Create test game log
  const gameLog = await createTestGameLog(user1.id, 'Amazing game!');

  // Create comment (user2 comments on user1's game log)
  const comment = await createTestComment(user2.id, gameLog.id, 'GAME_LOG', 'Great game!');

  // Check if notification was created
  const notifications = await getNotifications(user1.id);

  if (notifications.length === 0) {
    throw new Error('No notification created for comment on game log');
  }

  const notification = notifications[0];
  if (notification.type !== 'comment_added') {
    throw new Error(`Expected notification type 'comment_added', got '${notification.type}'`);
  }

  if (!notification.message.includes('Jane Smith commented on your game log')) {
    throw new Error(`Unexpected notification message: ${notification.message}`);
  }

  console.log(`   Created notification: ${notification.message}`);

  // Cleanup
  await cleanupTestData([user1.id, user2.id], [gameLog.id], [comment.id], []);
}

async function testReplyToComment() {
  // Create test users
  const user1 = await createTestUser('testuser3', 'Bob', 'Wilson');
  const user2 = await createTestUser('testuser4', 'Alice', 'Johnson');

  // Create test game log
  const gameLog = await createTestGameLog(user1.id, 'Another great game!');

  // Create initial comment
  const comment1 = await createTestComment(
    user1.id,
    gameLog.id,
    'GAME_LOG',
    'My thoughts on the game'
  );

  // Create reply (user2 replies to user1's comment)
  const comment2 = await createTestComment(user2.id, comment1.id, 'COMMENT', 'I agree with you!');

  // Check if notification was created
  const notifications = await getNotifications(user1.id);

  if (notifications.length === 0) {
    throw new Error('No notification created for comment reply');
  }

  const notification = notifications[0];
  if (notification.type !== 'comment_reply') {
    throw new Error(`Expected notification type 'comment_reply', got '${notification.type}'`);
  }

  if (!notification.message.includes('Alice Johnson replied to your comment')) {
    throw new Error(`Unexpected notification message: ${notification.message}`);
  }

  console.log(`   Created notification: ${notification.message}`);

  // Cleanup
  await cleanupTestData([user1.id, user2.id], [gameLog.id], [comment1.id, comment2.id], []);
}

async function testReactionOnGameLog() {
  // Create test users
  const user1 = await createTestUser('testuser5', 'Charlie', 'Brown');
  const user2 = await createTestUser('testuser6', 'Diana', 'Prince');

  // Create test game log
  const gameLog = await createTestGameLog(user1.id, 'Fantastic game!');

  // Create reaction (user2 reacts to user1's game log)
  const reaction = await createTestReaction(user2.id, gameLog.id, 'GAME_LOG', '👍');

  // Check if notification was created
  const notifications = await getNotifications(user1.id);

  if (notifications.length === 0) {
    throw new Error('No notification created for reaction on game log');
  }

  const notification = notifications[0];
  if (notification.type !== 'reaction_added') {
    throw new Error(`Expected notification type 'reaction_added', got '${notification.type}'`);
  }

  if (!notification.message.includes('Diana Prince reacted with 👍 to your game log')) {
    throw new Error(`Unexpected notification message: ${notification.message}`);
  }

  console.log(`   Created notification: ${notification.message}`);

  // Cleanup
  await cleanupTestData([user1.id, user2.id], [gameLog.id], [], [reaction.id]);
}

async function testReactionOnComment() {
  // Create test users
  const user1 = await createTestUser('testuser7', 'Eve', 'Adams');
  const user2 = await createTestUser('testuser8', 'Frank', 'Miller');

  // Create test game log
  const gameLog = await createTestGameLog(user1.id, 'Incredible game!');

  // Create comment
  const comment = await createTestComment(user1.id, gameLog.id, 'GAME_LOG', 'What a game!');

  // Create reaction (user2 reacts to user1's comment)
  const reaction = await createTestReaction(user2.id, comment.id, 'COMMENT', '❤️');

  // Check if notification was created
  const notifications = await getNotifications(user1.id);

  if (notifications.length === 0) {
    throw new Error('No notification created for reaction on comment');
  }

  const notification = notifications[0];
  if (notification.type !== 'reaction_added') {
    throw new Error(`Expected notification type 'reaction_added', got '${notification.type}'`);
  }

  if (!notification.message.includes('Frank Miller reacted with ❤️ to your comment')) {
    throw new Error(`Unexpected notification message: ${notification.message}`);
  }

  console.log(`   Created notification: ${notification.message}`);

  // Cleanup
  await cleanupTestData([user1.id, user2.id], [gameLog.id], [comment.id], [reaction.id]);
}

async function testSelfInteractionPrevention() {
  // Create test user
  const user = await createTestUser('testuser9', 'Grace', 'Hopper');

  // Create test game log
  const gameLog = await createTestGameLog(user.id, 'My own game!');

  // Create comment on own game log (should not create notification)
  const comment = await createTestComment(user.id, gameLog.id, 'GAME_LOG', 'My own comment');

  // Create reaction on own game log (should not create notification)
  const reaction = await createTestReaction(user.id, gameLog.id, 'GAME_LOG', '👍');

  // Check that no notifications were created
  const notifications = await getNotifications(user.id);

  if (notifications.length > 0) {
    throw new Error(`Self-interaction created ${notifications.length} notifications, expected 0`);
  }

  console.log('   No notifications created for self-interactions (correct behavior)');

  // Cleanup
  await cleanupTestData([user.id], [gameLog.id], [comment.id], [reaction.id]);
}

// Helper functions
async function createTestUser(
  username: string,
  firstName: string,
  lastName: string
): Promise<TestUser> {
  const id = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await client`
    INSERT INTO users (id, username, first_name, last_name, object)
    VALUES (${id}, ${username}, ${firstName}, ${lastName}, 'user')
  `;

  return { id, username, first_name: firstName, last_name: lastName };
}

async function createTestGameLog(userId: string, notes: string): Promise<TestGameLog> {
  const id = `test_gamelog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await client`
    INSERT INTO game_logs (id, user_id, game_id, notes, rating_for_game, watched_date, classification, watched_setting, watched_scope)
    VALUES (${id}, ${userId}, 'test_game_id', ${notes}, 5, NOW(), 'PROTECTED', 'TV', 'FULL_GAME')
  `;

  return { id, user_id: userId, notes };
}

async function createTestComment(
  userId: string,
  parentId: string,
  parentType: string,
  content: string
): Promise<TestComment> {
  const id = `test_comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await client`
    INSERT INTO comments (id, user_id, parent_id, parent_type, content)
    VALUES (${id}, ${userId}, ${parentId}, ${parentType}, ${content})
  `;

  return { id, user_id: userId, parent_id: parentId, parent_type: parentType, content };
}

async function createTestReaction(
  userId: string,
  targetId: string,
  targetType: string,
  emoji: string
): Promise<TestReaction> {
  const id = `test_reaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await client`
    INSERT INTO reactions (id, user_id, target_id, target_type, emoji)
    VALUES (${id}, ${userId}, ${targetId}, ${targetType}, ${emoji})
  `;

  return { id, user_id: userId, target_id: targetId, target_type: targetType, emoji };
}

async function getNotifications(userId: string): Promise<TestNotification[]> {
  const result = await client`
    SELECT id, user_id, type, title, message, target_id, target_type, created_at
    FROM notifications
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;

  return result as unknown as TestNotification[];
}

async function cleanupTestData(
  userIds: string[],
  gameLogIds: string[],
  commentIds: string[],
  reactionIds: string[]
) {
  // Delete in reverse order to respect foreign key constraints
  if (reactionIds.length > 0) {
    await client`DELETE FROM reactions WHERE id = ANY(${reactionIds})`;
  }

  if (commentIds.length > 0) {
    await client`DELETE FROM comments WHERE id = ANY(${commentIds})`;
  }

  if (gameLogIds.length > 0) {
    await client`DELETE FROM game_logs WHERE id = ANY(${gameLogIds})`;
  }

  if (userIds.length > 0) {
    await client`DELETE FROM users WHERE id = ANY(${userIds})`;
  }

  // Clean up any notifications created during tests
  await client`DELETE FROM notifications WHERE user_id = ANY(${userIds})`;
}

// Run the tests
if (require.main === module) {
  testNotificationTriggers().catch(console.error);
}
