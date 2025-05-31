import { sql } from 'drizzle-orm';

import { db } from '../src/lib/db';

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

    console.log('\nMigration Versions:');
    console.log('==================');

    if (result.rows.length === 0) {
      console.log('No migrations found.');
      return;
    }

    // Map each row to MigrationVersion type
    (result.rows as Record<string, unknown>[]).forEach(row => {
      const migration = row as unknown as MigrationVersion;
      console.log('\nMigration:', migration.name);
      console.log('Status:', migration.status);
      console.log('Executed at:', migration.executed_at);
      console.log('Execution time:', migration.execution_time_ms, 'ms');
      if (migration.error_message) {
        console.log('Error:', migration.error_message);
      }
      console.log('Rollback executed:', migration.rollback_executed);
      console.log('Checksum:', migration.checksum);
      console.log('------------------');
    });
  } catch (error) {
    console.error('Error viewing migrations:', error);
  } finally {
    process.exit(0);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  viewMigrations().catch(console.error);
}
