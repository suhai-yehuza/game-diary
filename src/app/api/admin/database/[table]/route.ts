import { NextResponse } from 'next/server';

import { logger } from '@lib/core/logger';
import { createDatabaseClient } from '@src/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ table: string }> }) {
  try {
    const { table } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '10', 10);
    const search = searchParams.get('search') ?? '';

    logger.info(`Fetching data from table: ${table}`);

    const db = createDatabaseClient();
    const offset = (page - 1) * limit;

    // Build dynamic query based on table
    let query = '';
    let countQuery = '';
    const queryParams: unknown[] = [];

    switch (table) {
      case 'users':
        query = `
          SELECT *
          FROM users
          WHERE (email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1)
          ORDER BY created_at DESC
          LIMIT $2 OFFSET $3
        `;
        countQuery = `
          SELECT COUNT(*) as total
          FROM users
          WHERE (email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1)
        `;
        queryParams.push(`%${search}%`, limit, offset);
        break;
      case 'games':
        query = `
          SELECT *
          FROM games
          WHERE title ILIKE $1
          ORDER BY created_at DESC
          LIMIT $2 OFFSET $3
        `;
        countQuery = `
          SELECT COUNT(*) as total
          FROM games
          WHERE title ILIKE $1
        `;
        queryParams.push(`%${search}%`, limit, offset);
        break;
      case 'game_logs':
        query = `SELECT * FROM game_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
        countQuery = `SELECT COUNT(*) as total FROM game_logs`;
        queryParams.push(limit, offset);
        break;
      case 'game_ratings':
        query = `SELECT * FROM game_ratings ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
        countQuery = `SELECT COUNT(*) as total FROM game_ratings`;
        queryParams.push(limit, offset);
        break;
      case 'comments':
        query = `SELECT * FROM comments ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
        countQuery = `SELECT COUNT(*) as total FROM comments`;
        queryParams.push(limit, offset);
        break;
      case 'reactions':
        query = `SELECT * FROM reactions ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
        countQuery = `SELECT COUNT(*) as total FROM reactions`;
        queryParams.push(limit, offset);
        break;
      case 'friendships':
        query = `SELECT * FROM friendships ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
        countQuery = `SELECT COUNT(*) as total FROM friendships`;
        queryParams.push(limit, offset);
        break;
      case 'notifications':
        query = `SELECT * FROM notifications ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
        countQuery = `SELECT COUNT(*) as total FROM notifications`;
        queryParams.push(limit, offset);
        break;
      case 'nba_games':
        query = `SELECT * FROM nba_games ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
        countQuery = `SELECT COUNT(*) as total FROM nba_games`;
        queryParams.push(limit, offset);
        break;
      default:
        return NextResponse.json({ error: `Table '${table}' not supported` }, { status: 400 });
    }

    // Execute queries
    const [dataResult, countResult] = await Promise.all([
      db.execute(query),
      db.execute(countQuery),
    ]);

    const data = dataResult.rows;
    const { total } = countResult.rows[0] as { total: string };

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: parseInt(total, 10),
        pages: Math.ceil(parseInt(total, 10) / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
