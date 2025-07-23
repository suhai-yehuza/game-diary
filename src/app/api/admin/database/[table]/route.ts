import { sql } from 'drizzle-orm';
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
    let query;
    let countQuery;
    // Remove queryParams

    switch (table) {
      case 'users':
        query = search
          ? sql`SELECT * FROM users WHERE (email ILIKE ${'%' + search + '%'} OR first_name ILIKE ${'%' + search + '%'} OR last_name ILIKE ${'%' + search + '%'}) ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
          : sql`SELECT * FROM users ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        countQuery = search
          ? sql`SELECT COUNT(*) as total FROM users WHERE (email ILIKE ${'%' + search + '%'} OR first_name ILIKE ${'%' + search + '%'} OR last_name ILIKE ${'%' + search + '%'})`
          : sql`SELECT COUNT(*) as total FROM users`;
        break;
      case 'games':
        query = search
          ? sql`SELECT * FROM games WHERE title ILIKE ${'%' + search + '%'} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
          : sql`SELECT * FROM games ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        countQuery = search
          ? sql`SELECT COUNT(*) as total FROM games WHERE title ILIKE ${'%' + search + '%'}`
          : sql`SELECT COUNT(*) as total FROM games`;
        break;
      case 'game_logs':
        query = sql`SELECT * FROM game_logs ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        countQuery = sql`SELECT COUNT(*) as total FROM game_logs`;
        break;
      case 'game_ratings':
        query = sql`SELECT * FROM game_ratings ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        countQuery = sql`SELECT COUNT(*) as total FROM game_ratings`;
        break;
      case 'comments':
        query = sql`SELECT * FROM comments ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        countQuery = sql`SELECT COUNT(*) as total FROM comments`;
        break;
      case 'reactions':
        query = sql`SELECT * FROM reactions ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        countQuery = sql`SELECT COUNT(*) as total FROM reactions`;
        break;
      case 'friendships':
        query = sql`SELECT * FROM friendships ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        countQuery = sql`SELECT COUNT(*) as total FROM friendships`;
        break;
      case 'notifications':
        query = sql`SELECT * FROM notifications ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        countQuery = sql`SELECT COUNT(*) as total FROM notifications`;
        break;
      case 'nba_games':
        query = sql`SELECT * FROM nba_games ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        countQuery = sql`SELECT COUNT(*) as total FROM nba_games`;
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
    if (error instanceof Error) {
      logger.error('Stack:', error.stack);
      return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
