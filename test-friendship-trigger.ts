#!/usr/bin/env tsx

import 'dotenv-flow/config';

import { neon } from '@neondatabase/serverless';

import { logger } from '@lib/core/logger';

// Create a SQL client instance
const sqlClient = neon(process.env.DATABASE_URL!);

async function testFriendshipTrigger(): Promise<void> {
  try {
    logger.info('🧪 Testing Friendship Notification Trigger...');
    logger.info('================================================');

    // Clean up any existing test data
    logger.info('🧹 Cleaning up existing test data...');
    await sqlClient`DELETE FROM notifications WHERE user_id LIKE 'test_friend_%'`;
    await sqlClient`DELETE FROM friendships WHERE user_id LIKE 'test_friend_%' OR friend_id LIKE 'test_friend_%'`;
    await sqlClient`DELETE FROM users WHERE id LIKE 'test_friend_%'`;

    // Create test users
    logger.info('👥 Creating test users...');
    await sqlClient`
      INSERT INTO users (id, username, first_name, last_name, email_address, created_at, updated_at)
      VALUES
        ('test_friend_user1', 'testfriend1', 'Test', 'Friend1', 'testfriend1@example.com', NOW(), NOW()),
        ('test_friend_user2', 'testfriend2', 'Test', 'Friend2', 'testfriend2@example.com', NOW(), NOW())
    `;

    // Test 1: Send friend request (should create notification)
    logger.info('📤 Testing friend request notification...');
    await sqlClient`
      INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
      VALUES (gen_random_uuid()::text, 'test_friend_user1', 'test_friend_user2', 'Pending', NOW(), NOW())
    `;

    // Check if notification was created
    const friendRequestNotifications = await sqlClient`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = 'test_friend_user2' AND type = 'friend_request'
    `;

    const friendRequestCount = Number(friendRequestNotifications[0]?.count ?? 0);
    logger.info(`✅ Friend request notifications created: ${friendRequestCount}`);

    // Test 2: Accept friend request (should create notification)
    logger.info('✅ Testing friend request acceptance notification...');
    await sqlClient`
      UPDATE friendships
      SET status = 'Accepted', updated_at = NOW()
      WHERE user_id = 'test_friend_user1' AND friend_id = 'test_friend_user2'
    `;

    // Check if acceptance notification was created
    const acceptNotifications = await sqlClient`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = 'test_friend_user1' AND type = 'friend_request_accepted'
    `;

    const acceptCount = Number(acceptNotifications[0]?.count ?? 0);
    logger.info(`✅ Friend request acceptance notifications created: ${acceptCount}`);

    // Show all notifications created
    logger.info('📋 All notifications created:');
    const allNotifications = await sqlClient`
      SELECT type, title, message, user_id, created_at
      FROM notifications
      WHERE user_id LIKE 'test_friend_%'
      ORDER BY created_at
    `;

    allNotifications.forEach((notification, index) => {
      logger.info(
        `${index + 1}. ${notification.type}: ${notification.title} - ${notification.message} (to: ${notification.user_id})`
      );
    });

    // Summary
    const totalNotifications = friendRequestCount + acceptCount;
    logger.info('\n📊 Test Summary:');
    logger.info(`- Friend request notifications: ${friendRequestCount}`);
    logger.info(`- Friend request acceptance notifications: ${acceptCount}`);
    logger.info(`- Total notifications: ${totalNotifications}`);

    if (totalNotifications >= 2) {
      logger.info('🎉 SUCCESS: Friendship notification trigger is working correctly!');
    } else {
      logger.error('❌ FAILURE: Friendship notification trigger is not working properly.');
    }
  } catch (error) {
    logger.error('❌ Error during friendship trigger test:', error);
    throw error;
  } finally {
    // Clean up
    logger.info('🧹 Cleaning up test data...');
    try {
      await sqlClient`DELETE FROM notifications WHERE user_id LIKE 'test_friend_%'`;
      await sqlClient`DELETE FROM friendships WHERE user_id LIKE 'test_friend_%' OR friend_id LIKE 'test_friend_%'`;
      await sqlClient`DELETE FROM users WHERE id LIKE 'test_friend_%'`;
    } catch (cleanupError) {
      logger.warn('⚠️ Error during cleanup:', cleanupError);
    }
  }
}

// Run the test
testFriendshipTrigger()
  .then(() => {
    logger.info('✅ Friendship trigger test completed');
    process.exit(0);
  })
  .catch(error => {
    logger.error('❌ Friendship trigger test failed:', error);
    process.exit(1);
  });
