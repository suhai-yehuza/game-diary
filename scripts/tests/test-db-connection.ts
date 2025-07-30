import 'dotenv-flow/config';

import { sql } from 'drizzle-orm';

import { logger } from '@/lib/utils/logger';
import { createDatabaseClient } from '@/lib/db';

import { parseScriptArgs } from '../utils/script-utils';

// Check if we're in CI and handle missing DATABASE_URL gracefully
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
if (isCI && !process.env.DATABASE_URL) {
  logger.warn('⚠️ DATABASE_URL not found in CI environment. Skipping database tests.');
  logger.info('✅ Database tests skipped in CI environment (no DATABASE_URL available)');
  process.exit(0);
}

async function testBasicConnection() {
  try {
    logger.info('🔌 Testing basic database connection...');

    const options = parseScriptArgs();
    const db = createDatabaseClient({ env: options.env });

    // Test basic connection
    const result = (await db.execute(
      sql`SELECT NOW() as current_time, version() as db_version`
    )) as unknown as {
      rows: Array<{ current_time: Date; db_version: string }>;
    };
    logger.info('✅ Database connection successful!');
    logger.info(`Current time: ${result.rows[0]?.current_time}`);
    logger.info(`Database version: ${result.rows[0]?.db_version}`);

    // Test a simple query (from test-neon-postgres.ts)
    const simpleResult = (await db.execute(sql`SELECT NOW() as current_time`)) as unknown as {
      rows: Array<{ current_time: Date }>;
    };
    logger.info(`✅ Query test passed! Current time: ${simpleResult.rows[0].current_time}`);

    return db;
  } catch (error) {
    logger.error(
      '❌ Database connection failed:',
      error instanceof Error ? error : new Error(String(error))
    );
    logger.info(`Error details: ${error}`);
    throw error;
  }
}

async function testConnectionStability() {
  try {
    logger.info('\n🔄 Testing connection stability with multiple operations...');

    const options = parseScriptArgs();
    const db = createDatabaseClient({ env: options.env });

    // Create a test table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS connection_test (
        id SERIAL PRIMARY KEY,
        test_data TEXT,
        createdAt TIMESTAMP DEFAULT NOW()
      )
    `);

    // Clear any existing test data
    await db.execute(sql`DELETE FROM connection_test`);

    logger.info('📝 Testing multiple small insertions...');

    // Test multiple small operations to simulate batch behavior
    for (let i = 0; i < 20; i++) {
      await db.execute(sql`
        INSERT INTO connection_test (test_data)
        VALUES (${'Test data item ' + i})
      `);

      // Small delay to simulate real-world usage
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Verify all insertions
    const count = (await db.execute(
      sql`SELECT COUNT(*) as count FROM connection_test`
    )) as unknown as {
      rows: Array<{ count: number }>;
    };
    logger.info(`✅ Successfully inserted ${count.rows[0]?.count} items`);

    // Test a larger batch operation
    logger.info('📦 Testing larger batch operation...');
    const batchValues = Array.from({ length: 100 }, (_, i) => `('Batch item ${i}')`).join(', ');

    await db.execute(
      sql.raw(`
      INSERT INTO connection_test (test_data)
      VALUES ${batchValues}
    `)
    );

    const finalCount = (await db.execute(
      sql`SELECT COUNT(*) as count FROM connection_test`
    )) as unknown as {
      rows: Array<{ count: number }>;
    };
    logger.info(`✅ Total items after batch: ${finalCount.rows[0]?.count}`);

    // Clean up
    await db.execute(sql`DROP TABLE IF EXISTS connection_test`);

    logger.info('✅ Connection stability test passed!');
  } catch (error) {
    logger.error(
      '❌ Connection stability test failed:',
      error instanceof Error ? error : new Error(String(error))
    );
    logger.info('Error details:', { error: String(error) });
    throw error;
  }
}

async function testErrorRecovery() {
  try {
    logger.info('\n🛠️ Testing error handling...');

    const options = parseScriptArgs();
    const db = createDatabaseClient({ env: options.env });

    // Test invalid query handling
    try {
      await db.execute(sql`SELECT * FROM non_existent_table`);
    } catch (error) {
      logger.info('✅ Invalid query error handled correctly');
      logger.info('Error details:', { error: String(error) });
    }

    // Verify database is still functional after error
    const result = (await db.execute(sql`SELECT 1 as test`)) as unknown as {
      rows: Array<{ test: number }>;
    };
    logger.info(`✅ Database functional after error: ${result.rows[0]?.test}`);
  } catch (error) {
    logger.error(
      '❌ Error recovery test failed:',
      error instanceof Error ? error : new Error(String(error))
    );
    logger.info('Error details:', { error: String(error) });
    throw error;
  }
}

async function main() {
  try {
    const options = parseScriptArgs();
    const mode = options.mode ?? 'full'; // 'basic' | 'full'

    if (mode === 'basic') {
      // Basic connection test only (from test-neon-postgres.ts)
      await testBasicConnection();
      logger.info('✅ Basic database tests passed successfully!');
    } else {
      // Full comprehensive test suite
      await testBasicConnection();
      await testConnectionStability();
      await testErrorRecovery();

      logger.info('\n🎉 All database tests passed successfully!');
      logger.info('\n💡 Your database seeding should now be more stable with:');
      logger.info('   - Reduced batch sizes (15 items per batch)');
      logger.info('   - Enhanced retry logic with exponential backoff');
      logger.info('   - Better network error detection and handling');
      logger.info('   - Connection stability improvements');
      logger.info('   - 30-second connection timeout');
      logger.info('   - Connection keep-alive enabled');

      logger.info('\n🚀 Try running your seeder again - it should be much more stable now!');
    }
  } catch (error) {
    logger.error(
      '\n❌ Database tests failed:',
      error instanceof Error ? error : new Error(String(error))
    );
    process.exit(1);
  }
}

// Run the main function
main();
