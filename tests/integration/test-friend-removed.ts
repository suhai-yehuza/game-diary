import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';

import { errorHandlers } from '@/lib/utils/error-handler';

// Load environment variables
config();

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';

if (!databaseUrl) {
  throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
}

const sql = neon(databaseUrl);
const db = drizzle(sql);

async function testFriendRemoved() {
  try {
    console.log('🧪 Testing friend_removed notification...\n');

    // Get two users
    const usersResult = (await db.execute(`
      SELECT id, username, first_name, last_name
      FROM users
      LIMIT 2
    `)) as unknown as {
      rows: Array<{ id: string; username: string; first_name: string; last_name: string }>;
    };

    const user1 = usersResult.rows[0];
    const user2 = usersResult.rows[1];

    console.log(`👥 Using users: ${user1.username} and ${user2.username}`);

    // Check current notification count
    const beforeCount = (await db.execute(`
      SELECT COUNT(*) as count FROM notifications
    `)) as unknown as { rows: Array<{ count: string }> };

    console.log(`📊 Notifications before: ${beforeCount.rows[0].count}`);

    // Step 1: Create an accepted friendship
    const friendshipId = `test-${Date.now()}`;
    console.log('\n🔍 Step 1: Creating accepted friendship...');

    await db.execute(`
      INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
      VALUES ('${friendshipId}', '${user1.id}', '${user2.id}', 'ACCEPTED', NOW(), NOW())
    `);

    console.log('   ✅ Friendship created');

    // Step 2: Delete the friendship to trigger friend_removed notification
    console.log('\n🔍 Step 2: Deleting friendship...');

    await db.execute(`
      DELETE FROM friendships WHERE id = '${friendshipId}'
    `);

    console.log('   ✅ Friendship deleted');

    // Check for friend_removed notification
    const afterDeleteCount = (await db.execute(`
      SELECT COUNT(*) as count FROM notifications
    `)) as unknown as { rows: Array<{ count: string }> };

    console.log(`📊 Notifications after delete: ${afterDeleteCount.rows[0].count}`);

    // Check for friend_removed notification
    const friendRemovedNotifications = (await db.execute(`
      SELECT type, title, message, user_id
      FROM notifications
      WHERE type = 'friend_removed'
      ORDER BY created_at DESC
      LIMIT 1
    `)) as unknown as {
      rows: Array<{ type: string; title: string; message: string; user_id: string }>;
    };

    if (friendRemovedNotifications.rows.length > 0) {
      console.log('   ✅ friend_removed notification created:');
      console.log(`      Type: ${friendRemovedNotifications.rows[0].type}`);
      console.log(`      Title: ${friendRemovedNotifications.rows[0].title}`);
      console.log(`      Message: ${friendRemovedNotifications.rows[0].message}`);
      console.log(`      User ID: ${friendRemovedNotifications.rows[0].user_id}`);

      // Verify it was sent to the correct user (the friend, not the remover)
      if (friendRemovedNotifications.rows[0].user_id === user2.id) {
        console.log('   ✅ Notification sent to correct user (the friend)');
      } else {
        console.log('   ❌ Notification sent to wrong user');
      }
    } else {
      console.log('   ❌ No friend_removed notification created');
    }

    // Check all notification types
    console.log('\n📬 All notification types:');
    const allNotifications = (await db.execute(`
      SELECT type, COUNT(*) as count
      FROM notifications
      GROUP BY type
      ORDER BY count DESC
    `)) as unknown as { rows: Array<{ type: string; count: string }> };

    allNotifications.rows.forEach(row => {
      console.log(`   ${row.type}: ${row.count}`);
    });

    // Clean up any test notifications
    console.log('\n🧹 Cleaning up test notifications...');
    await db.execute(`DELETE FROM notifications WHERE target_id = '${friendshipId}'`);

    console.log('✅ Test completed');
  } catch (error) {
    // Use centralized error handling
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'Integration Test',
      action: 'Friend removed test',
    });
    console.error('❌ Error testing friend_removed:', error);
  }
}

testFriendRemoved().catch(console.error);
