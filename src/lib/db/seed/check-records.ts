import { sql } from 'drizzle-orm';

import { createDatabaseClient } from './config';

const env = process.argv[2] || 'development';
const tableName = process.argv[3] || 'players';

async function main() {
  try {
    const db = createDatabaseClient({ env });
    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM ${sql.identifier(tableName)};
    `);
    console.log(`Record count in ${tableName}:`, result.rows[0].count);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
