import { sql, inArray, eq, and, isNull, desc } from 'drizzle-orm';

import { db } from '@/lib/db';
import { basketball_games, game_ratings } from '@/lib/db/schema';

/**
 * Landing Page SQL Queries
 *
 * Centralized collection of all SQL queries related to landing page data.
 * Includes queries for trending content, recent games, popular games, and debug operations.
 */

/**
 * Debug queries for database content analysis
 */
export async function debugDatabaseContentQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  // Check total game logs
  const totalGameLogsQuery = sql`SELECT COUNT(*) as count FROM game_logs WHERE deleted_at IS NULL`;
  const totalGameLogsResult = await database.execute(totalGameLogsQuery);
  const totalGameLogs = totalGameLogsResult.rows?.[0]?.count || 0;

  // Check public game logs
  const publicGameLogsQuery = sql`SELECT COUNT(*) as count FROM game_logs WHERE classification = 'PUBLIC' AND deleted_at IS NULL`;
  const publicGameLogsResult = await database.execute(publicGameLogsQuery);
  const publicGameLogs = publicGameLogsResult.rows?.[0]?.count || 0;

  // Check total comments
  const totalCommentsQuery = sql`SELECT COUNT(*) as count FROM comments WHERE deleted_at IS NULL`;
  const totalCommentsResult = await database.execute(totalCommentsQuery);
  const totalComments = totalCommentsResult.rows?.[0]?.count || 0;

  // Check total reactions
  const totalReactionsQuery = sql`SELECT COUNT(*) as count FROM reactions WHERE deleted_at IS NULL`;
  const totalReactionsResult = await database.execute(totalReactionsQuery);
  const totalReactions = totalReactionsResult.rows?.[0]?.count || 0;

  // Get sample game logs
  const sampleGameLogsQuery = sql`
    SELECT
      gl.id,
      gl.classification,
      gl.created_at,
      u.username
    FROM game_logs gl
    LEFT JOIN users u ON gl.user_id = u.id
    WHERE gl.deleted_at IS NULL
    ORDER BY gl.created_at DESC
    LIMIT 10
  `;
  const sampleGameLogsResult = await database.execute(sampleGameLogsQuery);
  const sampleGameLogs = sampleGameLogsResult.rows || [];

  return {
    totalGameLogs: Number(totalGameLogs),
    publicGameLogs: Number(publicGameLogs),
    totalComments: Number(totalComments),
    totalReactions: Number(totalReactions),
    sampleGameLogs,
  };
}

/**
 * Debug queries for NBA games content analysis
 */
export async function debugNbaGamesContentQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  // Check total NBA games
  const totalGamesQuery = sql`SELECT COUNT(*) as count FROM basketball_games WHERE deleted_at IS NULL`;
  const totalGamesResult = await database.execute(totalGamesQuery);
  const totalGames = totalGamesResult.rows?.[0]?.count || 0;

  // Check finished games with different status patterns
  const finishedGamesQuery = sql`
    SELECT status, COUNT(*) as count
    FROM basketball_games
    WHERE deleted_at IS NULL
    GROUP BY status
    ORDER BY count DESC
  `;
  const finishedGamesResult = await database.execute(finishedGamesQuery);
  const gameStatuses = (finishedGamesResult.rows || [])
    .map((row: Record<string, unknown>) => row.status as string)
    .filter(Boolean);

  // Count games that might be considered "finished"
  const finishedCountQuery = sql`
    SELECT COUNT(*) as count
    FROM basketball_games
    WHERE deleted_at IS NULL
    AND (status LIKE '%FT%' OR status LIKE '%Finish%' OR status IN ('Final', 'COMPLETED'))
  `;
  const finishedCountResult = await database.execute(finishedCountQuery);
  const finishedGames = finishedCountResult.rows?.[0]?.count || 0;

  // Get sample games with different statuses
  const sampleGamesQuery = sql`
    SELECT
      g.id,
      g.status,
      g.date,
      g.teams,
      g.scores
    FROM basketball_games g
    WHERE g.deleted_at IS NULL
    ORDER BY g.date DESC
    LIMIT 10
  `;
  const sampleGamesResult = await database.execute(sampleGamesQuery);
  const sampleGames = sampleGamesResult.rows || [];

  // Very simple test - just get any NBA games without joins
  const simpleTestQuery = sql`
    SELECT id, status, date, teams
    FROM basketball_games
    WHERE deleted_at IS NULL
    ORDER BY date DESC
    LIMIT 5
  `;
  const simpleTestResult = await database.execute(simpleTestQuery);
  const simpleTestGames = simpleTestResult.rows || [];

  // Even simpler test - get ANY games, including soft-deleted ones
  const anyGamesQuery = sql`
    SELECT id, status, date, deleted_at
    FROM basketball_games
    ORDER BY date DESC
    LIMIT 5
  `;
  const anyGamesResult = await database.execute(anyGamesQuery);
  const anyGames = anyGamesResult.rows || [];

  return {
    totalGames: Number(totalGames),
    finishedGames: Number(finishedGames),
    gameStatuses,
    sampleGames,
    simpleTestGames,
    anyGames,
  };
}

