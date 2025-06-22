import 'dotenv-flow/config';

import { sql } from 'drizzle-orm';

import { logger } from '@lib/core/logger';
import { createDatabaseClient, testConnection } from '@src/lib/db';

import { parseScriptArgs } from '../shared/script-utils';

async function main() {
  try {
    const options = parseScriptArgs();
    // Create database client
    const db = createDatabaseClient({ env: options.environment });

    // Test basic connection
    await testConnection(db);
    logger.info('✅ Basic database connection test passed!');

    // Test a simple query
    const result = (await db.execute(sql`SELECT NOW() as current_time`)) as unknown as {
      rows: Array<{ current_time: Date }>;
    };
    logger.info('✅ Query test passed! Current time:', result.rows[0].current_time);

    logger.info('✅ All database tests passed successfully!');
  } catch (error) {
    logger.error(
      '❌ Database test failed:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

main();
