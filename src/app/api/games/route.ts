import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { API_LIMITS } from '@/lib/constants';
import { db } from '@/lib/db';
import { errorHandlers } from '@/lib/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') || '100') : 100;

    console.log('🔍 Games API called with params:', { season, limit });

    // Fetch games from database with team information
    const games = await db()?.query.nba_games.findMany({
      limit: API_LIMITS.GAMES.LARGE,
      with: {
        // Note: We'll need to manually fetch teams since relations might not be set up
      },
    });

    console.log('📊 Found games:', games?.length || 0);

    // Debug: Check game statuses and scores
    if (games && games.length > 0) {
      const statusCounts = games.reduce<Record<string, number>>((acc, game) => {
        acc[game.status] = (acc[game.status] || 0) + 1;
        return acc;
      }, {});

      const gamesWithScores = games.filter(
        game => game.home_team_score !== null && game.away_team_score !== null
      ).length;

      console.log('📊 Game status breakdown:', statusCounts);
      console.log('📊 Games with scores:', gamesWithScores, 'out of', games.length);

      // Show sample games
      const sampleGames = games.slice(0, 3);
      console.log(
        '📊 Sample games:',
        sampleGames.map(g => ({
          id: g.id,
          status: g.status,
          home_score: g.home_team_score,
          away_score: g.away_team_score,
          date: g.date,
        }))
      );
    }

    if (!games || games.length === 0) {
      return NextResponse.json({
        get: 'games/',
        parameters: { season: season || 'all' },
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
        id: game.id, // Preserve the original database ID (e.g., "2015-1")
        date: {
          start: game.date.toISOString(),
          end: game.date.toISOString(),
          duration: null,
        },
        status: {
          clock: ((game.status_data as Record<string, unknown>)?.clock as string | null) ?? null,
          halftime: ((game.status_data as Record<string, unknown>)?.halftime as boolean) ?? false,
          short: ((game.status_data as Record<string, unknown>)?.short as string) ?? game.status,
          long: ((game.status_data as Record<string, unknown>)?.long as string) ?? game.status,
        },
        stage: game.stage ?? 1, // Game stage (regular season, playoffs, etc.)
        periods: (game.periods as Record<string, unknown>) || {
          current:
            (((game.status_data as Record<string, unknown>)?.periods as Record<string, unknown>)
              ?.current as number) ?? 1,
          total:
            (((game.status_data as Record<string, unknown>)?.periods as Record<string, unknown>)
              ?.total as number) ?? 4,
          endOfPeriod:
            (((game.status_data as Record<string, unknown>)?.periods as Record<string, unknown>)
              ?.endOfPeriod as boolean) ?? false,
        },
        arena: {
          name: ((game.arena as Record<string, unknown>)?.name as string) ?? 'Unknown Arena',
          city: ((game.arena as Record<string, unknown>)?.city as string) ?? 'Unknown City',
          state: ((game.arena as Record<string, unknown>)?.state as string) ?? null,
          country: ((game.arena as Record<string, unknown>)?.country as string) ?? 'USA',
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
        scores: (game.scores as Record<string, unknown>) || {
          visitors: {
            win: (game.away_team_score ?? 0) > (game.home_team_score ?? 0),
            loss: (game.away_team_score ?? 0) < (game.home_team_score ?? 0),
            series: {
              win: 0,
              loss: 0,
            },
            linescore: [game.away_team_score ?? 0],
            points: game.away_team_score ?? 0, // ✅ Add points field
          },
          home: {
            win: (game.home_team_score ?? 0) > (game.away_team_score ?? 0),
            loss: (game.home_team_score ?? 0) < (game.away_team_score ?? 0),
            series: {
              win: 0,
              loss: 0,
            },
            linescore: [game.home_team_score ?? 0],
            points: game.home_team_score ?? 0, // ✅ Add points field
          },
        },
        officials: (game.officials as string[]) || [],
        timesTied: game.times_tied ?? 0,
        leadChanges: game.lead_changes ?? 0,
        nugget: game.nugget ?? null,
      };
    });

    return NextResponse.json({
      get: 'games/',
      parameters: { season: season || 'all' },
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
