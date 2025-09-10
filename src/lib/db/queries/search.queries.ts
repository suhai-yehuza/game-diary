import { and, eq, sql, isNull, ilike, or, desc, asc } from 'drizzle-orm';

import { db } from '@/lib/db';
import {
  users,
  game_logs,
  basketball_games,
  basketball_teams,
  basketball_players,
} from '@/lib/db/schema';

/**
 * Search SQL Queries
 *
 * Centralized collection of all SQL queries related to search functionality.
 * Includes global search, filtered search, and search statistics.
 */

/**
 * Global search across all entities
 */
export async function globalSearchQuery(searchTerm: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const searchPattern = `%${searchTerm}%`;

  // Search users
  const usersResult = await database
    .select({
      id: users.id,
      username: users.username,
      first_name: users.first_name,
      last_name: users.last_name,
      image_url: users.image_url,
      isAdmin: users.isAdmin,
      type: sql<string>`'user'`,
    })
    .from(users)
    .where(
      and(
        isNull(users.deleted_at),
        or(
          ilike(users.username, searchPattern),
          ilike(users.first_name, searchPattern),
          ilike(users.last_name, searchPattern)
        )
      )
    )
    .limit(limit)
    .offset(offset);

  // Search game logs
  const gameLogsResult = await database
    .select({
      id: game_logs.id,
      notes: game_logs.notes,
      tags: game_logs.tags,
      type: sql<string>`'game_log'`,
    })
    .from(game_logs)
    .where(
      and(
        isNull(game_logs.deleted_at),
        or(
          ilike(game_logs.notes, searchPattern),
          sql`${game_logs.tags}::text ILIKE ${searchPattern}`
        )
      )
    )
    .limit(limit)
    .offset(offset);

  // Search games
  const gamesResult = await database.execute(sql`
    SELECT
      id,
      date,
      teams,
      scores,
      'game' as type
    FROM basketball_games
    WHERE deleted_at IS NULL
      AND (
        teams->'home'->>'name' ILIKE ${searchPattern}
        OR teams->'away'->>'name' ILIKE ${searchPattern}
      )
    LIMIT ${limit}
    OFFSET ${offset}
  `);

  // Search teams
  const teamsResult = await database
    .select({
      id: basketball_teams.id,
      name: basketball_teams.name,
      type: sql<string>`'team'`,
    })
    .from(basketball_teams)
    .where(and(isNull(basketball_teams.deleted_at), ilike(basketball_teams.name, searchPattern)))
    .limit(limit)
    .offset(offset);

  // Search players
  const playersResult = await database
    .select({
      id: basketball_players.id,
      first_name: basketball_players.first_name,
      last_name: basketball_players.last_name,
      type: sql<string>`'player'`,
    })
    .from(basketball_players)
    .where(
      and(
        isNull(basketball_players.deleted_at),
        or(
          ilike(basketball_players.first_name, searchPattern),
          ilike(basketball_players.last_name, searchPattern)
        )
      )
    )
    .limit(limit)
    .offset(offset);

  return {
    users: usersResult,
    gameLogs: gameLogsResult,
    games: gamesResult.rows,
    teams: teamsResult,
    players: playersResult,
  };
}

/**
 * Search users with advanced filtering
 */
