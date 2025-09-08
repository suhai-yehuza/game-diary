import { sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { AuthorizationError } from '@/lib/graphql/errors';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { ErrorCategory } from '@/types';
import type { GraphQLContext } from '@/types';

// Adaptive Game Log Query Resolvers - adjusts strategy based on data size
export const adaptiveGameLogQueryResolvers = {
  // Get a single game log by ID
  gameLog: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    const { id } = args;

    // Build WHERE conditions for single game log
    const whereConditions = ['gl.deleted_at IS NULL', `gl.id = '${id}'`];

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Use ultra-fast query for single game log
    const result = await executeUltraFastQuery(whereClause, 1);

    // For single gameLog query, return the first node or null
    if (result?.edges && result.edges.length > 0) {
      const gameLog = result.edges[0].node;

      // Check access permissions based on classification and ownership
      let canAccess = false;

      // Public game logs can be accessed by anyone
      if (gameLog.classification === 'PUBLIC') {
        canAccess = true;
      }
      // For protected and private game logs, user must be authenticated
      else if (context.user?.id) {
        // Owner can always access
        if ((gameLog as Record<string, unknown>).user_id === context.user.id) {
          canAccess = true;
        }
        // For now, allow access to protected game logs if authenticated
        else if (gameLog.classification === 'PROTECTED') {
          canAccess = true;
        }
      }

      if (!canAccess) {
        return null; // Return null instead of throwing error for GraphQL consistency
      }

      return gameLog;
    }

    return null;
  },

  gameLogs: async (
    _parent: unknown,
    args: {
      filters?: {
        userId?: string;
        gameId?: string;
        dateRange?: { start: Date; end?: Date };
        classification?: string;
        search?: string;
        searchText?: string;
        minRating?: number;
        maxRating?: number;
        watchedSetting?: string;
        watchedLocation?: string;
        tags?: string[];
        hasNotes?: boolean;
        watchedDateRange?: { start: Date; end?: Date };
        sortBy?: string;
        sortDirection?: string;
      };
      pagination?: {
        first?: number;
        after?: string;
        last?: number;
        before?: string;
      };
    },
    context: GraphQLContext
  ) => {
    const { filters, pagination } = args;
    console.log('🔍 gameLogs resolver: called with args:', { filters, pagination });

    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    // Log user's existing game log IDs for debugging
    await ErrorHandler.getInstance().handleAsync(
      async () => {
        console.log('🔍 [USER_GAME_LOGS] About to query database for user game logs...');
        const dbInstance = db();
        console.log('🔍 [USER_GAME_LOGS] Database instance:', !!dbInstance);

        const userGameLogsQuery = await dbInstance?.execute(sql`
          SELECT id, game_id, created_at
          FROM game_logs
          WHERE user_id = ${context.user?.id}
          AND deleted_at IS NULL
          ORDER BY created_at DESC
          LIMIT 20
        `);

        console.log('🔍 [USER_GAME_LOGS] Query result:', userGameLogsQuery);
        const userGameLogs = userGameLogsQuery?.rows || [];
        console.log('🔍 [USER_GAME_LOGS] Session user existing game log IDs:', {
          userId: context.user?.id,
          totalGameLogs: userGameLogs.length,
          gameLogs: userGameLogs.map((log: Record<string, unknown>) => ({
            id: log.id,
            gameId: log.game_id,
            createdAt: log.created_at,
          })),
        });
      },
      {
        component: 'userGameLogsDebug',
        category: ErrorCategory.DATABASE,
        severity: 'low',
      }
    );

    const limit = Math.min(pagination?.first ?? 50, 100);

    // Build WHERE conditions
    const whereConditions = ['gl.deleted_at IS NULL'];

    if (filters?.userId) {
      whereConditions.push(`gl.user_id = '${filters.userId}'`);
    }

    if (filters?.gameId) {
      console.log('🔍 [QUERY_GAME_ID] Filtering by gameId:', filters.gameId);
      console.log('🔍 [QUERY_GAME_ID] Game ID type:', typeof filters.gameId);
      console.log('🔍 [QUERY_GAME_ID] Game ID length:', filters.gameId.length);
      whereConditions.push(`gl.game_id = '${filters.gameId}'`);
    }

    if (filters?.classification) {
      whereConditions.push(`gl.classification = '${filters.classification}'`);
    }

    if (filters?.minRating) {
      whereConditions.push(`gl.rating_for_game >= ${filters.minRating}`);
    }

    if (filters?.maxRating) {
      whereConditions.push(`gl.rating_for_game <= ${filters.maxRating}`);
    }

    if (filters?.watchedSetting) {
      whereConditions.push(`gl.watched_setting = '${filters.watchedSetting}'`);
    }

    if (filters?.watchedLocation) {
      whereConditions.push(`gl.watched_location = '${filters.watchedLocation}'`);
    }

    if (filters?.hasNotes) {
      whereConditions.push(`gl.notes IS NOT NULL AND gl.notes != ''`);
    }

    if (pagination?.after) {
      whereConditions.push(`gl.created_at < (
        SELECT created_at FROM game_logs WHERE id = '${pagination.after}'
      )`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Strategy 1: Ultra-fast query for small datasets (≤10 items)
    if (limit <= 10) {
      console.log('🔍 [QUERY_STRATEGY] Using ultra-fast query with whereClause:', whereClause);
      const result = await executeUltraFastQuery(whereClause, limit);
      console.log('🔍 [QUERY_RESULT] Ultra-fast query result:', {
        totalCount: result?.totalCount,
        edgesCount: result?.edges?.length || 0,
        gameLogIds: result?.edges?.map(edge => edge.node.id) || [],
      });
      return result;
    }

    // Strategy 2: Optimized query for medium datasets (11-30 items)
    if (limit <= 50) {
      const result = await executeOptimizedQuery(whereClause, limit);
      console.log('🔍 [QUERY_RESULT] Optimized query result:', {
        totalCount: result.totalCount,
        edgesCount: result.edges?.length || 0,
        gameLogIds: result.edges?.map(edge => edge.node.id) || [],
      });
      return result;
    }

    // Strategy 3: Minimal query for large datasets (>30 items)
    const result = await executeMinimalQuery(whereClause, limit);
    console.log('🔍 [QUERY_RESULT] Minimal query result:', {
      totalCount: result.totalCount,
      edgesCount: result.edges?.length || 0,
      gameLogIds: result.edges?.map(edge => edge.node.id) || [],
    });
    return result;
  },
};

// Strategy 1: Ultra-fast query (≤10 items) - minimal data for fastest response
async function executeUltraFastQuery(whereClause: string, limit: number) {
  // Truly minimal query for ultra-fast execution
  const ultraFastQuery = `
    SELECT
      gl.id,
      gl.user_id,
      gl.game_id,
      gl.rating_for_game,
      gl.notes,
      gl.tags,
      gl.watched_date,
      gl.watched_setting,
      gl.watched_location,
      gl.watched_scope,
      gl.classification,
      gl.created_at,
      gl.updated_at,
      0 as total_comment_count,
      0 as total_reaction_count,
      u.id as user_id,
      u.username as user_username,
      u.first_name as user_first_name,
      u.last_name as user_last_name
    FROM game_logs gl
    LEFT JOIN users u ON gl.user_id = u.id
    ${whereClause}
    ORDER BY gl.created_at DESC
    LIMIT ${limit + 1}
  `;

  const startTime = Date.now();

  return ErrorHandler.getInstance().handleAsync(
    async () => {
      console.log('🔍 [ULTRA_FAST] About to execute query:', ultraFastQuery);
      const dbInstance = db();
      console.log('🔍 [ULTRA_FAST] Database instance available:', !!dbInstance);

      const result = await dbInstance?.execute(sql.raw(ultraFastQuery));
      const queryDuration = Date.now() - startTime;

      console.log('🔍 [ULTRA_FAST] Query executed successfully:', {
        result,
        resultType: typeof result,
        resultRows: result?.rows?.length || 0,
        queryDuration,
      });

      if (queryDuration > 50) {
        console.warn(`Ultra-fast query took ${queryDuration}ms`);
      }

      return processQueryResult(result, limit, queryDuration, true, whereClause); // minimal = true for ultra-fast
    },
    {
      component: 'ultraFastQuery',
      category: ErrorCategory.DATABASE,
      severity: 'medium',
    }
  );
}

// Strategy 2: Optimized query (11-50 items) - reduced JOINs for better performance
async function executeOptimizedQuery(whereClause: string, limit: number) {
  const optimizedQuery = `
    SELECT
      gl.id,
      gl.user_id,
      gl.game_id,
      gl.rating_for_game,
      gl.notes,
      gl.tags,
      gl.watched_date,
      gl.watched_setting,
      gl.watched_location,
      gl.watched_scope,
      gl.classification,
      gl.created_at,
      gl.updated_at,
      u.username,
      u.first_name,
      u.last_name,
      u.image_url,
      COALESCE(comment_counts.total_comment_count, 0) as total_comment_count,
      COALESCE(reaction_counts.total_reaction_count, 0) as total_reaction_count
    FROM game_logs gl
    LEFT JOIN users u ON gl.user_id = u.id
    LEFT JOIN (
      SELECT parent_id, COUNT(*) as total_comment_count
      FROM comments
      WHERE parent_type = 'GAME_LOG' AND deleted_at IS NULL
      GROUP BY parent_id
    ) comment_counts ON gl.id = comment_counts.parent_id
    LEFT JOIN (
      SELECT target_id, COUNT(*) as total_reaction_count
      FROM reactions
      WHERE target_type = 'GAME_LOG' AND deleted_at IS NULL
      GROUP BY target_id
    ) reaction_counts ON gl.id = reaction_counts.target_id
    ${whereClause}
    ORDER BY gl.created_at DESC
    LIMIT ${limit + 1}
  `;

  const startTime = Date.now();

  const result = await ErrorHandler.getInstance().handleAsync(
    async () => {
      const queryPromise = db()?.execute(sql.raw(optimizedQuery));
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error('Query timeout')), 5000) // 5 second timeout
      );

      return Promise.race([queryPromise, timeoutPromise]);
    },
    {
      component: 'GraphQL Resolver',
      action: 'Execute optimized game log query',
      timestamp: new Date().toISOString(),
    }
  );

  if (!result) {
    console.warn('Optimized query timed out, falling back to minimal query');
    return executeMinimalQuery(whereClause, limit);
  }

  const queryDuration = Date.now() - startTime;

  if (queryDuration > 100) {
    console.warn(`Optimized query took ${queryDuration}ms`);
  }

  return processQueryResult(result, limit, queryDuration, false, whereClause); // minimal = false for optimized
}

