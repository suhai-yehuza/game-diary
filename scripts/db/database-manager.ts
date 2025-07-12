#!/usr/bin/env tsx
/**
 * @fileoverview Unified database management system for migrations, setup, and maintenance.
 * Consolidates all database operations into a single, well-organized module.
 */

import 'dotenv-flow/config';

import { createHash } from 'crypto';
import { readFileSync, readdirSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

import { sql } from 'drizzle-orm';
import { neon, neonConfig } from '@neondatabase/serverless';
import { neon as neonDirect } from '@neondatabase/serverless';

import { logger } from '@lib/core/logger';
import { createDatabaseClient } from '@src/lib/db';
import { setupAllTriggers } from '../utils/database-triggers';
import {
  parseScriptArgs,
  logScriptHeader,
  logScriptFooter,
  handleScriptError,
} from '../utils/script-utils';
import type { IMigration, IMigrationVerification, IMigrationVersion } from '@src/lib/types';

// Add canonical reset logic (from full-reset.ts)
import { execSync } from 'child_process';
import { config as dotenvConfig } from 'dotenv';

async function runCanonicalReset(env: string) {
  // Determine which .env file to load
  let mainEnvFile = '.env';
  if (env === 'dev' && existsSync('.env.development')) {
    mainEnvFile = '.env.development';
  } else if (env === 'staging' && existsSync('.env.staging')) {
    mainEnvFile = '.env.staging';
  } else if ((env === 'prod' || env === 'production') && existsSync('.env.production')) {
    mainEnvFile = '.env.production';
  } else if (existsSync('.env')) {
    mainEnvFile = '.env';
  }
  dotenvConfig({ path: mainEnvFile });
  if (existsSync('.env.local')) {
    dotenvConfig({ path: '.env.local', override: true });
  }
  const databaseUrl = process.env.DATABASE_URL || '';
  if (!databaseUrl) {
    console.error(`❌ No DATABASE_URL found for ${env} environment`);
    process.exit(1);
  }
  const migrationFile = join(process.cwd(), 'src/lib/db/migrations/000_full_schema_reset.sql');
  if (!existsSync(migrationFile)) {
    throw new Error(`Migration file not found: ${migrationFile}`);
  }
  console.log(`📄 Running canonical migration: ${migrationFile}`);
  const command = `psql "${databaseUrl}" -f "${migrationFile}"`;
  execSync(command, { stdio: 'inherit', encoding: 'utf8' });
  console.log('✅ Canonical schema reset completed successfully!');
}

const execAsync = promisify(exec);

// Configure neon for better stability (shared across all operations)
neonConfig.wsProxy = host => `${host}:5432/v1`;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = true;
neonConfig.pipelineConnect = false;
neonConfig.fetchFunction = (input: RequestInfo | URL, init?: RequestInit) => {
  const options = {
    ...init,
    signal: AbortSignal.timeout(30000), // 30 second timeout
    keepalive: true,
  };
  return fetch(input, options);
};

// Create a single SQL client instance for raw SQL operations
const sqlClient = neon(process.env.DATABASE_URL!);

const sqlDirect = neonDirect(process.env.DATABASE_URL!);

// ============================================================================
// SHARED UTILITIES
// ============================================================================

/**
 * Parse SQL file to extract individual statements, handling functions and triggers properly
 */
function parseSqlStatements(content: string): string[] {
  const statements: string[] = [];
  let currentStatement = '';
  let inDollarQuote = false;
  let dollarQuoteTag = '';

  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Skip empty lines and comments when not in a statement
    if (!currentStatement && (trimmedLine === '' || trimmedLine.startsWith('--'))) {
      continue;
    }

    // Check for dollar quote start/end
    const dollarQuoteMatch = line.match(/\$([^$]*)\$/g);
    if (dollarQuoteMatch) {
      for (const match of dollarQuoteMatch) {
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarQuoteTag = match;
        } else if (match === dollarQuoteTag) {
          inDollarQuote = false;
          dollarQuoteTag = '';
        }
      }
    }

    currentStatement += line + '\n';

    // Only split on semicolon if we're not inside dollar quotes
    if (!inDollarQuote && trimmedLine.endsWith(';')) {
      const stmt = currentStatement.trim();
      if (stmt && !stmt.startsWith('--')) {
        statements.push(stmt);
      }
      currentStatement = '';
    }
  }

  // Add any remaining statement
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  return statements;
}

/**
 * Verify database connection
 */
