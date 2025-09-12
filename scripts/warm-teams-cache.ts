#!/usr/bin/env tsx

import { simpleCacheService } from '../src/lib/cache/simple-cache-service';
import { logger } from '../src/lib/utils/logger';

async function warmTeamsCache() {
  try {
    logger.info('teams-cache', 'warming-started');

    // Warm up teams cache by fetching all teams with optimal parameters
    const response = await fetch(
      'http://localhost:3000/api/teams?limit=100&sortBy=name&sortDirection=asc'
    );
    if (!response.ok) {
      throw new Error(`Failed to warm teams cache: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logger.info('teams-cache', 'warming-completed', {
      teamsCount: data.teams?.length || 0,
      cacheKey: data.cacheInfo?.cacheKey || 'teams:all',
      isAllTeamsRequest: data.cacheInfo?.isAllTeamsRequest,
    });

    console.log('✅ Teams cache warmed successfully!');
    console.log(`📊 Loaded ${data.teams?.length || 0} teams into cache`);

    // Warm up individual team data for the first 10 teams
    if (data.teams && data.teams.length > 0) {
      console.log('\n🔥 Warming individual team data...');
      const teamsToWarm = data.teams.slice(0, 10); // Warm first 10 teams

      for (const team of teamsToWarm) {
        try {
          // Warm individual team data
          const teamResponse = await fetch(`http://localhost:3000/api/teams/${team.id}`);
          if (teamResponse.ok) {
            console.log(`  ✅ Team ${team.name} (ID: ${team.id}) data warmed`);
          }

          // Warm team stats for current season
          const currentYear = new Date().getFullYear();
          const statsResponse = await fetch(
            `http://localhost:3000/api/teams/${team.id}/stats?season=${currentYear}`
          );
          if (statsResponse.ok) {
            console.log(`  ✅ Team ${team.name} stats for ${currentYear} warmed`);
          }
        } catch (error) {
          console.warn(`  ⚠️ Failed to warm data for team ${team.name}:`, error);
        }
      }
    }

    // Show cache stats
    const stats = simpleCacheService.getStats();
    const teamsCacheKeys = Object.keys(stats).filter(
      key => key.startsWith('teams:') || key.startsWith('team:') || key.startsWith('team-stats:')
    );

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
