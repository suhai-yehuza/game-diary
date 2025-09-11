import { eq, and, sql, isNull, count, inArray } from 'drizzle-orm';

import { db } from '@/lib/db';
import { game_logs, basketball_games, users, comments, reactions } from '@/lib/db/schema';
import type { IGameLog, IGameLogsServiceOptions, IGameLogsServiceResult } from '@/types';

/**
 * Get paginated game logs with filtering and sorting
 */
export async function getGameLogs(
  options: IGameLogsServiceOptions = {}
): Promise<IGameLogsServiceResult> {
  const {
    page = 1,
    limit = 20,
    search,
    classification,
    userId,
    sortBy = 'created_at',
    sortDirection = 'desc',
    teamName,
    username,
    tags,
    watchedDateFrom,
    watchedDateTo,
    gameDateFrom,
    gameDateTo,
    rating,
    watchedSetting,
    watchedScope,
  } = options;

  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [isNull(game_logs.deleted_at)];

  if (userId) {
    conditions.push(eq(game_logs.user_id, userId));
  }

  if (classification && classification !== 'all') {
    conditions.push(eq(game_logs.classification, classification.toUpperCase()));
  }

  if (search) {
    const searchTerm = `%${search}%`;
    conditions.push(
      sql`(
        ${game_logs.notes} ILIKE ${searchTerm} OR
        ${game_logs.tags}::text ILIKE ${searchTerm}
      )`
    );
  }

  // Additional filter conditions
  if (teamName) {
    const teamSearchTerm = `%${teamName}%`;
    conditions.push(
      sql`(
        EXISTS (
          SELECT 1 FROM ${basketball_games} bg
          WHERE bg.id = gl.game_id
          AND (
            bg.teams->'home'->>'name' ILIKE ${teamSearchTerm} OR
            bg.teams->'visitors'->>'name' ILIKE ${teamSearchTerm}
          )
        )
      )`
    );
  }

  if (username) {
    const userSearchTerm = `%${username}%`;
    conditions.push(
      sql`(
        EXISTS (
          SELECT 1 FROM ${users} u
          WHERE u.id = gl.user_id
          AND (
            u.username ILIKE ${userSearchTerm} OR
            u.first_name ILIKE ${userSearchTerm} OR
            u.last_name ILIKE ${userSearchTerm}
          )
        )
      )`
    );
  }

  if (tags) {
    const tagSearchTerm = `%${tags}%`;
    conditions.push(sql`gl.tags::text ILIKE ${tagSearchTerm}`);
  }

  if (watchedDateFrom) {
    conditions.push(sql`gl.watched_date >= ${watchedDateFrom}`);
  }

  if (watchedDateTo) {
    conditions.push(sql`gl.watched_date <= ${watchedDateTo}`);
  }

  if (gameDateFrom) {
    conditions.push(
      sql`(
        EXISTS (
          SELECT 1 FROM ${basketball_games} bg
          WHERE bg.id = gl.game_id
          AND bg.date >= ${gameDateFrom}
        )
      )`
    );
  }

  if (gameDateTo) {
    conditions.push(
      sql`(
        EXISTS (
          SELECT 1 FROM ${basketball_games} bg
          WHERE bg.id = gl.game_id
          AND bg.date <= ${gameDateTo}
        )
      )`
    );
  }

  if (rating) {
    const ratingValue = parseInt(rating);
    if (!isNaN(ratingValue)) {
      conditions.push(sql`gl.rating_for_game = ${ratingValue}`);
    }
  }

  if (watchedSetting) {
    conditions.push(sql`gl.watched_setting = ${watchedSetting}`);
  }

  if (watchedScope) {
    conditions.push(sql`gl.watched_scope = ${watchedScope}`);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const totalCountResult = await db()
    ?.select({ count: count() })
    .from(game_logs)
    .where(whereClause);
  const totalCount = totalCountResult?.[0]?.count || 0;

  // Get paginated results with joins
  const gameLogsResult = await db()?.query.game_logs.findMany({
    where: whereClause,
    with: {
      user: true,
      game: true,
    },
    orderBy: (game_logs, { desc, asc }) => {
      switch (sortBy) {
        case 'rating_for_game':
          return sortDirection === 'asc'
            ? [asc(game_logs.rating_for_game)]
            : [desc(game_logs.rating_for_game)];
        case 'watched_date':
          return sortDirection === 'asc'
            ? [asc(game_logs.watched_date)]
            : [desc(game_logs.watched_date)];
        case 'classification':
          return sortDirection === 'asc'
            ? [asc(game_logs.classification)]
            : [desc(game_logs.classification)];
        case 'created_at':
        default:
          return sortDirection === 'asc'
            ? [asc(game_logs.created_at)]
            : [desc(game_logs.created_at)];
      }
    },
    limit,
    offset,
  });

  // Get comment and reaction counts using efficient JOINs instead of N+1 queries
  const gameLogIds = (gameLogsResult || []).map(row => row.id);

  // Get all comment counts in one query
  const commentCountsResult =
    gameLogIds.length > 0
      ? await db()
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
          .groupBy(comments.parent_id)
      : [];

  // Get all reaction counts in one query
  const reactionCountsResult =
    gameLogIds.length > 0
      ? await db()
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
          .groupBy(reactions.target_id)
      : [];

  // Create lookup maps for O(1) access
  const commentCountMap = new Map(
    (commentCountsResult || []).map(item => [item.parent_id, item.count])
  );
  const reactionCountMap = new Map(
    (reactionCountsResult || []).map(item => [item.target_id, item.count])
  );

  // Map results with counts
  const gameLogsWithCounts = (gameLogsResult || []).map((row: Record<string, unknown>) => {
    const commentCount = commentCountMap.get(row.id as string) || 0;
    const reactionCount = reactionCountMap.get(row.id as string) || 0;

    return {
      id: row.id,
      game_id: row.game_id,
      user_id: row.user_id,
      rating_for_game: row.rating_for_game,
      notes: row.notes,
      tags: (row.tags as string[]) || [],
      watched_date: row.watched_date,
      watched_setting: row.watched_setting,
      watched_location: row.watched_location,
      watched_scope: row.watched_scope,
      classification: row.classification,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
      totalCommentCount: commentCount,
      totalReactionCount: reactionCount,
      comments: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: commentCount,
      },
      reactions: [],
      user: row.user || {
        id: 'unknown',
        username: 'unknown',
        first_name: 'Anonymous',
        last_name: 'User',
        image_url: null,
      },
      game: row.game || {
        id: 'unknown',
        date: new Date().toISOString(),
        status: 'UNKNOWN',
        teams: null,
        scores: null,
      },
    };
  });

  const gameLogs = gameLogsWithCounts;

  const hasNextPage = offset + limit < totalCount;
  const hasPreviousPage = page > 1;

  return {
    gameLogs: gameLogs as unknown as IGameLog[],
    totalCount,
    hasNextPage,
    hasPreviousPage,
  };
}

