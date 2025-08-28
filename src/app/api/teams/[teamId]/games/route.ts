import { eq, or, desc } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { nba_games, teams } from '@/lib/db/schema';
import { errorHandlers } from '@/lib/utils/error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    // Fetch games where this team is either home or away
    const games = await db()
      .select()
      .from(nba_games)
      .where(or(eq(nba_games.home_team_id, teamId), eq(nba_games.away_team_id, teamId)))
      .orderBy(desc(nba_games.date))
      .limit(10);

    // For each game, fetch team details and transform to expected format
    const gamesWithTeams = await Promise.all(
      games.map(async game => {
        const [homeTeam, awayTeam] = await Promise.all([
          db()?.query.teams.findFirst({
            where: eq(teams.id, game.home_team_id),
          }),
          db()?.query.teams.findFirst({
            where: eq(teams.id, game.away_team_id),
          }),
        ]);

        // Transform to match GameCard expected format
        return {
          id: parseInt(game.id),
          date: {
            start: game.date.toISOString(),
          },
          status: {
            short: game.status,
            long: game.status,
            halftime: false,
          },
          periods: {
            current: 4,
            total: 4,
            endOfPeriod: false,
          },
          teams: {
            home: {
              id: parseInt(game.home_team_id),
              name: homeTeam?.name || 'Unknown Team',
              nickname: homeTeam?.nickname || '',
              code: homeTeam?.code || '',
              logo: homeTeam?.logo || '',
            },
            visitors: {
              id: parseInt(game.away_team_id),
              name: awayTeam?.name || 'Unknown Team',
              nickname: awayTeam?.nickname || '',
              code: awayTeam?.code || '',
              logo: awayTeam?.logo || '',
            },
          },
          scores: {
            home: {
              points: game.home_team_score || 0,
            },
            visitors: {
              points: game.away_team_score || 0,
            },
          },
          arena: {
            name: 'Arena',
            city: homeTeam?.city || '',
            state: '',
            country: 'USA',
          },
        };
      })
    );

    return NextResponse.json(gamesWithTeams);
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'GET /api/teams/[teamId]/games',
    });
    return NextResponse.json({ error: 'Failed to fetch team games' }, { status: 500 });
  }
}