async function verifyConnection(): Promise<boolean> {
  try {
    await sqlClient`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database connection verification failed:', error);
    return false;
  }
}

/**
 * Ensure database connection with retries
 */
async function ensureConnection(): Promise<void> {
  let attempts = 0;
  const maxAttempts = 5;
  const delay = 1000;

  while (attempts < maxAttempts) {
    const isConnected = await verifyConnection();
    if (isConnected) {
      return;
    }
    attempts++;
    if (attempts === maxAttempts) {
      throw new Error('Failed to establish database connection after multiple attempts');
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * Wait for migration table to be created
 */
async function waitForMigrationTable(): Promise<void> {
  let attempts = 0;
  const maxAttempts = 10;
  const delay = 1000;

  while (attempts < maxAttempts) {
    try {
      await sqlClient.unsafe(`SELECT 1 FROM "migration_versions" LIMIT 1`);
      return;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('relation "migration_versions" does not exist')
      ) {
        attempts++;
        if (attempts === maxAttempts) {
          throw new Error('Migration table was not created after multiple attempts');
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

/**
 * Run a command with logging
 */
async function runCommand(command: string, description: string): Promise<void> {
  logger.info(`\n📌 ${description}...`);
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stdout) logger.info(stdout);
    if (stderr && !stderr.includes('Warning') && !stderr.includes('deprecat')) logger.error(stderr);
    logger.info(`✅ ${description} completed`);
  } catch (error: unknown) {
    logger.error(`❌ Failed: ${description}`);
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error(String(error));
    }
    throw error;
  }
}

// ============================================================================
// MIGRATION MANAGEMENT
// ============================================================================

/**
 * Get all migration files from the migrations directory
 */
async function getMigrationFiles(): Promise<string[]> {
  const types = ['base', 'feature', 'trigger'];
  const migrations: string[] = [];
  const migrationsDir = join(process.cwd(), 'src/lib/db/migrations');

  // First add all the .sql files in the immediate root migrations directory
  const files = readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Ensure files are processed in order
  migrations.push(...files.map(file => join(file)));

  // Then add all the .sql files in the child directories
  for (const type of types) {
    const typeDir = join(migrationsDir, type);
    if (existsSync(typeDir)) {
      const files = readdirSync(typeDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
      migrations.push(...files.map(file => join(type, file)));
    }
  }

  return migrations;
}

/**
 * Get executed migrations from the database
 */
async function getExecutedMigrations(): Promise<IMigrationVersion[]> {
  try {
    const result = await sqlClient`
      SELECT * FROM migration_versions
      ORDER BY executed_at ASC
    `;
    return result as unknown as IMigrationVersion[];
  } catch (error) {
    // If the table doesn't exist yet, return empty array
    if (
      error instanceof Error &&
      error.message.includes('relation "migration_versions" does not exist')
    ) {
      return [];
    }
    throw error;
  }
}

/**
 * Record a migration in the tracking table
 */
async function recordMigration(
  name: string,
  checksum: string,
  executionTime: number,
  status: 'success' | 'failed' | 'rolled_back',
  errorMessage?: string,
  rollbackScript?: string
): Promise<void> {
  try {
    await waitForMigrationTable();

    logger.info('Recording migration:', { name, status });
    await sqlClient`
      INSERT INTO migration_versions (
        name, checksum, execution_time_ms, status, error_message, rollback_script, rollback_executed
      ) VALUES (
        ${name}, ${checksum}, ${executionTime}, ${status}, ${errorMessage || null}, ${rollbackScript || null}, false
      )
    `;
  } catch (error) {
    logger.error('Error recording migration:', error);
    throw error;
  }
}

/**
 * Update migration status
 */
async function updateMigrationStatus(
  name: string,
  status: 'success' | 'failed' | 'rolled_back',
  errorMessage?: string
): Promise<void> {
  await sqlClient`
    UPDATE migration_versions
    SET status = ${status}, error_message = ${errorMessage}
    WHERE name = ${name}
  `;
}

/**
 * Get verification data for a migration
 */
async function getVerificationData(
  db: ReturnType<typeof createDatabaseClient>,
  migrationName: string
): Promise<IMigrationVerification> {
  const verification: IMigrationVerification = {
    version: '1.0',
    isValid: true,
  };

  if (migrationName.includes('trigger')) {
    // Check for triggers
    const triggers = (await db.execute(sql`
      SELECT tgname as name
      FROM pg_trigger
      WHERE tgname NOT LIKE 'RI_%'
      AND tgname NOT LIKE 'pg_%'
      ORDER BY tgname;
    `)) as unknown as { rows: { name: string }[] };
    verification.triggers = triggers.rows.map(r => r.name);

    // Check for functions
    const functions = (await db.execute(sql`
      SELECT proname as name
      FROM pg_proc
      WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      ORDER BY proname;
    `)) as unknown as { rows: { name: string }[] };
    verification.functions = functions.rows.map(r => r.name);
  }

  // Always check indexes
  const indexes = (await db.execute(sql`
    SELECT indexname as name
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname NOT LIKE '%_pkey'
    ORDER BY indexname;
  `)) as unknown as { rows: { name: string }[] };
  verification.indexes = indexes.rows.map(r => r.name);

  return verification;
}

/**
 * Compare verification data
 */
function compareVerification(
  before: IMigrationVerification,
  after: IMigrationVerification
): {
  added: IMigrationVerification;
  removed: IMigrationVerification;
} {
  const added: IMigrationVerification = { version: '1.0', isValid: true };
  const removed: IMigrationVerification = { version: '1.0', isValid: true };

  // Compare each type
  for (const key of ['tables', 'functions', 'triggers', 'indexes'] as const) {
    const beforeItems = before[key] || [];
    const afterItems = after[key] || [];

    const addedItems = afterItems.filter((item: string) => !beforeItems.includes(item));
    const removedItems = beforeItems.filter((item: string) => !afterItems.includes(item));

    if (addedItems.length > 0) {
      added[key] = addedItems;
    }
    if (removedItems.length > 0) {
      removed[key] = removedItems;
    }
  }

  return { added, removed };
}

// ============================================================================
// MIGRATION OPERATIONS
// ============================================================================

/**
 * Apply a single migration file
 */
async function applyMigration(file: string, dryRun = false): Promise<void> {
  await ensureConnection();

  const migrationsDir = join(process.cwd(), 'src/lib/db/migrations');
  const filePath = join(migrationsDir, file);
  const sqlContent = readFileSync(filePath, 'utf-8');

  // Check if migration has already been executed successfully
  const executedMigrations = await getExecutedMigrations();
  const existingMigration = executedMigrations.find(m => m.name === file);

  if (existingMigration?.status === 'success') {
    logger.info(`Skipping already executed migration: ${file}`);
    return;
  }

  logger.info(`Executing migration: ${file}`);
  const startTime = Date.now();

  try {
    if (!dryRun) {
      // Start transaction
      await sqlClient.unsafe('BEGIN');

      // Parse and execute SQL statements
      const statements = parseSqlStatements(sqlContent);
      logger.info(`Executing ${statements.length} SQL statements...`);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          logger.info(`Executing statement ${i + 1}/${statements.length}`);
          await sqlClient.unsafe(statement);
        }
      }

      // Commit transaction
      await sqlClient.unsafe('COMMIT');
    }

    const executionTime = Date.now() - startTime;
    const checksum = createHash('sha256').update(sqlContent).digest('hex');

    if (!dryRun) {
      await recordMigration(file, checksum, executionTime, 'success');
    }

    logger.info(`✅ Migration ${file} completed successfully in ${executionTime}ms`);
  } catch (error) {
    if (!dryRun) {
      await sqlClient.unsafe('ROLLBACK');
      const executionTime = Date.now() - startTime;
      const checksum = createHash('sha256').update(sqlContent).digest('hex');
      await recordMigration(
        file,
        checksum,
        executionTime,
        'failed',
        error instanceof Error ? error.message : String(error)
      );
    }
    logger.error(`❌ Migration ${file} failed:`, error);
    throw error;
  }
}

/**
 * Apply all pending migrations
 */
async function applyAllMigrations(environment = 'development', dryRun = false): Promise<void> {
  logger.info(`🚀 Starting migration runner for ${environment} environment...`);
  if (dryRun) {
    logger.info('🔍 Running in DRY RUN mode - no changes will be made');
  }
  logger.info('================================================\n');

  const db = createDatabaseClient({ env: environment });

  try {
    // Step 1: Ensure migration tracking table exists
    logger.info('📋 Step 1: Ensuring migration tracking table exists...');

    if (!dryRun) {
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
          rollback_executed BOOLEAN DEFAULT false,
          verification JSONB
        );
      `);

      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_migration_versions_name ON migration_versions(name);
      `);
    }
    logger.info('✅ Migration tracking table ready');

    // Step 2: Get all migration files
    logger.info('\n📂 Step 2: Scanning for migration files...');
    const files = await getMigrationFiles();

    const migrations: IMigration[] = files.map(file => {
      const path = join(process.cwd(), 'src/lib/db/migrations', file);
      const content = readFileSync(path, 'utf8');
      const checksum = createHash('sha256').update(content).digest('hex');

      return {
        version: '1.0',
        name: file,
        status: 'pending',
        path,
        content,
        checksum,
      };
    });

    logger.info(`Found ${migrations.length} migration files`);

    // Step 3: Get verification data before migrations
    logger.info('\n🔍 Step 3: Getting pre-migration verification data...');
    const beforeVerification = await getVerificationData(db, 'all');

    // Step 4: Apply migrations
    logger.info('\n⚡ Step 4: Applying migrations...');
    let appliedCount = 0;

    for (const migration of migrations) {
      try {
        await applyMigration(migration.name, dryRun);
        appliedCount++;
      } catch (error) {
        logger.error(`Failed to apply migration ${migration.name}:`, error);
        if (!dryRun) {
          throw error;
        }
      }
    }

    // Step 5: Get verification data after migrations
    logger.info('\n🔍 Step 5: Getting post-migration verification data...');
    const afterVerification = await getVerificationData(db, 'all');

    // Step 6: Compare and report changes
    logger.info('\n📊 Step 6: Migration verification report...');
    const changes = compareVerification(beforeVerification, afterVerification);

    if (changes.added.triggers?.length) {
      logger.info('✅ Added triggers:', changes.added.triggers);
    }
    if (changes.added.functions?.length) {
      logger.info('✅ Added functions:', changes.added.functions);
    }
    if (changes.added.indexes?.length) {
      logger.info('✅ Added indexes:', changes.added.indexes);
    }

    logger.info(`\n🎉 Migration process completed! Applied ${appliedCount} migrations.`);
  } catch (error) {
    logger.error('Migration process failed:', error);
    throw error;
  }
}

/**
 * Apply a specific migration file (for consolidated migrations)
 */
async function applySpecificMigration(migrationPath: string, dryRun = false): Promise<void> {
  await ensureConnection();

  logger.info(`Starting migration from: ${migrationPath}`);
  const sqlContent = readFileSync(migrationPath, 'utf-8');

  // Parse the SQL into individual statements
  const statements = parseSqlStatements(sqlContent);

  logger.info(`Executing ${statements.length} SQL statements...`);

  try {
    if (!dryRun) {
      // Start transaction
      await sqlClient.unsafe('BEGIN');

      // Execute each statement
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          logger.info(`Executing statement ${i + 1}/${statements.length}`);
          await sqlClient.unsafe(statement);
        }
      }

      // Commit transaction
      await sqlClient.unsafe('COMMIT');
    }

    logger.info('Migration completed successfully!');
  } catch (error) {
    if (!dryRun) {
      await sqlClient.unsafe('ROLLBACK');
    }
    logger.error('Error applying migration:', error);
    throw error;
  }
}

/**
 * View migration history
 */
async function viewMigrations(environment = 'development'): Promise<void> {
  logger.info(`\nMigration Versions (${environment} environment):`);
  logger.info('==================');

  try {
    const db = createDatabaseClient({ env: environment });

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
    throw error;
  }
}

/**
 * Validate migration files
 */
async function validateMigrations(): Promise<void> {
  logger.info('🔍 Validating migration files in src/lib/db/migrations...');

  const migrationsDir = join(process.cwd(), 'src/lib/db/migrations');

  try {
    const files = readdirSync(migrationsDir, { recursive: true });
    const sqlFiles = files.filter(
      (file): file is string => typeof file === 'string' && file.endsWith('.sql')
    );

    if (sqlFiles.length === 0) {
      throw new Error('No migration .sql files found in src/lib/db/migrations.');
    }

    logger.info('✅ Found the following migration files:');
    sqlFiles.forEach((f: string) => logger.info(`   - ${f}`));
    logger.info('✅ All required migration files are present in src/lib/db/migrations');
  } catch (error) {
    logger.error('❌ Error validating migrations:', error);
    throw error;
  }
}

/**
 * Validate that all required triggers and functions are present in the database
 */
async function validateTriggers(): Promise<void> {
  logger.info('🔍 Validating triggers and functions in database...');

  try {
    // Check for required triggers
    const requiredTriggers = [
      'game_logs_ratings_trigger',
      'comment_notification_trigger',
      'reaction_notification_trigger',
      'friendship_notification_trigger',
      'update_friendship_user_arrays_insert',
      'update_friendship_user_arrays_update',
      'update_friendship_user_arrays_delete',
    ];

    const triggerResults = await sqlClient`
      SELECT trigger_name
      FROM information_schema.triggers
      WHERE trigger_name = ANY(${requiredTriggers})
    `;

    const foundTriggers = triggerResults.map(r => r.trigger_name);
    const missingTriggers = requiredTriggers.filter(t => !foundTriggers.includes(t));

    if (missingTriggers.length > 0) {
      logger.error(`❌ Missing triggers: ${missingTriggers.join(', ')}`);
      throw new Error(`Missing required triggers: ${missingTriggers.join(', ')}`);
    }

    logger.info(`✅ All ${requiredTriggers.length} required triggers are present`);

    // Check for required functions
    const requiredFunctions = [
      'update_game_ratings',
      'generate_uuid_v4',
      'create_comment_notification',
      'create_reaction_notification',
      'create_friend_request_notification',
      'update_friendship_user_arrays',
      'rebuild_user_friendship_arrays',
    ];

    const functionResults = await sqlClient`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_name = ANY(${requiredFunctions})
    `;

    const foundFunctions = functionResults.map(r => r.routine_name);
    const missingFunctions = requiredFunctions.filter(f => !foundFunctions.includes(f));

    if (missingFunctions.length > 0) {
      logger.error(`❌ Missing functions: ${missingFunctions.join(', ')}`);
      throw new Error(`Missing required functions: ${missingFunctions.join(', ')}`);
    }

    logger.info(`✅ All ${requiredFunctions.length} required functions are present`);
  } catch (error) {
    logger.error('❌ Trigger validation failed:', error);
    throw error;
  }
}

// ============================================================================
// DATABASE SETUP OPERATIONS
// ============================================================================

/**
 * Copy custom migrations to drizzle directory
 */
async function copyCustomMigrations(): Promise<void> {
  const sourceDir = join(process.cwd(), 'src/lib/db/migrations');
  const targetDir = join(process.cwd(), 'drizzle');

  // Ensure target directory exists
  mkdirSync(targetDir, { recursive: true });

  // Function to recursively get all SQL files from the src/lib/db/migrations directory
  function getAllSqlFiles(dir: string): string[] {
    const files: string[] = [];
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...getAllSqlFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.sql')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  // Get all SQL files recursively
  const files = getAllSqlFiles(sourceDir);

  // Copy each file to target directory
  files.forEach(file => {
    const relativePath = file.replace(sourceDir, '').replace(/^\//, '');
    const targetPath = join(targetDir, relativePath);

    // Ensure the target directory exists
    mkdirSync(join(targetDir, relativePath.split('/').slice(0, -1).join('/')), { recursive: true });

    copyFileSync(file, targetPath);
    logger.info(`Copied ${relativePath} to drizzle directory`);
  });
}

/**
 * Setup database (complete or triggers-only)
 */
async function setupDatabase(
  mode: 'complete' | 'triggers-only' = 'complete',
  environment = 'development',
  runTests = false
): Promise<void> {
  logScriptHeader(`Database Setup (${mode})`, environment);

  try {
    const db = createDatabaseClient({ env: environment });

    if (mode === 'complete') {
      // Full database setup
      logger.info('🚀 Starting complete database setup...');
      logger.info('================================================\n');

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
        logger.error(JSON.stringify(error, null, 2));
        logger.info('⚠️  Database might be already clean or error during cleanup');
      }

      // Step 2: Generate Drizzle migrations
      await runCommand('pnpm db:generate:safe', 'Generating Drizzle migrations (safe mode)');

      // Step 3: Copy custom migrations
      await copyCustomMigrations();

      // Step 4: Push schema to database with --force flag
      await runCommand('drizzle-kit push --force', 'Creating database tables (force mode)');

      // Step 5: Wait for tables to be ready
      logger.info('\n⏳ Waiting for tables to be ready...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 6: Create migration tracking table
      logger.info('\n📋 Step 6: Creating migration tracking table...');
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
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_migration_versions_name ON migration_versions(name);
      `);
      logger.info('✅ Migration tracking table created');

      // Step 7: Run tests if requested
      if (runTests) {
        await runCommand('npx tsx src/lib/db/seed/test-trigger.ts', 'Testing triggers');
      }

      logScriptFooter('Complete Database Setup', true, [
        'Run "npx tsx src/lib/db/seed/test-trigger.ts" to test the triggers',
        'Run "pnpm db:seed:dev" to seed the database with sample data',
      ]);
    }

    // Always set up triggers (for both modes)
    logger.info('\n⚡ Setting up database triggers...');
    await setupAllTriggers(db, { dropExisting: true });

    if (mode === 'triggers-only') {
      logScriptFooter('Database Triggers Setup', true, [
        'Run "npx tsx src/lib/db/seed/test-trigger.ts" to test the triggers',
        'Use your application - triggers will automatically update ratings',
      ]);
    }
  } catch (error) {
    handleScriptError(error, `Database setup (${mode})`);
  }
}

