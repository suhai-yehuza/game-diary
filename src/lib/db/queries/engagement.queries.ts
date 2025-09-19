import { sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import type { IPlayerEngagementData } from '@/types';

/**
 * Engagement SQL Queries
 *
 * Centralized collection of all SQL queries related to engagement metrics.
 * Includes queries for counting comments, reactions, and calculating engagement scores.
 */

/**
 * Get comprehensive engagement data for a specific game
 * This query aggregates all game logs for a game and counts their engagement
 */

/**
 * Get comprehensive engagement data for a specific team
 * This query aggregates all game logs mentioning a team and counts their engagement
 */
export async function getTeamEngagementQuery(teamId: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const engagementQuery = sql`
    SELECT
      -- Game log counts for this team
      COUNT(DISTINCT gl.id) as total_game_logs,
      COUNT(DISTINCT CASE WHEN gl.classification = 'PUBLIC' THEN gl.id END) as public_game_logs,
      COUNT(DISTINCT CASE WHEN gl.classification = 'PRIVATE' THEN gl.id END) as private_game_logs,

      -- Public engagement (only on public game logs)
      COALESCE(SUM(CASE WHEN gl.classification = 'PUBLIC' THEN gl_engagement.comments ELSE 0 END), 0) as total_public_comments,
      COALESCE(SUM(CASE WHEN gl.classification = 'PUBLIC' THEN gl_engagement.reactions ELSE 0 END), 0) as total_public_reactions,

      -- All engagement (on both public and private game logs)
      COALESCE(SUM(gl_engagement.comments), 0) as total_all_comments,
      COALESCE(SUM(gl_engagement.reactions), 0) as total_all_reactions,

      -- User engagement diversity
      COUNT(DISTINCT gl.user_id) as unique_users_logged,
      COUNT(DISTINCT CASE WHEN gl.classification = 'PUBLIC' THEN gl.user_id END) as unique_public_users

    FROM game_logs gl
    LEFT JOIN basketball_games bg ON gl.game_id = bg.id
    LEFT JOIN (
      SELECT
        gl_sub.id,
        -- Comments and reactions for this game log
        COALESCE(comment_counts.count, 0) as comments,
        COALESCE(reaction_counts.count, 0) as reactions

      FROM game_logs gl_sub

      -- Comments on this game log
      LEFT JOIN (
        SELECT parent_id, COUNT(*) as count
        FROM comments
        WHERE parent_type = 'GAME_LOG'
          AND deleted_at IS NULL
        GROUP BY parent_id
      ) comment_counts ON gl_sub.id = comment_counts.parent_id

      -- Reactions on this game log
      LEFT JOIN (
        SELECT target_id, COUNT(*) as count
        FROM reactions
        WHERE target_type = 'GAME_LOG'
          AND deleted_at IS NULL
        GROUP BY target_id
      ) reaction_counts ON gl_sub.id = reaction_counts.target_id

      WHERE gl_sub.deleted_at IS NULL
    ) gl_engagement ON gl.id = gl_engagement.id

    WHERE gl.deleted_at IS NULL
      AND (
        (bg.teams->>'home'->>'id')::text = ${teamId} OR
        (bg.teams->>'visitors'->>'id')::text = ${teamId}
      )
  `;

  const result = await database.execute(engagementQuery);
  return (
    result.rows?.[0] || {
      total_game_logs: 0,
      public_game_logs: 0,
      private_game_logs: 0,
      total_public_comments: 0,
      total_public_reactions: 0,
      total_all_comments: 0,
      total_all_reactions: 0,
      unique_users_logged: 0,
      unique_public_users: 0,
    }
  );
}

/**
 * Get comprehensive engagement data for a specific player
 * This query aggregates all game logs mentioning a player and counts their engagement
 */
export function getPlayerEngagementQuery(_playerId: string): IPlayerEngagementData {
  // For now, return 0 engagement to avoid database connection issues
  // The Popular Players API should use the batch query instead
  return {
    total_game_logs: 0,
    public_game_logs: 0,
    private_game_logs: 0,
    total_public_comments: 0,
    total_public_reactions: 0,
    total_all_comments: 0,
    total_all_reactions: 0,
    unique_users_logged: 0,
    unique_public_users: 0,
  };
}

/**
 * Get engagement data for multiple players in a single query
 * This is more efficient than individual queries for each player
 */
export async function getBatchPlayerEngagementQuery(
  playerIds: string[]
): Promise<Map<string, IPlayerEngagementData>> {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  // Limit batch size to prevent connection pool exhaustion
  const MAX_BATCH_SIZE = 1000;
  if (playerIds.length > MAX_BATCH_SIZE) {
    // Process only the first batch to avoid connection issues
    playerIds = playerIds.slice(0, MAX_BATCH_SIZE);
  }

  try {
    // Get engagement data for all players in a single optimized query
    // Use string interpolation to handle potential data type mismatches
    const playerIdsString = playerIds.map(id => `'${id}'`).join(',');

    const engagementResult = await database.execute(
      sql.raw(`
      SELECT
        COALESCE(pc.parent_id, pr.target_id) as player_id,
        COALESCE(pc.comment_count, 0) as total_public_comments,
        COALESCE(pr.reaction_count, 0) as total_public_reactions,
        COALESCE(pc.unique_users, 0) as unique_public_users
      FROM (
        SELECT
          parent_id,
          COUNT(*) as comment_count,
          COUNT(DISTINCT user_id) as unique_users
        FROM public_comments
        WHERE parent_type = 'BASKETBALL_PLAYER'
        AND parent_id IN (${playerIdsString})
        AND deleted_at IS NULL
        GROUP BY parent_id
      ) pc
      FULL OUTER JOIN (
        SELECT
          target_id,
          COUNT(*) as reaction_count
        FROM public_reactions
        WHERE target_type = 'BASKETBALL_PLAYER'
        AND target_id IN (${playerIdsString})
        AND deleted_at IS NULL
        GROUP BY target_id
      ) pr ON pc.parent_id = pr.target_id
    `)
    );

    // Create a map of player engagement data
    const engagementMap = new Map<string, IPlayerEngagementData>();

    // Initialize all players with zero engagement
    for (const playerId of playerIds) {
      engagementMap.set(playerId, {
        total_game_logs: 0,
        public_game_logs: 0,
        private_game_logs: 0,
        total_public_comments: 0,
        total_public_reactions: 0,
        total_all_comments: 0,
        total_all_reactions: 0,
        unique_users_logged: 0,
        unique_public_users: 0,
      });
    }

    // Update with actual engagement data
    for (const row of engagementResult.rows || []) {
      const playerId = row.player_id?.toString() || '';
      if (playerId && engagementMap.has(playerId)) {
        const comments = Number(row.total_public_comments || 0);
        const reactions = Number(row.total_public_reactions || 0);
        const uniqueUsers = Number(row.unique_public_users || 0);

        engagementMap.set(playerId, {
          total_game_logs: 0,
          public_game_logs: 0,
          private_game_logs: 0,
          total_public_comments: comments,
          total_public_reactions: reactions,
          total_all_comments: comments,
          total_all_reactions: reactions,
          unique_users_logged: uniqueUsers,
          unique_public_users: uniqueUsers,
        });
      }
    }

    return engagementMap;
  } catch (error) {
    // Log error for debugging but don't expose details in production
    console.error('Error fetching batch player engagement:', error);

    // Return zero engagement map on error
    const engagementMap = new Map<string, IPlayerEngagementData>();
    for (const playerId of playerIds) {
      engagementMap.set(playerId, {
        total_game_logs: 0,
        public_game_logs: 0,
        private_game_logs: 0,
        total_public_comments: 0,
        total_public_reactions: 0,
        total_all_comments: 0,
        total_all_reactions: 0,
        unique_users_logged: 0,
        unique_public_users: 0,
      });
    }
    return engagementMap;
  }
}

/**
 * Get comprehensive engagement data for a specific user/fan
 * This query aggregates all activity by a user and counts their engagement
 */
export async function getUserEngagementQuery(userId: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const engagementQuery = sql`
    SELECT
      -- Game log counts for this user
      COUNT(DISTINCT gl.id) as total_game_logs,
      COUNT(DISTINCT CASE WHEN gl.classification = 'PUBLIC' THEN gl.id END) as public_game_logs,
      COUNT(DISTINCT CASE WHEN gl.classification = 'PRIVATE' THEN gl.id END) as private_game_logs,

      -- Comments by this user
      COALESCE(user_comments.count, 0) as total_comments,
      COALESCE(user_public_comments.count, 0) as public_comments,

      -- Reactions by this user
      COALESCE(user_reactions.count, 0) as total_reactions,
      COALESCE(user_public_reactions.count, 0) as public_reactions,

      -- Engagement on user's content
      COALESCE(user_received_comments.count, 0) as received_comments,
      COALESCE(user_received_reactions.count, 0) as received_reactions

    FROM users u
    LEFT JOIN game_logs gl ON u.id = gl.user_id AND gl.deleted_at IS NULL
    LEFT JOIN (
      SELECT user_id, COUNT(*) as count
      FROM comments
      WHERE deleted_at IS NULL
      GROUP BY user_id
    ) user_comments ON u.id = user_comments.user_id
    LEFT JOIN (
      SELECT c.user_id, COUNT(*) as count
      FROM comments c
      JOIN game_logs gl ON c.parent_id = gl.id
      WHERE c.deleted_at IS NULL AND gl.classification = 'PUBLIC'
      GROUP BY c.user_id
    ) user_public_comments ON u.id = user_public_comments.user_id
    LEFT JOIN (
      SELECT user_id, COUNT(*) as count
      FROM reactions
      WHERE deleted_at IS NULL
      GROUP BY user_id
    ) user_reactions ON u.id = user_reactions.user_id
    LEFT JOIN (
      SELECT user_id, COUNT(*) as count
      FROM reactions r
      JOIN game_logs gl ON r.target_id = gl.id
      WHERE r.deleted_at IS NULL AND gl.classification = 'PUBLIC'
      GROUP BY user_id
    ) user_public_reactions ON u.id = user_public_reactions.user_id
    LEFT JOIN (
      SELECT gl.user_id, COUNT(*) as count
      FROM game_logs gl
      JOIN comments c ON gl.id = c.parent_id
      WHERE c.parent_type = 'GAME_LOG' AND c.deleted_at IS NULL AND gl.deleted_at IS NULL
      GROUP BY gl.user_id
    ) user_received_comments ON u.id = user_received_comments.user_id
    LEFT JOIN (
      SELECT gl.user_id, COUNT(*) as count
      FROM game_logs gl
      JOIN reactions r ON gl.id = r.target_id
      WHERE r.target_type = 'GAME_LOG' AND r.deleted_at IS NULL AND gl.deleted_at IS NULL
      GROUP BY gl.user_id
    ) user_received_reactions ON u.id = user_received_reactions.user_id

    WHERE u.id = ${userId}
      AND u.deleted_at IS NULL
  `;

  const result = await database.execute(engagementQuery);
  return (
    result.rows?.[0] || {
      total_game_logs: 0,
      public_game_logs: 0,
      private_game_logs: 0,
      total_comments: 0,
      public_comments: 0,
      total_reactions: 0,
      public_reactions: 0,
      received_comments: 0,
      received_reactions: 0,
    }
  );
}
export async function getGameEngagementQuery(gameId: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const engagementQuery = sql`
    SELECT
      -- Game log counts
      COUNT(DISTINCT gl.id) as total_game_logs,
      COUNT(DISTINCT CASE WHEN gl.classification = 'PUBLIC' THEN gl.id END) as public_game_logs,
      COUNT(DISTINCT CASE WHEN gl.classification = 'PRIVATE' THEN gl.id END) as private_game_logs,

      -- Public engagement (only on public game logs)
      COALESCE(SUM(CASE WHEN gl.classification = 'PUBLIC' THEN gl_engagement.comments ELSE 0 END), 0) as total_public_comments,
      COALESCE(SUM(CASE WHEN gl.classification = 'PUBLIC' THEN gl_engagement.reactions ELSE 0 END), 0) as total_public_reactions,

      -- All engagement (on both public and private game logs)
      COALESCE(SUM(gl_engagement.comments), 0) as total_all_comments,
      COALESCE(SUM(gl_engagement.reactions), 0) as total_all_reactions,

      -- User engagement diversity
      COUNT(DISTINCT gl.user_id) as unique_users_logged,
      COUNT(DISTINCT CASE WHEN gl.classification = 'PUBLIC' THEN gl.user_id END) as unique_public_users

    FROM game_logs gl
    LEFT JOIN (
      SELECT
        gl_sub.id,
        -- Comments and reactions for this game log
        COALESCE(comment_counts.count, 0) as comments,
        COALESCE(reaction_counts.count, 0) as reactions

      FROM game_logs gl_sub

      -- Comments on this game log
      LEFT JOIN (
        SELECT parent_id, COUNT(*) as count
        FROM comments
        WHERE parent_type = 'GAME_LOG'
          AND deleted_at IS NULL
        GROUP BY parent_id
      ) comment_counts ON gl_sub.id = comment_counts.parent_id

      -- Reactions on this game log
      LEFT JOIN (
        SELECT target_id, COUNT(*) as count
        FROM reactions
        WHERE target_type = 'GAME_LOG'
          AND deleted_at IS NULL
        GROUP BY target_id
      ) reaction_counts ON gl_sub.id = reaction_counts.target_id

      WHERE gl_sub.game_id = ${gameId}
        AND gl_sub.deleted_at IS NULL
    ) gl_engagement ON gl.id = gl_engagement.id

    WHERE gl.game_id = ${gameId}
      AND gl.deleted_at IS NULL
  `;

  const result = await database.execute(engagementQuery);
  return (
    result.rows?.[0] || {
      total_game_logs: 0,
      public_game_logs: 0,
      private_game_logs: 0,
      total_public_comments: 0,
      total_public_reactions: 0,
      total_all_comments: 0,
      total_all_reactions: 0,
      unique_users_logged: 0,
      unique_public_users: 0,
    }
  );
}

/**
 * Get engagement data for multiple games in a single query
 * More efficient than calling getGameEngagementQuery multiple times
 */
export async function getMultipleGamesEngagementQuery(gameIds: string[]) {
  if (gameIds.length === 0) {
    return [];
  }

  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const engagementQuery = sql`
    SELECT
      gl.game_id,
      COALESCE(SUM(gl_engagement.public_comments), 0) as total_public_comments,
      COALESCE(SUM(gl_engagement.public_reactions), 0) as total_public_reactions
    FROM (
      SELECT
        gl.game_id,
        gl.id,
        -- Count public comments on game logs for this game
        COALESCE(comment_counts.count, 0) as public_comments,
        -- Count public reactions on game logs for this game
        COALESCE(reaction_counts.count, 0) as public_reactions
      FROM game_logs gl
      LEFT JOIN (
        SELECT parent_id, COUNT(*) as count
        FROM comments
        WHERE parent_type = 'GAME_LOG'
          AND deleted_at IS NULL
        GROUP BY parent_id
      ) comment_counts ON gl.id = comment_counts.parent_id
      LEFT JOIN (
        SELECT target_id, COUNT(*) as count
        FROM reactions
        WHERE target_type = 'GAME_LOG'
          AND deleted_at IS NULL
        GROUP BY target_id
      ) reaction_counts ON gl.id = reaction_counts.target_id
      WHERE gl.game_id IN (${gameIds.map(id => `'${id}'`).join(', ')})
        AND gl.classification = 'PUBLIC'
        AND gl.deleted_at IS NULL
    ) gl_engagement
    GROUP BY gl.game_id
  `;

  const result = await database.execute(engagementQuery);
  return result.rows || [];
}

/**
 * Get top games by engagement score
 * Returns games sorted by total public comments and reactions
 */
export async function getTopGamesByEngagementQuery(limit = 10) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const topEngagementQuery = sql`
    SELECT
      gl.game_id,
      COALESCE(SUM(gl_engagement.public_comments), 0) as total_public_comments,
      COALESCE(SUM(gl_engagement.public_reactions), 0) as total_public_reactions,
      (COALESCE(SUM(gl_engagement.public_comments), 0) + COALESCE(SUM(gl_engagement.public_reactions), 0)) as total_engagement
    FROM (
      SELECT
        gl.game_id,
        gl.id,
        -- Count public comments on game logs for this game
        COALESCE(comment_counts.count, 0) as public_comments,
        -- Count public reactions on game logs for this game
        COALESCE(reaction_counts.count, 0) as public_reactions
      FROM game_logs gl
      LEFT JOIN (
        SELECT parent_id, COUNT(*) as count
        FROM comments
        WHERE parent_type = 'GAME_LOG'
          AND deleted_at IS NULL
        GROUP BY parent_id
      ) comment_counts ON gl.id = comment_counts.parent_id
      LEFT JOIN (
        SELECT target_id, COUNT(*) as count
        FROM reactions
        WHERE target_type = 'GAME_LOG'
          AND deleted_at IS NULL
        GROUP BY target_id
      ) reaction_counts ON gl.id = reaction_counts.target_id
      WHERE gl.classification = 'PUBLIC'
        AND gl.deleted_at IS NULL
    ) gl_engagement
    GROUP BY gl.game_id
    HAVING (COALESCE(SUM(gl_engagement.public_comments), 0) + COALESCE(SUM(gl_engagement.public_reactions), 0)) > 0
    ORDER BY total_engagement DESC
    LIMIT ${limit}
  `;

  const result = await database.execute(topEngagementQuery);
  return result.rows || [];
}
