#!/usr/bin/env tsx

import { hybridCacheService } from '../src/lib/cache/hybrid-cache-service';
import { logger } from '../src/lib/utils/logger';

async function warmTeamsCache() {
  try {
    logger.info('teams-cache', 'warming-started');

    // Warm up teams cache by fetching data
    const response = await fetch('http://localhost:3000/api/teams');
    if (!response.ok) {
      throw new Error(`Failed to warm teams cache: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logger.info('teams-cache', 'warming-completed', {
      teamsCount: data.response?.length || 0,
      cacheKey: 'teams:all',
    });

    console.log('✅ Teams cache warmed successfully!');
    console.log(`📊 Loaded ${data.response?.length || 0} teams into cache`);

    // Show cache stats
    const stats = await hybridCacheService.getStats();
    const teamsCacheKeys = Object.keys(stats).filter(key => key.startsWith('teams:'));

    console.log('\n📈 Cache Statistics:');
    teamsCacheKeys.forEach(key => {
      const keyStats = stats[key];
      console.log(`  ${key}: TTL=${keyStats?.ttl}s, Tags=${keyStats?.tags?.join(', ')}`);
    });
  } catch (error) {
    logger.error('teams-cache', 'warming-failed', { error: String(error) });
    console.error('❌ Failed to warm teams cache:', error);
    process.exit(1);
  }
}

// Run the cache warming
if (import.meta.main) {
  warmTeamsCache().catch(console.error);
}
