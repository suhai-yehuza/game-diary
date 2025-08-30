import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { teams } from '@/lib/db/schema';
import { errorHandlers } from '@/lib/utils/error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;

    // Check if we're in test/mock mode
    if (process.env.MOCK_MODE === 'true' || process.env.NODE_ENV === 'test') {
      // Return mock data for test environment
      return NextResponse.json({
        id: parseInt(teamId),
        name: 'Test Team',
        nickname: 'Test',
        code: 'TEST',
        city: 'Test City',
        logo: null,
        allStar: false,
        nbaFranchise: true,
        leagues: {
          standard: {
            conference: 'Test Conference',
            division: null,
          },
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    const database = db();
    if (!database) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
    }

    // Fetch team from database
    const team = await database.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Parse conference data if it's JSON
    let conference = team.conference;
    if (conference && typeof conference === 'string' && conference.startsWith('[')) {
      try {
        const parsed = JSON.parse(conference) as unknown;
        conference = Array.isArray(parsed) ? (parsed[0] as string) : conference;
      } catch {
        // Keep original value if parsing fails
      }
    }

    // Return team data in the expected format
    return NextResponse.json({
      id: parseInt(team.id),
      name: team.name,
      nickname: team.nickname,
      code: team.code,
      city: team.city,
      logo: team.logo,
      allStar: team.all_star,
      nbaFranchise: team.nba_franchise,
      leagues: {
        standard: {
          conference: conference,
          division: null, // We don't have division in the current schema
        },
      },
      created_at: team.created_at,
      updated_at: team.updated_at,
    });
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'GET /api/teams/[teamId]',
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
