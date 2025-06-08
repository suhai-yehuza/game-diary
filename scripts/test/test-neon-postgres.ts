import 'dotenv-flow/config';

import { sql } from 'drizzle-orm';

import { createDatabaseClient, testConnection } from '@src/lib/db/seed/config';
import { logger } from 'lib/core/logger';
async function main() {
  try {
    // Create database client
    const db = createDatabaseClient({ env: process.env.NODE_ENV });

    // Test basic connection
    await testConnection(db);
    logger.info('✅ Basic database connection test passed!');

    // Test a simple query
    const result = await db.execute(sql`SELECT NOW() as current_time`);
    logger.info('✅ Query test passed! Current time:', result.rows[0].current_time);

    logger.info('✅ All database tests passed successfully!');
  } catch (error) {
    logger.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

main();
