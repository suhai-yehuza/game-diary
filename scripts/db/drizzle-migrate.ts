/// <reference lib="dom" />
/// <reference types="node" />

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { neon, neonConfig } from '@neondatabase/serverless';

import { logger } from '@lib/core/logger';
import { db } from '@src/lib/db';
import type { migrationVersions } from '@src/lib/db/schema/migration-schemas';
import { env } from '@src/lib/env';
import type { IRequestInit } from '@src/lib/types/misc.types';

const MIGRATIONS_DIR = path.join(process.cwd(), 'src/lib/db/migrations');

// Configure neon for better stability
neonConfig.wsProxy = host => `${host}:5432/v1`;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = true;
neonConfig.pipelineConnect = false;
neonConfig.fetchFunction = (input: RequestInfo | URL, init?: IRequestInit) => {
  return fetch(input, {
    ...init,
    signal: AbortSignal.timeout(30000), // 30 second timeout
    keepalive: true,
  });
};

// Create a single SQL client instance for raw SQL operations
const sqlClient = neon(env.DATABASE_URL);

// Use the schema type for migration versions
type MigrationVersion = typeof migrationVersions.$inferSelect;

// Type definitions for fetch API
type RequestInfo = string | URL;

async function getMigrationFiles(): Promise<string[]> {
  const types = ['base', 'feature', 'trigger'];
  const migrations: string[] = [];

  // first add all the .sql files in the immediate root migrations directory
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Ensure files are processed in order
  migrations.push(...files.map(file => path.join(file)));

  // then add all the .sql files in the child directories
  for (const type of types) {
    const typeDir = path.join(MIGRATIONS_DIR, type);
    if (fs.existsSync(typeDir)) {
      const files = fs
        .readdirSync(typeDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
      migrations.push(...files.map(file => path.join(type, file)));
    }
  }

  return migrations;
}

function calculateChecksum(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function getExecutedMigrations(): Promise<MigrationVersion[]> {
  try {
    const result = await sqlClient`
      SELECT * FROM migration_versions
      ORDER BY executed_at ASC
    `;
    return result as unknown as MigrationVersion[];
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

async function verifyTableExists(tableName: string): Promise<boolean> {
  try {
    // Use a direct table check with proper error handling
    await sqlClient.unsafe(`SELECT 1 FROM "${tableName}" LIMIT 1`);
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(`relation "${tableName}" does not exist`)
    ) {
      return false;
    }
    logger.error(`Error verifying table ${tableName}:`, error);
    return false;
  }
}

async function waitForMigrationTable(): Promise<void> {
  let attempts = 0;
  const maxAttempts = 10;
  const delay = 1000;

  while (attempts < maxAttempts) {
    const exists = await verifyTableExists('migration_versions');
    if (exists) {
      return;
    }
    attempts++;
    if (attempts === maxAttempts) {
      throw new Error('Migration table was not created after multiple attempts');
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

async function recordMigration(
  name: string,
  checksum: string,
  executionTime: number,
  status: 'success' | 'failed' | 'rolled_back',
  errorMessage?: string,
  rollbackScript?: string
): Promise<void> {
  try {
    // Wait for migration_versions table to be created
    await waitForMigrationTable();

    logger.info('Recording migration:', { name, status });
    await sqlClient.unsafe(`
      INSERT INTO migration_versions (
        name, checksum, execution_time_ms, status, error_message, rollback_script, rollback_executed
      ) VALUES (
        '${name}', '${checksum}', ${executionTime}, '${status}', ${errorMessage ? `'${errorMessage}'` : 'NULL'}, ${rollbackScript ? `'${rollbackScript}'` : 'NULL'}, false
      )
    `);
  } catch (error) {
    logger.error('Error recording migration:', error);
    throw error;
  }
}

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

async function verifyConnection(): Promise<boolean> {
  try {
    await sqlClient`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database connection verification failed:', error);
    return false;
  }
}

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

async function runMigration(file: string): Promise<void> {
  // Ensure we have a valid connection before starting
  await ensureConnection();

  const filePath = path.join(MIGRATIONS_DIR, file);
  const sqlContent = fs.readFileSync(filePath, 'utf-8');
  const checksum = calculateChecksum(sqlContent);

  // Check if migration has already been executed successfully
  const executedMigrations = await getExecutedMigrations();
  const existingMigration = executedMigrations.find(m => m.name === file);

  if (existingMigration?.status === 'success') {
    if (existingMigration.checksum !== checksum) {
      throw new Error(
        `Migration ${file} has been modified since last execution. Checksum mismatch.`
      );
    }
    logger.info(`Skipping already executed migration: ${file}`);
    return;
  }

  logger.info(`Executing migration: ${file}`);
  const startTime = Date.now();

  try {
    // Start transaction
    await sqlClient`BEGIN`;

    // Execute SQL statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await sqlClient.unsafe(statement);
    }

    // If this is the base schema migration, verify the migration_versions table exists before committing
    if (file === '001_base_schema.sql') {
      const exists = await verifyTableExists('migration_versions');
      if (!exists) {
        throw new Error('Migration versions table was not created successfully');
      }

      // Verify the rating stars trigger was created
      const triggerExists = await sqlClient`
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_rating_stars_trigger' 
        AND tgrelid = 'game_logs'::regclass
      `;
      if (!triggerExists.length) {
        throw new Error('Rating stars trigger was not created successfully');
      }
    }

    // Commit transaction
    await sqlClient`COMMIT`;
    logger.info(`Successfully executed migration: ${file}`);

    // If this is the base schema migration, wait a moment for the migration_versions table to be fully available
    if (file === '001_base_schema.sql') {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Record successful migration
    const executionTime = Date.now() - startTime;
    await recordMigration(file, checksum, executionTime, 'success');

    // Verify the tables were created and schema is synchronized
    if (file === '001_base_schema.sql') {
      const tables = ['game_logs', 'game_ratings', 'users', 'teams'] as const;
      for (const table of tables) {
        let exists = false;
        let attempts = 0;
        const maxAttempts = 5;

        while (!exists && attempts < maxAttempts) {
          // Ensure connection is still valid before checking table
          await ensureConnection();

          // Try to query the table using Drizzle's schema
          try {
            switch (table) {
              case 'game_logs':
                await db.query.game_logs.findFirst();
                break;
              case 'game_ratings':
                await db.query.game_ratings.findFirst();
                break;
              case 'users':
                await db.query.users.findFirst();
                break;
              case 'teams':
                await db.query.teams.findFirst();
                break;
            }
            exists = true;
          } catch (error) {
            // If Drizzle query fails, try raw SQL
            logger.info(
              `Drizzle query failed for table ${table}, trying raw SQL with error ${error}`
            );
            exists = await verifyTableExists(table);
          }

          if (!exists) {
            attempts++;
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }

        if (!exists) {
          throw new Error(
            `Table ${table} was not created successfully after ${maxAttempts} attempts`
          );
        }
      }
    }
  } catch (error) {
    // Rollback transaction
    await sqlClient`ROLLBACK`;

    // Record failed migration
    const executionTime = Date.now() - startTime;
    await recordMigration(
      file,
      checksum,
      executionTime,
      'failed',
      error instanceof Error ? error.message : 'Unknown error'
    );

    throw error;
  }
}

async function rollbackMigration(file: string): Promise<void> {
  const executedMigrations = await getExecutedMigrations();
  const migration = executedMigrations.find(m => m.name === file);

  if (!migration) {
    throw new Error(`Migration ${file} has not been executed`);
  }

  if (migration.rollback_executed) {
    logger.info(`Migration ${file} has already been rolled back`);
    return;
  }

  logger.info(`Rolling back migration: ${file}`);

  try {
    // Start transaction
    await sqlClient`BEGIN`;

    // Execute rollback script if available
    if (migration.rollback_script) {
      await sqlClient.unsafe(migration.rollback_script);
    }

    // Update migration status
    await updateMigrationStatus(file, 'rolled_back');

    // Commit transaction
    await sqlClient`COMMIT`;
    logger.info(`Successfully rolled back migration: ${file}`);
  } catch (error) {
    // Rollback transaction
    await sqlClient`ROLLBACK`;
    throw error;
  }
}

export async function migrate() {
  try {
    // Ensure we have a valid connection before starting migrations
    await ensureConnection();

    const migrationFiles = await getMigrationFiles();
    const executedMigrations = await getExecutedMigrations();

    // Verify migration order
    for (let i = 0; i < executedMigrations.length; i++) {
      const executed = executedMigrations[i];
      const expected = migrationFiles[i];
      if (executed.name !== expected) {
        throw new Error(
          `Migration order mismatch. Expected ${expected} but found ${executed.name} in executed migrations.`
        );
      }
    }

    // Execute new migrations
    for (const file of migrationFiles) {
      await runMigration(file);
    }

    // Final verification of connection and tables
    await ensureConnection();
    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
}

export async function rollback(steps: number = 1) {
  try {
    const executedMigrations = await getExecutedMigrations();
    const migrationsToRollback = executedMigrations
      .filter(m => m.status === 'success' && !m.rollback_executed)
      .slice(-steps);

    for (const migration of migrationsToRollback) {
      await rollbackMigration(migration.name);
    }

    logger.info(`Successfully rolled back ${migrationsToRollback.length} migrations`);
  } catch (error) {
    logger.error('Rollback failed:', error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const rollbackSteps = args[0] === 'rollback' ? parseInt(args[1]) || 1 : 0;

  if (rollbackSteps > 0) {
    rollback(rollbackSteps).catch(error => logger.error('Rollback failed:', error));
  } else {
    migrate().catch(error => logger.error('Migration failed:', error));
  }
}
