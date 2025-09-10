import { and, eq, sql, isNull, count, ilike, desc, asc } from 'drizzle-orm';

import { db } from '@/lib/db';
import { basketball_teams } from '@/lib/db/schema';

/**
 * Teams SQL Queries
 *
 * Centralized collection of all SQL queries related to basketball teams.
 * Includes team data retrieval, filtering, and statistics.
 */

/**
 * Get team by ID
 */
export async function getTeamByIdQuery(teamId: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select()
    .from(basketball_teams)
    .where(and(eq(basketball_teams.id, teamId), isNull(basketball_teams.deleted_at)))
    .limit(1);

  return result[0] || null;
}

/**
 * Get teams with pagination
 */
export async function getTeamsQuery(limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select()
    .from(basketball_teams)
    .where(isNull(basketball_teams.deleted_at))
    .orderBy(asc(basketball_teams.name))
    .limit(limit)
    .offset(offset);
}

/**
 * Search teams by name
 */
export async function searchTeamsQuery(searchTerm: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const searchPattern = `%${searchTerm}%`;

  return database
    .select()
    .from(basketball_teams)
    .where(and(isNull(basketball_teams.deleted_at), ilike(basketball_teams.name, searchPattern)))
    .orderBy(asc(basketball_teams.name))
    .limit(limit)
    .offset(offset);
}

/**
 * Get team count
 */
export async function getTeamCountQuery(): Promise<number> {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select({ count: count() })
    .from(basketball_teams)
    .where(isNull(basketball_teams.deleted_at));

  return result[0]?.count || 0;
}

/**
 * Get teams by IDs
 */
export async function getTeamsByIdsQuery(teamIds: string[]) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  if (teamIds.length === 0) {
    return [];
  }

  return database
    .select()
    .from(basketball_teams)
    .where(and(sql`${basketball_teams.id} = ANY(${teamIds})`, isNull(basketball_teams.deleted_at)));
}

/**
 * Get teams by conference
 */
export async function getTeamsByConferenceQuery(conference: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database.execute(sql`
    SELECT *
    FROM basketball_teams
    WHERE deleted_at IS NULL
      AND (nba->>'conference')::text = ${conference}
    ORDER BY name
    LIMIT ${limit}
    OFFSET ${offset}
  `);
}

/**
 * Get teams by division
 */
export async function getTeamsByDivisionQuery(division: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database.execute(sql`
    SELECT *
    FROM basketball_teams
    WHERE deleted_at IS NULL
      AND (nba->>'division')::text = ${division}
    ORDER BY name
    LIMIT ${limit}
    OFFSET ${offset}
  `);
}

/**
 * Get team statistics
 */
export async function getTeamStatisticsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      COUNT(*) as total_teams,
      COUNT(CASE WHEN nba->>'conference' = 'Eastern' THEN 1 END) as eastern_teams,
      COUNT(CASE WHEN nba->>'conference' = 'Western' THEN 1 END) as western_teams,
      COUNT(CASE WHEN nba->>'division' IS NOT NULL THEN 1 END) as teams_with_division
    FROM basketball_teams
    WHERE deleted_at IS NULL
  `);

  return (
    result.rows[0] || {
      total_teams: 0,
      eastern_teams: 0,
      western_teams: 0,
      teams_with_division: 0,
    }
  );
}

/**
 * Get recent teams
 */
export async function getRecentTeamsQuery(limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select()
    .from(basketball_teams)
    .where(isNull(basketball_teams.deleted_at))
    .orderBy(desc(basketball_teams.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get teams by city
 */
export async function getTeamsByCityQuery(city: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const searchPattern = `%${city}%`;

  return database.execute(sql`
    SELECT *
    FROM basketball_teams
    WHERE deleted_at IS NULL
      AND (
        name ILIKE ${searchPattern}
        OR (nba->>'city')::text ILIKE ${searchPattern}
      )
    ORDER BY name
    LIMIT ${limit}
    OFFSET ${offset}
  `);
}
