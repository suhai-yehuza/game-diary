import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

import { errorHandlers } from '@/lib/utils/error-handler';

/**
 * Get total counts for NBA Hub page
 * This endpoint provides the total number of games, teams, and players in the database
 */
export async function GET() {
  try {
    console.log('📊 Fetching NBA Hub counts from database...');

    const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

    if (!databaseUrl) {
      throw new Error('Database URL not configured');
    }

    const db = neon(databaseUrl);

    // Query total counts from database using string table names
    const [gamesCount, teamsCount, playersCount] = await Promise.all([
      // Count total NBA games
      db`SELECT COUNT(*) as count FROM nba_games`,
      // Count total teams
      db`SELECT COUNT(*) as count FROM teams`,
      // Count total NBA players
      db`SELECT COUNT(*) as count FROM nba_players`,
    ]);

    const counts = {
      games: parseInt(gamesCount[0]?.count as string) || 0,
      teams: parseInt(teamsCount[0]?.count as string) || 0,
      players: parseInt(playersCount[0]?.count as string) || 0,
    };

    console.log(
      `📊 NBA Hub counts: ${counts.games} games, ${counts.teams} teams, ${counts.players} players`
    );

    return NextResponse.json({
      success: true,
      counts,
      timestamp: new Date().toISOString(),
    });
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
