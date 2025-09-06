#!/usr/bin/env tsx

import { hybridCacheService } from '../src/lib/cache/hybrid-cache-service';
import { logger } from '../src/lib/utils/logger';

interface CacheOperation {
  name: string;
  action: 'warm' | 'invalidate' | 'stats' | 'clear-all';
  target?: 'teams' | 'games' | 'players' | 'all';
  params?: Record<string, string>;
}

async function manageNBACaches(operation: CacheOperation) {
  try {
    logger.info('nba-cache-management', 'operation-started', operation);

    switch (operation.action) {
      case 'warm':
        await warmCache(operation.target);
        break;
      case 'invalidate':
        await invalidateCache(operation.target, operation.params);
        break;
      case 'stats':
        await showCacheStats();
        break;
      case 'clear-all':
        await clearAllCaches();
        break;
      default:
        throw new Error(`Unknown operation: ${operation.action}`);
    }

    logger.info('nba-cache-management', 'operation-completed', operation);
  } catch (error) {
    logger.error('nba-cache-management', 'operation-failed', {
      operation,
      error: String(error),
    });
    console.error(`❌ Failed to ${operation.action} cache:`, error);
    process.exit(1);
  }
}

async function warmCache(target?: string) {
  const baseUrl = 'http://localhost:3000';

  if (!target || target === 'all') {
    console.log('🔥 Warming all NBA caches...');

    const warmPromises = [
      fetch(`${baseUrl}/api/teams`),
      fetch(`${baseUrl}/api/games?season=2024`),
      fetch(`${baseUrl}/api/players?options=true`),
      fetch(`${baseUrl}/api/players?limit=50`),
    ];

    await Promise.all(warmPromises);
    console.log('✅ All NBA caches warmed successfully!');
  } else {
    console.log(`🔥 Warming ${target} cache...`);

    switch (target) {
      case 'teams':
        await fetch(`${baseUrl}/api/teams`);
        break;
      case 'games':
        await fetch(`${baseUrl}/api/games?season=2024`);
        break;
      case 'players':
        await Promise.all([
          fetch(`${baseUrl}/api/players?options=true`),
          fetch(`${baseUrl}/api/players?limit=50`),
        ]);
        break;
    }

    console.log(`✅ ${target} cache warmed successfully!`);
  }
}

async function invalidateCache(target?: string, params?: Record<string, string>) {
  if (!target || target === 'all') {
    console.log('🗑️ Invalidating all NBA caches...');

    await hybridCacheService.invalidateByTags(['teams', 'games', 'players', 'nba']);
    console.log('✅ All NBA caches invalidated successfully!');
  } else {
    console.log(`🗑️ Invalidating ${target} cache...`);

    switch (target) {
      case 'teams':
        await hybridCacheService.invalidateByTags(['teams', 'nba']);
        break;
      case 'games':
        const season = params?.season;
        if (season) {
          await hybridCacheService.invalidateByTags([`games:${season}`]);
          console.log(`✅ Games cache for season ${season} invalidated`);
        } else {
          await hybridCacheService.invalidateByTags(['games', 'nba']);
        }
        break;
      case 'players':
        await hybridCacheService.invalidateByTags(['players', 'nba']);
        break;
    }

    console.log(`✅ ${target} cache invalidated successfully!`);
  }
}

async function showCacheStats() {
  console.log('📊 NBA Cache Statistics:');
  console.log('========================');

  const stats = await hybridCacheService.getStats();

  // Teams cache
  const teamsKeys = Object.keys(stats).filter(key => key.startsWith('teams:'));
  console.log(`\n🏀 Teams Cache (${teamsKeys.length} keys):`);
  teamsKeys.forEach(key => {
    const keyStats = stats[key];
    console.log(`  ${key}: TTL=${keyStats?.ttl}s, Tags=${keyStats?.tags?.join(', ')}`);
  });

  // Games cache
  const gamesKeys = Object.keys(stats).filter(key => key.startsWith('games:'));
  console.log(`\n🎮 Games Cache (${gamesKeys.length} keys):`);
  gamesKeys.forEach(key => {
    const keyStats = stats[key];
    console.log(`  ${key}: TTL=${keyStats?.ttl}s, Tags=${keyStats?.tags?.join(', ')}`);
  });

  // Players cache
  const playersKeys = Object.keys(stats).filter(key => key.startsWith('players:'));
  console.log(`\n👤 Players Cache (${playersKeys.length} keys):`);
  playersKeys.forEach(key => {
    const keyStats = stats[key];
    console.log(`  ${key}: TTL=${keyStats?.ttl}s, Tags=${keyStats?.tags?.join(', ')}`);
  });

  // Overall stats
  const totalKeys = teamsKeys.length + gamesKeys.length + playersKeys.length;
  console.log(`\n📈 Total NBA Cache Keys: ${totalKeys}`);
}

async function clearAllCaches() {
  console.log('🧹 Clearing all NBA caches...');

  await hybridCacheService.invalidateByTags(['teams', 'games', 'players', 'nba']);

  console.log('✅ All NBA caches cleared successfully!');
}

// CLI interface
function showUsage() {
  console.log(`
🏀 NBA Cache Management Script

Usage: tsx scripts/manage-nba-caches.ts <action> [target] [options]

Actions:
  warm [target]     - Warm up cache (target: teams, games, players, all)
  invalidate [target] [--season=2024] - Invalidate cache
  stats             - Show cache statistics
  clear-all         - Clear all NBA caches

Examples:
  tsx scripts/manage-nba-caches.ts warm all
  tsx scripts/manage-nba-caches.ts warm games
  tsx scripts/manage-nba-caches.ts invalidate games --season=2024
  tsx scripts/manage-nba-caches.ts stats
  tsx scripts/manage-nba-caches.ts clear-all
`);
}

// Parse command line arguments
function parseArgs(): CacheOperation | null {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showUsage();
    return null;
  }

  const action = args[0] as CacheOperation['action'];
  const target = args[1] as CacheOperation['target'];

  // Parse additional parameters
  const params: Record<string, string> = {};
  args.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      params[key] = value;
    }
  });

  return { name: `${action} ${target || 'all'}`, action, target, params };
}

// Main execution
if (require.main === module) {
  const operation = parseArgs();
  if (operation) {
    manageNBACaches(operation).catch(console.error);
  }
}
