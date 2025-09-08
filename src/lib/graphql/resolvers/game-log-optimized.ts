import { eq, and, sql, desc, count, isNull, inArray, type SQL } from 'drizzle-orm';

import { db } from '@/lib/db';
import { game_logs, users, comments, reactions, friendships } from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import type { GraphQLContext } from '@/types';

// Helper function to get database instance
const getDb = () => {
  const dbInstance = db();
  if (!dbInstance) {
    throw new Error('Database not available');
  }
  return dbInstance;
};

// Optimized Game Log Resolvers using Drizzle ORM
export const optimizedGameLogQueryResolvers = {
  // Optimized gameLogs query with better performance
  async gameLogs(
    parent: unknown,
    args: {
      filters?: { userId?: string; classification?: string; gameId?: string; hasNotes?: boolean };
      pagination?: { first?: number; after?: string };
    },
    context: GraphQLContext
  ) {
    const { filters, pagination } = args;
    setTimeout(() => {
      console.log('🔍 [RESOLVER] optimized gameLogs resolver: called with args:', {
        filters,
        pagination,
      });
    }, 50);

    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }
    const limit = Math.min(pagination?.first ?? 20, 100);

    // Build WHERE conditions using Drizzle ORM
    const whereConditions = [isNull(game_logs.deleted_at)];

    if (filters?.userId) {
      whereConditions.push(eq(game_logs.user_id, filters.userId));
      setTimeout(() => {
        console.log(
          '🔍 [RESOLVER] optimized gameLogs resolver: added userId filter:',
          filters.userId
        );
      }, 100);
    }

    if (filters?.classification) {
      whereConditions.push(eq(game_logs.classification, filters.classification));
      setTimeout(() => {
        console.log(
          '🔍 [RESOLVER] optimized gameLogs resolver: added classification filter:',
          filters.classification
        );
      }, 120);
    }

    if (filters?.gameId) {
      whereConditions.push(eq(game_logs.game_id, filters.gameId));
      setTimeout(() => {
        console.log(
          '🔍 [RESOLVER] optimized gameLogs resolver: added gameId filter:',
          filters.gameId
        );
      }, 140);
    }

    if (filters?.hasNotes) {
      whereConditions.push(sql`${game_logs.notes} IS NOT NULL AND ${game_logs.notes} != ''`);
    }

    if (pagination?.after) {
      // Get the created_at timestamp of the cursor record
      const cursorRecord = await getDb().query.game_logs.findFirst({
        where: eq(game_logs.id, pagination.after),
        columns: { created_at: true },
      });

      if (cursorRecord?.created_at) {
        whereConditions.push(sql`${game_logs.created_at} < ${cursorRecord.created_at}`);
      }
    }

    const whereClause = and(...whereConditions);

    if (!whereClause) {
      // Return empty result if whereClause is invalid
      return {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      };
    }

    setTimeout(() => {
      console.log('🔍 [RESOLVER] optimized gameLogs resolver: WHERE conditions:', whereConditions);
      console.log('🔍 [RESOLVER] optimized gameLogs resolver: limit:', limit);
    }, 160);

    // Debug: Check if there are any game logs for this user at all
    const totalUserGameLogs =
      (await getDb().query.game_logs.findMany({
        where: and(isNull(game_logs.deleted_at), eq(game_logs.user_id, context.user.id)),
        limit: 10,
        columns: {
          id: true,
          game_id: true,
          user_id: true,
          created_at: true,
        },
      })) || [];

    setTimeout(() => {
      console.log(
        '🔍 [RESOLVER] optimized gameLogs resolver: total user game logs:',
        totalUserGameLogs?.length
      );
      console.log(
        '🔍 [RESOLVER] optimized gameLogs resolver: user game log IDs and game IDs:',
        totalUserGameLogs?.map((log: { id: string; game_id: string; created_at: Date }) => ({
          id: log.id,
          game_id: log.game_id,
          created_at: log.created_at,
        }))
      );
    }, 180);

    if (!whereClause) {
      throw new Error('Invalid where clause');
    }

    // Use the most efficient query based on limit
    let result;
    if (limit <= 10) {
      setTimeout(() => {
        console.log('🔍 [RESOLVER] optimized gameLogs resolver: using executeUltraFastQuery');
      }, 200);
      result = await executeUltraFastQuery(whereClause, limit);
    } else if (limit <= 50) {
      setTimeout(() => {
        console.log('🔍 [RESOLVER] optimized gameLogs resolver: using executeOptimizedQuery');
      }, 200);
      result = await executeOptimizedQuery(whereClause, limit);
    } else {
      setTimeout(() => {
        console.log('🔍 [RESOLVER] optimized gameLogs resolver: using executeMinimalQuery');
      }, 200);
      result = await executeMinimalQuery(whereClause, limit);
    }

    setTimeout(() => {
      console.log('🔍 [RESOLVER] optimized gameLogs resolver: result:', result);
    }, 220);
    return result;
  },

  // Optimized gameLog query for single item
  async gameLog(parent: unknown, args: { id: string }, context: GraphQLContext) {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    const { id } = args;

    const gameLog = await getDb().query.game_logs.findFirst({
      where: and(eq(game_logs.id, id), isNull(game_logs.deleted_at)),
      with: {
        user: {
          columns: {
            username: true,
            first_name: true,
            last_name: true,
            image_url: true,
          },
        },
      },
    });

    if (!gameLog) {
      return null;
    }

    // Check access permissions
    const canAccess =
      gameLog.classification === 'PUBLIC' ||
      (gameLog.classification === 'PROTECTED' && context.userId === gameLog.user_id) ||
      (gameLog.classification === 'PRIVATE' && context.userId === gameLog.user_id);

    if (!canAccess) {
      throw new Error('Access denied');
    }

    return {
      id: gameLog.id,
      game_id: gameLog.game_id,
      rating_for_game: gameLog.rating_for_game,
      notes: gameLog.notes,
      tags: gameLog.tags || [],
      watched_date: gameLog.watched_date ? new Date(gameLog.watched_date) : undefined,
      watched_setting: gameLog.watched_setting,
      watched_location: gameLog.watched_location,
      watched_scope: gameLog.watched_scope,
      classification: gameLog.classification,
      created_at: gameLog.created_at ? new Date(gameLog.created_at) : new Date(),
      updated_at: gameLog.updated_at ? new Date(gameLog.updated_at) : new Date(),
      user: {
        id: gameLog.user_id,
        username: gameLog.user?.username || 'Unknown User',
        first_name: gameLog.user?.first_name || 'Unknown',
        last_name: gameLog.user?.last_name || 'User',
        image_url: gameLog.user?.image_url,
      },
    };
  },

  // Friends game logs query
  async friendsGameLogs(
    parent: unknown,
    args: { pagination?: { first?: number; after?: string } },
    context: GraphQLContext
  ) {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    const { pagination } = args;
    const limit = Math.min(pagination?.first ?? 20, 100);

    // Get user's friends
    const dbInstance = getDb();

    const userFriendships = await dbInstance.query.friendships.findMany({
      where: and(eq(friendships.user_id, context.user.id), eq(friendships.status, 'ACCEPTED')),
      columns: { friend_id: true },
    });

    if (!userFriendships || userFriendships.length === 0) {
      return {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      };
    }

    const friendIds = userFriendships
      .map((f: { friend_id: string | null }) => f.friend_id)
      .filter((id): id is string => id !== null);

    // Build WHERE conditions for friends' game logs
    const whereConditions = [
      isNull(game_logs.deleted_at),
      inArray(game_logs.user_id, friendIds),
      // Only show PUBLIC and PROTECTED logs from friends
      sql`${game_logs.classification} IN ('PUBLIC', 'PROTECTED')`,
    ];

    if (pagination?.after) {
      // Get the created_at timestamp of the cursor record
      const cursorRecord = await getDb().query.game_logs.findFirst({
        where: eq(game_logs.id, pagination.after),
        columns: { created_at: true },
      });

      if (cursorRecord?.created_at) {
        whereConditions.push(sql`${game_logs.created_at} < ${cursorRecord.created_at}`);
      }
    }

    const whereClause = and(...whereConditions);

    if (!whereClause) {
      // Return empty result if whereClause is invalid
      return {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      };
    }

    // Use the most efficient query based on limit
    if (limit <= 10) {
      return executeUltraFastQuery(whereClause, limit);
    } else if (limit <= 50) {
      return executeOptimizedQuery(whereClause, limit);
    } else {
      return executeMinimalQuery(whereClause, limit);
    }
  },
};

