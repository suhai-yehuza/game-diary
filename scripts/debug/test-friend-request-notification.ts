import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';

config();

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';
if (!databaseUrl) throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');

const sql = neon(databaseUrl);
const db = drizzle(sql);

async function testFriendRequestNotification() {
  try {
    console.log('🧪 Testing friend_request notification...\n');

    // Get two users
    const usersResult = (await db.execute(`
      SELECT id, username FROM users LIMIT 2
    `)) as unknown as { rows: Array<{ id: string; username: string }> };
    const user1 = usersResult.rows[0];
    const user2 = usersResult.rows[1];
    if (!user1 || !user2) throw new Error('Not enough users in DB');
    console.log(`👥 Using users: ${user1.username} and ${user2.username}`);

    // Insert a pending friendship
    const friendshipId = `test-${Date.now()}`;
    await db.execute(`
      INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at)
      VALUES ('${friendshipId}', '${user1.id}', '${user2.id}', 'PENDING', NOW(), NOW())
    `);
    console.log('   ✅ Pending friendship inserted');

    // Check for friend_request notification
    const notifResult = (await db.execute(`
      SELECT type, title, message, user_id, created_at
      FROM notifications
      WHERE type = 'friend_request' AND target_id = '${friendshipId}'
      ORDER BY created_at DESC
      LIMIT 1
    `)) as unknown as {
      rows: Array<{
        type: string;
        title: string;
        message: string;
        user_id: string;
        created_at: string;
      }>;
    };

    if (notifResult.rows.length > 0) {
      const notif = notifResult.rows[0];
      console.log('   ✅ friend_request notification created:');
      console.log(`      Type: ${notif.type}`);
      console.log(`      Title: ${notif.title}`);
      console.log(`      Message: ${notif.message}`);
      console.log(`      User ID: ${notif.user_id}`);
    } else {
      console.log('   ❌ No friend_request notification created');
    }

    // Clean up
    await db.execute(`DELETE FROM notifications WHERE target_id = '${friendshipId}'`);
    await db.execute(`DELETE FROM friendships WHERE id = '${friendshipId}'`);
    console.log('✅ Test completed and cleaned up');
  } catch (error) {
    console.error('❌ Error testing friend_request notification:', error);
  }
}

testFriendRequestNotification().catch(console.error);
