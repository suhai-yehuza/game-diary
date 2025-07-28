import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { logger } from '@/lib/utils/logger';
import { createDatabaseClient } from '@src/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ table: string }> }) {
  try {
    const { table } = await params;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? '';
    const searchField = searchParams.get('searchField') ?? '';
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '10', 10);
    const offset = (page - 1) * limit;

    const db = createDatabaseClient();

    // Helper functions
    const buildSearchCondition = (searchTerm: string, field: string, tableColumns: string[]) => {
      if (!searchTerm) return '';
      const validField = tableColumns.includes(field) ? field : tableColumns[0];
      return `WHERE ${validField} ILIKE '%${searchTerm}%'`;
    };

    const buildOrderByClause = (defaultSort: string) => {
      const sortBy = searchParams.get('sortBy') ?? defaultSort;
      const sortDirection = searchParams.get('sortDirection') ?? 'DESC';
      return `ORDER BY ${sortBy} ${sortDirection}`;
    };

    let query: ReturnType<typeof sql>;
    let countQuery: ReturnType<typeof sql>;

    switch (table) {
      case 'users': {
        const userColumns = ['id', 'email', 'username', 'first_name', 'last_name'];
        const userSearchCondition = buildSearchCondition(search, searchField, userColumns);
        const orderByClause = buildOrderByClause('created_at');
        query = sql`SELECT * FROM users ${userSearchCondition ? sql.raw(userSearchCondition) : sql``} ${sql.raw(orderByClause)} LIMIT ${limit} OFFSET ${offset}`;
        countQuery = sql`SELECT COUNT(*) as total FROM users ${userSearchCondition ? sql.raw(userSearchCondition) : sql``}`;
        break;
      }

      case 'game_logs':
      case 'game_logs_public':
      case 'game_logs_private':
      case 'game_logs_protected': {
        const gameLogColumns = ['id', 'user_id', 'game_id', 'title', 'content'];
        const gameLogSearchCondition = buildSearchCondition(search, searchField, gameLogColumns);
        const orderByClause = buildOrderByClause('created_at');
        // Use the base table name for all game log variants
        const baseTableName = 'game_logs';
        query = sql`SELECT * FROM ${sql.raw(baseTableName)} ${gameLogSearchCondition ? sql.raw(gameLogSearchCondition) : sql``} ${sql.raw(orderByClause)} LIMIT ${limit} OFFSET ${offset}`;
        countQuery = sql`SELECT COUNT(*) as total FROM ${sql.raw(baseTableName)} ${gameLogSearchCondition ? sql.raw(gameLogSearchCondition) : sql``}`;
        break;
      }

      case 'game_ratings': {
        const gameRatingColumns = ['id', 'user_id', 'game_id', 'rating'];
        const gameRatingSearchCondition = buildSearchCondition(
          search,
          searchField,
          gameRatingColumns
        );
        const orderByClause = buildOrderByClause('created_at');
        query = sql`SELECT * FROM game_ratings ${gameRatingSearchCondition ? sql.raw(gameRatingSearchCondition) : sql``} ${sql.raw(orderByClause)} LIMIT ${limit} OFFSET ${offset}`;
        countQuery = sql`SELECT COUNT(*) as total FROM game_ratings ${gameRatingSearchCondition ? sql.raw(gameRatingSearchCondition) : sql``}`;
        break;
      }

      case 'comments': {
        const commentColumns = ['id', 'user_id', 'game_log_id', 'content'];
        const commentSearchCondition = buildSearchCondition(search, searchField, commentColumns);
        const orderByClause = buildOrderByClause('created_at');
        query = sql`SELECT * FROM comments ${commentSearchCondition ? sql.raw(commentSearchCondition) : sql``} ${sql.raw(orderByClause)} LIMIT ${limit} OFFSET ${offset}`;
        countQuery = sql`SELECT COUNT(*) as total FROM comments ${commentSearchCondition ? sql.raw(commentSearchCondition) : sql``}`;
        break;
      }

      case 'reactions': {
        const reactionColumns = ['id', 'user_id', 'target_type', 'target_id', 'emoji'];
        const reactionSearchCondition = buildSearchCondition(search, searchField, reactionColumns);
        const orderByClause = buildOrderByClause('created_at');
        query = sql`SELECT * FROM reactions ${reactionSearchCondition ? sql.raw(reactionSearchCondition) : sql``} ${sql.raw(orderByClause)} LIMIT ${limit} OFFSET ${offset}`;
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
        const orderByClause = buildOrderByClause('created_at');
        query = sql`SELECT * FROM friendships ${friendshipSearchCondition ? sql.raw(friendshipSearchCondition) : sql``} ${sql.raw(orderByClause)} LIMIT ${limit} OFFSET ${offset}`;
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
        const orderByClause = buildOrderByClause('created_at');
        query = sql`SELECT * FROM notifications ${notificationSearchCondition ? sql.raw(notificationSearchCondition) : sql``} ${sql.raw(orderByClause)} LIMIT ${limit} OFFSET ${offset}`;
        countQuery = sql`SELECT COUNT(*) as total FROM notifications ${notificationSearchCondition ? sql.raw(notificationSearchCondition) : sql``}`;
        break;
      }

      case 'nba_games': {
        const nbaGameColumns = ['id', 'date', 'status', 'home_team_score', 'away_team_score'];
        const nbaGameSearchCondition = buildSearchCondition(search, searchField, nbaGameColumns);
        const orderByClause = buildOrderByClause('created_at');
        query = sql`SELECT * FROM nba_games ${nbaGameSearchCondition ? sql.raw(nbaGameSearchCondition) : sql``} ${sql.raw(orderByClause)} LIMIT ${limit} OFFSET ${offset}`;
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
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('Error fetching data:', errorObj);
    return NextResponse.json({ error: errorObj.message }, { status: 500 });
  }
}
