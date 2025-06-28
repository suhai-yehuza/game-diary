#!/usr/bin/env tsx

/// <reference lib="dom" />
/// <reference types="node" />

import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { neon, neonConfig } from '@neondatabase/serverless';

import { logger } from '@lib/core/logger';
import type { IMigrationVersion } from '@src/lib/types';

const MIGRATIONS_DIR = join(process.cwd(), 'src/lib/db/migrations');

// Configure neon for better stability
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

// Use the schema type for migration versions
async function getMigrationFiles(): Promise<string[]> {
  const types = ['base', 'feature', 'trigger'];
  const migrations: string[] = [];

  // first add all the .sql files in the immediate root migrations directory
  const files = readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Ensure files are processed in order
  migrations.push(...files.map(file => join(file)));

  // then add all the .sql files in the child directories
  for (const type of types) {
    const typeDir = join(MIGRATIONS_DIR, type);
    if (existsSync(typeDir)) {
      const files = readdirSync(typeDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
      migrations.push(...files.map(file => join(type, file)));
    }
  }

  return migrations;
}

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

  const filePath = join(MIGRATIONS_DIR, file);
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
      await waitForMigrationTable();
    }

    // Commit transaction
    await sqlClient`COMMIT`;

    // Record successful migration
    const executionTime = Date.now() - startTime;
    await recordMigration(file, '', executionTime, 'success');
    logger.info(`Successfully executed migration: ${file}`);
  } catch (error) {
    // Rollback transaction
    await sqlClient`ROLLBACK`;

    // Record failed migration
    const executionTime = Date.now() - startTime;
    await recordMigration(
      file,
      '',
      executionTime,
      'failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
}

async function rollbackMigration(file: string): Promise<void> {
  // Ensure we have a valid connection before starting
  await ensureConnection();

  const filePath = join(MIGRATIONS_DIR, file);
  const sqlContent = readFileSync(filePath, 'utf-8');

  // Check if migration has been executed
  const executedMigrations = await getExecutedMigrations();
  const existingMigration = executedMigrations.find(m => m.name === file);

  if (!existingMigration) {
    logger.info(`Skipping rollback for non-executed migration: ${file}`);
    return;
  }

  if (existingMigration.rollback_executed) {
    logger.info(`Skipping already rolled back migration: ${file}`);
    return;
  }

  logger.info(`Rolling back migration: ${file}`);

  try {
    // Start transaction
    await sqlClient`BEGIN`;

    // Execute rollback SQL statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await sqlClient.unsafe(statement);
    }

    // Commit transaction
    await sqlClient`COMMIT`;

    // Update migration status
    await updateMigrationStatus(file, 'rolled_back');
    logger.info(`Successfully rolled back migration: ${file}`);
  } catch (error) {
    // Rollback transaction
    await sqlClient`ROLLBACK`;

    // Update migration status
    await updateMigrationStatus(
      file,
      'failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
}

export async function migrate() {
  try {
    // Ensure database connection
    await ensureConnection();

    // Get all migration files
    const migrationFiles = await getMigrationFiles();
    if (migrationFiles.length === 0) {
      logger.info('No migrations to execute');
      return;
    }

    // Execute migrations in order
    for (const file of migrationFiles) {
      await runMigration(file);
    }

    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
}

export async function rollback(steps: number = 1) {
  try {
    // Ensure database connection
    await ensureConnection();

    // Get executed migrations in reverse order
    const executedMigrations = await getExecutedMigrations();
    const migrationsToRollback = executedMigrations
      .filter(m => m.status === 'success' && !m.rollback_executed)
      .slice(-steps);

    if (migrationsToRollback.length === 0) {
      logger.info('No migrations to rollback');
      return;
    }

    // Rollback migrations in reverse order
    for (const migration of migrationsToRollback) {
      await rollbackMigration(migration.name);
    }

    logger.info('Rollback completed successfully');
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
