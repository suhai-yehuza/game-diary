import { sql } from 'drizzle-orm';

import { db } from '../src/lib/db';
import { import { logger } from '@/lib/logger'; } from '@/lib/logger';
interface MigrationVersion {
  name: string;
  checksum: string;
  executed_at: string;
  execution_time_ms: number;
  status: string;
  error_message?: string;
  rollback_executed: boolean;
}

async function viewMigrations() {
  try {
    const result = await db.execute(sql`
      SELECT 
        name,
        checksum,
        executed_at,
        execution_time_ms,
        status,
        error_message,
        rollback_executed
      FROM migration_versions
      ORDER BY executed_at DESC
    `);

    logger.info('\nMigration Versions:');
    logger.info('==================');

    if (result.rows.length === 0) {
      logger.info('No migrations found.');
      return;
    }

    // Map each row to MigrationVersion type
    (result.rows as Record<string, unknown>[]).forEach(row => {
      const migration = row as unknown as MigrationVersion;
      logger.info('\nMigration:', migration.name);
      logger.info('Status:', migration.status);
      logger.info('Executed at:', migration.executed_at);
      logger.info('Execution time:', migration.execution_time_ms, 'ms');
      if (migration.error_message) {
        logger.info('Error:', migration.error_message);
      }
      logger.info('Rollback executed:', migration.rollback_executed);
      logger.info('Checksum:', migration.checksum);
      logger.info('------------------');
    });
  } catch (error) {
    logger.error('Error viewing migrations:', error);
  } finally {
    process.exit(0);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  viewMigrations().catch(console.error);
}