// Helper function to get total count
async function _getTotalCount(whereClause: string): Promise<number> {
  const countQuery = `
    SELECT COUNT(*) as count
    FROM game_logs gl
    ${whereClause}
  `;

  const result = await ErrorHandler.getInstance().handleAsync(
    async () => {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Count query timeout')), 5000);
      });

      const queryPromise = db()?.execute(countQuery);
      const queryResult = await Promise.race([queryPromise, timeoutPromise]);

      const rows = (queryResult as { rows?: unknown[] })?.rows || [];
      return rows.length > 0 ? (rows[0] as { count: number }).count : 0;
    },
    {
      component: 'GraphQL Resolver',
      action: 'Get total count for game logs',
      timestamp: new Date().toISOString(),
    }
  );

  return result ?? 0;
}

// Strategy 3: Minimal query (>50 items) - fastest possible query
async function executeMinimalQuery(whereClause: string, limit: number) {
  const minimalQuery = `
    SELECT
      gl.id,
      gl.user_id,
      gl.game_id,
      gl.rating_for_game,
      gl.notes,
      gl.tags,
      gl.watched_date,
      gl.watched_setting,
      gl.watched_location,
      gl.watched_scope,
      gl.classification,
      gl.created_at,
      gl.updated_at,
      COALESCE(comment_counts.total_comment_count, 0) as total_comment_count,
      COALESCE(reaction_counts.total_reaction_count, 0) as total_reaction_count
    FROM game_logs gl
    LEFT JOIN (
      SELECT parent_id, COUNT(*) as total_comment_count
      FROM comments
      WHERE parent_type = 'GAME_LOG' AND deleted_at IS NULL
      GROUP BY parent_id
    ) comment_counts ON gl.id = comment_counts.parent_id
    LEFT JOIN (
      SELECT target_id, COUNT(*) as total_reaction_count
      FROM reactions
      WHERE target_type = 'GAME_LOG' AND deleted_at IS NULL
      GROUP BY target_id
    ) reaction_counts ON gl.id = reaction_counts.target_id
    ${whereClause}
    ORDER BY gl.created_at DESC
    LIMIT ${limit + 1}
  `;

  const startTime = Date.now();
  const result = await db()?.execute(sql.raw(minimalQuery));
  const queryDuration = Date.now() - startTime;

  if (queryDuration > 200) {
    console.warn(`Minimal query took ${queryDuration}ms`);
  }

  return processQueryResult(result, limit, queryDuration, true, whereClause); // minimal = true
}