// ============================================================================
// TRUNCATION OPERATIONS
// ============================================================================

/**
 * Truncate tables based on scope
 */
async function truncateTables(scope: 'internal' | 'external' | 'all'): Promise<void> {
  logger.info(`Connecting to database: ${process.env.DATABASE_URL}`);
  await ensureConnection();

  // Debug: List all tables in public schema
  const tables = await sqlClient.unsafe(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
  );
  logger.info('Tables in public schema:', JSON.stringify(tables));
  const testCount = await sqlClient.unsafe('SELECT COUNT(*) as count FROM "seasons"');
  logger.info('Manual SELECT COUNT(*) from seasons:', JSON.stringify(testCount));

  logger.info(`🗑️  Truncating ${scope} tables...`);

  // Helper to truncate a single table and commit
  async function truncateSingleTable(table: string) {
    try {
      const before = await sqlClient.unsafe(`SELECT COUNT(*) as count FROM "${table}"`);
      logger.info(
        `Table ${table} before: ${(before as unknown as any[])[0]?.count ?? 'unknown'} rows`
      );
      await sqlClient.unsafe('TRUNCATE TABLE "' + table + '" CASCADE');
      const after = await sqlClient.unsafe(`SELECT COUNT(*) as count FROM "${table}"`);
      logger.info(
        `Table ${table} after: ${(after as unknown as any[])[0]?.count ?? 'unknown'} rows`
      );
      logger.info(`✅ Truncated ${table}`);
    } catch (error) {
      logger.error(`❌ Error truncating ${table}:`, error);
    }
  }

  if (scope === 'internal' || scope === 'all') {
    logger.info('Truncating internal tables...');
    await truncateAllInternalTables();
  }

  if (scope === 'external' || scope === 'all') {
    logger.info('Truncating external tables...');
    await truncateAllExternalTables();
  }

  logger.info(`✅ Finished truncating ${scope} tables`);
}

