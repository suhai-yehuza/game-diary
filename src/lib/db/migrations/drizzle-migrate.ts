import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

import { sql } from 'drizzle-orm';

import { db } from '../index';

const MIGRATIONS_DIR = path.join(process.cwd(), 'src/lib/db/migrations');

interface MigrationVersion {
  name: string;
  checksum: string;
  executed_at: Date;
  execution_time_ms: number;
  status: 'success' | 'failed' | 'rolled_back';
  error_message?: string;
  rollback_script?: string;
  rollback_executed: boolean;
}

async function getMigrationFiles(): Promise<string[]> {
  const types = ['base', 'feature', 'trigger'];
  const migrations: string[] = [];
  
  // first add all the .sql files in the immediate root migrations directory
  const files = fs.readdirSync(MIGRATIONS_DIR)
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
    const result = await db.execute(sql`
      SELECT * FROM migration_versions
      ORDER BY executed_at ASC
    `);
    return (result.rows as unknown) as MigrationVersion[];
  } catch (error) {
    // If the table doesn't exist yet, return empty array
    if (error instanceof Error && error.message.includes('relation "migration_versions" does not exist')) {
      return [];
    }
    throw error;
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
  await db.execute(sql`
    INSERT INTO migration_versions (
      name, checksum, execution_time_ms, status, error_message, rollback_script
    ) VALUES (
      ${name}, ${checksum}, ${executionTime}, ${status}, ${errorMessage}, ${rollbackScript}
    )
  `);
}

async function updateMigrationStatus(
  name: string,
  status: 'success' | 'failed' | 'rolled_back',
  errorMessage?: string
): Promise<void> {
  await db.execute(sql`
    UPDATE migration_versions
    SET status = ${status}, error_message = ${errorMessage}
    WHERE name = ${name}
  `);
}

async function runMigration(file: string): Promise<void> {
  const filePath = path.join(MIGRATIONS_DIR, file);
  const sqlContent = fs.readFileSync(filePath, 'utf-8');
  const checksum = calculateChecksum(sqlContent);

  // Check if migration has already been executed successfully
  const executedMigrations = await getExecutedMigrations();
  const existingMigration = executedMigrations.find(m => m.name === file);

  if (existingMigration?.status === 'success') {
    if (existingMigration.checksum !== checksum) {
      throw new Error(`Migration ${file} has been modified since last execution. Checksum mismatch.`);
    }
    console.log(`Skipping already executed migration: ${file}`);
    return;
  }

  console.log(`Executing migration: ${file}`);
  const startTime = Date.now();

  try {
    // Start transaction
    await db.execute(sql`BEGIN`);

    // Execute migration
    await db.execute(sql.raw(sqlContent));

    // Record successful migration
    const executionTime = Date.now() - startTime;
    await recordMigration(file, checksum, executionTime, 'success');

    // Commit transaction
    await db.execute(sql`COMMIT`);
    console.log(`Successfully executed migration: ${file}`);
  } catch (error) {
    // Rollback transaction
    await db.execute(sql`ROLLBACK`);

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
    console.log(`Migration ${file} has already been rolled back`);
    return;
  }

  console.log(`Rolling back migration: ${file}`);
  const startTime = Date.now();

  try {
    // Start transaction
    await db.execute(sql`BEGIN`);

    // Execute rollback script if available
    if (migration.rollback_script) {
      await db.execute(sql.raw(migration.rollback_script));
    }

    // Update migration status
    await updateMigrationStatus(file, 'rolled_back');

    // Commit transaction
    await db.execute(sql`COMMIT`);
    console.log(`Successfully rolled back migration: ${file}`);
  } catch (error) {
    // Rollback transaction
    await db.execute(sql`ROLLBACK`);
    throw error;
  }
}

export async function migrate() {
  try {
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

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
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

    console.log(`Successfully rolled back ${migrationsToRollback.length} migrations`);
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const rollbackSteps = args[0] === 'rollback' ? parseInt(args[1]) || 1 : 0;

  if (rollbackSteps > 0) {
    rollback(rollbackSteps).catch(console.error);
  } else {
    migrate().catch(console.error);
  }
}
