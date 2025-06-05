import { exec } from 'child_process';
import { promisify } from 'util';

import { sql } from 'drizzle-orm';

import { logger } from '@/lib/logger';

import { createDatabaseClient } from '../src/lib/db/seed/config';

const execAsync = promisify(exec);

// Get environment from command line argument or default to development
const environment = process.argv[2] || 'development';
const runTests = process.argv.includes('--test');

async function runCommand(command: string, description: string): Promise<void> {
  logger.info(`\n📌 ${description}...`);
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stdout) logger.info(stdout);
    if (stderr && !stderr.includes('Warning') && !stderr.includes('deprecat')) logger.error(stderr);
    logger.info(`✅ ${description} completed`);
  } catch (error: any) {
    logger.error(`❌ Failed: ${description}`);
    logger.error(error.message);
    throw error;
  }
}

async function setupDatabase() {
  logger.info(`🚀 Starting complete database setup for ${environment} environment...`);
  logger.info('================================================\n');

  const db = createDatabaseClient({ env: environment });

  try {
    // Step 1: Clean existing database
    logger.info('📦 Step 1: Cleaning existing database...');
    try {
      await db.execute(sql`
        DO $$ 
        DECLARE 
          r RECORD;
        BEGIN
          -- Drop all tables
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
          
          -- Drop all custom types
          FOR r IN (SELECT typname FROM pg_type WHERE typtype = 'e' AND typnamespace = 'public'::regnamespace) LOOP
            EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
          END LOOP;
        END $$;
      `);
      logger.info('✅ Database cleaned successfully');
    } catch (error) {
      logger.info('⚠️  Database might be already clean or error during cleanup');
    }

    // Step 2: Generate Drizzle migrations
    await runCommand('pnpm db:generate', 'Generating Drizzle migrations');

    // Step 3: Copy custom migrations
    await runCommand('pnpm db:copy-custom-migrations', 'Copying custom migrations');

    // Step 4: Push schema to database with --force flag
    await runCommand('drizzle-kit push --force', 'Creating database tables (force mode)');

    // Step 5: Wait for tables to be ready
    logger.info('\n⏳ Waiting for tables to be ready...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 6: Create triggers
    logger.info('\n⚡ Step 6: Creating database triggers...');

    // Drop existing trigger if it exists
    await db.execute(sql`
      DROP TRIGGER IF EXISTS update_rating_stars_trigger ON game_logs;
      DROP FUNCTION IF EXISTS update_rating_stars();
    `);

    // Create game ratings trigger function
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION update_game_ratings()
      RETURNS TRIGGER AS $$
      DECLARE
          v_id VARCHAR(255);
      BEGIN
          IF (TG_OP = 'DELETE') THEN
              IF NOT EXISTS (SELECT 1 FROM game_logs WHERE "gameId" = OLD."gameId") THEN
                  DELETE FROM game_ratings WHERE "gameId" = OLD."gameId";
              ELSE
                  UPDATE game_ratings
                  SET 
                      "averageRating" = (
                          SELECT ROUND(AVG("ratingForGame")::numeric, 2)
                          FROM game_logs
                          WHERE "gameId" = OLD."gameId"
                      ),
                      "totalRatings" = (
                          SELECT COUNT(*)
                          FROM game_logs
                          WHERE "gameId" = OLD."gameId"
                      ),
                      "updatedAt" = NOW()
                  WHERE "gameId" = OLD."gameId";
              END IF;
              RETURN OLD;
          END IF;

          IF (TG_OP = 'INSERT') THEN
              INSERT INTO game_ratings ("id", "gameId", "averageRating", "totalRatings", "createdAt", "updatedAt")
              SELECT 
                  gen_random_uuid()::text,
                  NEW."gameId",
                  ROUND(AVG("ratingForGame")::numeric, 2),
                  COUNT(*),
                  NOW(),
                  NOW()
              FROM game_logs
              WHERE "gameId" = NEW."gameId"
              ON CONFLICT ("gameId") DO UPDATE
              SET 
                  "averageRating" = EXCLUDED."averageRating",
                  "totalRatings" = EXCLUDED."totalRatings",
                  "updatedAt" = NOW();
              RETURN NEW;
          END IF;

          IF (TG_OP = 'UPDATE') THEN
              UPDATE game_ratings
              SET 
                  "averageRating" = (
                      SELECT ROUND(AVG("ratingForGame")::numeric, 2)
                      FROM game_logs
                      WHERE "gameId" = NEW."gameId"
                  ),
                  "totalRatings" = (
                      SELECT COUNT(*)
                      FROM game_logs
                      WHERE "gameId" = NEW."gameId"
                  ),
                  "updatedAt" = NOW()
              WHERE "gameId" = NEW."gameId";
              RETURN NEW;
          END IF;

          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Drop existing trigger if it exists
    await db.execute(sql`
      DROP TRIGGER IF EXISTS game_logs_ratings_trigger ON game_logs;
    `);

    // Create the trigger
    await db.execute(sql`
      CREATE TRIGGER game_logs_ratings_trigger
          AFTER INSERT OR UPDATE OR DELETE ON game_logs
          FOR EACH ROW
          EXECUTE FUNCTION update_game_ratings();
    `);
    logger.info('✅ Game ratings trigger created');

    // Step 7: Create migration tracking table
    logger.info('\n📋 Step 7: Creating migration tracking table...');

    // Create the table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS migration_versions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        checksum VARCHAR(64) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        execution_time_ms INTEGER,
        status VARCHAR(20) NOT NULL DEFAULT 'success',
        error_message TEXT,
        rollback_script TEXT,
        rollback_executed BOOLEAN DEFAULT false
      );
    `);

    // Create the index separately
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_migration_versions_name ON migration_versions(name);
    `);
    logger.info('✅ Migration tracking table created');

    // Step 8: Run tests if requested
    if (runTests) {
      await runCommand('npx tsx src/lib/db/seed/test-trigger.ts', 'Testing triggers');
    }

    // Success summary
    logger.info('\n================================================');
    logger.info('🎉 Database setup completed successfully!');
    logger.info('================================================\n');
    logger.info('✅ All tables created');
    logger.info('✅ All triggers created');
    logger.info('✅ Migration tracking enabled');

    if (!runTests) {
      logger.info('\n📝 Next steps:');
      logger.info('1. Run "npx tsx src/lib/db/seed/test-trigger.ts" to test the triggers');
      logger.info('2. Run "pnpm db:seed:dev" to seed the database with sample data');
    }

    process.exit(0);
  } catch (error) {
    logger.error('\n❌ Error during database setup:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
