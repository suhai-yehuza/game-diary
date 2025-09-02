import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { teams } from '@/lib/db/schema';
import { errorHandlers } from '@/lib/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const league = searchParams.get('league');

    // Fetch all teams from database
    const allTeams = await db()?.query.teams.findMany({
      orderBy: teams.name,
    });

    if (!allTeams) {
      return NextResponse.json({ response: [] });
    }

    // Transform teams to match the expected API response format
    const transformedTeams = allTeams.map(team => {
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

      return {
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
      };
    });

    // Filter by league if specified
    let filteredTeams = transformedTeams;
    if (league === 'standard') {
      // Filter for NBA teams only
      filteredTeams = transformedTeams.filter(team => team.nbaFranchise && !team.allStar);
    }

    return NextResponse.json({
      get: 'teams/',
      parameters: { league: league || 'all' },
      errors: [],
      results: filteredTeams.length,
      response: filteredTeams,
    });
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'GET /api/teams',
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