async function truncateAllInternalTables() {
  try {
    // Truncate each table individually with hardcoded statements
    logger.info('Truncating users table...');
    const beforeUsers = await sqlClient`SELECT COUNT(*) as count FROM "users"`;
    logger.info(`Table users before: ${beforeUsers[0]?.count ?? 'unknown'} rows`);
    await sqlDirect`TRUNCATE TABLE "users" CASCADE`;
    const afterUsers = await sqlClient`SELECT COUNT(*) as count FROM "users"`;
    logger.info(`Table users after: ${afterUsers[0]?.count ?? 'unknown'} rows`);
    logger.info('✅ Truncated users');

    logger.info('Truncating game_logs table...');
    const beforeGameLogs = await sqlClient`SELECT COUNT(*) as count FROM "game_logs"`;
    logger.info(`Table game_logs before: ${beforeGameLogs[0]?.count ?? 'unknown'} rows`);
    await sqlDirect`TRUNCATE TABLE "game_logs" CASCADE`;
    const afterGameLogs = await sqlClient`SELECT COUNT(*) as count FROM "game_logs"`;
    logger.info(`Table game_logs after: ${afterGameLogs[0]?.count ?? 'unknown'} rows`);
    logger.info('✅ Truncated game_logs');

    logger.info('Truncating game_ratings table...');
    const beforeGameRatings = await sqlClient`SELECT COUNT(*) as count FROM "game_ratings"`;
    logger.info(`Table game_ratings before: ${beforeGameRatings[0]?.count ?? 'unknown'} rows`);
    await sqlDirect`TRUNCATE TABLE "game_ratings" CASCADE`;
    const afterGameRatings = await sqlClient`SELECT COUNT(*) as count FROM "game_ratings"`;
    logger.info(`Table game_ratings after: ${afterGameRatings[0]?.count ?? 'unknown'} rows`);
    logger.info('✅ Truncated game_ratings');

    logger.info('Truncating friendships table...');
    const beforeFriendships = await sqlClient`SELECT COUNT(*) as count FROM "friendships"`;
    logger.info(`Table friendships before: ${beforeFriendships[0]?.count ?? 'unknown'} rows`);
    await sqlDirect`TRUNCATE TABLE "friendships" CASCADE`;
    const afterFriendships = await sqlClient`SELECT COUNT(*) as count FROM "friendships"`;
    logger.info(`Table friendships after: ${afterFriendships[0]?.count ?? 'unknown'} rows`);
    logger.info('✅ Truncated friendships');

    logger.info('Truncating reactions table...');
    const beforeReactions = await sqlClient`SELECT COUNT(*) as count FROM "reactions"`;
    logger.info(`Table reactions before: ${beforeReactions[0]?.count ?? 'unknown'} rows`);
    await sqlDirect`TRUNCATE TABLE "reactions" CASCADE`;
    const afterReactions = await sqlClient`SELECT COUNT(*) as count FROM "reactions"`;
    logger.info(`Table reactions after: ${afterReactions[0]?.count ?? 'unknown'} rows`);
    logger.info('✅ Truncated reactions');

    logger.info('Truncating comments table...');
    const beforeComments = await sqlClient`SELECT COUNT(*) as count FROM "comments"`;
    logger.info(`Table comments before: ${beforeComments[0]?.count ?? 'unknown'} rows`);
    await sqlDirect`TRUNCATE TABLE "comments" CASCADE`;
    const afterComments = await sqlClient`SELECT COUNT(*) as count FROM "comments"`;
    logger.info(`Table comments after: ${afterComments[0]?.count ?? 'unknown'} rows`);
    logger.info('✅ Truncated comments');

    logger.info('Truncating notifications table...');
    const beforeNotifications = await sqlClient`SELECT COUNT(*) as count FROM "notifications"`;
    logger.info(`Table notifications before: ${beforeNotifications[0]?.count ?? 'unknown'} rows`);
    await sqlDirect`TRUNCATE TABLE "notifications" CASCADE`;
    const afterNotifications = await sqlClient`SELECT COUNT(*) as count FROM "notifications"`;
    logger.info(`Table notifications after: ${afterNotifications[0]?.count ?? 'unknown'} rows`);
    logger.info('✅ Truncated notifications');
  } catch (error) {
    logger.error('❌ Error truncating internal tables:', error);
  }
}

