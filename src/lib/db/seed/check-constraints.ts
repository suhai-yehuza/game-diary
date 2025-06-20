import { sql } from 'drizzle-orm';

import { seedLogger } from '@lib/core/logger';

import { createDatabaseClient } from './config';
const env = process.argv[2] || 'development';
const tableName = process.argv[3] || 'players';

async function main() {
  try {
    const db = createDatabaseClient({ env });
    const result = await db.execute(sql`
      SELECT
        tc.table_schema, 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND (tc.table_name = ${tableName} OR ccu.table_name = ${tableName});
    `);
    seedLogger.info(
      `Foreign key constraints for ${tableName}:`,
      (result as unknown as { rows: unknown[] }).rows
    );
  } catch (error) {
    seedLogger.error('Error:', error);
    process.exit(1);
  }
}

main();
