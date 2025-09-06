#!/usr/bin/env tsx

import { GameLogsService } from '../src/lib/services/game-logs.service';
import { logger } from '../src/lib/utils/logger';

async function testGraphQLService() {
  logger.info('Testing GraphQL Service...');

  try {
    // Test fetching public game logs
    logger.info('Testing public game logs fetch...');
    const publicResult = await GameLogsService.getGameLogs(
      { classification: 'PUBLIC' },
      { page: 1, limit: 10 },
      { useCache: false, forceRefresh: true }
    );

    logger.info('Public game logs result:', {
      count: publicResult.gameLogs.length,
      totalCount: publicResult.totalCount,
      hasNextPage: publicResult.hasNextPage,
      cacheHit: publicResult.cacheHit,
    });

    // Test fetching all game logs
    logger.info('Testing all game logs fetch...');
    const allResult = await GameLogsService.getGameLogs(
      {},
      { page: 1, limit: 10 },
      { useCache: false, forceRefresh: true }
    );

    logger.info('All game logs result:', {
      count: allResult.gameLogs.length,
      totalCount: allResult.totalCount,
      hasNextPage: allResult.hasNextPage,
      cacheHit: allResult.cacheHit,
    });

    // Test cache stats
    logger.info('Testing cache stats...');
    const cacheStats = await GameLogsService.getCacheStats();
    logger.info('Cache stats:', cacheStats);
  } catch (error) {
    logger.error('Test failed:', error);
  }
}

if (import.meta.main) {
  void testGraphQLService();
}
