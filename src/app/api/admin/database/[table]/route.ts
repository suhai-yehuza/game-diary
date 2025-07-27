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
    const searchField = searchParams.get('searchField') ?? 'all';

    logger.info(`Fetching data from table: ${table}`);

    const db = createDatabaseClient();
    const offset = (page - 1) * limit;

    // Build dynamic query based on table
    let query;
    let countQuery;

    // Helper function to build search conditions
    const buildSearchCondition = (searchTerm: string, field: string, tableColumns: string[]) => {
      if (!searchTerm.trim()) return '';

      const searchPattern = `%${searchTerm}%`;

      if (field === 'all') {
        // Search across all relevant columns
        const conditions = tableColumns.map(col => `${col} ILIKE '${searchPattern}'`).join(' OR ');
        return `WHERE (${conditions})`;
      } else {
        // Search in specific field
        return `WHERE ${field} ILIKE '${searchPattern}'`;
      }
    };

    switch (table) {
      case 'users': {
        const userColumns = ['username', 'first_name', 'last_name', 'email_address'];
        const userSearchCondition = buildSearchCondition(search, searchField, userColumns);
        query = sql`SELECT * FROM users ${userSearchCondition ? sql.raw(userSearchCondition) : sql``} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        countQuery = sql`SELECT COUNT(*) as total FROM users ${userSearchCondition ? sql.raw(userSearchCondition) : sql``}`;
        break;
      }

      case 'game_logs': {
        const gameLogColumns = ['id', 'user_id', 'game_id', 'rating_for_game', 'classification'];
        const gameLogSearchCondition = buildSearchCondition(search, searchField, gameLogColumns);
        query = sql`SELECT * FROM game_logs ${gameLogSearchCondition ? sql.raw(gameLogSearchCondition) : sql``} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        countQuery = sql`SELECT COUNT(*) as total FROM game_logs ${gameLogSearchCondition ? sql.raw(gameLogSearchCondition) : sql``}`;
        break;
      }

      case 'game_ratings': {
        const gameRatingColumns = ['id', 'user_id', 'game_id', 'rating'];
        const gameRatingSearchCondition = buildSearchCondition(
          search,
          searchField,
          gameRatingColumns
        );
        query = sql`SELECT * FROM game_ratings ${gameRatingSearchCondition ? sql.raw(gameRatingSearchCondition) : sql``} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        countQuery = sql`SELECT COUNT(*) as total FROM game_ratings ${gameRatingSearchCondition ? sql.raw(gameRatingSearchCondition) : sql``}`;
        break;
      }

      case 'comments': {
        const commentColumns = ['id', 'user_id', 'game_log_id', 'content'];
        const commentSearchCondition = buildSearchCondition(search, searchField, commentColumns);
        query = sql`SELECT * FROM comments ${commentSearchCondition ? sql.raw(commentSearchCondition) : sql``} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        countQuery = sql`SELECT COUNT(*) as total FROM comments ${commentSearchCondition ? sql.raw(commentSearchCondition) : sql``}`;
        break;
      }

      case 'reactions': {
        const reactionColumns = ['id', 'user_id', 'target_type', 'target_id', 'emoji'];
        const reactionSearchCondition = buildSearchCondition(search, searchField, reactionColumns);
        query = sql`SELECT * FROM reactions ${reactionSearchCondition ? sql.raw(reactionSearchCondition) : sql``} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        countQuery = sql`SELECT COUNT(*) as total FROM reactions ${reactionSearchCondition ? sql.raw(reactionSearchCondition) : sql``}`;
        break;
      }

      case 'friendships': {
        const friendshipColumns = ['id', 'user_id', 'friend_id', 'status'];
        const friendshipSearchCondition = buildSearchCondition(
          search,
          searchField,
          friendshipColumns
        );
        query = sql`SELECT * FROM friendships ${friendshipSearchCondition ? sql.raw(friendshipSearchCondition) : sql``} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        countQuery = sql`SELECT COUNT(*) as total FROM friendships ${friendshipSearchCondition ? sql.raw(friendshipSearchCondition) : sql``}`;
        break;
      }

      case 'notifications': {
        const notificationColumns = ['id', 'user_id', 'type', 'title', 'read'];
        const notificationSearchCondition = buildSearchCondition(
          search,
          searchField,
          notificationColumns
        );
        query = sql`SELECT * FROM notifications ${notificationSearchCondition ? sql.raw(notificationSearchCondition) : sql``} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        countQuery = sql`SELECT COUNT(*) as total FROM notifications ${notificationSearchCondition ? sql.raw(notificationSearchCondition) : sql``}`;
        break;
      }

      case 'nba_games': {
        const nbaGameColumns = ['id', 'date', 'status', 'home_team_score', 'away_team_score'];
        const nbaGameSearchCondition = buildSearchCondition(search, searchField, nbaGameColumns);
        query = sql`SELECT * FROM nba_games ${nbaGameSearchCondition ? sql.raw(nbaGameSearchCondition) : sql``} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
        countQuery = sql`SELECT COUNT(*) as total FROM nba_games ${nbaGameSearchCondition ? sql.raw(nbaGameSearchCondition) : sql``}`;
        break;
      }

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
