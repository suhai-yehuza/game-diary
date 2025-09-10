import { and, eq, sql, isNull, count, ilike, or, desc, asc } from 'drizzle-orm';

import { db } from '@/lib/db';
import { basketball_players } from '@/lib/db/schema';

/**
 * Players SQL Queries
 *
 * Centralized collection of all SQL queries related to basketball players.
 * Includes player data retrieval, filtering, and statistics.
 */

/**
 * Get player by ID
 */
export async function getPlayerByIdQuery(playerId: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select()
    .from(basketball_players)
    .where(and(eq(basketball_players.id, playerId), isNull(basketball_players.deleted_at)))
    .limit(1);

  return result[0] || null;
}

/**
 * Get players with pagination
 */
export async function getPlayersQuery(limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select()
    .from(basketball_players)
    .where(isNull(basketball_players.deleted_at))
    .orderBy(asc(basketball_players.first_name), asc(basketball_players.last_name))
    .limit(limit)
    .offset(offset);
}

/**
 * Search players by name
 */
export async function searchPlayersQuery(searchTerm: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const searchPattern = `%${searchTerm}%`;

  return database
    .select()
    .from(basketball_players)
    .where(
      and(
        isNull(basketball_players.deleted_at),
        or(
          ilike(basketball_players.first_name, searchPattern),
          ilike(basketball_players.last_name, searchPattern),
          ilike(
            sql`CONCAT(${basketball_players.first_name}, ' ', ${basketball_players.last_name})`,
            searchPattern
          )
        )
      )
    )
    .orderBy(asc(basketball_players.first_name), asc(basketball_players.last_name))
    .limit(limit)
    .offset(offset);
}

/**
 * Get players by position
 */
export async function getPlayersByPositionQuery(position: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database.execute(sql`
    SELECT *
    FROM basketball_players
    WHERE deleted_at IS NULL
      AND (leagues->'standard'->>'pos')::text = ${position}
    ORDER BY first_name, last_name
    LIMIT ${limit}
    OFFSET ${offset}
  `);
}

/**
 * Get players by team
 */
export async function getPlayersByTeamQuery(teamId: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database.execute(sql`
    SELECT *
    FROM basketball_players
    WHERE deleted_at IS NULL
      AND (teams->'standard'->>'teamId')::text = ${teamId}
    ORDER BY first_name, last_name
    LIMIT ${limit}
    OFFSET ${offset}
  `);
}

/**
 * Get players by college
 */
export async function getPlayersByCollegeQuery(college: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const searchPattern = `%${college}%`;

  return database
    .select()
    .from(basketball_players)
    .where(
      and(isNull(basketball_players.deleted_at), ilike(basketball_players.college, searchPattern))
    )
    .orderBy(asc(basketball_players.first_name), asc(basketball_players.last_name))
    .limit(limit)
    .offset(offset);
}

/**
 * Get players by country
 */
export async function getPlayersByCountryQuery(country: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database.execute(sql`
    SELECT *
    FROM basketball_players
    WHERE deleted_at IS NULL
      AND (birth->>'country')::text = ${country}
    ORDER BY first_name, last_name
    LIMIT ${limit}
    OFFSET ${offset}
  `);
}

/**
 * Get player count
 */
export async function getPlayerCountQuery(): Promise<number> {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select({ count: count() })
    .from(basketball_players)
    .where(isNull(basketball_players.deleted_at));

  return result[0]?.count || 0;
}

/**
 * Get players by IDs
 */
export async function getPlayersByIdsQuery(playerIds: string[]) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  if (playerIds.length === 0) {
    return [];
  }

  return database
    .select()
    .from(basketball_players)
    .where(
      and(sql`${basketball_players.id} = ANY(${playerIds})`, isNull(basketball_players.deleted_at))
    );
}

/**
 * Get player statistics
 */
export async function getPlayerStatisticsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      COUNT(*) as total_players,
      COUNT(CASE WHEN (leagues->'standard'->>'pos')::text = 'Guard' THEN 1 END) as guards,
      COUNT(CASE WHEN (leagues->'standard'->>'pos')::text = 'Forward' THEN 1 END) as forwards,
      COUNT(CASE WHEN (leagues->'standard'->>'pos')::text = 'Center' THEN 1 END) as centers,
      COUNT(CASE WHEN college IS NOT NULL AND college != '' THEN 1 END) as players_with_college
    FROM basketball_players
    WHERE deleted_at IS NULL
  `);

  return (
    result.rows[0] || {
      total_players: 0,
      guards: 0,
      forwards: 0,
      centers: 0,
      players_with_college: 0,
    }
  );
}

/**
 * Get recent players
 */
export async function getRecentPlayersQuery(limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select()
    .from(basketball_players)
    .where(isNull(basketball_players.deleted_at))
    .orderBy(desc(basketball_players.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get players by height range
 */
export async function getPlayersByHeightQuery(
  minHeight: number,
  maxHeight: number,
  limit = 20,
  offset = 0
) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database.execute(sql`
    SELECT *
    FROM basketball_players
    WHERE deleted_at IS NULL
      AND (height->>'meters')::numeric >= ${minHeight}
      AND (height->>'meters')::numeric <= ${maxHeight}
    ORDER BY first_name, last_name
    LIMIT ${limit}
    OFFSET ${offset}
  `);
}

/**
 * Get players by weight range
 */
export async function getPlayersByWeightQuery(
  minWeight: number,
  maxWeight: number,
  limit = 20,
  offset = 0
) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database.execute(sql`
    SELECT *
    FROM basketball_players
    WHERE deleted_at IS NULL
      AND (weight->>'kilograms')::numeric >= ${minWeight}
      AND (weight->>'kilograms')::numeric <= ${maxWeight}
    ORDER BY first_name, last_name
    LIMIT ${limit}
    OFFSET ${offset}
  `);
}
