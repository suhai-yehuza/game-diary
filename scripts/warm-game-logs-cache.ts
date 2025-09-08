#!/usr/bin/env tsx

import { GameLogsService } from '../src/lib/services/game-logs.service';
import { GameLogCacheUtils } from '../src/lib/cache/game-log-cache.utils';
import { logger } from '../src/lib/utils/logger';

async function warmUpGameLogsCache() {
  logger.info('Starting game logs cache warm-up...');

  try {
    // Warm up common queries
    const commonQueries = [
      { filters: { classification: 'PUBLIC' }, pagination: { page: 1, limit: 20 } },
      { filters: { classification: 'PUBLIC' }, pagination: { page: 1, limit: 50 } },
      { filters: { classification: 'PUBLIC' }, pagination: { page: 2, limit: 20 } },
      { filters: {}, pagination: { page: 1, limit: 20 } },
      { filters: { search: 'NBA' }, pagination: { page: 1, limit: 20 } },
      { filters: { search: 'Basketball' }, pagination: { page: 1, limit: 20 } },
    ];

    logger.info(`Warming up ${commonQueries.length} common queries...`);

    for (const query of commonQueries) {
      try {
        logger.info(`Warming up: ${JSON.stringify(query)}`);
        await GameLogsService.getGameLogs(query.filters, query.pagination, {
          useCache: true,
          forceRefresh: false,
        });
        logger.info(`✅ Successfully warmed up: ${JSON.stringify(query)}`);
      } catch (error) {
        logger.error(`❌ Failed to warm up: ${JSON.stringify(query)}`, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Get cache statistics
    const stats = await GameLogsService.getCacheStats();
    logger.info('Cache warm-up completed. Stats:', stats);
  } catch (error) {
    logger.error('Game logs cache warm-up failed:', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  void warmUpGameLogsCache();
}
