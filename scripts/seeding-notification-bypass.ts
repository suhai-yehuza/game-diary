import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

/**
 * Utility functions to manage notification triggers during database seeding
 * This prevents rate limiting from affecting the seeding process
 */

function createDatabaseConnection() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  const sql = neon(databaseUrl);
  return drizzle(sql);
}

export async function disableNotificationTriggers() {
  try {
    console.log('🛑 Disabling notification triggers for seeding...');

    const database = createDatabaseConnection();

    // Disable all notification triggers
    await database.execute(`DROP TRIGGER IF EXISTS reaction_notification_trigger ON reactions;`);
    await database.execute(`DROP TRIGGER IF EXISTS comment_notification_trigger ON comments;`);
    await database.execute(
      `DROP TRIGGER IF EXISTS friendship_notification_trigger ON friendships;`
    );
    await database.execute(
      `DROP TRIGGER IF EXISTS friendship_deletion_notification_trigger ON friendships;`
    );

    console.log('✅ Notification triggers disabled for seeding');
    return true;
  } catch (error) {
    console.error('❌ Error disabling notification triggers:', error);
    throw error;
  }
}

export async function enableNotificationTriggers() {
  try {
    console.log('🔄 Re-enabling notification triggers after seeding...');

    const database = createDatabaseConnection();

    // Re-enable all notification triggers using CREATE OR REPLACE
    await database.execute(`
      CREATE OR REPLACE TRIGGER reaction_notification_trigger
          AFTER INSERT ON reactions
          FOR EACH ROW
          EXECUTE FUNCTION create_reaction_notification();
    `);

    await database.execute(`
      CREATE OR REPLACE TRIGGER comment_notification_trigger
          AFTER INSERT ON comments
          FOR EACH ROW
          EXECUTE FUNCTION create_comment_notification();
    `);

    await database.execute(`
      CREATE OR REPLACE TRIGGER friendship_notification_trigger
          AFTER INSERT OR UPDATE ON friendships
          FOR EACH ROW
          EXECUTE FUNCTION create_friend_request_notification();
    `);

    await database.execute(`
      CREATE OR REPLACE TRIGGER friendship_deletion_notification_trigger
          AFTER DELETE ON friendships
          FOR EACH ROW
          EXECUTE FUNCTION create_friend_removed_notification();
    `);

    console.log('✅ Notification triggers re-enabled');
    return true;
  } catch (error) {
    console.error('❌ Error enabling notification triggers:', error);
    throw error;
  }
}

export async function createSeedingNotifications() {
  try {
    console.log('📝 Creating seeding-specific notifications...');

    const database = createDatabaseConnection();

    // Get all users
    const usersResult = await database.execute(`
      SELECT id, username FROM users WHERE deleted_at IS NULL
    `);

    if (usersResult.rows.length === 0) {
      console.log('⚠️ No users found, skipping notification creation');
      return;
    }

    const users = usersResult.rows;
    let notificationCount = 0;

    // Create a reasonable number of notifications for each user (within rate limits)
    for (const user of users) {
      // Create 5-10 notifications per user (well within rate limits)
      const numNotifications = Math.floor(Math.random() * 6) + 5; // 5-10 notifications

      for (let i = 0; i < numNotifications; i++) {
        const notificationTypes = ['friend_request', 'comment', 'reaction'];
        const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

        let message = '';
        switch (type) {
          case 'friend_request':
            message = 'You have a new friend request';
            break;
          case 'comment':
            message = 'Someone commented on your game log';
            break;
          case 'reaction':
            message = 'Someone reacted to your content';
            break;
        }

        await database.execute(`
          INSERT INTO notifications (
            id, user_id, type, title, message, target_id, target_type,
            resolved, read, created_at, updated_at
          ) VALUES (
            generate_uuid_v7(), '${user.id}', '${type}', 'New ${type.replace('_', ' ')}',
            '${message}', null, null, false, false, NOW(), NOW()
          )
        `);

        notificationCount++;
      }
    }

    console.log(`✅ Created ${notificationCount} seeding notifications for ${users.length} users`);
    return notificationCount;
  } catch (error) {
    console.error('❌ Error creating seeding notifications:', error);
    throw error;
  }
}

// Main function to handle seeding with notification bypass
export async function runSeedingWithNotificationBypass(seedingFunction: () => Promise<void>) {
  try {
    console.log('🌱 Starting seeding with notification bypass...\n');

    // Step 1: Disable notification triggers
    await disableNotificationTriggers();

    // Step 2: Run the seeding function
    console.log('📊 Running seeding function...');
    await seedingFunction();

    // Step 3: Create reasonable notifications
    await createSeedingNotifications();

    // Step 4: Re-enable notification triggers
    await enableNotificationTriggers();

    console.log('\n🎉 Seeding completed successfully with notification bypass!');
    console.log('📋 Summary:');
    console.log('  - Notification triggers disabled during seeding');
    console.log('  - Seeding completed without rate limiting');
    console.log('  - Reasonable notifications created for users');
    console.log('  - Notification triggers re-enabled');
  } catch (error) {
    console.error('❌ Error during seeding with notification bypass:', error);

    // Try to re-enable triggers even if seeding failed
    try {
      console.log('🔄 Attempting to re-enable notification triggers...');
      await enableNotificationTriggers();
    } catch (triggerError) {
      console.error('❌ Failed to re-enable notification triggers:', triggerError);
    }

    throw error;
  }
}

// Standalone script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🔧 Notification bypass utility');
  console.log('Usage:');
  console.log('  - disableNotificationTriggers() - Disable triggers for seeding');
  console.log('  - enableNotificationTriggers() - Re-enable triggers after seeding');
  console.log('  - createSeedingNotifications() - Create reasonable notifications');
  console.log('  - runSeedingWithNotificationBypass(seedingFunction) - Complete bypass workflow');
}
