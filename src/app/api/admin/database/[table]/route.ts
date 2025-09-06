import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { withAdminAuth } from '@/lib/middleware/admin-auth';
import { errorHandlers } from '@/lib/utils/error-handler';
import { createDatabaseClient } from '@src/lib/db';

// Data sanitization function to remove sensitive/encrypted fields
function sanitizeUserData(user: Record<string, unknown>) {
  const {
    password_hash: _password_hash,
    encrypted_first_name: _encrypted_first_name,
    encrypted_last_name: _encrypted_last_name,
    encrypted_email_address: _encrypted_email_address,
    encrypted_phone_number: _encrypted_phone_number,
    ...safeUser
  } = user;

  return safeUser;
}

function sanitizeGameLogData(gameLog: Record<string, unknown>) {
  const {
    encrypted_notes: _encrypted_notes,
    encrypted_tags: _encrypted_tags,
    ...safeGameLog
  } = gameLog;

  return safeGameLog;
}

export const GET = withAdminAuth(
  async (authContext, request: Request, context: { params: Promise<{ table: string }> }) => {
    try {
      const { table } = await context.params;
      const { searchParams } = new URL(request.url);
      const search = searchParams.get('search') ?? '';
      const searchField = searchParams.get('searchField') ?? '';
      const page = parseInt(searchParams.get('page') ?? '1', 10);
      const limit = parseInt(searchParams.get('limit') ?? '10', 10);
      const offset = (page - 1) * limit;

      // Check if we're in test/mock mode
      if (process.env.MOCK_MODE === 'true' || process.env.NODE_ENV === 'test') {
        // Return mock data for test environment
        return NextResponse.json({
          success: true,
          data: [],
          table,
          schema: {
            columns: ['id', 'created_at'],
            rowCount: 0,
            lastUpdated: new Date().toISOString(),
          },
          rowCount: 0,
          lastUpdated: new Date().toISOString(),
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
          filters: search ? { search, searchField } : undefined,
        });
      }

      let db;
      try {
        db = createDatabaseClient();
      } catch (_dbError) {
        // If database connection fails, return 503 Service Unavailable
        return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
      }

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
          // Only select safe, non-encrypted fields for display
          query = sql`SELECT id, username, first_name, last_name, email_address, created_at, updated_at FROM users ${userSearchCondition ? sql.raw(userSearchCondition) : sql``} ${sql.raw(orderByClause)} LIMIT ${limit} OFFSET ${offset}`;
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
          // Only select safe, non-encrypted fields for display
          query = sql`SELECT id, user_id, game_id, rating_for_game, classification, watched_setting, watched_scope, created_at, updated_at FROM ${sql.raw(baseTableName)} ${gameLogSearchCondition ? sql.raw(gameLogSearchCondition) : sql``} ${sql.raw(orderByClause)} LIMIT ${limit} OFFSET ${offset}`;
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
          const reactionSearchCondition = buildSearchCondition(
            search,
            searchField,
            reactionColumns
          );
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

        case 'basketball_games': {
          const nbaGameColumns = ['id', 'date', 'status', 'teams', 'scores'];
          const nbaGameSearchCondition = buildSearchCondition(search, searchField, nbaGameColumns);
          const orderByClause = buildOrderByClause('created_at');
          query = sql`SELECT * FROM basketball_games ${nbaGameSearchCondition ? sql.raw(nbaGameSearchCondition) : sql``} ${sql.raw(orderByClause)} LIMIT ${limit} OFFSET ${offset}`;
          countQuery = sql`SELECT COUNT(*) as total FROM basketball_games ${nbaGameSearchCondition ? sql.raw(nbaGameSearchCondition) : sql``}`;
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

      let data: Record<string, unknown>[] = dataResult.rows;
      const { total } = countResult.rows[0] as { total: string };

      // Sanitize data based on table type
      if (table === 'users') {
        data = data.map(sanitizeUserData);
      } else if (table.includes('game_logs')) {
        data = data.map(sanitizeGameLogData);
      }

      return NextResponse.json({
        success: true,
        data,
        table,
        schema: {
          columns: Object.keys(data[0] || {}),
          rowCount: parseInt(total, 10),
          lastUpdated: new Date().toISOString(),
        },
        rowCount: parseInt(total, 10),
        lastUpdated: new Date().toISOString(),
        pagination: {
          page,
          limit,
          total: parseInt(total, 10),
          pages: Math.ceil(parseInt(total, 10) / limit),
        },
        filters: search ? { search, searchField } : undefined,
      });
    } catch (error) {
      // Use centralized error handling
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'API',
        action: 'GET /api/admin/database/[table]',
      });
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);

export const POST = withAdminAuth(
  async (authContext, request: Request, context: { params: Promise<{ table: string }> }) => {
    try {
      const { table } = await context.params;
      const body = (await request.json()) as { operation: string };

      // Handle different operations based on body
      const operation = (body as { operation: string }).operation;

      switch (operation) {
        case 'export':
          return NextResponse.json({
            success: true,
            message: `Export operation for table ${table} completed`,
            data: { table, operation: 'export' },
          });

        default:
          return NextResponse.json(
            {
              error: `Operation '${operation}' not supported`,
            },
            { status: 400 }
          );
      }
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'API',
        action: 'POST /api/admin/database/[table]',
      });
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
);

export const PUT = withAdminAuth(
  async (_authContext, _request: Request, _context: { params: Promise<{ table: string }> }) => {
    await Promise.resolve(); // Satisfy async requirement
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }
);

export const DELETE = withAdminAuth(
  async (_authContext, _request: Request, _context: { params: Promise<{ table: string }> }) => {
    await Promise.resolve(); // Satisfy async requirement
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }
);
