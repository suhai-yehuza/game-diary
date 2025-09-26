#!/usr/bin/env tsx

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.development' });

import { logger } from '@/lib/utils/logger';
import { cacheMigration } from '@/lib/cache/cache-migration';
import { hybridCacheService } from '@/lib/cache/hybrid-cache-service';

/**
 * Script to migrate from local cache to Redis cache
 * Usage: pnpm tsx scripts/migrate-to-redis-cache.ts [--verify] [--cleanup]
 */

async function migrateToRedisCache() {
  const args = process.argv.slice(2);
  const shouldVerify = args.includes('--verify');
  const shouldCleanup = args.includes('--cleanup');

  try {
    console.log('🚀 Starting cache migration to Redis...\n');

    // Step 1: Check migration status
    console.log('📊 Checking migration status...');
    const status = await cacheMigration.getMigrationStatus();
    console.log(`Simple cache size: ${status.simpleCacheSize}`);
    console.log(`Hybrid cache size: ${status.hybridCacheSize}`);
    console.log(`Redis available: ${status.redisAvailable}`);
    console.log(`Memory available: ${status.memoryAvailable}\n`);

    // Step 2: Migrate data
    console.log('🔄 Migrating cache data...');
    const migrationResult = await cacheMigration.migrateToHybrid();
    console.log(`✅ Migrated: ${migrationResult.migrated} keys`);
    console.log(`❌ Failed: ${migrationResult.failed} keys`);

    if (migrationResult.errors.length > 0) {
      console.log('⚠️  Errors:');
      migrationResult.errors.forEach(error => console.log(`  - ${error}`));
    }
    console.log();

    // Step 3: Verify migration if requested
    if (shouldVerify) {
      console.log('🔍 Verifying migration...');
      const verificationResult = await cacheMigration.verifyMigration();
      console.log(`✅ Verified: ${verificationResult.verified} keys`);
      console.log(`❌ Mismatches: ${verificationResult.mismatches} keys`);

      if (verificationResult.errors.length > 0) {
        console.log('⚠️  Verification errors:');
        verificationResult.errors.forEach(error => console.log(`  - ${error}`));
      }
      console.log();
    }

    // Step 4: Cleanup if requested
    if (shouldCleanup) {
      console.log('🧹 Cleaning up old cache...');
      await cacheMigration.clearAfterMigration();
      console.log('✅ Cache cleanup completed\n');
    }

    // Step 5: Final status check
    console.log('📊 Final status check...');
    const finalStatus = await cacheMigration.getMigrationStatus();
    console.log(`Simple cache size: ${finalStatus.simpleCacheSize}`);
    console.log(`Hybrid cache size: ${finalStatus.hybridCacheSize}`);
    console.log(`Redis available: ${finalStatus.redisAvailable}`);
    console.log(`Memory available: ${finalStatus.memoryAvailable}\n`);

    // Step 6: Test hybrid cache
    console.log('🧪 Testing hybrid cache...');
    const testKey = 'migration:test';
    const testData = { message: 'Cache migration test', timestamp: new Date().toISOString() };

    await hybridCacheService.set(testKey, testData);
    const retrievedData = await hybridCacheService.get(testKey);

    if (retrievedData && JSON.stringify(retrievedData) === JSON.stringify(testData)) {
      console.log('✅ Hybrid cache test passed');
    } else {
      console.log('❌ Hybrid cache test failed');
    }

    await hybridCacheService.delete(testKey);
    console.log();

    // Step 7: Show cache health
    console.log('🏥 Cache health status...');
    const healthStatus = await hybridCacheService.getHealthStatus();
    console.log(`Healthy: ${healthStatus.healthy}`);
    console.log(`Strategy: ${healthStatus.strategy}`);
    console.log(`Redis: ${healthStatus.redis ? '✅' : '❌'}`);
    console.log(`Memory: ${healthStatus.memory ? '✅' : '❌'}`);
    console.log(`Timestamp: ${healthStatus.timestamp}\n`);

    console.log('🎉 Cache migration completed successfully!');
    console.log('\nNext steps:');
    console.log(
      '1. Update your application code to use hybridCacheService instead of simpleCacheService'
    );
    console.log('2. Test your application thoroughly');
    console.log('3. Monitor cache performance and Redis usage');
    console.log('4. Consider running this script with --cleanup after verification');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateToRedisCache().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
