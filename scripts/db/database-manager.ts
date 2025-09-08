#!/usr/bin/env tsx
/**
 * @fileoverview Unified database management system for migrations, setup, and maintenance.
 * Consolidates all database operations into a single, well-organized module.
 *
 * Admin User Preservation:
 * - Users with isAdmin = true are automatically preserved during table truncation
 * - Set isAdmin = true for any user accounts you want to keep during cleanup operations
 */

import { loadEnvironmentVariables } from '@/lib/utils/env-loader';

// Load environment variables safely
loadEnvironmentVariables();

import { createHash } from 'crypto';
import { readFileSync, readdirSync, existsSync, mkdirSync, copyFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

import { sql } from 'drizzle-orm';
import { neon, neonConfig } from '@neondatabase/serverless';
import { neon as neonDirect } from '@neondatabase/serverless';

import { logger } from '@src/lib/utils/logger';
import { createDatabaseClient } from '@src/lib/db';
import { setupAllTriggersFromSql } from '@scripts/utils/database-triggers';
import {
  parseScriptArgs,
  logScriptHeader,
  logScriptFooter,
  handleScriptError,
} from '@scripts/utils/script-utils';
import type { IMigration, IMigrationVerification, IMigrationVersion } from '@src/lib/types';
import { SchemaConsistencyChecker } from './ensure-schema-consistency';
import { syncReactionEmojis } from '@src/lib/db/seed/shared-seeding-utils';

// Import the centralized reset function
import { execSync } from 'child_process';

async function runCanonicalReset(env: string) {
  // Use the centralized reset script instead of duplicating logic
  logger.info(`🔄 Running canonical reset via centralized script for ${env} environment...`);

  try {
    // Call the centralized reset script
    execSync(`npx tsx scripts/db/reset-with-env.ts --env=${env}`, {
      stdio: 'inherit',
      encoding: 'utf8',
      cwd: process.cwd(),
    });
    logger.info('✅ Canonical schema reset completed successfully via centralized script!');
  } catch (error) {
    logger.error('❌ Canonical reset failed:', error);
    throw error;
  }
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
// Use the same connection method as the main application
const sqlClient = neon(process.env.DATABASE_URL!);

const sqlDirect = neonDirect(process.env.DATABASE_URL!);

// Also create a Drizzle client for consistency
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@src/lib/db/schema';
const drizzleClient = drizzle(sqlClient, { schema });

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
    logger.error(
      'Database connection verification failed:',
      error instanceof Error ? error : new Error(String(error))
    );
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

/**
 * Run interactive commands that require user input
 */
async function runInteractiveCommand(command: string, description: string): Promise<void> {
  logger.info(`\n📌 ${description}...`);
  try {
    // For drizzle-kit push --force, we need to handle the interactive prompt
    if (command.includes('drizzle-kit push --force')) {
      logger.info('🔧 Detected drizzle-kit push --force, using direct SQL execution instead...');
      // Instead of using drizzle-kit push --force, apply the migration file directly
      // Find the most recent migration file
      const drizzleDir = 'drizzle';
      const migrationFiles = readdirSync(drizzleDir)
        .filter(file => file.endsWith('.sql') && file !== '000_full_schema_reset.sql')
        .sort()
        .reverse();

      if (migrationFiles.length > 0) {
        const migrationFile = `drizzle/${migrationFiles[0]}`;
        logger.info(`📄 Found migration file: ${migrationFile}`);

        const sqlContent = readFileSync(migrationFile, 'utf-8');
        const statements = sqlContent.split('--> statement-breakpoint').filter(stmt => stmt.trim());

        logger.info(`📄 Applying ${statements.length} SQL statements from migration file...`);

        // Execute all statements using Drizzle client for better compatibility
        logger.info('  🔧 Executing statements using Drizzle client for better compatibility...');

        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i].trim();
          if (statement) {
            try {
              logger.info(
                `  🔧 Executing statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`
              );
              // Try Drizzle client first, fallback to direct SQL
              try {
                await drizzleClient.execute(sql.raw(statement));
              } catch (drizzleError) {
                logger.warn(
                  `  ⚠️  Drizzle execution failed, trying direct SQL: ${drizzleError instanceof Error ? drizzleError.message : String(drizzleError)}`
                );
                await sqlClient.unsafe(statement);
              }
              logger.info(`  ✅ Applied statement ${i + 1}/${statements.length}`);

              // Small delay to ensure statement is processed
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
              logger.error(
                `  ❌ Statement ${i + 1} failed: ${error instanceof Error ? error.message : String(error)}`
              );
              // Log the full statement for debugging
              logger.error(`  📄 Failed statement: ${statement}`);
              throw error;
            }
          }
        }

        logger.info('  ✅ All statements executed successfully');

        // Verify that tables were actually created
        logger.info('  🔍 Verifying table creation...');
        try {
          const tableCount = await sqlClient.unsafe(
            "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'"
          );
          logger.info(
            `  📊 Found ${(tableCount as any)[0]?.count || 'unknown'} tables in public schema`
          );

          // List the actual tables
          const tables = await sqlClient.unsafe(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
          );
          const tableNames = (tables as any).map((t: any) => t.table_name);
          logger.info(`  📋 Tables: ${tableNames.join(', ')}`);
        } catch (verifyError) {
          logger.warn('  ⚠️  Table verification failed (non-critical)');
        }
      } else {
        throw new Error(`No migration files found in ${drizzleDir} directory`);
      }
    } else {
      // For other commands, use the regular runCommand logic
      const { stdout, stderr } = await execAsync(command);
      if (stdout) logger.info(stdout);
      if (stderr && !stderr.includes('Warning') && !stderr.includes('deprecat'))
        logger.error(stderr);
    }
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
  const types = ['data', 'functions', 'rls', 'triggers'];
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
    logger.error(
      'Error recording migration:',
      error instanceof Error ? error : new Error(String(error))
    );
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
    logger.error(
      `❌ Migration ${file} failed:`,
      error instanceof Error ? error : new Error(String(error))
    );
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
        logger.error(
          `Failed to apply migration ${migration.name}:`,
          error instanceof Error ? error : new Error(String(error))
        );
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
      logger.info('✅ Added triggers:', { triggers: changes.added.triggers });
    }
    if (changes.added.functions?.length) {
      logger.info('✅ Added functions:', { functions: changes.added.functions });
    }
    if (changes.added.indexes?.length) {
      logger.info('✅ Added indexes:', { indexes: changes.added.indexes });
    }

    // Step 7: Sync reaction emojis after all migrations are complete
    if (!dryRun) {
      logger.info('\n🔄 Step 7: Syncing reaction emojis with application constants...');
      try {
        await syncReactionEmojis(db, 'Migration Process');
        logger.info('✅ Reaction emojis synced successfully');
      } catch (error) {
        logger.warn(`⚠️  Warning: Could not sync reaction emojis: ${error}`);
        logger.info('📋 This may be normal if the reaction_emojis table does not exist yet');
      }
    } else {
      logger.info('\n⏭️  Step 7: Skipping reaction emoji sync (dry run mode)');
    }

    logger.info(`\n🎉 Migration process completed! Applied ${appliedCount} migrations.`);
  } catch (error) {
    logger.error(
      'Migration process failed:',
      error instanceof Error ? error : new Error(String(error))
    );
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
    logger.error(
      'Error applying migration:',
      error instanceof Error ? error : new Error(String(error))
    );
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

      logger.info('\nMigration:', { name: migration.name });
      logger.info('Status:', { status: migration.status });
      logger.info('Executed at:', { executedAt });
      logger.info('Execution time:', { executionTime });

      if (migration.error_message) {
        logger.info('Error:', { error_message: migration.error_message });
      }

      logger.info('Rollback executed:', { rollback_executed: migration.rollback_executed });
      logger.info('Checksum:', { checksum: migration.checksum });
      logger.info('------------------');
    });

    logger.info(`\nTotal migrations: ${migrations.length}`);
  } catch (error) {
    logger.error(
      'Error viewing migrations:',
      error instanceof Error ? error : new Error(String(error))
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
    logger.error(
      '❌ Error validating migrations:',
      error instanceof Error ? error : new Error(String(error))
    );
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
      'generate_uuid_v7',
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
    logger.error(
      '❌ Trigger validation failed:',
      error instanceof Error ? error : new Error(String(error))
    );
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

  // Remove any existing Drizzle-generated files to avoid conflicts
  const existingFiles = readdirSync(targetDir).filter(f => f.endsWith('.sql'));
  const drizzlePattern = /^0000_|^0001_/; // Pattern for Drizzle-generated files
  existingFiles.forEach(file => {
    if (drizzlePattern.test(file)) {
      const filePath = join(targetDir, file);
      unlinkSync(filePath);
      logger.info(`Removed conflicting Drizzle file: ${file}`);
    }
  });

  // Define migration categories and their optimal order
  const migrationCategories = [
    {
      name: 'base_schema',
      pattern: /^000_base_schema\.sql$/,
      priority: 1,
      description: 'Base schema (tables, constraints)',
    },
    {
      name: 'performance_indexes',
      pattern: /^00[1-9]_.*\.sql$/, // Files starting with 001-009 (performance indexes)
      priority: 2,
      description: 'Performance indexes (applied early for query optimization)',
    },
    {
      name: 'functions',
      pattern: /^functions\/.*\.sql$/,
      priority: 3,
      description: 'Database functions (business logic - must exist before triggers)',
    },
    {
      name: 'triggers',
      pattern: /^triggers\/.*\.sql$/,
      priority: 4,
      description: 'Database triggers (depend on functions and tables)',
    },
    {
      name: 'rls_policies',
      pattern: /^rls\/.*\.sql$/,
      priority: 5,
      description: 'Row Level Security policies (applied after all objects exist)',
    },
    {
      name: 'data',
      pattern: /^data\/.*\.sql$/,
      priority: 6,
      description: 'Reference data, seed data (applied last)',
    },
  ];

  // Function to recursively get all SQL files from the migrations directory
  function getAllSqlFiles(
    dir: string,
    basePath = ''
  ): Array<{ path: string; relativePath: string }> {
    const files: Array<{ path: string; relativePath: string }> = [];
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = join(basePath, entry.name);

      if (entry.isDirectory()) {
        files.push(...getAllSqlFiles(fullPath, relativePath));
      } else if (entry.isFile() && entry.name.endsWith('.sql')) {
        files.push({ path: fullPath, relativePath });
      }
    }

    return files;
  }

  // Get all SQL files
  const allFiles = getAllSqlFiles(sourceDir);

  // Categorize files by their purpose
  const categorizedFiles: { [key: string]: Array<{ path: string; relativePath: string }> } = {};

  allFiles.forEach(file => {
    let categorized = false;

    for (const category of migrationCategories) {
      if (category.pattern.test(file.relativePath)) {
        if (!categorizedFiles[category.name]) {
          categorizedFiles[category.name] = [];
        }
        categorizedFiles[category.name].push(file);
        categorized = true;
        break;
      }
    }

    if (!categorized) {
      // Handle files that don't match any category
      if (!categorizedFiles['other']) {
        categorizedFiles['other'] = [];
      }
      categorizedFiles['other'].push(file);
      logger.warn(`Uncategorized migration file: ${file.relativePath}`);
    }
  });

  // Copy files in optimal order
  let targetCounter = 1;

  migrationCategories.forEach(category => {
    const files = categorizedFiles[category.name];
    if (files && files.length > 0) {
      logger.info(`Processing ${category.description} (${files.length} files)`);

      // Sort files within category alphabetically for consistency
      files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

      files.forEach(file => {
        const targetName = `${String(targetCounter).padStart(4, '0')}_${file.relativePath.replace(/\//g, '_')}`;
        const targetPath = join(targetDir, targetName);

        copyFileSync(file.path, targetPath);
        logger.info(`Copied ${file.relativePath} to drizzle directory as ${targetName}`);
        targetCounter++;
      });
    }
  });

  // Handle any uncategorized files
  if (categorizedFiles['other']) {
    logger.warn(`Found ${categorizedFiles['other'].length} uncategorized migration files:`);
    categorizedFiles['other'].forEach(file => {
      const targetName = `${String(targetCounter).padStart(4, '0')}_${file.relativePath.replace(/\//g, '_')}`;
      const targetPath = join(targetDir, targetName);

      copyFileSync(file.path, targetPath);
      logger.info(`Copied ${file.relativePath} to drizzle directory as ${targetName}`);
      targetCounter++;
    });
  }

  logger.info(`✅ Migration copy completed. Total files processed: ${targetCounter - 1}`);
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

    // Ensure schema exists before setting up triggers (for both modes)
    if (mode === 'triggers-only') {
      logger.info('🚀 Starting triggers-only setup (ensuring schema exists)...');
      logger.info('================================================\n');
    } else {
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
    }

    // Step 2: Ensure schema exists (for both modes)
    logger.info('📋 Step 2: Ensuring database schema exists...');

    try {
      // Check if key tables exist
      const tablesExist = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('users', 'game_logs', 'friendships', 'comments', 'reactions', 'notifications')
      `);

      const tableCount = parseInt(String(tablesExist.rows[0]?.count || '0'));

      if (tableCount < 6) {
        logger.info('⚠️  Schema incomplete, setting up database tables...');

        // Generate Drizzle migrations
        await runCommand('pnpm db:generate:safe', 'Generating Drizzle migrations (safe mode)');

        // Copy custom migrations
        await copyCustomMigrations();

        // Push schema to database with --force flag
        await runInteractiveCommand(
          'drizzle-kit push --force',
          'Creating database tables (force mode)'
        );

        // Wait for tables to be ready
        logger.info('\n⏳ Waiting for tables to be ready...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        logger.info('✅ Database schema setup complete');
      } else {
        logger.info('✅ Database schema already exists');
      }
    } catch (error) {
      // If the query fails (e.g., no tables exist yet), set up the schema
      logger.info('⚠️  Could not check existing schema, setting up database tables...');

      // Generate Drizzle migrations
      await runCommand('pnpm db:generate:safe', 'Generating Drizzle migrations (safe mode)');

      // Copy custom migrations
      await copyCustomMigrations();

      // Push schema to database with --force flag
      await runInteractiveCommand(
        'drizzle-kit push --force',
        'Creating database tables (force mode)'
      );

      // Wait for tables to be ready
      logger.info('\n⏳ Waiting for tables to be ready...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      logger.info('✅ Database schema setup complete');
    }

    // Step 3: Create migration tracking table (for both modes)
    logger.info('\n📋 Step 3: Creating migration tracking table...');
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

    // Step 4: Run tests if requested (complete mode only)
    if (mode === 'complete' && runTests) {
      await runCommand('npx tsx src/lib/db/seed/test-trigger.ts', 'Testing triggers');
    }

    // Step 5: Set up triggers (for both modes)
    logger.info('\n⚡ Setting up database triggers...');
    await setupAllTriggersFromSql(db, { dropExisting: true });

    if (mode === 'complete') {
      logScriptFooter('Complete Database Setup', true, [
        'Run "npx tsx src/lib/db/seed/test-trigger.ts" to test the triggers',
        'Run "pnpm db:seed:dev" to seed the database with sample data',
      ]);
    } else {
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
 *
 * Note: When truncating internal tables, users with isAdmin = true are automatically preserved
 * in the users table instead of being truncated. This allows maintaining admin/important user
 * accounts during cleanup operations.
 */
async function truncateTables(scope: 'internal' | 'external' | 'all'): Promise<void> {
  logger.info(`Connecting to database: ${process.env.DATABASE_URL}`);
  await ensureConnection();

  // Debug: List all tables in public schema
  const tables = await sqlClient.unsafe(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
  );
  logger.info('Tables in public schema:', { tables: JSON.stringify(tables) });
  const testCount = await sqlClient.unsafe('SELECT COUNT(*) as count FROM "seasons"');
  logger.info('Manual SELECT COUNT(*) from seasons:', { testCount: JSON.stringify(testCount) });

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
      logger.error(
        `❌ Error truncating ${table}:`,
        error instanceof Error ? error : new Error(String(error))
      );
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

    // Check for admin users to preserve
    logger.info('Checking for admin users to preserve...');

    try {
      // Query for admin users
      const adminUsers = await sqlClient`SELECT id, username FROM "users" WHERE "isAdmin" = true`;
      const adminUserCount = adminUsers.length;

      if (adminUserCount > 0) {
        logger.info(
          `Found ${adminUserCount} admin users to preserve: ${adminUsers.map(u => `${u.username} (${u.id})`).join(', ')}`
        );

        // Delete all non-admin users
        const deleteQuery = `DELETE FROM "users" WHERE "isAdmin" = false`;
        await sqlClient.unsafe(deleteQuery);
        logger.info(`Deleted non-admin users while preserving ${adminUserCount} admin accounts`);
      } else {
        logger.info('No admin users found, truncating all users');
        await sqlDirect`TRUNCATE TABLE "users" CASCADE`;
      }
    } catch (preserveError) {
      logger.warn(
        `Failed to preserve admin users, falling back to full truncate: ${preserveError instanceof Error ? preserveError.message : String(preserveError)}`
      );
      await sqlDirect`TRUNCATE TABLE "users" CASCADE`;
    }

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
    logger.error(
      '❌ Error truncating internal tables:',
      error instanceof Error ? error : new Error(String(error))
    );
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

    logger.info('Truncating basketball_teams table...');
    const beforeTeams = await sqlClient`SELECT COUNT(*) as count FROM "basketball_teams"`;
    logger.info(`Table basketball_teams before: ${beforeTeams[0]?.count ?? 'unknown'} rows`);
    await sqlDirect`TRUNCATE TABLE "basketball_teams" CASCADE`;
    const afterTeams = await sqlClient`SELECT COUNT(*) as count FROM "basketball_teams"`;
    logger.info(`Table basketball_teams after: ${afterTeams[0]?.count ?? 'unknown'} rows`);
    logger.info('✅ Truncated basketball_teams');

    // Invalidate NBA Hub counts cache since basketball_teams count changed
    try {
      const { NBAHubCacheUtils } = await import('@/lib/cache');
      await NBAHubCacheUtils.invalidateSpecificCountCaches('teams');
      logger.info('✅ Invalidated NBA Hub basketball_teams count cache');
    } catch (cacheError) {
      logger.warn('Failed to invalidate NBA Hub basketball_teams count cache:', cacheError);
    }

    logger.info('Truncating basketball_games table...');
    const beforeGames = await sqlClient`SELECT COUNT(*) as count FROM "basketball_games"`;
    logger.info(`Table basketball_games before: ${beforeGames[0]?.count ?? 'unknown'} rows`);
    await sqlDirect`TRUNCATE TABLE "basketball_games" CASCADE`;
    const afterGames = await sqlClient`SELECT COUNT(*) as count FROM "basketball_games"`;
    logger.info(`Table basketball_games after: ${afterGames[0]?.count ?? 'unknown'} rows`);
    logger.info('✅ Truncated basketball_games');

    // Invalidate NBA Hub counts cache since games count changed
    try {
      const { NBAHubCacheUtils } = await import('@/lib/cache');
      await NBAHubCacheUtils.invalidateSpecificCountCaches('games');
      logger.info('✅ Invalidated NBA Hub games count cache');
    } catch (cacheError) {
      logger.warn('Failed to invalidate NBA Hub games count cache:', cacheError);
    }

    logger.info('Truncating basketball_players table...');
    const beforePlayers = await sqlClient`SELECT COUNT(*) as count FROM "basketball_players"`;
    logger.info(`Table basketball_players before: ${beforePlayers[0]?.count ?? 'unknown'} rows`);
    await sqlDirect`TRUNCATE TABLE "basketball_players" CASCADE`;
    const afterPlayers = await sqlClient`SELECT COUNT(*) as count FROM "basketball_players"`;
    logger.info(`Table basketball_players after: ${afterPlayers[0]?.count ?? 'unknown'} rows`);
    logger.info('✅ Truncated basketball_players');

    // Invalidate NBA Hub counts cache since players count changed
    try {
      const { NBAHubCacheUtils } = await import('@/lib/cache');
      await NBAHubCacheUtils.invalidateSpecificCountCaches('players');
      logger.info('✅ Invalidated NBA Hub players count cache');
    } catch (cacheError) {
      logger.warn('Failed to invalidate NBA Hub players count cache:', cacheError);
    }
  } catch (error) {
    logger.error(
      '❌ Error truncating external tables:',
      error instanceof Error ? error : new Error(String(error))
    );
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
    logger.error(
      '❌ Error dropping internal tables:',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

async function dropAllExternalTables() {
  try {
    // Drop each table individually with hardcoded statements
    logger.info('Dropping basketball_players table...');
    await sqlDirect`DROP TABLE IF EXISTS "basketball_players" CASCADE`;
    logger.info('✅ Dropped basketball_players');

    logger.info('Dropping basketball_games table...');
    await sqlDirect`DROP TABLE IF EXISTS "basketball_games" CASCADE`;
    logger.info('✅ Dropped basketball_games');

    logger.info('Dropping basketball_teams table...');
    await sqlDirect`DROP TABLE IF EXISTS "basketball_teams" CASCADE`;
    logger.info('✅ Dropped basketball_teams');

    logger.info('Dropping leagues table...');
    await sqlDirect`DROP TABLE IF EXISTS "leagues" CASCADE`;
    logger.info('✅ Dropped leagues');

    logger.info('Dropping seasons table...');
    await sqlDirect`DROP TABLE IF EXISTS "seasons" CASCADE`;
    logger.info('✅ Dropped seasons');
  } catch (error) {
    logger.error(
      '❌ Error dropping external tables:',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

// ============================================================================
// MAIN CLI INTERFACE
// ============================================================================

/**
 * Migrate with schema consistency checks
 */
async function migrateWithSchemaConsistency(
  environment: string,
  dryRun: boolean,
  skipSchemaCheck: boolean
): Promise<void> {
  logger.info(
    `🚀 Starting migration with schema consistency checks for ${environment} environment...`
  );

  if (!skipSchemaCheck) {
    logger.info('🔍 Pre-migration: Checking schema consistency...');
    try {
      const checker = new SchemaConsistencyChecker();
      const consistencyResult = await checker.check();

      if (!consistencyResult.success) {
        logger.warn('⚠️  Schema consistency issues detected:');
        consistencyResult.issues.forEach(issue => logger.warn(`  • ${issue}`));

        if (consistencyResult.recommendations.length > 0) {
          logger.info('💡 Recommendations:');
          consistencyResult.recommendations.forEach(rec => logger.info(`  • ${rec}`));
        }

        logger.info('🔄 Attempting to fix schema consistency issues...');
        try {
          await checker.generateQuickFix();
          logger.info('✅ Schema consistency issues resolved');
        } catch (fixError) {
          logger.warn(`⚠️  Could not auto-fix schema issues: ${fixError}`);
          logger.info('📋 You may need to manually resolve these issues before proceeding');
          logger.info('💡 Run: pnpm db:workflow:full to resolve schema issues');

          if (!dryRun) {
            logger.error('❌ Migration aborted due to schema consistency issues');
            throw new Error('Schema consistency issues must be resolved before migration');
          } else {
            logger.warn('⚠️  Proceeding with dry run despite schema issues');
          }
        }
      } else {
        logger.info('✅ Schema consistency check passed');
      }
    } catch (error) {
      logger.warn(`⚠️  Schema consistency check failed: ${error}`);
      if (!dryRun) {
        logger.error('❌ Migration aborted due to schema consistency check failure');
        throw error;
      } else {
        logger.warn('⚠️  Proceeding with dry run despite schema check failure');
      }
    }
  } else {
    logger.info('⏭️  Skipping schema consistency check (--skip-schema-check flag)');
  }

  // Copy custom migrations to drizzle directory to ensure they're included in Drizzle migrations
  if (!dryRun) {
    logger.info('📋 Copying custom migrations to drizzle directory...');
    try {
      await copyCustomMigrations();
      logger.info('✅ Custom migrations copied to drizzle directory');
    } catch (error) {
      logger.warn(`⚠️  Warning: Could not copy custom migrations: ${error}`);
      logger.info('📋 This may be normal if no custom migrations exist');
    }
  } else {
    logger.info('⏭️  Skipping custom migration copy (dry run mode)');
  }

  // Run the actual migration
  await applyAllMigrations(environment, dryRun);

  // Sync reaction emojis after migrations (ensures all emojis from constants are in database)
  if (!dryRun) {
    logger.info('🔄 Syncing reaction emojis with application constants...');
    try {
      const db = createDatabaseClient({ env: environment });
      await syncReactionEmojis(db, 'Database Migration Manager');
      logger.info('✅ Reaction emojis synced successfully');
    } catch (error) {
      logger.warn(`⚠️  Warning: Could not sync reaction emojis: ${error}`);
      logger.info('📋 This may be normal if the reaction_emojis table does not exist yet');
    }
  } else {
    logger.info('⏭️  Skipping reaction emoji sync (dry run mode)');
  }

  // Post-migration schema validation
  if (!skipSchemaCheck && !dryRun) {
    logger.info('🔍 Post-migration: Validating schema consistency...');
    try {
      const checker = new SchemaConsistencyChecker();
      const validationResult = await checker.check();

      if (validationResult.success) {
        logger.info('✅ Post-migration schema validation passed');
      } else {
        logger.warn('⚠️  Post-migration schema validation issues:');
        validationResult.issues.forEach(issue => logger.warn(`  • ${issue}`));
        logger.info('💡 Run: pnpm db:workflow:full to resolve remaining issues');
      }
    } catch (error) {
      logger.warn(`⚠️  Post-migration schema validation failed: ${error}`);
    }
  }
}

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
      logger.info('Usage: pnpm db:reset --mode=canonical|drizzle --env=dev|staging|prod');
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
        await migrateWithSchemaConsistency(
          options.environment,
          args.includes('--dry-run'),
          args.includes('--skip-schema-check')
        );
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

        // Note: Users with isAdmin = true will be preserved during internal table truncation
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
  truncate --scope=<scope>     Truncate tables (scope: internal|external|all) [preserves users with isAdmin = true]
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
    logger.error(
      'Database operation failed:',
      error instanceof Error ? error : new Error(String(error))
    );
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
