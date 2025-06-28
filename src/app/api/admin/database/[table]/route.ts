import { NextResponse } from 'next/server';

import { logger } from '@lib/core/logger';
import { createDatabaseClient } from '@src/lib/db';

export async function GET(
  request: Readonly<Request>,
  { params }: Readonly<{ params: Promise<{ table: string }> }>
) {
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
          SELECT id, email, first_name, last_name, created_at, updated_at
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
          SELECT id, title, description, created_at, updated_at
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

      default:
        return NextResponse.json({ error: `Table '${table}' not supported` }, { status: 400 });
    }

    // Execute queries
    const [dataResult, countResult] = await Promise.all([
      db.execute(query),
      db.execute(countQuery),
    ]);

    const data = dataResult.rows;
    const total = (countResult.rows?.[0] as { total: string })?.total;

    return NextResponse.json({
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
