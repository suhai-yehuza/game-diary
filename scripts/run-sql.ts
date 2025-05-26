import fs from 'fs';
import path from 'path';

import { sql } from 'drizzle-orm';

import { createDatabaseClient } from '../src/lib/db/seed/config';

async function main() {
  try {
    const db = createDatabaseClient({ env: process.env.NODE_ENV || 'development', logger: true });

    // Read and execute the SQL file
    const sqlFile = path.resolve(
      process.cwd(),
      'src/lib/db/migrations/20240320_fix_game_log_classifications.sql'
    );
    const content = fs.readFileSync(sqlFile, 'utf-8');

    // Split into statements and execute each one
    const statements = content.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await db.execute(sql.raw(statement));
        console.log('Successfully executed statement');
      }
    }

    // Check the classifications
    const result = await db.execute(sql`
      SELECT classification, COUNT(*) as count 
      FROM game_logs 
      GROUP BY classification
    `);

    console.log('\nClassification distribution:');
    for (const row of result.rows) {
      console.log(`${row.classification}: ${row.count}`);
    }

    console.log('\nSQL file executed successfully');
  } catch (error) {
    console.error('Error executing SQL file:', error);
    process.exit(1);
  }
}

main();
