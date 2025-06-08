import { createHash } from 'crypto';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

import { sql } from 'drizzle-orm';

import { createDatabaseClient } from '@src/lib/db/seed/config';
import { logger } from 'lib/core/logger';
import type { Migration, MigrationVerification } from '@src/lib/types/consolidated.types';

// Get environment from command line argument or default to development
const environment = process.argv[2] || 'development';
const dryRun = process.argv.includes('--dry-run');

// Parse SQL file to extract individual statements, handling functions and triggers properly
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

// Get verification data for a migration
async function getVerificationData(
  db: ReturnType<typeof createDatabaseClient>,
  migrationName: string
): Promise<MigrationVerification> {
  const verification: MigrationVerification = {};

  if (migrationName.includes('trigger')) {
    // Check for triggers
    const triggers = await db.execute(sql`
      SELECT tgname as name 
      FROM pg_trigger 
      WHERE tgname NOT LIKE 'RI_%' 
      AND tgname NOT LIKE 'pg_%'
      ORDER BY tgname;
    `);
    verification.triggers = triggers.rows.map((r: any) => r.name);

    // Check for functions
    const functions = await db.execute(sql`
      SELECT proname as name 
      FROM pg_proc 
      WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      ORDER BY proname;
    `);
    verification.functions = functions.rows.map((r: any) => r.name);
  }

  // Always check indexes
  const indexes = await db.execute(sql`
    SELECT indexname as name 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname NOT LIKE '%_pkey'
    ORDER BY indexname;
  `);
  verification.indexes = indexes.rows.map((r: any) => r.name);

  return verification;
}

// Compare verification data
function compareVerification(
  before: MigrationVerification,
  after: MigrationVerification
): {
  added: MigrationVerification;
  removed: MigrationVerification;
} {
  const added: MigrationVerification = {};
  const removed: MigrationVerification = {};

  // Compare each type
  for (const key of ['tables', 'functions', 'triggers', 'indexes'] as const) {
    const beforeItems = before[key] || [];
    const afterItems = after[key] || [];

    const addedItems = afterItems.filter(item => !beforeItems.includes(item));
    const removedItems = beforeItems.filter(item => !afterItems.includes(item));

    if (addedItems.length > 0) {
      added[key] = addedItems;
    }
    if (removedItems.length > 0) {
      removed[key] = removedItems;
    }
  }

  return { added, removed };
}

