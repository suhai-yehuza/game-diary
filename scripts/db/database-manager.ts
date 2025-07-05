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
      await runCommand('pnpm db:generate', 'Generating Drizzle migrations');

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
  await ensureConnection();

  logger.info(`🗑️  Truncating ${scope} tables...`);

  try {
    // Start transaction
    await sqlClient.unsafe('BEGIN');

    if (scope === 'internal' || scope === 'all') {
      logger.info('Truncating internal tables...');

      // Internal tables (user-generated content)
      const internalTables = [
        'game_logs',
        'friendships',
        'reactions',
        'comments',
        'notifications',
        'user_preferences',
        'user_sessions',
      ];

      for (const table of internalTables) {
        try {
          await sqlClient.unsafe(`TRUNCATE TABLE "${table}" CASCADE`);
          logger.info(`✅ Truncated ${table}`);
        } catch (error) {
          logger.warn(
            `⚠️  Could not truncate ${table}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }

    if (scope === 'external' || scope === 'all') {
      logger.info('Truncating external tables...');

      // External tables (API data)
      const externalTables = [
        'nba_games',
        'nba_teams',
        'nba_players',
        'nba_seasons',
        'nba_leagues',
        'nba_standings',
        'nba_game_statistics',
        'nba_player_statistics',
        'nba_team_statistics',
      ];

      for (const table of externalTables) {
        try {
          await sqlClient.unsafe(`TRUNCATE TABLE "${table}" CASCADE`);
          logger.info(`✅ Truncated ${table}`);
        } catch (error) {
          logger.warn(
            `⚠️  Could not truncate ${table}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }

    // Commit transaction
    await sqlClient.unsafe('COMMIT');
    logger.info(`✅ Successfully truncated ${scope} tables`);
  } catch (error) {
    await sqlClient.unsafe('ROLLBACK');
    logger.error('❌ Error truncating tables:', error);
    throw error;
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

      case 'setup':
        const mode = (args[1] as 'complete' | 'triggers-only') || 'complete';
        await setupDatabase(mode, options.environment, options.test);
        break;

      case 'copy-migrations':
        await copyCustomMigrations();
        break;

      case 'truncate':
        const scope = args[1] as 'internal' | 'external' | 'all';
        if (!scope) {
          throw new Error('Scope is required: --scope=internal|external|all');
        }
        await truncateTables(scope);
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
  setup [complete|triggers-only] Setup database (default: complete)
  copy-migrations              Copy custom migrations to drizzle directory
  truncate --scope=<scope>     Truncate tables (scope: internal|external|all)

Options:
  --env=<environment>          Environment (default: development)
  --test                      Run tests after setup
  --dry-run                   Show what would be done without making changes

Examples:
  tsx scripts/db/database-manager.ts migrate
  tsx scripts/db/database-manager.ts migrate-file drizzle/000_schema_with_cascade.sql
  tsx scripts/db/database-manager.ts setup complete
  tsx scripts/db/database-manager.ts truncate --scope=internal
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
  parseSqlStatements,
  ensureConnection,
  verifyConnection,
};