// Strategy 1: Ultra-fast query (≤10 items) - optimized for speed
async function executeUltraFastQuery(whereClause: SQL<unknown>, limit: number) {
  const startTime = Date.now();

  const dbInstance = getDb();

  const result = await dbInstance.query.game_logs.findMany({
    where: whereClause,
    limit: limit + 1,
    orderBy: [desc(game_logs.created_at)],
    with: {
      user: {
        columns: {
          username: true,
          first_name: true,
          last_name: true,
          image_url: true,
        },
      },
      game: {
        columns: {
          id: true,
          teams: true,
          scores: true,
          date: true,
          status: true,
        },
      },
    },
  });

  const queryDuration = Date.now() - startTime;

  if (result && result.length > 0) {
    // Found game logs
  } else {
    // No game logs found
  }

  if (queryDuration > 50) {
    console.warn(`Ultra-fast query took ${queryDuration}ms`);
  }

  // Ensure result is always an array
  const safeResult = result || [];
  return processQueryResult(safeResult, limit, queryDuration, false);
}

// Strategy 2: Optimized query (11-50 items) - balanced performance with counts
async function executeOptimizedQuery(whereClause: SQL<unknown>, limit: number) {
  const startTime = Date.now();

  const dbInstance = getDb();

  // Get game logs with user and game data
  const gameLogs = await dbInstance.query.game_logs.findMany({
    where: whereClause,
    limit: limit + 1,
    orderBy: [desc(game_logs.created_at)],
    with: {
      user: {
        columns: {
          id: true,
          username: true,
          first_name: true,
          last_name: true,
          image_url: true,
        },
      },
      game: {
        columns: {
          id: true,
          teams: true,
          scores: true,
          date: true,
          status: true,
        },
      },
    },
  });

  // Debug: Test alternative query approach
  const _testGameLogs = await dbInstance
    ?.select({
      id: game_logs.id,
      user_id: game_logs.user_id,
      game_id: game_logs.game_id,
      rating_for_game: game_logs.rating_for_game,
      notes: game_logs.notes,
      classification: game_logs.classification,
      created_at: game_logs.created_at,
      updated_at: game_logs.updated_at,
      username: users.username,
      first_name: users.first_name,
      last_name: users.last_name,
      image_url: users.image_url,
    })
    .from(game_logs)
    .leftJoin(users, eq(game_logs.user_id, users.id))
    .where(whereClause)
    .limit(1);

  // Debug: Check if game data is being fetched
  if (gameLogs && gameLogs.length > 0) {
    // Game logs found
  }

  // Debug: Log the first game log to see what user data we're getting
  if (gameLogs && gameLogs.length > 0) {
    // Test: Try to manually fetch the user to see if the relationship works
    if (gameLogs[0].user_id) {
      const _manualUser = await dbInstance.query.users.findFirst({
        where: eq(users.id, gameLogs[0].user_id),
      });
    }
  }

  if (!gameLogs || gameLogs.length === 0) {
    return {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        endCursor: null,
      },
      totalCount: 0,
    };
  }

  // Get comment and reaction counts for each game log
  const gameLogIds = gameLogs.map(gl => gl.id);

  const [commentCounts, reactionCounts] = await Promise.all([
    // Get comment counts
    dbInstance
      ?.select({
        parent_id: comments.parent_id,
        count: count(),
      })
      .from(comments)
      .where(
        and(
          inArray(comments.parent_id, gameLogIds),
          eq(comments.parent_type, 'GAME_LOG'),
          isNull(comments.deleted_at)
        )
      )
      .groupBy(comments.parent_id),

    // Get reaction counts
    dbInstance
      ?.select({
        target_id: reactions.target_id,
        count: count(),
      })
      .from(reactions)
      .where(
        and(
          inArray(reactions.target_id, gameLogIds),
          eq(reactions.target_type, 'GAME_LOG'),
          isNull(reactions.deleted_at)
        )
      )
      .groupBy(reactions.target_id),
  ]);

  // Create lookup maps for counts
  const commentCountMap = new Map(
    (commentCounts || []).map((cc: { parent_id: string; count: number }) => [
      cc.parent_id,
      cc.count,
    ])
  );
  const reactionCountMap = new Map(
    (reactionCounts || []).map((rc: { target_id: string; count: number }) => [
      rc.target_id,
      rc.count,
    ])
  );

  const queryDuration = Date.now() - startTime;

  if (queryDuration > 100) {
    console.warn(`Optimized query took ${queryDuration}ms`);
  }

  // Ensure gameLogs is always an array
  const safeGameLogs = gameLogs || [];
  return processQueryResultWithCounts(
    safeGameLogs,
    limit,
    queryDuration,
    commentCountMap,
    reactionCountMap
  );
}

