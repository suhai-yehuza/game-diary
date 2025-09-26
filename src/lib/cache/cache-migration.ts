import { logger } from '@/lib/utils/logger';

import { hybridCacheService } from './hybrid-cache-service';
import { simpleCacheService } from './simple-cache-service';

/**
 * Cache migration utilities to help transition from local cache to Redis
 */
export class CacheMigration {
  /**
   * Migrate all data from simple cache to hybrid cache
   */
  static async migrateToHybrid(): Promise<{
    migrated: number;
    failed: number;
    errors: string[];
  }> {
    const result = {
      migrated: 0,
      failed: 0,
      errors: [] as string[],
    };

    try {
      logger.info('Starting cache migration to hybrid service');

      // Get all keys from simple cache
      const stats = simpleCacheService.getStats();
      const keys = stats.keys;

      logger.info(`Found ${keys.length} keys to migrate`);

      // Migrate each key
      for (const key of keys) {
        try {
          // Get data from simple cache
          const data = simpleCacheService.get(key);
          if (data !== null) {
            // Set in hybrid cache
            await hybridCacheService.set(key, data);
            result.migrated++;
            logger.info(`Migrated key: ${key}`);
          }
        } catch (error) {
          result.failed++;
          const errorMsg = `Failed to migrate key ${key}: ${String(error)}`;
          result.errors.push(errorMsg);
          logger.warn(errorMsg);
        }
      }

      logger.info(`Migration completed: ${result.migrated} migrated, ${result.failed} failed`);
    } catch (error) {
      const errorMsg = `Migration failed: ${String(error)}`;
      result.errors.push(errorMsg);
      logger.error(errorMsg);
    }

    return result;
  }

  /**
   * Verify migration by comparing cache contents
   */
  static async verifyMigration(): Promise<{
    verified: number;
    mismatches: number;
    errors: string[];
  }> {
    const result = {
      verified: 0,
      mismatches: 0,
      errors: [] as string[],
    };

    try {
      logger.info('Starting migration verification');

      // Get all keys from simple cache
      const stats = simpleCacheService.getStats();
      const keys = stats.keys;

      for (const key of keys) {
        try {
          // Get data from both caches
          const simpleData = simpleCacheService.get(key);
          const hybridData = await hybridCacheService.get(key);

          if (simpleData === null && hybridData === null) {
            result.verified++;
            continue;
          }

          if (simpleData === null || hybridData === null) {
            result.mismatches++;
            logger.warn(`Key ${key}: one cache has data, other doesn't`);
            continue;
          }

          // Compare data (simple string comparison for now)
          if (JSON.stringify(simpleData) === JSON.stringify(hybridData)) {
            result.verified++;
          } else {
            result.mismatches++;
            logger.warn(`Key ${key}: data mismatch`);
          }
        } catch (error) {
          const errorMsg = `Verification failed for key ${key}: ${String(error)}`;
          result.errors.push(errorMsg);
          logger.warn(errorMsg);
        }
      }

      logger.info(
        `Verification completed: ${result.verified} verified, ${result.mismatches} mismatches`
      );
    } catch (error) {
      const errorMsg = `Verification failed: ${String(error)}`;
      result.errors.push(errorMsg);
      logger.error(errorMsg);
    }

    return result;
  }

  /**
   * Clear both caches after successful migration
   */
  static async clearAfterMigration(): Promise<void> {
    try {
      logger.info('Clearing caches after migration');

      // Clear simple cache
      simpleCacheService.clear();
      logger.info('Simple cache cleared');

      // Clear hybrid cache
      await hybridCacheService.clear();
      logger.info('Hybrid cache cleared');

      logger.info('Cache cleanup completed');
    } catch (error) {
      logger.error(`Cache cleanup failed: ${String(error)}`);
      throw error;
    }
  }

  /**
   * Get migration status
   */
  static async getMigrationStatus(): Promise<{
    simpleCacheSize: number;
    hybridCacheSize: number;
    redisAvailable: boolean;
    memoryAvailable: boolean;
  }> {
    try {
      const simpleStats = simpleCacheService.getStats();
      const hybridStats = await hybridCacheService.getStats();
      const healthStatus = await hybridCacheService.getHealthStatus();

      return {
        simpleCacheSize: simpleStats.size,
        hybridCacheSize: hybridStats.size,
        redisAvailable: healthStatus.redis,
        memoryAvailable: healthStatus.memory,
      };
    } catch (error) {
      logger.error(`Failed to get migration status: ${String(error)}`);
      throw error;
    }
  }
}

// Export migration utilities
export const cacheMigration = CacheMigration;
