import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createDatabaseClient } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const offset = (page - 1) * limit;

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          users: [],
          gameLogs: [],
          totalUsers: 0,
          totalGameLogs: 0,
        },
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      });
    }

    const db = createDatabaseClient();

    // Search users
    const usersQuery = `
      SELECT
        id,
        username,
        first_name,
        last_name,
        email_address,
        created_at
      FROM users
      WHERE
        LOWER(username) LIKE LOWER('%${query}%') OR
        LOWER(first_name) LIKE LOWER('%${query}%') OR
        LOWER(last_name) LIKE LOWER('%${query}%') OR
        LOWER(email_address) LIKE LOWER('%${query}%')
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const usersCountQuery = `
      SELECT COUNT(*) as count
      FROM users
      WHERE
        LOWER(username) LIKE LOWER('%${query}%') OR
        LOWER(first_name) LIKE LOWER('%${query}%') OR
        LOWER(last_name) LIKE LOWER('%${query}%') OR
        LOWER(email_address) LIKE LOWER('%${query}%')
    `;

    // Search game logs
    const gameLogsQuery = `
      SELECT
        gl.id,
        gl.user_id,
        gl.game_id,
        gl.rating_for_game,
        gl.classification,
        gl.created_at,
        u.username
      FROM game_logs gl
      LEFT JOIN users u ON gl.user_id = u.id
      WHERE
        LOWER(u.username) LIKE LOWER('%${query}%') OR
        LOWER(gl.classification) LIKE LOWER('%${query}%') OR
        gl.game_id::text LIKE '%${query}%'
      ORDER BY gl.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const gameLogsCountQuery = `
      SELECT COUNT(*) as count
      FROM game_logs gl
      LEFT JOIN users u ON gl.user_id = u.id
      WHERE
        LOWER(u.username) LIKE LOWER('%${query}%') OR
        LOWER(gl.classification) LIKE LOWER('%${query}%') OR
        gl.game_id::text LIKE '%${query}%'
    `;

    // Execute queries
    const [usersResult, usersCountResult, gameLogsResult, gameLogsCountResult] = await Promise.all([
      db.execute(usersQuery),
      db.execute(usersCountQuery),
      db.execute(gameLogsQuery),
      db.execute(gameLogsCountQuery),
    ]);

    const totalUsers = parseInt((usersCountResult.rows[0]?.count as string) ?? '0');
    const totalGameLogs = parseInt((gameLogsCountResult.rows[0]?.count as string) ?? '0');
    const totalResults = totalUsers + totalGameLogs;

    return NextResponse.json({
      success: true,
      data: {
        users: usersResult.rows,
        gameLogs: gameLogsResult.rows,
        totalUsers,
        totalGameLogs,
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
