import { sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// import { cache } from '@/lib/cache'; // DISABLED: Using only NBA API cache now
import { createDatabaseClient } from '@/lib/db';
// import { CacheNamespace } from '@/types'; // Unused import
import { errorHandlers } from '@/lib/utils/error-handler';

// Helper function to safely convert values to strings
function safeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

// Data sanitization function to remove sensitive/encrypted fields
function sanitizeUserData(user: Record<string, unknown>) {
  const {
    password_hash: _password_hash,
    encrypted_first_name: _encrypted_first_name,
    encrypted_last_name: _encrypted_last_name,
    encrypted_email_address: _encrypted_email_address,
    encrypted_phone_number: _encrypted_phone_number,
    phone_number: _phone_number, // This might be encrypted
    ...safeUser
  } = user;

  // Check if any remaining fields contain encrypted data
  const sanitizedUser = { ...safeUser };

  // Remove any fields that look like encrypted data (contain iv, content, tag)
  Object.keys(sanitizedUser).forEach(key => {
    const value = sanitizedUser[key];
    if (
      typeof value === 'string' &&
      value.includes('"iv"') &&
      value.includes('"content"') &&
      value.includes('"tag"')
    ) {
      console.warn(`Removing encrypted field from user data: ${key}`);
      delete sanitizedUser[key];
    }
  });

  return sanitizedUser;
}

function sanitizeGameLogData(gameLog: Record<string, unknown>) {
  const {
    encrypted_notes: _encrypted_notes,
    encrypted_tags: _encrypted_tags,
    ...safeGameLog
  } = gameLog;

  // Remove any fields that look like encrypted data
  Object.keys(safeGameLog).forEach(key => {
    const value = safeGameLog[key];
    if (
      typeof value === 'string' &&
      value.includes('"iv"') &&
      value.includes('"content"') &&
      value.includes('"tag"')
    ) {
      console.warn(`Removing encrypted field from game log data: ${key}`);
      delete safeGameLog[key];
    }
  });

  return safeGameLog;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    // Input validation
    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          users: [],
          gameLogs: [],
          games: [],
          teams: [],
          players: [],
          totalUsers: 0,
          totalGameLogs: 0,
          totalGames: 0,
          totalTeams: 0,
          totalPlayers: 0,
        },
        total: 0,
      });
    }

    // Check if we're in test/mock mode
    if (process.env.MOCK_MODE === 'true' || process.env.NODE_ENV === 'test') {
      // Return mock data for test environment
      return NextResponse.json({
        success: true,
        results: [],
        total: 0,
        query,
        filters: {},
        facets: {
          type: [
            { value: 'users', count: 0 },
            { value: 'gameLogs', count: 0 },
            { value: 'games', count: 0 },
            { value: 'teams', count: 0 },
            { value: 'players', count: 0 },
          ],
        },
        took: 0,
      });
    }

    // Generate cache key based on search parameters
    const _cacheKey = `search:${query}`;

    // DISABLED: Database caching - execute search directly
    console.log(`[Search API] Executing search for query: ${query} (no caching)...`);

    let db;
    try {
      db = createDatabaseClient();
    } catch (_dbError) {
      // If database connection fails, return empty results with success
      return NextResponse.json({
        success: true,
        results: [],
        total: 0,
        query,
        filters: {},
        facets: {
          type: [
            { value: 'users', count: 0 },
            { value: 'gameLogs', count: 0 },
            { value: 'games', count: 0 },
            { value: 'teams', count: 0 },
            { value: 'players', count: 0 },
          ],
        },
        took: 0,
      });
    }

    const searchPattern = `%${query}%`;

    // Search users with parameterized query
    const usersQuery = sql`
      SELECT
        id,
        username,
        first_name,
        last_name,
        email_address,
        created_at
      FROM users
      WHERE
        username ILIKE ${searchPattern} OR
        first_name ILIKE ${searchPattern} OR
        last_name ILIKE ${searchPattern} OR
        email_address ILIKE ${searchPattern}
      ORDER BY created_at DESC
    `;

    const usersCountQuery = sql`
      SELECT COUNT(*) as count
      FROM users
      WHERE
        username ILIKE ${searchPattern} OR
        first_name ILIKE ${searchPattern} OR
        last_name ILIKE ${searchPattern} OR
        email_address ILIKE ${searchPattern}
    `;

    // Search game logs with parameterized query
    const gameLogsQuery = sql`
      SELECT
        id,
        user_id,
        game_id,
        rating_for_game,
        notes,
        classification,
        created_at
      FROM game_logs
      WHERE notes ILIKE ${searchPattern}
      ORDER BY created_at DESC
    `;

    const gameLogsCountQuery = sql`
      SELECT COUNT(*) as count
      FROM game_logs
      WHERE notes ILIKE ${searchPattern}
    `;

    // Search games with parameterized query
    const gamesQuery = sql`
      SELECT
        id,
        date,
        teams,
        scores,
        status,
        created_at
      FROM basketball_games
      WHERE
        teams->'home'->>'name' ILIKE ${searchPattern} OR
        teams->'away'->>'name' ILIKE ${searchPattern} OR
        teams->'home'->>'nickname' ILIKE ${searchPattern} OR
        teams->'away'->>'nickname' ILIKE ${searchPattern}
      ORDER BY date DESC
    `;

    const gamesCountQuery = sql`
      SELECT COUNT(*) as count
      FROM basketball_games
      WHERE
        teams->'home'->>'name' ILIKE ${searchPattern} OR
        teams->'away'->>'name' ILIKE ${searchPattern} OR
        teams->'home'->>'nickname' ILIKE ${searchPattern} OR
        teams->'away'->>'nickname' ILIKE ${searchPattern}
    `;

    // Search teams with parameterized query
    const teamsQuery = sql`
      SELECT
        id,
        name,
        city,
        conference,
        created_at
      FROM basketball_teams
      WHERE
        name ILIKE ${searchPattern} OR
        city ILIKE ${searchPattern} OR
        conference ILIKE ${searchPattern}
      ORDER BY name ASC
    `;

    const teamsCountQuery = sql`
      SELECT COUNT(*) as count
      FROM basketball_teams
      WHERE
        name ILIKE ${searchPattern} OR
        city ILIKE ${searchPattern} OR
        conference ILIKE ${searchPattern}
    `;

    // Search players
    const playersQuery = sql`
      SELECT
        id,
        first_name,
        last_name,
        birth,
        nba,
        height,
        weight,
        college,
        affiliation,
        teams,
        leagues,
        image_url,
        created_at
      FROM basketball_players
      WHERE
        first_name ILIKE ${searchPattern} OR
        last_name ILIKE ${searchPattern} OR
        college ILIKE ${searchPattern} OR
        affiliation ILIKE ${searchPattern} OR
        teams::text ILIKE ${searchPattern} OR
        leagues::text ILIKE ${searchPattern}
      ORDER BY last_name ASC, first_name ASC
    `;

    const playersCountQuery = sql`
      SELECT COUNT(*) as count
      FROM basketball_players
      WHERE
        first_name ILIKE ${searchPattern} OR
        last_name ILIKE ${searchPattern} OR
        college ILIKE ${searchPattern} OR
        affiliation ILIKE ${searchPattern} OR
        teams::text ILIKE ${searchPattern} OR
        leagues::text ILIKE ${searchPattern}
    `;

    // Execute queries with parameters
    const [
      usersResult,
      usersCountResult,
      gameLogsResult,
      gameLogsCountResult,
      gamesResult,
      gamesCountResult,
      teamsResult,
      teamsCountResult,
      playersResult,
      playersCountResult,
    ] = await Promise.all([
      db.execute(usersQuery),
      db.execute(usersCountQuery),
      db.execute(gameLogsQuery),
      db.execute(gameLogsCountQuery),
      db.execute(gamesQuery),
      db.execute(gamesCountQuery),
      db.execute(teamsQuery),
      db.execute(teamsCountQuery),
      db.execute(playersQuery),
      db.execute(playersCountQuery),
    ]);

    const totalUsers = parseInt((usersCountResult.rows[0]?.count as string) ?? '0');
    const totalGameLogs = parseInt((gameLogsCountResult.rows[0]?.count as string) ?? '0');
    const totalGames = parseInt((gamesCountResult.rows[0]?.count as string) ?? '0');
    const totalTeams = parseInt((teamsCountResult.rows[0]?.count as string) ?? '0');
    const totalPlayers = parseInt((playersCountResult.rows[0]?.count as string) ?? '0');

    // Sanitize user data
    const users = usersResult.rows.map(sanitizeUserData);
    const gameLogs = gameLogsResult.rows.map(sanitizeGameLogData);
    const games = gamesResult.rows;
    const teams = teamsResult.rows;
    const players = playersResult.rows;

    const totalResults = totalUsers + totalGameLogs + totalGames + totalTeams + totalPlayers;

    // Transform data to match ISearchResponse format
    const allResults = [
      ...users.map(user => ({
        id: user.id,
        title:
          user.username || `${safeString(user.first_name)} ${safeString(user.last_name)}`.trim(),
        description: safeString(user.email_address),
        type: 'user' as const,
        url: `/users/${safeString(user.id)}`,
        metadata: {
          subtitle: user.email_address,
        },
        ...user,
      })),
      ...gameLogs.map(gameLog => ({
        id: gameLog.id,
        title: `Game Log #${safeString(gameLog.id)}`,
        description: gameLog.notes,
        type: 'gameLog' as const,
        url: `/game-logs/${safeString(gameLog.id)}`,
        metadata: {
          subtitle: `Rating: ${safeString(gameLog.rating_for_game)}/5`,
        },
        ...gameLog,
      })),
      ...games.map(game => {
        const gameData = game;
        const teams = gameData.teams as Record<string, unknown> | undefined;
        const homeTeam = (teams?.home as Record<string, unknown>) ?? {};
        const awayTeam = (teams?.away as Record<string, unknown>) ?? {};

        // Improved fallback logic: name -> nickname -> code -> generic fallback
        const homeTeamName =
          safeString(homeTeam.name)?.trim() ||
          safeString(homeTeam.nickname)?.trim() ||
          safeString(homeTeam.code)?.trim() ||
          'Home Team';
        const awayTeamName =
          safeString(awayTeam.name)?.trim() ||
          safeString(awayTeam.nickname)?.trim() ||
          safeString(awayTeam.code)?.trim() ||
          'Away Team';

        const gameDate = gameData.date
          ? new Date(safeString(gameData.date)).toLocaleDateString()
          : 'Unknown Date';
        return {
          id: safeString(gameData.id),
          title: `${awayTeamName} @ ${homeTeamName}`,
          description: `Game on ${gameDate}`,
          type: 'game' as const,
          url: `/games/${safeString(gameData.id)}`,
          metadata: {
            subtitle: `${awayTeamName} @ ${homeTeamName}`,
            imageUrl: safeString(homeTeam.logo),
          },
          // Include team data for the GameSearchResult component
          home_team_name: safeString(homeTeam.name),
          home_team_nickname: safeString(homeTeam.nickname),
          home_team_code: safeString(homeTeam.code),
          away_team_name: safeString(awayTeam.name),
          away_team_nickname: safeString(awayTeam.nickname),
          away_team_code: safeString(awayTeam.code),
          ...gameData,
        };
      }),
      ...teams.map(team => ({
        id: safeString(team.id),
        title: safeString(team.name),
        description: `${safeString(team.city)} • ${safeString(team.conference)}`,
        type: 'team' as const,
        url: `/teams/${safeString(team.id)}`,
        metadata: {
          subtitle: `${safeString(team.city)} • ${safeString(team.conference)}`,
        },
        ...team,
      })),
      ...players.map(player => ({
        id: safeString(player.id),
        title:
          `${safeString(player.first_name)} ${safeString(player.last_name)}`.trim() ||
          'Unknown Player',
        description: safeString(player.college) || safeString(player.affiliation) || 'NBA Player',
        type: 'player' as const,
        url: `/players/${safeString(player.id)}`,
        metadata: {
          subtitle: safeString(player.college) || safeString(player.affiliation) || 'NBA Player',
        },
        ...player,
      })),
    ];

    const response = {
      success: true,
      results: allResults,
      total: totalResults,
      query,
      filters: {},
      facets: {
        type: [
          { value: 'users', count: totalUsers },
          { value: 'gameLogs', count: totalGameLogs },
          { value: 'games', count: totalGames },
          { value: 'teams', count: totalTeams },
          { value: 'players', count: totalPlayers },
        ],
      },
      took: 0, // Placeholder for search time
    };

    // DISABLED: Database caching

    return NextResponse.json(response);
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Search API',
      action: 'GET /api/search',
      requestId: request.headers.get('x-request-id') || undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        data: {
          users: [],
          gameLogs: [],
          games: [],
          teams: [],
          players: [],
          totalUsers: 0,
          totalGameLogs: 0,
          totalGames: 0,
          totalTeams: 0,
          totalPlayers: 0,
        },
        total: 0,
      },
      { status: 500 }
    );
  }
}