/**
 * Get friends' game logs for a user
 */
export async function getFriendsGameLogs(
  userId: string | undefined,
  options: IGameLogsServiceOptions = {}
): Promise<IGameLogsServiceResult> {
  const {
    page = 1,
    limit = 20,
    search,
    sortBy = 'created_at',
    sortDirection = 'desc',
    teamName,
    username,
    tags,
    watchedDateFrom,
    watchedDateTo,
    gameDateFrom,
    gameDateTo,
    rating,
    watchedSetting,
    watchedScope,
  } = options;

  const offset = (page - 1) * limit;

  // Build where conditions for friends logs (PUBLIC + PROTECTED, not from current user)
  const conditions = [
    isNull(game_logs.deleted_at),
    sql`${game_logs.classification} IN ('PUBLIC', 'PROTECTED')`,
  ];

  // Only exclude current user's logs if userId is provided and not empty
  if (userId && userId.trim() !== '') {
    conditions.push(sql`${game_logs.user_id} != ${userId}`);
  }

  // Add search conditions (same as getGameLogs)
  if (search) {
    const searchTerm = `%${search}%`;
    conditions.push(
      sql`(
        ${game_logs.notes} ILIKE ${searchTerm} OR
        ${game_logs.tags}::text ILIKE ${searchTerm}
      )`
    );
  }

  // Add other filter conditions (same as getGameLogs)
  if (teamName) {
    const teamSearchTerm = `%${teamName}%`;
    conditions.push(
      sql`(
        EXISTS (
          SELECT 1 FROM ${basketball_games} bg
          WHERE bg.id = gl.game_id
          AND (
            bg.teams->'home'->>'name' ILIKE ${teamSearchTerm} OR
            bg.teams->'visitors'->>'name' ILIKE ${teamSearchTerm}
          )
        )
      )`
    );
  }

  if (username) {
    const userSearchTerm = `%${username}%`;
    conditions.push(
      sql`(
        EXISTS (
          SELECT 1 FROM ${users} u
          WHERE u.id = gl.user_id
          AND (
            u.username ILIKE ${userSearchTerm} OR
            u.first_name ILIKE ${userSearchTerm} OR
            u.last_name ILIKE ${userSearchTerm}
          )
        )
      )`
    );
  }

  if (tags) {
    const tagSearchTerm = `%${tags}%`;
    conditions.push(sql`gl.tags::text ILIKE ${tagSearchTerm}`);
  }

  if (watchedDateFrom) {
    conditions.push(sql`gl.watched_date >= ${watchedDateFrom}`);
  }

  if (watchedDateTo) {
    conditions.push(sql`gl.watched_date <= ${watchedDateTo}`);
  }

  if (gameDateFrom) {
    conditions.push(
      sql`(
        EXISTS (
          SELECT 1 FROM ${basketball_games} bg
          WHERE bg.id = gl.game_id
          AND bg.date >= ${gameDateFrom}
        )
      )`
    );
  }

  if (gameDateTo) {
    conditions.push(
      sql`(
        EXISTS (
          SELECT 1 FROM ${basketball_games} bg
          WHERE bg.id = gl.game_id
          AND bg.date <= ${gameDateTo}
        )
      )`
    );
  }

  if (rating) {
    const ratingValue = parseInt(rating);
    if (!isNaN(ratingValue)) {
      conditions.push(sql`gl.rating_for_game = ${ratingValue}`);
    }
  }

  if (watchedSetting) {
    conditions.push(sql`gl.watched_setting = ${watchedSetting}`);
  }

  if (watchedScope) {
    conditions.push(sql`gl.watched_scope = ${watchedScope}`);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const totalCountResult = await db()
    ?.select({ count: count() })
    .from(game_logs)
    .where(whereClause);
  const totalCount = totalCountResult?.[0]?.count || 0;

  // Get paginated results with joins
  const gameLogsResult = await db()?.query.game_logs.findMany({
    where: whereClause,
    with: {
      user: true,
      game: true,
    },
    orderBy: (game_logs, { desc, asc }) => {
      switch (sortBy) {
        case 'rating_for_game':
          return sortDirection === 'asc'
            ? [asc(game_logs.rating_for_game)]
            : [desc(game_logs.rating_for_game)];
        case 'watched_date':
          return sortDirection === 'asc'
            ? [asc(game_logs.watched_date)]
            : [desc(game_logs.watched_date)];
        case 'classification':
          return sortDirection === 'asc'
            ? [asc(game_logs.classification)]
            : [desc(game_logs.classification)];
        case 'created_at':
        default:
          return sortDirection === 'asc'
            ? [asc(game_logs.created_at)]
            : [desc(game_logs.created_at)];
      }
    },
    limit,
    offset,
  });

  // Get comment and reaction counts using efficient JOINs instead of N+1 queries
  const gameLogIds = (gameLogsResult || []).map(row => row.id);

  // Get all comment counts in one query
  const commentCountsResult =
    gameLogIds.length > 0
      ? await db()
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
          .groupBy(comments.parent_id)
      : [];

  // Get all reaction counts in one query
  const reactionCountsResult =
    gameLogIds.length > 0
      ? await db()
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
          .groupBy(reactions.target_id)
      : [];

  // Create lookup maps for O(1) access
  const commentCountMap = new Map(
    (commentCountsResult || []).map(item => [item.parent_id, item.count])
  );
  const reactionCountMap = new Map(
    (reactionCountsResult || []).map(item => [item.target_id, item.count])
  );

  // Map results with counts
  const gameLogsWithCounts = (gameLogsResult || []).map((row: Record<string, unknown>) => {
    const commentCount = commentCountMap.get(row.id as string) || 0;
    const reactionCount = reactionCountMap.get(row.id as string) || 0;

    return {
      id: row.id,
      game_id: row.game_id,
      user_id: row.user_id,
      rating_for_game: row.rating_for_game,
      notes: row.notes,
      tags: (row.tags as string[]) || [],
      watched_date: row.watched_date,
      watched_setting: row.watched_setting,
      watched_location: row.watched_location,
      watched_scope: row.watched_scope,
      classification: row.classification,
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
      totalCommentCount: commentCount,
      totalReactionCount: reactionCount,
      comments: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: commentCount,
      },
      reactions: [],
      user: row.user || {
        id: 'unknown',
        username: 'unknown',
        first_name: 'Anonymous',
        last_name: 'User',
        image_url: null,
      },
      game: row.game || {
        id: 'unknown',
        date: new Date().toISOString(),
        status: 'UNKNOWN',
        teams: null,
        scores: null,
      },
    };
  });

  const gameLogs = gameLogsWithCounts;

  const hasNextPage = offset + limit < totalCount;
  const hasPreviousPage = page > 1;

  return {
    gameLogs: gameLogs as unknown as IGameLog[],
    totalCount,
    hasNextPage,
    hasPreviousPage,
  };
}
