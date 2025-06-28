import { sql } from 'drizzle-orm';

import { logger } from '../../lib/core/logger';
import { createDatabaseClient } from '../../src/lib/db';
import type { IMigrationVersion } from '../../src/lib/types';

import { parseScriptArgs } from '../shared/script-utils';

async function viewMigrations() {
  const options = parseScriptArgs();
  const env = options.environment ?? 'development';

  logger.info(`\nMigration Versions (${env} environment):`);
  logger.info('==================');

  try {
    const db = createDatabaseClient({ env });

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

    if (!result.rows || result.rows.length === 0) {
      logger.info('No migrations found.');
      return;
    }

    // Map each row to MigrationVersion type
    const migrations = result.rows as unknown as IMigrationVersion[];

    migrations.forEach(migration => {
      const executedAt = new Date(migration.executed_at).toLocaleString();
      const executionTime = migration.execution_time_ms
        ? `${migration.execution_time_ms}ms`
        : 'N/A';

      logger.info('\nMigration:', migration.name);
      logger.info('Status:', migration.status);
      logger.info('Executed at:', executedAt);
      logger.info('Execution time:', executionTime);

      if (migration.error_message) {
        logger.info('Error:', migration.error_message);
      }

      logger.info('Rollback executed:', migration.rollback_executed);
      logger.info('Checksum:', migration.checksum);
      logger.info('------------------');
    });

    logger.info(`\nTotal migrations: ${migrations.length}`);
  } catch (error) {
    logger.error(
      'Error viewing migrations:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  viewMigrations().catch(error => {
    logger.error(
      'Migration viewing failed:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  });
}