// Common result processing function
function processQueryResult(
  result: unknown,
  limit: number,
  queryDuration: number,
  _minimal = false,
  _whereClause = ''
) {
  const rows = (result as { rows?: unknown[] })?.rows || [];
  const hasNextPage = rows.length > limit;
  const paginatedRows = hasNextPage ? rows.slice(0, limit) : rows;

  // Transform to GraphQL structure
  const edges = paginatedRows.map((row: unknown) => {
    const typedRow = row as Record<string, unknown>;
    return {
      cursor: typedRow.id,
      node: {
        id: typedRow.id,
        game_id: typedRow.game_id,
        rating_for_game: typedRow.rating_for_game,
        notes: typedRow.notes,
        tags: typedRow.tags || [],
        watched_date: typedRow.watched_date ? new Date(typedRow.watched_date as string) : undefined,
        watched_setting: typedRow.watched_setting,
        watched_location: typedRow.watched_location,
        watched_scope: typedRow.watched_scope,
        classification: typedRow.classification,
        created_at: typedRow.created_at ? new Date(typedRow.created_at as string) : undefined,
        updated_at: typedRow.updated_at ? new Date(typedRow.updated_at as string) : undefined,
        deleted_at: typedRow.deleted_at ? new Date(typedRow.deleted_at as string) : undefined,
        totalCommentCount: typedRow.total_comment_count ?? 0,
        totalReactionCount: typedRow.total_reaction_count ?? 0,
        // User data (always include to avoid null field error)
        user: {
          id: typedRow.user_id || typedRow.user_id || '',
          username: typedRow.username || typedRow.user_username || '',
          first_name: typedRow.first_name || typedRow.user_first_name || '',
          last_name: typedRow.last_name || typedRow.user_last_name || '',
          email_address: null,
          phone_number: null,
          image_url: typedRow.image_url || null,
          isAdmin: false, // Default value
        },
        // Game data - let the individual resolver handle this to avoid complex JOINs
        game: null,
      },
    };
  });

  return {
    edges,
    pageInfo: {
      hasNextPage,
      endCursor: hasNextPage
        ? ((paginatedRows[paginatedRows.length - 1] as Record<string, unknown>)?.id as string)
        : null,
      hasPreviousPage: false,
      startCursor: null,
    },
    totalCount: paginatedRows.length, // Temporarily use page count to avoid timeout
  };
}
