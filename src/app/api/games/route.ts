import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { API_LIMITS } from '@/lib/constants';
import { db } from '@/lib/db';
import { errorHandlers } from '@/lib/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season');
    const league = searchParams.get('league');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') || '100') : 100;

    console.log('🔍 Games API called with params:', { season, league, limit });

    // Fetch games from database with team information
    const games = await db()?.query.nba_games.findMany({
      limit: API_LIMITS.GAMES.LARGE,
      with: {
        // Note: We'll need to manually fetch teams since relations might not be set up
      },
    });

    console.log('📊 Found games:', games?.length || 0);

    if (!games || games.length === 0) {
      return NextResponse.json({
        get: 'games/',
        parameters: { season: season || 'all', league: league || 'all' },
        errors: [],
        results: 0,
        response: [],
      });
    }

    // Fetch team information for all games
    const teamIds = new Set<string>();
    games.forEach(game => {
      teamIds.add(game.home_team_id);
      teamIds.add(game.away_team_id);
    });

    const teams = await db()?.query.teams.findMany({
      where: (teams, { inArray }) => inArray(teams.id, Array.from(teamIds)),
    });

    const teamsMap = new Map(teams?.map(team => [team.id, team]) || []);

    // Transform games to match the expected API response format
    const transformedGames = games.map(game => {
      const homeTeam = teamsMap.get(game.home_team_id);
      const awayTeam = teamsMap.get(game.away_team_id);

      return {
        id: parseInt(game.id),
        date: {
          start: game.date.toISOString(),
          end: game.date.toISOString(),
          duration: null,
        },
        status: {
          clock: null,
          halftime: false,
          short: game.status,
          long: game.status,
        },
        periods: {
          current: 1,
          total: 4,
          endOfPeriod: false,
        },
        arena: {
          name: 'Unknown Arena',
          city: 'Unknown City',
          state: null,
          country: 'USA',
        },
        teams: {
          visitors: {
            id: parseInt(game.away_team_id),
            name: awayTeam?.name || 'Unknown Team',
            nickname: awayTeam?.nickname || 'Unknown',
            code: awayTeam?.code || 'UNK',
            logo: awayTeam?.logo || null,
          },
          home: {
            id: parseInt(game.home_team_id),
            name: homeTeam?.name || 'Unknown Team',
            nickname: homeTeam?.nickname || 'Unknown',
            code: homeTeam?.code || 'UNK',
            logo: homeTeam?.logo || null,
          },
        },
        scores: {
          visitors: {
            win: (game.away_team_score ?? 0) > (game.home_team_score ?? 0),
            loss: (game.away_team_score ?? 0) < (game.home_team_score ?? 0),
            series: {
              win: 0,
              loss: 0,
            },
            linescore: [game.away_team_score ?? 0],
          },
          home: {
            win: (game.home_team_score ?? 0) > (game.away_team_score ?? 0),
            loss: (game.home_team_score ?? 0) < (game.away_team_score ?? 0),
            series: {
              win: 0,
              loss: 0,
            },
            linescore: [game.home_team_score ?? 0],
          },
        },
        officials: [],
        timesTied: 0,
        leadChanges: 0,
        nugget: null,
      };
    });

    return NextResponse.json({
      get: 'games/',
      parameters: { season: season || 'all', league: league || 'all' },
      errors: [],
      results: transformedGames.length,
      response: transformedGames,
    });
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'GET /api/games',
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