async function truncateAllExternalTables() {
  try {
    // Truncate each table individually with hardcoded statements
    logger.info('Truncating seasons table...');
    const beforeSeasons = await sqlClient`SELECT COUNT(*) as count FROM "seasons"`;
    logger.info(`Table seasons before: ${beforeSeasons[0]?.count ?? 'unknown'} rows`);
    await sqlDirect`TRUNCATE TABLE "seasons" CASCADE`;
    const afterSeasons = await sqlClient`SELECT COUNT(*) as count FROM "seasons"`;
    logger.info(`Table seasons after: ${afterSeasons[0]?.count ?? 'unknown'} rows`);
    logger.info('✅ Truncated seasons');

    logger.info('Truncating leagues table...');
    const beforeLeagues = await sqlClient`SELECT COUNT(*) as count FROM "leagues"`;
    logger.info(`Table leagues before: ${beforeLeagues[0]?.count ?? 'unknown'} rows`);
    await sqlDirect`TRUNCATE TABLE "leagues" CASCADE`;
    const afterLeagues = await sqlClient`SELECT COUNT(*) as count FROM "leagues"`;
    logger.info(`Table leagues after: ${afterLeagues[0]?.count ?? 'unknown'} rows`);
    logger.info('✅ Truncated leagues');

    logger.info('Truncating teams table...');
    const beforeTeams = await sqlClient`SELECT COUNT(*) as count FROM "teams"`;
    logger.info(`Table teams before: ${beforeTeams[0]?.count ?? 'unknown'} rows`);
    await sqlDirect`TRUNCATE TABLE "teams" CASCADE`;
    const afterTeams = await sqlClient`SELECT COUNT(*) as count FROM "teams"`;
    logger.info(`Table teams after: ${afterTeams[0]?.count ?? 'unknown'} rows`);
    logger.info('✅ Truncated teams');

    logger.info('Truncating nba_games table...');
    const beforeGames = await sqlClient`SELECT COUNT(*) as count FROM "nba_games"`;
    logger.info(`Table nba_games before: ${beforeGames[0]?.count ?? 'unknown'} rows`);
    await sqlDirect`TRUNCATE TABLE "nba_games" CASCADE`;
    const afterGames = await sqlClient`SELECT COUNT(*) as count FROM "nba_games"`;
    logger.info(`Table nba_games after: ${afterGames[0]?.count ?? 'unknown'} rows`);
    logger.info('✅ Truncated nba_games');

    logger.info('Truncating nba_players table...');
    const beforePlayers = await sqlClient`SELECT COUNT(*) as count FROM "nba_players"`;
    logger.info(`Table nba_players before: ${beforePlayers[0]?.count ?? 'unknown'} rows`);
    await sqlDirect`TRUNCATE TABLE "nba_players" CASCADE`;
    const afterPlayers = await sqlClient`SELECT COUNT(*) as count FROM "nba_players"`;
    logger.info(`Table nba_players after: ${afterPlayers[0]?.count ?? 'unknown'} rows`);
    logger.info('✅ Truncated nba_players');
  } catch (error) {
    logger.error('❌ Error truncating external tables:', error);
  }
}