async function applyMigrations() {
  logger.info(`🚀 Starting migration runner for ${environment} environment...`);
  if (dryRun) {
    logger.info('🔍 Running in DRY RUN mode - no changes will be made');
  }
  logger.info('================================================\n');

  const db = createDatabaseClient({ env: environment });
  const migrationsDir = join(process.cwd(), 'src/lib/db/migrations');

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
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure migrations run in order

    const migrations: Migration[] = files.map(file => {
      const path = join(migrationsDir, file);
      const content = readFileSync(path, 'utf8');
      const checksum = createHash('sha256').update(content).digest('hex');

      return {
        name: file,
        path,
        content,
        checksum,
      };
    });

    logger.info(`Found ${migrations.length} migration files:
${migrations.map(m => `  - ${m.name}`).join('\n')}`);

    // Step 3: Check which migrations have already been applied
    logger.info('\n🔍 Step 3: Checking migration status...');

    const appliedMigrations = dryRun
      ? { rows: [] }
      : await db.execute(sql`
      SELECT name, checksum, status, executed_at 
      FROM migration_versions 
      ORDER BY name;
    `);

    const appliedMap = new Map(appliedMigrations.rows.map((row: any) => [row.name, row]));

    // Step 4: Apply new migrations
    logger.info('\n⚡ Step 4: Applying migrations...\n');

    let appliedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const migration of migrations) {
      const applied = appliedMap.get(migration.name);

      if (applied) {
        if (applied.checksum === migration.checksum && applied.status === 'success') {
          logger.info(
            `✓ ${migration.name} - Already applied (${new Date(applied.executed_at).toLocaleDateString()})`
          );
          skippedCount++;
          continue;
        } else if (applied.checksum !== migration.checksum) {
          logger.warn(
            `⚠️  ${migration.name} - Checksum mismatch! File may have been modified after application.`
          );
          logger.warn(`    Applied checksum: ${applied.checksum.substring(0, 8)}...`);
          logger.warn(`    Current checksum: ${migration.checksum.substring(0, 8)}...`);

          if (!dryRun) {
            // Record the checksum mismatch but don't re-run the migration
            await db.execute(sql`
              UPDATE migration_versions 
              SET error_message = ${`Checksum mismatch detected on ${new Date().toISOString()}`}
              WHERE name = ${migration.name};
            `);
          }
          skippedCount++;
          continue;
        } else if (applied.status === 'failed') {
          logger.info(`⚠️  ${migration.name} - Previously failed, retrying...`);
        }
      }

      logger.info(`\n📝 Applying ${migration.name}...`);

      if (dryRun) {
        logger.info('   [DRY RUN] Would execute migration');
        appliedCount++;
        continue;
      }

      const startTime = Date.now();
      let verificationBefore: MigrationVerification = {};
      let verificationAfter: MigrationVerification = {};

      try {
        // Get pre-migration verification data
        logger.info('   📊 Getting pre-migration state...');
        verificationBefore = await getVerificationData(db, migration.name);

        // Parse and execute statements
        const statements = parseSqlStatements(migration.content);
        logger.info(`   📄 Executing ${statements.length} SQL statements...`);

        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i];
          if (statement.trim()) {
            try {
              await db.execute(sql.raw(statement));
              logger.info(`   ✓ Statement ${i + 1}/${statements.length} executed`);
            } catch (stmtError: any) {
              logger.error(
                `   ❌ Statement ${i + 1}/${statements.length} failed: ${stmtError.message}`
              );
              logger.error(`      Statement preview: ${statement.substring(0, 100)}...`);
              throw stmtError;
            }
          }
        }

        // Get post-migration verification data
        logger.info('   📊 Getting post-migration state...');
        verificationAfter = await getVerificationData(db, migration.name);

        const executionTime = Date.now() - startTime;

        // Compare before and after
        const { added, removed } = compareVerification(verificationBefore, verificationAfter);

        logger.info('   📋 Migration changes:');
        if (added.functions?.length) {
          logger.info(`      ➕ Functions added: ${added.functions.join(', ')}`);
        }
        if (added.triggers?.length) {
          logger.info(`      ➕ Triggers added: ${added.triggers.join(', ')}`);
        }
        if (added.indexes?.length) {
          logger.info(`      ➕ Indexes added: ${added.indexes.join(', ')}`);
        }
        if (removed.functions?.length) {
          logger.info(`      ➖ Functions removed: ${removed.functions.join(', ')}`);
        }
        if (removed.triggers?.length) {
          logger.info(`      ➖ Triggers removed: ${removed.triggers.join(', ')}`);
        }

        // Record successful migration
        await db.execute(sql`
          INSERT INTO migration_versions (name, checksum, execution_time_ms, status, verification)
          VALUES (${migration.name}, ${migration.checksum}, ${executionTime}, 'success', ${JSON.stringify({ added, removed })})
          ON CONFLICT (name) DO UPDATE
          SET checksum = ${migration.checksum},
              execution_time_ms = ${executionTime},
              status = 'success',
              error_message = NULL,
              verification = ${JSON.stringify({ added, removed })},
              executed_at = CURRENT_TIMESTAMP;
        `);

        logger.info(`   ✅ Applied successfully (${executionTime}ms)`);
        appliedCount++;
      } catch (error: any) {
        const executionTime = Date.now() - startTime;
        errorCount++;

        logger.error(`   ❌ Failed to apply migration: ${error.message}`);

        // Record failed migration
        try {
          await db.execute(sql`
            INSERT INTO migration_versions (name, checksum, execution_time_ms, status, error_message)
            VALUES (${migration.name}, ${migration.checksum}, ${executionTime}, 'failed', ${error.message})
            ON CONFLICT (name) DO UPDATE
            SET status = 'failed',
                error_message = ${error.message},
                execution_time_ms = ${executionTime},
                executed_at = CURRENT_TIMESTAMP;
          `);
        } catch (recordError) {
          logger.error(`   ❌ Failed to record migration error: ${recordError}`);
        }
      }
    }

    // Summary
    logger.info('\n================================================');
    logger.info('📊 Migration Summary:');
    logger.info(`   ✅ Applied: ${appliedCount}`);
    logger.info(`   ⏭️  Skipped: ${skippedCount}`);
    logger.info(`   ❌ Failed: ${errorCount}`);
    logger.info('================================================\n');

    if (errorCount > 0) {
      logger.error('⚠️  Some migrations failed. Please check the errors above.');
      process.exit(1);
    } else if (appliedCount > 0) {
      logger.info('🎉 All migrations applied successfully!');
    } else {
      logger.info('✨ Database is up to date!');
    }

    process.exit(0);
  } catch (error) {
    logger.error('\n❌ Error during migration:', error);
    process.exit(1);
  }
}

// Run migrations
applyMigrations();
