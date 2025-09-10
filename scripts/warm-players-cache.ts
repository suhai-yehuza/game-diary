#!/usr/bin/env tsx

import { simpleCacheService } from '../src/lib/cache/simple-cache-service';
import { logger } from '../src/lib/utils/logger';

async function warmPlayersCache() {
  try {
    logger.info('players-cache', 'warming-started');

    // Warm up players cache by fetching data
    console.log('🔥 Warming players cache...');

    const [filterOptionsResponse, playersResponse] = await Promise.all([
      fetch('http://localhost:3000/api/players?options=true'),
      fetch('http://localhost:3000/api/players?limit=100'),
    ]);

    if (!filterOptionsResponse.ok || !playersResponse.ok) {
      throw new Error('Failed to warm players cache');
    }

    const [filterOptions, players] = await Promise.all([
      filterOptionsResponse.json(),
      playersResponse.json(),
    ]);

    logger.info('players-cache', 'warming-completed', {
      filterOptionsCount: Object.keys(filterOptions).length,
      playersCount: players.response?.length || 0,
      totalPlayers: players.results || 0,
    });

    console.log('✅ Players cache warmed successfully!');
    console.log(`📊 Filter options: ${Object.keys(filterOptions).length} categories`);
    console.log(`📊 Sample players: ${players.response?.length || 0} players`);
    console.log(`📊 Total players in DB: ${players.results || 0}`);

    // Show cache stats
    const stats = simpleCacheService.getStats();
    const playersCacheKeys = Object.keys(stats).filter(key => key.startsWith('players:'));

    console.log('\n📈 Cache Statistics:');
    playersCacheKeys.forEach(key => {
      const keyStats = stats[key];
      console.log(`  ${key}: TTL=${keyStats?.ttl}s, Tags=${keyStats?.tags?.join(', ')}`);
    });
  } catch (error) {
    logger.error('players-cache', 'warming-failed', { error: String(error) });
    console.error('❌ Failed to warm players cache:', error);
    process.exit(1);
  }
}

// Run the cache warming
if (import.meta.main) {
  warmPlayersCache().catch(console.error);
}
