import 'dotenv-flow/config';

import { sql } from 'drizzle-orm';

import { createDatabaseClient, testConnection } from '../src/lib/db/seed/config';

async function main() {
  try {
    // Create database client
    const db = createDatabaseClient({ env: process.env.NODE_ENV });

    // Test basic connection
    await testConnection(db);
    console.log('✅ Basic database connection test passed!');

    // Test a simple query
    const result = await db.execute(sql`SELECT NOW() as current_time`);
    console.log('✅ Query test passed! Current time:', result.rows[0].current_time);

    console.log('✅ All database tests passed successfully!');
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

main();
