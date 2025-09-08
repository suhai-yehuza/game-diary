#!/usr/bin/env tsx

import { hybridCacheService } from '../src/lib/cache/hybrid-cache-service';
import { logger } from '../src/lib/utils/logger';

async function warmGamesCache() {
  try {
    logger.info('games-cache', 'warming-started');

    // Warm up games cache by fetching data for different seasons
    const currentYear = new Date().getFullYear();
    const seasons = [currentYear - 1, currentYear, currentYear + 1];

    console.log(`🔥 Warming games cache for seasons: ${seasons.join(', ')}`);

    const warmPromises = seasons.map(async season => {
      const response = await fetch(`http://localhost:3000/api/games?season=${season}`);
      if (!response.ok) {
        throw new Error(`Failed to warm games cache for season ${season}: ${response.status}`);
      }
      const data = await response.json();
      return { season, count: data.response?.length || 0 };
    });

    const results = await Promise.all(warmPromises);

    logger.info('games-cache', 'warming-completed', {
      seasons: results.map(r => r.season),
      totalGames: results.reduce((sum, r) => sum + r.count, 0),
    });

    console.log('✅ Games cache warmed successfully!');
    results.forEach(({ season, count }) => {
      console.log(`📊 Season ${season}: ${count} games cached`);
    });

    // Show cache stats
    const stats = await hybridCacheService.getStats();
    const gamesCacheKeys = Object.keys(stats).filter(key => key.startsWith('games:'));

    console.log('\n📈 Cache Statistics:');
    gamesCacheKeys.forEach(key => {
      const keyStats = stats[key];
      console.log(`  ${key}: TTL=${keyStats?.ttl}s, Tags=${keyStats?.tags?.join(', ')}`);
    });
  } catch (error) {
    logger.error('games-cache', 'warming-failed', { error: String(error) });
    console.error('❌ Failed to warm games cache:', error);
    process.exit(1);
  }
}

// Run the cache warming
if (import.meta.main) {
  warmGamesCache().catch(console.error);
}
