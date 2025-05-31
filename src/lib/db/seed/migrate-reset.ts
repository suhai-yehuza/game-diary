import { sql } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import * as schema from '@/lib/db/schema';

import { migrate } from '../migrations/drizzle-migrate';

import { createDatabaseClient } from './config';

// Get environment from command line argument or default to development
const env = process.argv[2] || 'development';

async function dropAllTables(db: NeonHttpDatabase<typeof schema>) {
  try {
    // First drop all tables
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);

    if (result.rows.length > 0) {
      const tableNames = (result.rows as { table_name: string }[]).map(row => row.table_name);
      console.log('Dropping tables:', tableNames);

      // Drop all tables in a single transaction
      await db.execute(sql`
        DO $$ 
        DECLARE 
          r RECORD;
        BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
        END $$;
      `);
    }

    // Drop all custom types
    console.log('Dropping custom types...');
    await db.execute(sql`
      DO $$ 
      DECLARE 
        r RECORD;
      BEGIN
        FOR r IN (SELECT typname FROM pg_type WHERE typtype = 'e' AND typnamespace = 'public'::regnamespace) LOOP
          EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
        END LOOP;
      END $$;
    `);

    console.log('All tables and types dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error);
    throw error;
  }
}

async function main() {
  try {
    const db = createDatabaseClient({ env, logger: true });

    // Drop all tables and types
    await dropAllTables(db);

    // Run migrations
    await migrate();

    console.log('Database reset and migration completed successfully');
  } catch (error) {
    console.error('Error during database reset:', error);
    process.exit(1);
  }
}

// Run the script
main();
