import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

import { NBAHubCacheUtils, CACHE_CONFIG } from '@/lib/cache';
import { errorHandlers } from '@/lib/utils/error-handler';

// Simple in-memory fallback cache for when hybrid cache fails
const fallbackCache = new Map<
  string,
  { data: Record<string, unknown>; timestamp: number; ttl: number }
>();

/**
 * Get total counts for NBA Hub page
 * This endpoint provides the total number of games, teams, and players in the database
 * Results are cached for 1 hour to improve performance
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bypassCache = searchParams.get('bypass-cache') === 'true';

    const startTime = Date.now();
    console.log('📊 Fetching NBA Hub counts...', { bypassCache });

    // Test cache service availability and environment
    console.log('🔍 Testing cache service...');
    console.log('🔍 Environment check:');
    console.log('  - NODE_ENV:', process.env.NODE_ENV);
    console.log(
      '  - UPSTASH_REDIS_REST_URL:',
      process.env.UPSTASH_REDIS_REST_URL ? '✅ Set' : '❌ Not set'
    );
    console.log(
      '  - UPSTASH_REDIS_REST_TOKEN:',
      process.env.UPSTASH_REDIS_REST_TOKEN ? '✅ Set' : '❌ Not set'
    );

    // Check fallback cache first (fastest) - unless bypassing cache
    if (!bypassCache) {
      const gamesFallback = fallbackCache.get('nbaHub:games.count');
      const teamsFallback = fallbackCache.get('nbaHub:teams.count');
      const playersFallback = fallbackCache.get('nbaHub:players.count');

      if (gamesFallback && teamsFallback && playersFallback) {
        const now = Date.now();
        const gamesValid = now - gamesFallback.timestamp < gamesFallback.ttl * 1000;
        const teamsValid = now - teamsFallback.timestamp < teamsFallback.ttl * 1000;
        const playersValid = now - playersFallback.timestamp < playersFallback.ttl * 1000;

        if (gamesValid && teamsValid && playersValid) {
          const fallbackCounts = {
            totalGames: (gamesFallback.data as { count: number }).count,
            totalTeams: (teamsFallback.data as { count: number }).count,
            totalPlayers: (playersFallback.data as { count: number }).count,
            liveGames: 0, // This will be updated by the live games service
          };

          console.log('📊 NBA Hub counts retrieved from fallback cache (individual keys)');
          const response = NextResponse.json({
            success: true,
            counts: fallbackCounts,
            timestamp: new Date().toISOString(),
            source: 'fallback-cache',
            cacheTime: 0,
            totalTime: Date.now() - startTime,
          });
          response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
          return response;
        }
      }
    }

    try {
      const testResult = NBAHubCacheUtils.getCachedNBACounts();
      console.log('✅ Cache service is accessible, test result:', testResult);
    } catch (cacheError) {
      console.error('❌ Cache service error:', cacheError);
      console.error('❌ Cache error details:', {
        name: cacheError instanceof Error ? cacheError.name : 'Unknown',
        message: cacheError instanceof Error ? cacheError.message : 'Unknown',
        stack: cacheError instanceof Error ? cacheError.stack : 'Unknown',
      });
    }

    // Try to get counts from hybrid cache (unless bypassing cache)
    if (!bypassCache) {
      console.log('🔍 Attempting to retrieve from hybrid cache...');
      const cacheStartTime = Date.now();
      const cachedCounts = NBAHubCacheUtils.getCachedNBACounts();
      const cacheEndTime = Date.now();

      console.log(`⏱️ Cache operation took ${cacheEndTime - cacheStartTime}ms`);
      console.log('📊 Cache result:', cachedCounts ? 'HIT' : 'MISS');

      if (cachedCounts) {
        console.log('📊 NBA Hub counts retrieved from hybrid cache');
        const response = NextResponse.json({
          success: true,
          counts: cachedCounts,
          timestamp: new Date().toISOString(),
          source: 'cache',
          cacheTime: cacheEndTime - cacheStartTime,
          totalTime: Date.now() - startTime,
        });

        // Set cache headers for browser caching
        response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600'); // 5 min + 10 min stale
        response.headers.set('ETag', `"${JSON.stringify(cachedCounts).length}-${Date.now()}"`);

        return response;
      }
    }

    console.log('📊 Cache miss - fetching NBA Hub counts from database...');
    const dbStartTime = Date.now();

    const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

    if (!databaseUrl) {
      throw new Error('Database URL not configured');
    }

    const db = neon(databaseUrl);

    // Query total counts from database using string table names
    const [gamesCount, teamsCount, playersCount] = await Promise.all([
      // Count total NBA games
      db`SELECT COUNT(*) as count FROM basketball_games`,
      // Count total teams
      db`SELECT COUNT(*) as count FROM basketball_teams`,
      // Count total NBA players
      db`SELECT COUNT(*) as count FROM basketball_players`,
    ]);

    const dbEndTime = Date.now();
    console.log(`⏱️ Database queries took ${dbEndTime - dbStartTime}ms`);

    const counts = {
      totalGames: parseInt(gamesCount[0]?.count as string) || 0,
      totalTeams: parseInt(teamsCount[0]?.count as string) || 0,
      totalPlayers: parseInt(playersCount[0]?.count as string) || 0,
      liveGames: 0, // This will be updated by the live games service
    };

    console.log(
      `📊 NBA Hub counts from database: ${counts.totalGames} games, ${counts.totalTeams} teams, ${counts.totalPlayers} players`
    );

    // Store in fallback cache immediately (fastest)
    fallbackCache.set('nbaHub:games.count', {
      data: { count: counts.totalGames },
      timestamp: Date.now(),
      ttl: CACHE_CONFIG.TTL.NBA_HUB_COUNTS,
    });
    fallbackCache.set('nbaHub:teams.count', {
      data: { count: counts.totalTeams },
      timestamp: Date.now(),
      ttl: CACHE_CONFIG.TTL.NBA_HUB_TEAMS_COUNT, // 24 hours for teams count
    });
    fallbackCache.set('nbaHub:players.count', {
      data: { count: counts.totalPlayers },
      timestamp: Date.now(),
      ttl: CACHE_CONFIG.TTL.NBA_HUB_COUNTS,
    });
    console.log('📊 NBA Hub counts stored in fallback cache (individual keys)');

    // Cache the counts for future requests
    try {
      console.log('💾 Caching counts in hybrid cache...');
      const cacheSetStartTime = Date.now();

      // Cache each count individually for better granularity
      await Promise.all([
        NBAHubCacheUtils.cacheCount('games', counts.totalGames, {
          ttl: CACHE_CONFIG.TTL.NBA_HUB_COUNTS,
        }),
        NBAHubCacheUtils.cacheCount('teams', counts.totalTeams, {
          ttl: CACHE_CONFIG.TTL.NBA_HUB_TEAMS_COUNT, // 24 hours for teams count
        }),
        NBAHubCacheUtils.cacheCount('players', counts.totalPlayers, {
          ttl: CACHE_CONFIG.TTL.NBA_HUB_COUNTS,
        }),
      ]);

      const cacheSetEndTime = Date.now();
      console.log(`⏱️ Cache set operation took ${cacheSetEndTime - cacheSetStartTime}ms`);
      console.log('📊 NBA Hub counts cached successfully in hybrid cache');
    } catch (cacheError) {
      console.warn('Failed to cache NBA Hub counts in hybrid cache:', cacheError);
      console.log('📊 Using fallback cache only');
    }

    const response = NextResponse.json({
      success: true,
      counts,
      timestamp: new Date().toISOString(),
      source: 'database',
      dbTime: dbEndTime - dbStartTime,
      totalTime: Date.now() - startTime,
    });

    // Set cache headers for browser caching
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600'); // 5 min + 10 min stale
    response.headers.set('ETag', `"${JSON.stringify(counts).length}-${Date.now()}"`);

    return response;
  } catch (error) {
    console.error('Error fetching NBA Hub counts:', error);

    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'NBA Hub Counts API',
      action: 'GET /api/nba-hub/counts',
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