async function dropTables(scope: 'internal' | 'external' | 'all'): Promise<void> {
  logger.info(`Connecting to database: ${process.env.DATABASE_URL}`);
  await ensureConnection();

  logger.info(`🗑️  Dropping ${scope} tables...`);

  if (scope === 'internal' || scope === 'all') {
    logger.info('Dropping internal tables...');
    await dropAllInternalTables();
  }

  if (scope === 'external' || scope === 'all') {
    logger.info('Dropping external tables...');
    await dropAllExternalTables();
  }

  logger.info(`✅ Finished dropping ${scope} tables`);
}

async function dropAllInternalTables() {
  try {
    // Drop each table individually with hardcoded statements
    logger.info('Dropping notifications table...');
    await sqlDirect`DROP TABLE IF EXISTS "notifications" CASCADE`;
    logger.info('✅ Dropped notifications');

    logger.info('Dropping comments table...');
    await sqlDirect`DROP TABLE IF EXISTS "comments" CASCADE`;
    logger.info('✅ Dropped comments');

    logger.info('Dropping reactions table...');
    await sqlDirect`DROP TABLE IF EXISTS "reactions" CASCADE`;
    logger.info('✅ Dropped reactions');

    logger.info('Dropping friendships table...');
    await sqlDirect`DROP TABLE IF EXISTS "friendships" CASCADE`;
    logger.info('✅ Dropped friendships');

    logger.info('Dropping game_ratings table...');
    await sqlDirect`DROP TABLE IF EXISTS "game_ratings" CASCADE`;
    logger.info('✅ Dropped game_ratings');

    logger.info('Dropping game_logs table...');
    await sqlDirect`DROP TABLE IF EXISTS "game_logs" CASCADE`;
    logger.info('✅ Dropped game_logs');

    logger.info('Dropping users table...');
    await sqlDirect`DROP TABLE IF EXISTS "users" CASCADE`;
    logger.info('✅ Dropped users');
  } catch (error) {
    logger.error('❌ Error dropping internal tables:', error);
  }
}

