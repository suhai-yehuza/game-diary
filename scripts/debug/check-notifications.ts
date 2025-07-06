import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';

// Load environment variables
config();

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';

if (!databaseUrl) {
  throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
}

const sql = neon(databaseUrl);
const db = drizzle(sql);

async function checkNotifications() {
  console.log('📬 Checking all notification types...\n');

  const result = (await db.execute(`
    SELECT type, COUNT(*) as count
    FROM notifications
    WHERE type LIKE 'friend%'
    GROUP BY type
    ORDER BY count DESC
  `)) as any;

  console.log('Friend-related notifications:');
  result.rows.forEach((row: any) => {
    console.log(`   ${row.type}: ${row.count}`);
  });

  console.log('\n📊 Total notifications by type:');
  const allResult = (await db.execute(`
    SELECT type, COUNT(*) as count
    FROM notifications
    GROUP BY type
    ORDER BY count DESC
  `)) as any;

  allResult.rows.forEach((row: any) => {
    console.log(`   ${row.type}: ${row.count}`);
  });

  console.log('\n🔍 Sample friend notifications:');
  const sampleResult = (await db.execute(`
    SELECT type, title, message, created_at
    FROM notifications
    WHERE type LIKE 'friend%'
    ORDER BY created_at DESC
    LIMIT 5
  `)) as any;

  sampleResult.rows.forEach((row: any) => {
    console.log(`   ${row.type}: ${row.title} - ${row.message}`);
  });

  console.log('\n🔍 Checking friendship statuses:');
  const friendshipResult = (await db.execute(`
    SELECT status, COUNT(*) as count
    FROM friendships
    GROUP BY status
    ORDER BY count DESC
  `)) as any;

  friendshipResult.rows.forEach((row: any) => {
    console.log(`   ${row.status}: ${row.count}`);
  });
}

checkNotifications().catch(console.error);
