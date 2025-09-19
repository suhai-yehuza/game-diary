import { sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import {
  getTeamEngagementQuery,
  getPlayerEngagementQuery,
  getUserEngagementQuery,
} from '@/lib/db/queries/engagement.queries';
import { logger } from '@/lib/utils/logger';

export async function GET(_request: NextRequest) {
  try {
    const database = db();
    if (!database) {
      throw new Error('Database connection not available');
    }

    logger.info('Testing engagement queries...');

    // Test 1: Get a sample team
    const teamQuery = sql`
      SELECT id, name FROM basketball_teams
      WHERE deleted_at IS NULL
      LIMIT 1
    `;
    const teamResult = await database.execute(teamQuery);
    const sampleTeam = teamResult.rows?.[0];

    // Test 2: Get a sample player
    const playerQuery = sql`
      SELECT id, first_name, last_name FROM basketball_players
      WHERE deleted_at IS NULL
      LIMIT 1
    `;
    const playerResult = await database.execute(playerQuery);
    const samplePlayer = playerResult.rows?.[0];

    // Test 3: Get a sample user
    const userQuery = sql`
      SELECT id, username FROM users
      WHERE deleted_at IS NULL
      LIMIT 1
    `;
    const userResult = await database.execute(userQuery);
    const sampleUser = userResult.rows?.[0];

    const results: Record<string, unknown> = {
      sampleTeam,
      samplePlayer,
      sampleUser,
    };

    // Test team engagement if we have a team
    if (sampleTeam) {
      try {
        const teamEngagement = await getTeamEngagementQuery(String(sampleTeam.id));
        results.teamEngagement = teamEngagement;
      } catch (error) {
        results.teamEngagementError = error instanceof Error ? error.message : String(error);
      }
    }

    // Test player engagement if we have a player
    if (samplePlayer) {
      try {
        const playerEngagement = getPlayerEngagementQuery(String(samplePlayer.id));
        results.playerEngagement = playerEngagement;
      } catch (error) {
        results.playerEngagementError = error instanceof Error ? error.message : String(error);
      }
    }

    // Test user engagement if we have a user
    if (sampleUser) {
      try {
        const userEngagement = await getUserEngagementQuery(String(sampleUser.id));
        results.userEngagement = userEngagement;
      } catch (error) {
        results.userEngagementError = error instanceof Error ? error.message : String(error);
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: 'Engagement queries test completed',
    });
  } catch (error) {
    logger.error('Failed to test engagement queries:', { error: String(error) });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