async function dropAllExternalTables() {
  try {
    // Drop each table individually with hardcoded statements
    logger.info('Dropping nba_players table...');
    await sqlDirect`DROP TABLE IF EXISTS "nba_players" CASCADE`;
    logger.info('✅ Dropped nba_players');

    logger.info('Dropping nba_games table...');
    await sqlDirect`DROP TABLE IF EXISTS "nba_games" CASCADE`;
    logger.info('✅ Dropped nba_games');

    logger.info('Dropping teams table...');
    await sqlDirect`DROP TABLE IF EXISTS "teams" CASCADE`;
    logger.info('✅ Dropped teams');

    logger.info('Dropping leagues table...');
    await sqlDirect`DROP TABLE IF EXISTS "leagues" CASCADE`;
    logger.info('✅ Dropped leagues');

    logger.info('Dropping seasons table...');
    await sqlDirect`DROP TABLE IF EXISTS "seasons" CASCADE`;
    logger.info('✅ Dropped seasons');
  } catch (error) {
    logger.error('❌ Error dropping external tables:', error);
  }
}

// ============================================================================
// MAIN CLI INTERFACE
// ============================================================================

/**
 * Main CLI interface for database operations
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  const options = parseScriptArgs();

  // Parse mode and env for reset
  if (command === 'reset') {
    let mode = 'canonical';
    let env = 'dev';
    for (let i = 1; i < args.length; i++) {
      if (args[i].startsWith('--mode=')) {
        mode = args[i].split('=')[1];
      }
      if (args[i].startsWith('--env=')) {
        env = args[i].split('=')[1];
      }
    }
    if (!['canonical', 'drizzle'].includes(mode)) {
      console.log('Usage: pnpm db:reset --mode=canonical|drizzle --env=dev|staging|prod');
      process.exit(1);
    }
    if (mode === 'canonical') {
      await runCanonicalReset(env);
    } else if (mode === 'drizzle') {
      await setupDatabase('complete', env);
    }
    return;
  }

  try {
    switch (command) {
      case 'migrate':
        await applyAllMigrations(options.environment, args.includes('--dry-run'));
        break;

      case 'migrate-file':
        const filePath = args[1];
        if (!filePath) {
          throw new Error('Migration file path is required');
        }
        await applySpecificMigration(filePath, args.includes('--dry-run'));
        break;

      case 'view':
        await viewMigrations(options.environment);
        break;

      case 'validate':
        await validateMigrations();
        break;

      case 'validate-triggers':
        await validateTriggers();
        break;

      case 'setup':
        const mode = (args[1] as 'complete' | 'triggers-only') || 'complete';
        await setupDatabase(mode, options.environment, options.test);
        break;

      case 'copy-migrations':
        await copyCustomMigrations();
        break;

      case 'truncate':
        // Parse scope from --scope=value format or direct value
        let scope: 'internal' | 'external' | 'all';
        const scopeArg = args[1];

        if (!scopeArg) {
          throw new Error('Scope is required: --scope=internal|external|all');
        }

        // Handle --scope=value format
        if (scopeArg.startsWith('--scope=')) {
          scope = scopeArg.split('=')[1] as 'internal' | 'external' | 'all';
        } else {
          scope = scopeArg as 'internal' | 'external' | 'all';
        }

        if (!['internal', 'external', 'all'].includes(scope)) {
          throw new Error('Invalid scope. Must be: internal|external|all');
        }

        await truncateTables(scope);
        break;

      case 'drop':
        // Parse scope from --scope=value format or direct value
        let dropScope: 'internal' | 'external' | 'all';
        const dropScopeArg = args[1];

        if (!dropScopeArg) {
          throw new Error('Scope is required: --scope=internal|external|all');
        }

        // Handle --scope=value format
        if (dropScopeArg.startsWith('--scope=')) {
          dropScope = dropScopeArg.split('=')[1] as 'internal' | 'external' | 'all';
        } else {
          dropScope = dropScopeArg as 'internal' | 'external' | 'all';
        }

        if (!['internal', 'external', 'all'].includes(dropScope)) {
          throw new Error('Invalid scope. Must be: internal|external|all');
        }

        await dropTables(dropScope);
        break;

      default:
        logger.info(`
Database Manager - Unified database operations

Usage: tsx scripts/db/database-manager.ts <command> [options]

Commands:
  migrate [--dry-run]           Apply all pending migrations
  migrate-file <path> [--dry-run] Apply a specific migration file
  view                         View migration history
  validate                     Validate migration files
  validate-triggers            Validate triggers and functions in database
  setup [complete|triggers-only] Setup database (default: complete)
  copy-migrations              Copy custom migrations to drizzle directory
  truncate --scope=<scope>     Truncate tables (scope: internal|external|all)
  drop --scope=<scope>         Drop tables (scope: internal|external|all)
  reset --mode=canonical|drizzle --env=dev|staging|prod Reset database to canonical schema or setup drizzle

Options:
  --env=<environment>          Environment (default: development)
  --test                      Run tests after setup
  --dry-run                   Show what would be done without making changes

Examples:
  tsx scripts/db/database-manager.ts migrate
  tsx scripts/db/database-manager.ts migrate-file drizzle/000_schema_with_cascade.sql
  tsx scripts/db/database-manager.ts setup complete
  tsx scripts/db/database-manager.ts truncate --scope=internal
  tsx scripts/db/database-manager.ts drop --scope=external
  tsx scripts/db/database-manager.ts reset --mode=canonical --env=dev
  tsx scripts/db/database-manager.ts reset --mode=drizzle --env=staging
        `);
        break;
    }
  } catch (error) {
    logger.error('Database operation failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logger.error('Database manager failed:', error);
    process.exit(1);
  });
}

// Export all functions for use in other modules
export {
  applyAllMigrations,
  applySpecificMigration,
  viewMigrations,
  validateMigrations,
  setupDatabase,
  copyCustomMigrations,
  truncateTables,
  dropTables,
  parseSqlStatements,
  ensureConnection,
  verifyConnection,
};