// Strategy 3: Minimal query (>50 items) - fastest possible query
async function executeMinimalQuery(whereClause: SQL<unknown>, limit: number) {
  const startTime = Date.now();

  const dbInstance = getDb();

  const result = await dbInstance.query.game_logs.findMany({
    where: whereClause,
    limit: limit + 1,
    orderBy: [desc(game_logs.created_at)],
    columns: {
      id: true,
      user_id: true,
      game_id: true,
      rating_for_game: true,
      notes: true,
      tags: true,
      watched_date: true,
      watched_setting: true,
      watched_location: true,
      watched_scope: true,
      classification: true,
      created_at: true,
      updated_at: true,
    },
    with: {
      user: {
        columns: {
          username: true,
          first_name: true,
          last_name: true,
          image_url: true,
        },
      },
      game: {
        columns: {
          id: true,
          teams: true,
          scores: true,
          date: true,
          status: true,
        },
      },
    },
  });

  const queryDuration = Date.now() - startTime;

  if (queryDuration > 200) {
    console.warn(`Minimal query took ${queryDuration}ms`);
  }

  // Ensure result is always an array
  const safeResult = result || [];
  return processQueryResult(safeResult, limit, queryDuration, false);
}

// Process query result for ultra-fast and minimal queries
function processQueryResult(
  result: unknown[] | undefined,
  limit: number,
  queryDuration: number,
  _minimal = false
) {
  if (!result || result.length === 0) {
    return {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: 0,
    };
  }

  const hasNextPage = result.length > limit;
  const paginatedRows = hasNextPage ? result.slice(0, limit) : result;

  const edges = paginatedRows.map((row: unknown) => {
    const typedRow = row as Record<string, unknown>;
    // Debug: Log each row being processed

    return {
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
        created_at: typedRow.created_at ? new Date(typedRow.created_at as string) : new Date(),
        updated_at: typedRow.updated_at ? new Date(typedRow.updated_at as string) : new Date(),
        user: {
          id: typedRow.user_id,
          username: (typedRow.user as Record<string, unknown>)?.username || 'Unknown User',
          first_name: (typedRow.user as Record<string, unknown>)?.first_name || 'Unknown',
          last_name: (typedRow.user as Record<string, unknown>)?.last_name || 'User',
          image_url: (typedRow.user as Record<string, unknown>)?.image_url,
        },
      },
      cursor: typedRow.id,
    };
  });

  return {
    edges,
    pageInfo: {
      hasNextPage,
      hasPreviousPage: false, // For forward-only pagination, this is always false
      startCursor: edges[0]?.cursor ?? null,
      endCursor: hasNextPage
        ? (paginatedRows[paginatedRows.length - 1] as Record<string, unknown>)?.id
        : null,
    },
    totalCount: paginatedRows.length, // For minimal queries, we don't get total count
  };
}