export async function searchUsersAdvancedQuery(
  searchTerm: string,
  filters: {
    isAdmin?: boolean;
    createdAfter?: string;
    createdBefore?: string;
  } = {},
  limit = 20,
  offset = 0
) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const searchPattern = `%${searchTerm}%`;
  const conditions = [
    isNull(users.deleted_at),
    or(
      ilike(users.username, searchPattern),
      ilike(users.first_name, searchPattern),
      ilike(users.last_name, searchPattern),
      ilike(users.email_address, searchPattern)
    ),
  ];

  if (filters.isAdmin !== undefined) {
    conditions.push(eq(users.isAdmin, filters.isAdmin));
  }

  if (filters.createdAfter) {
    conditions.push(sql`${users.created_at} >= ${filters.createdAfter}`);
  }

  if (filters.createdBefore) {
    conditions.push(sql`${users.created_at} <= ${filters.createdBefore}`);
  }

  return database
    .select({
      id: users.id,
      username: users.username,
      first_name: users.first_name,
      last_name: users.last_name,
      email_address: users.email_address,
      image_url: users.image_url,
      isAdmin: users.isAdmin,
      created_at: users.created_at,
    })
    .from(users)
    .where(and(...conditions))
    .orderBy(desc(users.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Search game logs with advanced filtering
 */
export async function searchGameLogsAdvancedQuery(
  searchTerm: string,
  filters: {
    userId?: string;
    classification?: string;
    rating?: number;
    dateFrom?: string;
    dateTo?: string;
  } = {},
  limit = 20,
  offset = 0
) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const searchPattern = `%${searchTerm}%`;
  const conditions = [
    isNull(game_logs.deleted_at),
    or(ilike(game_logs.notes, searchPattern), sql`${game_logs.tags}::text ILIKE ${searchPattern}`),
  ];

  if (filters.userId) {
    conditions.push(eq(game_logs.user_id, filters.userId));
  }

  if (filters.classification) {
    conditions.push(eq(game_logs.classification, filters.classification));
  }

  if (filters.rating) {
    conditions.push(eq(game_logs.rating_for_game, filters.rating));
  }

  if (filters.dateFrom) {
    conditions.push(sql`${game_logs.created_at} >= ${filters.dateFrom}`);
  }

  if (filters.dateTo) {
    conditions.push(sql`${game_logs.created_at} <= ${filters.dateTo}`);
  }

  return database
    .select({
      id: game_logs.id,
      user_id: game_logs.user_id,
      game_id: game_logs.game_id,
      notes: game_logs.notes,
      tags: game_logs.tags,
      rating_for_game: game_logs.rating_for_game,
      classification: game_logs.classification,
      created_at: game_logs.created_at,
    })
    .from(game_logs)
    .where(and(...conditions))
    .orderBy(desc(game_logs.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Search games with advanced filtering
 */
export async function searchGamesAdvancedQuery(
  searchTerm: string,
  filters: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    teamId?: string;
  } = {},
  limit = 20,
  offset = 0
) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const searchPattern = `%${searchTerm}%`;
  const conditions = [
    isNull(basketball_games.deleted_at),
    or(
      sql`teams->'home'->>'name' ILIKE ${searchPattern}`,
      sql`teams->'away'->>'name' ILIKE ${searchPattern}`
    ),
  ];

  if (filters.status) {
    conditions.push(sql`status->>'status' = ${filters.status}`);
  }

  if (filters.dateFrom) {
    conditions.push(sql`${basketball_games.date} >= ${filters.dateFrom}`);
  }

  if (filters.dateTo) {
    conditions.push(sql`${basketball_games.date} <= ${filters.dateTo}`);
  }

  if (filters.teamId) {
    conditions.push(
      sql`(
        (teams->'home'->>'id')::text = ${filters.teamId}
        OR (teams->'away'->>'id')::text = ${filters.teamId}
      )`
    );
  }

  return database
    .select()
    .from(basketball_games)
    .where(and(...conditions))
    .orderBy(desc(basketball_games.date))
    .limit(limit)
    .offset(offset);
}

/**
 * Search teams with advanced filtering
 */
export async function searchTeamsAdvancedQuery(
  searchTerm: string,
  filters: {
    conference?: string;
    division?: string;
  } = {},
  limit = 20,
  offset = 0
) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const searchPattern = `%${searchTerm}%`;
  const conditions = [
    isNull(basketball_teams.deleted_at),
    ilike(basketball_teams.name, searchPattern),
  ];

  if (filters.conference) {
    conditions.push(sql`(nba->>'conference')::text = ${filters.conference}`);
  }

  if (filters.division) {
    conditions.push(sql`(nba->>'division')::text = ${filters.division}`);
  }

  return database
    .select()
    .from(basketball_teams)
    .where(and(...conditions))
    .orderBy(asc(basketball_teams.name))
    .limit(limit)
    .offset(offset);
}

/**
 * Search players with advanced filtering
 */
export async function searchPlayersAdvancedQuery(
  searchTerm: string,
  filters: {
    position?: string;
    teamId?: string;
    college?: string;
    country?: string;
  } = {},
  limit = 20,
  offset = 0
) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const searchPattern = `%${searchTerm}%`;
  const conditions = [
    isNull(basketball_players.deleted_at),
    or(
      ilike(basketball_players.first_name, searchPattern),
      ilike(basketball_players.last_name, searchPattern)
    ),
  ];

  if (filters.position) {
    conditions.push(sql`(leagues->'standard'->>'pos')::text = ${filters.position}`);
  }

  if (filters.teamId) {
    conditions.push(sql`(teams->'standard'->>'teamId')::text = ${filters.teamId}`);
  }

  if (filters.college) {
    const collegePattern = `%${filters.college}%`;
    conditions.push(ilike(basketball_players.college, collegePattern));
  }

  if (filters.country) {
    conditions.push(sql`(birth->>'country')::text = ${filters.country}`);
  }

  return database
    .select()
    .from(basketball_players)
    .where(and(...conditions))
    .orderBy(asc(basketball_players.first_name), asc(basketball_players.last_name))
    .limit(limit)
    .offset(offset);
}

/**
 * Get search statistics
 */
export async function getSearchStatisticsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
      (SELECT COUNT(*) FROM game_logs WHERE deleted_at IS NULL) as total_game_logs,
      (SELECT COUNT(*) FROM basketball_games WHERE deleted_at IS NULL) as total_games,
      (SELECT COUNT(*) FROM basketball_teams WHERE deleted_at IS NULL) as total_teams,
      (SELECT COUNT(*) FROM basketball_players WHERE deleted_at IS NULL) as total_players
  `);

  return (
    result.rows[0] || {
      total_users: 0,
      total_game_logs: 0,
      total_games: 0,
      total_teams: 0,
      total_players: 0,
    }
  );
}
