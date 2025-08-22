import { sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { API_CONFIG } from '@/lib/config/app.config';
import { createDatabaseClient } from '@/lib/db';

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

  // Check if any remaining fields contain encrypted data
  const sanitizedGameLog = { ...safeGameLog };

  // Remove any fields that look like encrypted data (contain iv, content, tag)
  Object.keys(sanitizedGameLog).forEach(key => {
    const value = sanitizedGameLog[key];
    if (
      typeof value === 'string' &&
      value.includes('"iv"') &&
      value.includes('"content"') &&
      value.includes('"tag"')
    ) {
      console.warn(`Removing encrypted field from game log data: ${key}`);
      delete sanitizedGameLog[key];
    }
  });

  return sanitizedGameLog;
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

    const db = createDatabaseClient();
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

    // Search game logs with team information
    const gameLogsQuery = sql`
      SELECT
        gl.id,
        gl.user_id,
        gl.game_id,
        gl.rating_for_game,
        gl.classification,
        gl.created_at,
        u.username,
        u.first_name,
        u.last_name,
        u.email_address,
        g.date as game_date,
        g.status as game_status,
        ht.name as home_team_name,
        ht.nickname as home_team_nickname,
        ht.city as home_team_city,
        at.name as away_team_name,
        at.nickname as away_team_nickname,
        at.city as away_team_city
      FROM game_logs gl
      LEFT JOIN users u ON gl.user_id = u.id
      LEFT JOIN nba_games g ON gl.game_id = g.id
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      LEFT JOIN teams at ON g.away_team_id = at.id
      WHERE
        LOWER(u.username) LIKE LOWER(${searchPattern}) OR
        LOWER(gl.classification) LIKE LOWER(${searchPattern}) OR
        gl.game_id::text LIKE ${searchPattern} OR
        LOWER(ht.name) LIKE LOWER(${searchPattern}) OR
        LOWER(ht.nickname) LIKE LOWER(${searchPattern}) OR
        LOWER(ht.city) LIKE LOWER(${searchPattern}) OR
        LOWER(at.name) LIKE LOWER(${searchPattern}) OR
        LOWER(at.nickname) LIKE LOWER(${searchPattern}) OR
        LOWER(at.city) LIKE LOWER(${searchPattern})
      ORDER BY gl.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const gameLogsCountQuery = sql`
      SELECT COUNT(*) as count
      FROM game_logs gl
      LEFT JOIN users u ON gl.user_id = u.id
      LEFT JOIN nba_games g ON gl.game_id = g.id
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      LEFT JOIN teams at ON g.away_team_id = at.id
      WHERE
        LOWER(u.username) LIKE LOWER(${searchPattern}) OR
        LOWER(gl.classification) LIKE LOWER(${searchPattern}) OR
        gl.game_id::text LIKE ${searchPattern} OR
        LOWER(ht.name) LIKE LOWER(${searchPattern}) OR
        LOWER(ht.nickname) LIKE LOWER(${searchPattern}) OR
        LOWER(ht.city) LIKE LOWER(${searchPattern}) OR
        LOWER(at.name) LIKE LOWER(${searchPattern}) OR
        LOWER(at.nickname) LIKE LOWER(${searchPattern}) OR
        LOWER(at.city) LIKE LOWER(${searchPattern})
    `;

    // Search games with team information
    const gamesQuery = sql`
      SELECT
        g.id,
        g.date,
        g.status,
        g.home_team_score,
        g.away_team_score,
        g.average_rating,
        g.total_ratings,
        g.created_at,
        ht.name as home_team_name,
        ht.nickname as home_team_nickname,
        ht.city as home_team_city,
        at.name as away_team_name,
        at.nickname as away_team_nickname,
        at.city as away_team_city
      FROM nba_games g
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      LEFT JOIN teams at ON g.away_team_id = at.id
      WHERE
        LOWER(ht.name) LIKE LOWER(${searchPattern}) OR
        LOWER(ht.nickname) LIKE LOWER(${searchPattern}) OR
        LOWER(ht.city) LIKE LOWER(${searchPattern}) OR
        LOWER(at.name) LIKE LOWER(${searchPattern}) OR
        LOWER(at.nickname) LIKE LOWER(${searchPattern}) OR
        LOWER(at.city) LIKE LOWER(${searchPattern}) OR
        g.id::text LIKE ${searchPattern} OR
        LOWER(g.status) LIKE LOWER(${searchPattern})
      ORDER BY g.date DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const gamesCountQuery = sql`
      SELECT COUNT(*) as count
      FROM nba_games g
      LEFT JOIN teams ht ON g.home_team_id = ht.id
      LEFT JOIN teams at ON g.away_team_id = at.id
      WHERE
        LOWER(ht.name) LIKE LOWER(${searchPattern}) OR
        LOWER(ht.nickname) LIKE LOWER(${searchPattern}) OR
        LOWER(ht.city) LIKE LOWER(${searchPattern}) OR
        LOWER(at.name) LIKE LOWER(${searchPattern}) OR
        LOWER(at.nickname) LIKE LOWER(${searchPattern}) OR
        LOWER(at.city) LIKE LOWER(${searchPattern}) OR
        g.id::text LIKE ${searchPattern} OR
        LOWER(g.status) LIKE LOWER(${searchPattern})
    `;

    // Search teams
    const teamsQuery = sql`
      SELECT
        id,
        name,
        nickname,
        city,
        conference,
        created_at
      FROM teams
      WHERE
        LOWER(name) LIKE LOWER(${searchPattern}) OR
        LOWER(nickname) LIKE LOWER(${searchPattern}) OR
        LOWER(city) LIKE LOWER(${searchPattern}) OR
        LOWER(conference) LIKE LOWER(${searchPattern})
      ORDER BY name ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const teamsCountQuery = sql`
      SELECT COUNT(*) as count
      FROM teams
      WHERE
        LOWER(name) LIKE LOWER(${searchPattern}) OR
        LOWER(nickname) LIKE LOWER(${searchPattern}) OR
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
      FROM nba_players
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
      FROM nba_players
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
    const totalResults = totalUsers + totalGameLogs + totalGames + totalTeams + totalPlayers;

    // Sanitize user data to remove any encrypted fields
    const sanitizedUsers = usersResult.rows.map(sanitizeUserData);
    const sanitizedGameLogs = gameLogsResult.rows.map(sanitizeGameLogData);

    return NextResponse.json({
      success: true,
      data: {
        users: sanitizedUsers,
        gameLogs: sanitizedGameLogs,
        games: gamesResult.rows,
        teams: teamsResult.rows,
        players: playersResult.rows,
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
        pages: Math.ceil(totalResults / limit),
      },
    });
  } catch (error) {
    console.error('Global search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform global search',
      },
      { status: 500 }
    );
  }
}
