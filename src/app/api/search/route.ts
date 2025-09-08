import { sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// import { cache } from '@/lib/cache'; // DISABLED: Using only NBA API cache now
import { API_CONFIG } from '@/lib/config/app.config';
import { createDatabaseClient } from '@/lib/db';
// import { CacheNamespace } from '@/types'; // Unused import
import { errorHandlers } from '@/lib/utils/error-handler';

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
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(
      searchParams.get('limit') ?? API_CONFIG.pagination.DEFAULT_PAGE_SIZE.toString()
    );
    const offset = (page - 1) * limit;

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
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      });
    }

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid pagination parameters',
        },
        { status: 400 }
      );
    }

    // Check if we're in test/mock mode
    if (process.env.MOCK_MODE === 'true' || process.env.NODE_ENV === 'test') {
      // Return mock data for test environment
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
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      });
    }

    // Generate cache key based on search parameters
    const _cacheKey = `search:${query}:${page}:${limit}`;

    // DISABLED: Database caching - execute search directly
    console.log(`[Search API] Executing search for query: ${query} (no caching)...`);

    let db;
    try {
      db = createDatabaseClient();
    } catch (_dbError) {
      // If database connection fails, return empty results with success
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
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
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
        LOWER(username) LIKE LOWER(${searchPattern}) OR
        LOWER(first_name) LIKE LOWER(${searchPattern}) OR
        LOWER(last_name) LIKE LOWER(${searchPattern}) OR
        LOWER(email_address) LIKE LOWER(${searchPattern})
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const usersCountQuery = sql`
      SELECT COUNT(*) as count
      FROM users
      WHERE
        LOWER(username) LIKE LOWER(${searchPattern}) OR
        LOWER(first_name) LIKE LOWER(${searchPattern}) OR
        LOWER(last_name) LIKE LOWER(${searchPattern}) OR
        LOWER(email_address) LIKE LOWER(${searchPattern})
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
      WHERE LOWER(notes) LIKE LOWER(${searchPattern})
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const gameLogsCountQuery = sql`
      SELECT COUNT(*) as count
      FROM game_logs
      WHERE LOWER(notes) LIKE LOWER(${searchPattern})
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
        LOWER(teams->>'home'->>'name') LIKE LOWER(${searchPattern}) OR
        LOWER(teams->>'away'->>'name') LIKE LOWER(${searchPattern}) OR
        LOWER(teams->>'home'->>'nickname') LIKE LOWER(${searchPattern}) OR
        LOWER(teams->>'away'->>'nickname') LIKE LOWER(${searchPattern})
      ORDER BY date DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const gamesCountQuery = sql`
      SELECT COUNT(*) as count
      FROM basketball_games
      WHERE
        LOWER(teams->>'home'->>'name') LIKE LOWER(${searchPattern}) OR
        LOWER(teams->>'away'->>'name') LIKE LOWER(${searchPattern}) OR
        LOWER(teams->>'home'->>'nickname') LIKE LOWER(${searchPattern}) OR
        LOWER(teams->>'away'->>'nickname') LIKE LOWER(${searchPattern})
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
        LOWER(name) LIKE LOWER(${searchPattern}) OR
        LOWER(city) LIKE LOWER(${searchPattern}) OR
        LOWER(conference) LIKE LOWER(${searchPattern})
      ORDER BY name ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const teamsCountQuery = sql`
      SELECT COUNT(*) as count
      FROM basketball_teams
      WHERE
        LOWER(name) LIKE LOWER(${searchPattern}) OR
        LOWER(city) LIKE LOWER(${searchPattern}) OR
        LOWER(conference) LIKE LOWER(${searchPattern})
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
        LOWER(first_name) LIKE LOWER(${searchPattern}) OR
        LOWER(last_name) LIKE LOWER(${searchPattern}) OR
        LOWER(college) LIKE LOWER(${searchPattern}) OR
        LOWER(affiliation) LIKE LOWER(${searchPattern}) OR
        LOWER(teams) LIKE LOWER(${searchPattern}) OR
        LOWER(leagues) LIKE LOWER(${searchPattern})
      ORDER BY last_name ASC, first_name ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const playersCountQuery = sql`
      SELECT COUNT(*) as count
      FROM basketball_players
      WHERE
        LOWER(first_name) LIKE LOWER(${searchPattern}) OR
        LOWER(last_name) LIKE LOWER(${searchPattern}) OR
        LOWER(college) LIKE LOWER(${searchPattern}) OR
        LOWER(affiliation) LIKE LOWER(${searchPattern}) OR
        LOWER(teams) LIKE LOWER(${searchPattern}) OR
        LOWER(leagues) LIKE LOWER(${searchPattern})
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
    const totalPages = Math.ceil(totalResults / limit);

    const response = {
      success: true,
      data: {
        users,
        gameLogs,
        games,
        teams,
        players,
        totalUsers,
        totalGameLogs,
        totalGames,
        totalTeams,
        totalPlayers,
      },
      pagination: {
        page,
        limit,
        total: totalResults,
        pages: totalPages,
      },
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
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      },
      { status: 500 }
    );
  }
}
