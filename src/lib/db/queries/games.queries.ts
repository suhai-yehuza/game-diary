import { and, eq, sql, isNull, count, desc } from 'drizzle-orm';

import { db } from '@/lib/db';
import { basketball_games } from '@/lib/db/schema';

/**
 * Games SQL Queries
 *
 * Centralized collection of all SQL queries related to basketball games.
 * Includes game data retrieval, filtering, and statistics.
 */

/**
 * Get game by ID
 */
export async function getGameByIdQuery(gameId: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select()
    .from(basketball_games)
    .where(and(eq(basketball_games.id, gameId), isNull(basketball_games.deleted_at)))
    .limit(1);

  return result[0] || null;
}

/**
 * Get games with pagination
 */
export async function getGamesQuery(limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select()
    .from(basketball_games)
    .where(isNull(basketball_games.deleted_at))
    .orderBy(desc(basketball_games.date))
    .limit(limit)
    .offset(offset);
}

/**
 * Get games by date range
 */
export async function getGamesByDateRangeQuery(
  startDate: string,
  endDate: string,
  limit = 20,
  offset = 0
) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select()
    .from(basketball_games)
    .where(
      and(
        isNull(basketball_games.deleted_at),
        sql`${basketball_games.date} >= ${startDate}`,
        sql`${basketball_games.date} <= ${endDate}`
      )
    )
    .orderBy(desc(basketball_games.date))
    .limit(limit)
    .offset(offset);
}

/**
 * Get games by team ID
 */
export async function getGamesByTeamQuery(teamId: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database.execute(sql`
    SELECT *
    FROM basketball_games
    WHERE deleted_at IS NULL
      AND (
        (teams->'home'->>'id')::text = ${teamId}
        OR (teams->'away'->>'id')::text = ${teamId}
      )
    ORDER BY date DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `);
}

/**
 * Get live games
 */
export async function getLiveGamesQuery(limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database.execute(sql`
    SELECT *
    FROM basketball_games
    WHERE deleted_at IS NULL
      AND status->>'status' = 'live'
    ORDER BY date DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `);
}

/**
 * Get finished games
 */
export async function getFinishedGamesQuery(limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database.execute(sql`
    SELECT *
    FROM basketball_games
    WHERE deleted_at IS NULL
      AND status->>'status' = 'finished'
    ORDER BY date DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `);
}

/**
 * Get game count
 */
export async function getGameCountQuery(): Promise<number> {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select({ count: count() })
    .from(basketball_games)
    .where(isNull(basketball_games.deleted_at));

  return result[0]?.count || 0;
}

/**
 * Get games by IDs
 */
export async function getGamesByIdsQuery(gameIds: string[]) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  if (gameIds.length === 0) {
    return [];
  }

  return database
    .select()
    .from(basketball_games)
    .where(and(sql`${basketball_games.id} = ANY(${gameIds})`, isNull(basketball_games.deleted_at)));
}

/**
 * Get game statistics
 */
export async function getGameStatisticsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      COUNT(*) as total_games,
      COUNT(CASE WHEN status->>'status' = 'live' THEN 1 END) as live_games,
      COUNT(CASE WHEN status->>'status' = 'finished' THEN 1 END) as finished_games,
      COUNT(CASE WHEN date >= CURRENT_DATE THEN 1 END) as games_today,
      COUNT(CASE WHEN date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as games_this_week
    FROM basketball_games
    WHERE deleted_at IS NULL
  `);

  return (
    result.rows[0] || {
      total_games: 0,
      live_games: 0,
      finished_games: 0,
      games_today: 0,
      games_this_week: 0,
    }
  );
}

/**
 * Get games by status
 */
export async function getGamesByStatusQuery(status: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database.execute(sql`
    SELECT *
    FROM basketball_games
    WHERE deleted_at IS NULL
      AND status->>'status' = ${status}
    ORDER BY date DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `);
}

/**
 * Get recent games
 */
export async function getRecentGamesQuery(limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select()
    .from(basketball_games)
    .where(isNull(basketball_games.deleted_at))
    .orderBy(desc(basketball_games.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Search games by team name
 */
export async function searchGamesByTeamQuery(teamName: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const searchPattern = `%${teamName}%`;

  return database.execute(sql`
    SELECT *
    FROM basketball_games
    WHERE deleted_at IS NULL
      AND (
        teams->'home'->>'name' ILIKE ${searchPattern}
        OR teams->'away'->>'name' ILIKE ${searchPattern}
      )
    ORDER BY date DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `);
}

/**
 * Get games with high scores
 */
export async function getHighScoringGamesQuery(minScore = 100, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database.execute(sql`
    SELECT *
    FROM basketball_games
    WHERE deleted_at IS NULL
      AND (
        (scores->'home'->>'total')::int >= ${minScore}
        OR (scores->'away'->>'total')::int >= ${minScore}
      )
    ORDER BY
      GREATEST(
        (scores->'home'->>'total')::int,
        (scores->'away'->>'total')::int
      ) DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `);
}
