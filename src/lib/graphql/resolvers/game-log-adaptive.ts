import { sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { AuthorizationError } from '@/lib/graphql/errors';
import { ErrorHandler } from '@/lib/utils/error-handler';
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
    if (result.edges && result.edges.length > 0) {
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
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    const { filters, pagination } = args;
    const limit = Math.min(pagination?.first ?? 50, 100);

    // Build WHERE conditions
    const whereConditions = ['gl.deleted_at IS NULL'];

    if (filters?.userId) {
      whereConditions.push(`gl.user_id = '${filters.userId}'`);
    }

    if (filters?.gameId) {
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
      return executeUltraFastQuery(whereClause, limit);
    }

    // Strategy 2: Optimized query for medium datasets (11-30 items)
    if (limit <= 50) {
      return executeOptimizedQuery(whereClause, limit);
    }

    // Strategy 3: Minimal query for large datasets (>30 items)
    return executeMinimalQuery(whereClause, limit);
  },
};

// Strategy 1: Ultra-fast query (≤10 items) - minimal data for fastest response
async function executeUltraFastQuery(whereClause: string, limit: number) {
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
  const result = await db()?.execute(sql.raw(ultraFastQuery));
  const queryDuration = Date.now() - startTime;

  if (queryDuration > 50) {
    console.warn(`Ultra-fast query took ${queryDuration}ms`);
  }

  return processQueryResult(result, limit, queryDuration, true, whereClause); // minimal = true for ultra-fast
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
  minimal = false,
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
        // User data (if available from query, otherwise let resolver handle it)
        user: minimal
          ? undefined // Let the user resolver handle this
          : {
              id: typedRow.user_id || '',
              username: typedRow.username || '',
              first_name: typedRow.first_name || '',
              last_name: typedRow.last_name || '',
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