// Process query result for optimized queries with counts
function processQueryResultWithCounts(
  result: unknown[] | undefined,
  limit: number,
  queryDuration: number,
  commentCountMap: Map<string, number>,
  reactionCountMap: Map<string, number>
) {
  if (!result || result.length === 0) {
    return {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: 0,
    };
  }

  const hasNextPage = result.length > limit;
  const paginatedRows = hasNextPage ? result.slice(0, limit) : result;

  const edges = paginatedRows.map((row: unknown) => {
    const typedRow = row as Record<string, unknown>;
    return {
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
        created_at: typedRow.created_at ? new Date(typedRow.created_at as string) : new Date(),
        updated_at: typedRow.updated_at ? new Date(typedRow.updated_at as string) : new Date(),
        user: {
          id: typedRow.user_id,
          username: (typedRow.user as Record<string, unknown>)?.username || 'Unknown User',
          first_name: (typedRow.user as Record<string, unknown>)?.first_name || 'Unknown',
          last_name: (typedRow.user as Record<string, unknown>)?.last_name || 'User',
          image_url: (typedRow.user as Record<string, unknown>)?.image_url,
        },
        totalCommentCount: commentCountMap.get(typedRow.id as string) || 0,
        totalReactionCount: reactionCountMap.get(typedRow.id as string) || 0,
      },
      cursor: typedRow.id,
    };
  });

  return {
    edges,
    pageInfo: {
      hasNextPage,
      hasPreviousPage: false, // For forward-only pagination, this is always false
      startCursor: edges[0]?.cursor ?? null,
      endCursor: hasNextPage
        ? (paginatedRows[paginatedRows.length - 1] as Record<string, unknown>)?.id
        : null,
    },
    totalCount: paginatedRows.length, // For optimized queries, we don't get total count
  };
}
