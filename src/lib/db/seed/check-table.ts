import { sql } from 'drizzle-orm';

import { seedLogger } from '@lib/core/logger';

import { createDatabaseClient } from './config';
const env = process.argv[2] || 'development';
const tableName = process.argv[3] || 'players';

async function main() {
  try {
    const db = createDatabaseClient({ env });
    const result = await db.execute(sql`
      SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = ${tableName}
      ORDER BY ordinal_position;
    `);
    seedLogger.info(`Table structure for ${tableName}:`, result.rows);
  } catch (error) {
    seedLogger.error('Error:', error);
    process.exit(1);
  }
}

main();
