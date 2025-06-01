import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { sql } from 'drizzle-orm';
import { createHash } from 'crypto';
import { createDatabaseClient } from '../src/lib/db/seed/config';

// Get environment from command line argument or default to development
const environment = process.argv[2] || 'development';
const dryRun = process.argv.includes('--dry-run');

interface Migration {
  name: string;
  path: string;
  content: string;
  checksum: string;
}

async function applyMigrations() {
  console.log(`🚀 Starting migration runner for ${environment} environment...`);
  if (dryRun) {
    console.log('🔍 Running in DRY RUN mode - no changes will be made');
  }
  console.log('================================================\n');

  const db = createDatabaseClient({ env: environment, logger: true });
  const migrationsDir = join(process.cwd(), 'src/lib/db/migrations');

  try {
    // Step 1: Ensure migration tracking table exists
    console.log('📋 Step 1: Ensuring migration tracking table exists...');
    
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
          rollback_executed BOOLEAN DEFAULT false
        );
      `);

      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_migration_versions_name ON migration_versions(name);
      `);
    }
    console.log('✅ Migration tracking table ready');

    // Step 2: Get all migration files
    console.log('\n📂 Step 2: Scanning for migration files...');
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
        checksum
      };
    });

    console.log(`Found ${migrations.length} migration files:
${migrations.map(m => `  - ${m.name}`).join('\n')}`);

    // Step 3: Check which migrations have already been applied
    console.log('\n🔍 Step 3: Checking migration status...');
    
    const appliedMigrations = dryRun ? { rows: [] } : await db.execute(sql`
      SELECT name, checksum, status, executed_at 
      FROM migration_versions 
      ORDER BY name;
    `);

    const appliedMap = new Map(
      appliedMigrations.rows.map((row: any) => [row.name, row])
    );

    // Step 4: Apply new migrations
    console.log('\n⚡ Step 4: Applying migrations...\n');
    
    let appliedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const migration of migrations) {
      const applied = appliedMap.get(migration.name);
      
      if (applied) {
        if (applied.checksum === migration.checksum) {
          console.log(`✓ ${migration.name} - Already applied (${new Date(applied.executed_at).toLocaleDateString()})`);
          skippedCount++;
          continue;
        } else {
          console.warn(`⚠️  ${migration.name} - Checksum mismatch! File may have been modified after application.`);
          console.warn(`    Applied checksum: ${applied.checksum.substring(0, 8)}...`);
          console.warn(`    Current checksum: ${migration.checksum.substring(0, 8)}...`);
          
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
        }
      }

      console.log(`📝 Applying ${migration.name}...`);
      
      if (dryRun) {
        console.log('   [DRY RUN] Would execute migration');
        appliedCount++;
        continue;
      }

      const startTime = Date.now();
      
      try {
        // Split migration into individual statements
        // This is a simple implementation - you may need more sophisticated parsing
        const statements = migration.content
          .split(/;\s*$/m)
          .filter(stmt => stmt.trim().length > 0)
          .map(stmt => stmt.trim() + ';');

        // Execute each statement
        for (const statement of statements) {
          if (statement.trim() && !statement.match(/^\s*--/)) {
            await db.execute(sql.raw(statement));
          }
        }

        const executionTime = Date.now() - startTime;

        // Record successful migration
        await db.execute(sql`
          INSERT INTO migration_versions (name, checksum, execution_time_ms, status)
          VALUES (${migration.name}, ${migration.checksum}, ${executionTime}, 'success');
        `);

        console.log(`   ✅ Applied successfully (${executionTime}ms)`);
        appliedCount++;
      } catch (error: any) {
        const executionTime = Date.now() - startTime;
        errorCount++;

        console.error(`   ❌ Failed to apply migration: ${error.message}`);
        
        // Record failed migration
        try {
          await db.execute(sql`
            INSERT INTO migration_versions (name, checksum, execution_time_ms, status, error_message)
            VALUES (${migration.name}, ${migration.checksum}, ${executionTime}, 'failed', ${error.message})
            ON CONFLICT (name) DO UPDATE
            SET status = 'failed',
                error_message = ${error.message},
                execution_time_ms = ${executionTime};
          `);
        } catch (recordError) {
          console.error(`   ❌ Failed to record migration error: ${recordError}`);
        }
      }
    }

    // Summary
    console.log('\n================================================');
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Applied: ${appliedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log('================================================\n');

    if (errorCount > 0) {
      console.error('⚠️  Some migrations failed. Please check the errors above.');
      process.exit(1);
    } else if (appliedCount > 0) {
      console.log('🎉 All migrations applied successfully!');
    } else {
      console.log('✨ Database is up to date!');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during migration:', error);
    process.exit(1);
  }
}

// Run migrations
applyMigrations(); 