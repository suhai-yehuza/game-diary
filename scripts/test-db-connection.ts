import 'dotenv-flow/config';
import { sql } from 'drizzle-orm';

import { createDatabaseClient } from '../src/lib/db/seed/config';

async function main() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    const db = createDatabaseClient({ env: process.env.NODE_ENV || 'development' });
    
    // Test a simple query
    const result = await db.execute(sql`SELECT NOW() as current_time`);
    console.log('✅ Connection successful! Current time:', result.rows[0].current_time);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

main(); 