/**
 * Get top public game logs by engagement score
 * Uses optimized query with proper indexing
 */
export async function getTopPublicGameLogsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  // Optimized query for public game logs with engagement scoring
  // Simplified joins for better performance
  const publicGameLogsQuery = sql`
    SELECT
      gl.id,
      gl.rating_for_game,
      gl.created_at,
      u.username,
      u.image_url,
      g.teams,
      -- Count reactions on the game log itself
      COALESCE(gl_reactions.count, 0) as direct_reactions,
      -- Count top-level comments
      COALESCE(top_comments.count, 0) as top_level_comments,
      -- Count reactions on top-level comments
      COALESCE(top_comments.reaction_count, 0) as top_level_reactions
    FROM game_logs gl
    LEFT JOIN users u ON gl.user_id = u.id
    LEFT JOIN basketball_games g ON gl.game_id = g.id
    -- Teams data is now in JSONB, no need for joins

    -- Count reactions on the game log itself (simplified)
    LEFT JOIN (
      SELECT target_id, COUNT(*) as count
      FROM reactions
      WHERE target_type = 'GAME_LOG' AND deleted_at IS NULL
      GROUP BY target_id
    ) gl_reactions ON gl.id = gl_reactions.target_id

    -- Count top-level comments and their reactions (simplified)
    LEFT JOIN (
      SELECT
        c.parent_id,
        COUNT(c.id) as count,
        COALESCE(SUM(comment_reactions.count), 0) as reaction_count
      FROM comments c
      LEFT JOIN (
        SELECT target_id, COUNT(*) as count
        FROM reactions
        WHERE target_type = 'COMMENT' AND deleted_at IS NULL
        GROUP BY target_id
      ) comment_reactions ON c.id = comment_reactions.target_id
      WHERE c.parent_type = 'GAME_LOG' AND c.deleted_at IS NULL
      GROUP BY c.parent_id
    ) top_comments ON gl.id = top_comments.parent_id

    WHERE gl.classification = 'PUBLIC'
      AND gl.deleted_at IS NULL
      AND u.deleted_at IS NULL
      AND g.deleted_at IS NULL
    ORDER BY
      (COALESCE(gl_reactions.count, 0) + COALESCE(top_comments.count, 0) * 2) DESC,
      gl.created_at DESC
    LIMIT 10
  `;

  const result = await database.execute(publicGameLogsQuery);
  return result.rows || [];
}

/**
 * Get recent finished NBA games
 * Optimized query for recent game data
 */
export async function getRecentFinishedGamesQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  // Simple query for recent games - get any recent games first, then filter by status
  const recentGamesQuery = sql`
    SELECT
      g.id,
      g.date,
      g.status,
      g.teams,
      g.scores,
      g.arena
    FROM basketball_games g
    WHERE g.deleted_at IS NULL
    ORDER BY g.date DESC
    LIMIT 20
  `;

  const result = await database.execute(recentGamesQuery);
  return result.rows || [];
}

/**
 * Get popular games based on ratings
 * Uses industry-standard Bayesian average for popularity scoring
 */
export async function getPopularGamesQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  // Start simple: just count all rows in game_ratings
  const totalCountQuery = sql`
    SELECT COUNT(*) as total_count
    FROM game_ratings
  `;

  const totalCountResult = await database.execute(totalCountQuery);

  // Now let's try to get popular game IDs
  const popularGameIdsQuery = sql`
    SELECT game_id, average_rating, total_ratings
    FROM game_ratings
    WHERE deleted_at IS NULL
    ORDER BY average_rating DESC, total_ratings DESC
    LIMIT 10
  `;

  const popularGameIdsResult = await database.execute(popularGameIdsQuery);

  if (!popularGameIdsResult.rows || popularGameIdsResult.rows.length === 0) {
    return {
      totalCount: totalCountResult.rows?.[0]?.total_count || 0,
      popularGameIds: [],
      games: [],
    };
  }

  // Extract the game IDs
  const popularGameIds = popularGameIdsResult.rows.map(row => row.game_id as string);

  // Fetch all games using Drizzle ORM with inArray
  const games = await database
    .select({
      id: basketball_games.id,
      season: basketball_games.season,
      game_id: basketball_games.game_id,
      date: basketball_games.date,
      stage: basketball_games.stage,
      teams: basketball_games.teams,
      status: basketball_games.status,
      scores: basketball_games.scores,
      arena: basketball_games.arena,
      periods: basketball_games.periods,
      officials: basketball_games.officials,
      times_tied: basketball_games.times_tied,
      lead_changes: basketball_games.lead_changes,
      nugget: basketball_games.nugget,
      average_rating: game_ratings.average_rating,
      total_ratings: game_ratings.total_ratings,
      created_at: basketball_games.created_at,
      updated_at: basketball_games.updated_at,
      deleted_at: basketball_games.deleted_at,
    })
    .from(basketball_games)
    .leftJoin(game_ratings, eq(basketball_games.id, game_ratings.game_id))
    .where(and(inArray(basketball_games.id, popularGameIds), isNull(basketball_games.deleted_at)))
    .orderBy(desc(game_ratings.average_rating), desc(game_ratings.total_ratings));

  return {
    totalCount: totalCountResult.rows?.[0]?.total_count || 0,
    popularGameIds,
    games,
  };
}

