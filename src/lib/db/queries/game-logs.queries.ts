import { and, eq, sql, isNull, count, desc, asc } from 'drizzle-orm';

import { db } from '@/lib/db';
import { game_logs, basketball_games, users } from '@/lib/db/schema';
import type { IGameLogsServiceOptions } from '@/types';

/**
 * Game Logs SQL Queries
 *
 * Centralized collection of all SQL queries related to game logs.
 * Includes complex filtering, search, and aggregation queries.
 */

/**
 * Build search conditions for game logs
 */
export function buildGameLogSearchConditions(
  search: string,
  teamName?: string,
  username?: string,
  tags?: string
) {
  const conditions = [];

  if (search) {
    const searchTerm = `%${search}%`;
    conditions.push(
      sql`(
        ${game_logs.notes} ILIKE ${searchTerm} OR
        ${game_logs.tags}::text ILIKE ${searchTerm}
      )`
    );
  }

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

  return conditions;
}

/**
 * Build date range conditions for game logs
 */
export function buildGameLogDateConditions(
  watchedDateFrom?: string,
  watchedDateTo?: string,
  gameDateFrom?: string,
  gameDateTo?: string
) {
  const conditions = [];

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

  return conditions;
}

/**
 * Build filter conditions for game logs
 */
export function buildGameLogFilterConditions(
  userId?: string,
  classification?: string,
  rating?: string,
  watchedSetting?: string,
  watchedScope?: string
) {
  const conditions = [isNull(game_logs.deleted_at)];

  if (userId) {
    conditions.push(eq(game_logs.user_id, userId));
  }

  if (classification && classification !== 'all') {
    conditions.push(eq(game_logs.classification, classification.toUpperCase()));
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

  return conditions;
}

/**
 * Build friends game log conditions
 */
export function buildFriendsGameLogConditions(userId?: string) {
  const conditions = [
    isNull(game_logs.deleted_at),
    sql`${game_logs.classification} IN ('PUBLIC', 'PROTECTED')`,
  ];

  // Only exclude current user's logs if userId is provided and not empty
  if (userId && userId.trim() !== '') {
    conditions.push(sql`${game_logs.user_id} != ${userId}`);
  }

  return conditions;
}

/**
 * Get game logs with complex filtering
 */
export async function getGameLogsQuery(options: IGameLogsServiceOptions = {}) {
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

  // Build all conditions
  const baseConditions = buildGameLogFilterConditions(
    userId,
    classification,
    rating,
    watchedSetting,
    watchedScope
  );

  const searchConditions = buildGameLogSearchConditions(search || '', teamName, username, tags);
  const dateConditions = buildGameLogDateConditions(
    watchedDateFrom,
    watchedDateTo,
    gameDateFrom,
    gameDateTo
  );

  const allConditions = [...baseConditions, ...searchConditions, ...dateConditions];
  const whereClause = allConditions.length > 0 ? and(...allConditions) : undefined;

  // Build sort clause
  const sortColumn = (() => {
    switch (sortBy) {
      case 'created_at':
        return game_logs.created_at;
      case 'updated_at':
        return game_logs.updated_at;
      case 'watched_date':
        return game_logs.watched_date;
      case 'rating_for_game':
        return game_logs.rating_for_game;
      default:
        return game_logs.created_at;
    }
  })();
  const orderBy = sortDirection === 'desc' ? desc(sortColumn) : asc(sortColumn);

  // Execute query
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const [gameLogs, totalCount] = await Promise.all([
    database
      .select({
        id: game_logs.id,
        user_id: game_logs.user_id,
        game_id: game_logs.game_id,
        rating_for_game: game_logs.rating_for_game,
        notes: game_logs.notes,
        tags: game_logs.tags,
        watched_date: game_logs.watched_date,
        watched_setting: game_logs.watched_setting,
        watched_location: game_logs.watched_location,
        watched_scope: game_logs.watched_scope,
        classification: game_logs.classification,
        created_at: game_logs.created_at,
        updated_at: game_logs.updated_at,
      })
      .from(game_logs)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    database.select({ count: count() }).from(game_logs).where(whereClause),
  ]);

  return {
    gameLogs,
    totalCount: totalCount[0]?.count || 0,
  };
}

/**
 * Get friends game logs with filtering
 */
export async function getFriendsGameLogsQuery(options: IGameLogsServiceOptions = {}) {
  const {
    page = 1,
    limit = 20,
    search,
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

  // Build friends-specific conditions
  const baseConditions = buildFriendsGameLogConditions(userId);

  const searchConditions = buildGameLogSearchConditions(search || '', teamName, username, tags);
  const dateConditions = buildGameLogDateConditions(
    watchedDateFrom,
    watchedDateTo,
    gameDateFrom,
    gameDateTo
  );

  // Add additional filter conditions
  const additionalConditions = [];
  if (rating) {
    const ratingValue = parseInt(rating);
    if (!isNaN(ratingValue)) {
      additionalConditions.push(sql`gl.rating_for_game = ${ratingValue}`);
    }
  }

  if (watchedSetting) {
    additionalConditions.push(sql`gl.watched_setting = ${watchedSetting}`);
  }

  if (watchedScope) {
    additionalConditions.push(sql`gl.watched_scope = ${watchedScope}`);
  }

  const allConditions = [
    ...baseConditions,
    ...searchConditions,
    ...dateConditions,
    ...additionalConditions,
  ];
  const whereClause = allConditions.length > 0 ? and(...allConditions) : undefined;

  // Build sort clause
  const sortColumn = (() => {
    switch (sortBy) {
      case 'created_at':
        return game_logs.created_at;
      case 'updated_at':
        return game_logs.updated_at;
      case 'watched_date':
        return game_logs.watched_date;
      case 'rating_for_game':
        return game_logs.rating_for_game;
      default:
        return game_logs.created_at;
    }
  })();
  const orderBy = sortDirection === 'desc' ? desc(sortColumn) : asc(sortColumn);

  // Execute query
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const [gameLogs, totalCount] = await Promise.all([
    database
      .select({
        id: game_logs.id,
        user_id: game_logs.user_id,
        game_id: game_logs.game_id,
        rating_for_game: game_logs.rating_for_game,
        notes: game_logs.notes,
        tags: game_logs.tags,
        watched_date: game_logs.watched_date,
        watched_setting: game_logs.watched_setting,
        watched_location: game_logs.watched_location,
        watched_scope: game_logs.watched_scope,
        classification: game_logs.classification,
        created_at: game_logs.created_at,
        updated_at: game_logs.updated_at,
      })
      .from(game_logs)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    database.select({ count: count() }).from(game_logs).where(whereClause),
  ]);

  return {
    gameLogs,
    totalCount: totalCount[0]?.count || 0,
  };
}

/**
 * Get game log by ID with related data
 */
export async function getGameLogByIdQuery(gameLogId: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select()
    .from(game_logs)
    .where(and(eq(game_logs.id, gameLogId), isNull(game_logs.deleted_at)))
    .limit(1);

  return result[0] || null;
}

/**
 * Get game logs by user ID
 */
export async function getGameLogsByUserIdQuery(userId: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select()
    .from(game_logs)
    .where(and(eq(game_logs.user_id, userId), isNull(game_logs.deleted_at)))
    .orderBy(desc(game_logs.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get game logs by game ID
 */
export async function getGameLogsByGameIdQuery(gameId: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select()
    .from(game_logs)
    .where(and(eq(game_logs.game_id, gameId), isNull(game_logs.deleted_at)))
    .orderBy(desc(game_logs.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get game log counts by classification
 */
export async function getGameLogCountsByClassificationQuery(userId?: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const conditions = [isNull(game_logs.deleted_at)];
  if (userId) {
    conditions.push(eq(game_logs.user_id, userId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return database
    .select({
      classification: game_logs.classification,
      count: count(),
    })
    .from(game_logs)
    .where(whereClause)
    .groupBy(game_logs.classification);
}

/**
 * Get game log statistics
 */
export async function getGameLogStatisticsQuery(userId?: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const conditions = [isNull(game_logs.deleted_at)];
  if (userId) {
    conditions.push(eq(game_logs.user_id, userId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return database
    .select({
      totalCount: count(),
      averageRating: sql<number>`AVG(${game_logs.rating_for_game})`,
      maxRating: sql<number>`MAX(${game_logs.rating_for_game})`,
      minRating: sql<number>`MIN(${game_logs.rating_for_game})`,
    })
    .from(game_logs)
    .where(whereClause);
}

/**
 * Ultra-fast game log query with all related data
 * This query joins game logs with users, games, and teams for maximum performance
 */
export async function executeUltraFastGameLogQuery(whereClause: string, limit = 1) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const query = `
    SELECT
      gl.id,
      gl.game_id,
      gl.user_id,
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
      u.display_name,
      u.avatar_url,
      bg.date as game_date,
      bg.teams as game_teams,
      bg.status as game_status,
      bg.season as game_season,
      bg.stage as game_week
    FROM game_logs gl
    LEFT JOIN users u ON gl.user_id = u.id
    LEFT JOIN basketball_games bg ON gl.game_id = bg.id
    ${whereClause}
    ORDER BY gl.created_at DESC
    LIMIT ${limit}
  `;

  const result = await database.execute(sql.raw(query));
  return result;
}
