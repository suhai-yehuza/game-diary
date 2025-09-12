#!/usr/bin/env tsx

/**
 * Post-integration test cleanup script
 * Ensures clean database state after running database and notification integration tests
 *
 * Usage:
 *   tsx scripts/testing/post-integration-cleanup.ts
 *   tsx scripts/testing/post-integration-cleanup.ts --force
 *   tsx scripts/testing/post-integration-cleanup.ts --check-only
 */

import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { comprehensivePostTestCleanup, needsCleanup } from '../../tests/integration/cleanup-utils';

// Load environment variables
config({ path: '.env.development' });

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';

interface CleanupOptions {
  force?: boolean;
  checkOnly?: boolean;
  verbose?: boolean;
}

async function main() {
  const args = process.argv.slice(2);
  const options: CleanupOptions = {
    force: args.includes('--force'),
    checkOnly: args.includes('--check-only'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };

  console.log('🧹 Post-Integration Test Cleanup Script');
  console.log('======================================');

  if (!databaseUrl) {
    console.log('⚠️ No DATABASE_URL found. Skipping cleanup.');
    console.log('   Set DATABASE_URL or POSTGRES_URL environment variable to enable cleanup.');
    process.exit(0);
  }

  try {
    // Test database connection
    const sql = neon(databaseUrl);
    const db = drizzle(sql) as any;
    await db.execute('SELECT 1');
    console.log('✅ Database connection established');

    // Check if cleanup is needed
    const needsCleanupFlag = await needsCleanup(db);

    if (!needsCleanupFlag && !options.force) {
      console.log('✅ Database is already clean - no cleanup needed');
      if (options.checkOnly) {
        console.log('📊 Check-only mode: Database is clean');
        process.exit(0);
      }
    }

    if (options.checkOnly) {
      console.log('📊 Check-only mode: Database needs cleanup');
      process.exit(1);
    }

    if (needsCleanupFlag || options.force) {
      console.log('🧹 Running comprehensive post-test cleanup...');

      await comprehensivePostTestCleanup({ usingRealDatabase: true, db });

      console.log('✅ Post-test cleanup completed successfully');
    }

    console.log('🎉 Post-integration test cleanup completed');
  } catch (error) {
    console.error('❌ Error during post-test cleanup:', error);
    process.exit(1);
  }
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { main as postIntegrationCleanup };
