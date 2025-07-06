-- Test friendship notification trigger
-- This script tests if the friendship notification trigger is working

-- Clean up any existing test data
DELETE FROM notifications WHERE user_id LIKE 'test_friend_%';
DELETE FROM friendships WHERE user_id LIKE 'test_friend_%' OR friend_id LIKE 'test_friend_%';
DELETE FROM users WHERE id LIKE 'test_friend_%';

-- Create test users
INSERT INTO users (id, username, first_name, last_name, email, created_at, updated_at)
VALUES
  ('test_friend_user1', 'testfriend1', 'Test', 'Friend1', 'testfriend1@example.com', NOW(), NOW()),
  ('test_friend_user2', 'testfriend2', 'Test', 'Friend2', 'testfriend2@example.com', NOW(), NOW());

-- Test 1: Send friend request (should create notification)
INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
VALUES (gen_random_uuid()::text, 'test_friend_user1', 'test_friend_user2', 'Pending', NOW(), NOW());

-- Check if notification was created
SELECT 'Friend Request Test' as test_name,
       COUNT(*) as notification_count,
       CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END as result
FROM notifications
WHERE user_id = 'test_friend_user2' AND type = 'friend_request';

-- Test 2: Accept friend request (should create notification)
UPDATE friendships
SET status = 'Accepted', updated_at = NOW()
WHERE user_id = 'test_friend_user1' AND friend_id = 'test_friend_user2';

-- Check if acceptance notification was created
SELECT 'Friend Request Accept Test' as test_name,
       COUNT(*) as notification_count,
       CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END as result
FROM notifications
WHERE user_id = 'test_friend_user1' AND type = 'friend_request_accepted';

-- Show all notifications created
SELECT 'All Notifications' as summary,
       type,
       title,
       message,
       user_id,
       created_at
FROM notifications
WHERE user_id LIKE 'test_friend_%'
ORDER BY created_at;

-- Clean up
DELETE FROM notifications WHERE user_id LIKE 'test_friend_%';
DELETE FROM friendships WHERE user_id LIKE 'test_friend_%' OR friend_id LIKE 'test_friend_%';
DELETE FROM users WHERE id LIKE 'test_friend_%';