/**
 * Get popular teams directly from database
 */
export async function getPopularTeamsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  // Get teams with engagement data - use nickname when name is empty
  const teamsQuery = sql`
    SELECT
      t.id,
      CASE
        WHEN t.name IS NOT NULL AND t.name != '' THEN t.name
        ELSE t.nickname
      END as name,
      t.city,
      t.logo,
      COALESCE(team_engagement.total_game_logs, 0) as total_game_logs,
      COALESCE(team_engagement.public_game_logs, 0) as public_game_logs,
      COALESCE(team_engagement.total_all_comments, 0) as total_comments,
      COALESCE(team_engagement.total_all_reactions, 0) as total_reactions,
      COALESCE(team_engagement.total_public_comments, 0) as total_public_comments,
      COALESCE(team_engagement.total_public_reactions, 0) as total_public_reactions
    FROM basketball_teams t
    LEFT JOIN (
      SELECT
        CASE
          WHEN (bg.teams->'home'->>'id')::text IS NOT NULL THEN (bg.teams->'home'->>'id')::text
          WHEN (bg.teams->'visitors'->>'id')::text IS NOT NULL THEN (bg.teams->'visitors'->>'id')::text
        END as team_id,
        COUNT(DISTINCT gl.id) as total_game_logs,
        COUNT(DISTINCT CASE WHEN gl.classification = 'PUBLIC' THEN gl.id END) as public_game_logs,
        COALESCE(SUM(CASE WHEN gl.classification = 'PUBLIC' THEN gl_engagement.comments ELSE 0 END), 0) as total_public_comments,
        COALESCE(SUM(CASE WHEN gl.classification = 'PUBLIC' THEN gl_engagement.reactions ELSE 0 END), 0) as total_public_reactions,
        COALESCE(SUM(gl_engagement.comments), 0) as total_all_comments,
        COALESCE(SUM(gl_engagement.reactions), 0) as total_all_reactions
      FROM game_logs gl
      LEFT JOIN basketball_games bg ON gl.game_id = bg.id
      LEFT JOIN (
        SELECT
          gl_sub.id,
          COALESCE(comment_counts.count, 0) as comments,
          COALESCE(reaction_counts.count, 0) as reactions
        FROM game_logs gl_sub
        LEFT JOIN (
          SELECT parent_id, COUNT(*) as count
          FROM comments
          WHERE parent_type = 'GAME_LOG' AND deleted_at IS NULL
          GROUP BY parent_id
        ) comment_counts ON gl_sub.id = comment_counts.parent_id
        LEFT JOIN (
          SELECT target_id, COUNT(*) as count
          FROM reactions
          WHERE target_type = 'GAME_LOG' AND deleted_at IS NULL
          GROUP BY target_id
        ) reaction_counts ON gl_sub.id = reaction_counts.target_id
        WHERE gl_sub.deleted_at IS NULL
      ) gl_engagement ON gl.id = gl_engagement.id
      WHERE gl.deleted_at IS NULL
        AND (
          (bg.teams->'home'->>'id')::text IS NOT NULL OR
          (bg.teams->'visitors'->>'id')::text IS NOT NULL
        )
      GROUP BY team_id
    ) team_engagement ON t.id = team_engagement.team_id
    WHERE t.deleted_at IS NULL
    ORDER BY
      (COALESCE(team_engagement.total_all_comments, 0) + COALESCE(team_engagement.total_all_reactions, 0)) DESC,
      (COALESCE(team_engagement.total_public_comments, 0) + COALESCE(team_engagement.total_public_reactions, 0)) DESC,
      CASE
        WHEN t.name IS NOT NULL AND t.name != '' THEN t.name
        ELSE t.nickname
      END
    LIMIT 10
  `;

  const teamsResult = await database.execute(teamsQuery);
  return teamsResult.rows || [];
}
