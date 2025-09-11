import { sql } from 'drizzle-orm';

import { db } from '@/lib/db';

/**
 * Analytics SQL Queries
 *
 * Centralized collection of all SQL queries related to analytics and reporting.
 * Includes user activity, content statistics, and performance metrics.
 */

/**
 * Get user activity analytics
 */
export async function getUserActivityAnalyticsQuery(
  userId?: string,
  dateFrom?: string,
  dateTo?: string
) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const conditions = [];
  if (userId) {
    conditions.push(sql`user_id = ${userId}`);
  }
  if (dateFrom) {
    conditions.push(sql`created_at >= ${dateFrom}`);
  }
  if (dateTo) {
    conditions.push(sql`created_at <= ${dateTo}`);
  }

  const whereClause =
    conditions.length > 0 ? sql`WHERE ${sql.join(conditions, sql` AND `)}` : sql``;

  const result = await database.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM game_logs WHERE deleted_at IS NULL ${whereClause}) as game_logs_count,
      (SELECT COUNT(*) FROM comments WHERE deleted_at IS NULL ${whereClause}) as comments_count,
      (SELECT COUNT(*) FROM reactions WHERE deleted_at IS NULL ${whereClause}) as reactions_count,
      (SELECT COUNT(*) FROM friendships WHERE deleted_at IS NULL ${whereClause}) as friendships_count
  `);

  return (
    result.rows[0] || {
      game_logs_count: 0,
      comments_count: 0,
      reactions_count: 0,
      friendships_count: 0,
    }
  );
}

/**
 * Get content statistics
 */
export async function getContentStatisticsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
      (SELECT COUNT(*) FROM game_logs WHERE deleted_at IS NULL) as total_game_logs,
      (SELECT COUNT(*) FROM comments WHERE deleted_at IS NULL) as total_comments,
      (SELECT COUNT(*) FROM reactions WHERE deleted_at IS NULL) as total_reactions,
      (SELECT COUNT(*) FROM basketball_games WHERE deleted_at IS NULL) as total_games,
      (SELECT COUNT(*) FROM basketball_teams WHERE deleted_at IS NULL) as total_teams,
      (SELECT COUNT(*) FROM basketball_players WHERE deleted_at IS NULL) as total_players,
      (SELECT COUNT(*) FROM friendships WHERE deleted_at IS NULL AND status = 'ACCEPTED') as total_friendships
  `);

  return (
    result.rows[0] || {
      total_users: 0,
      total_game_logs: 0,
      total_comments: 0,
      total_reactions: 0,
      total_games: 0,
      total_teams: 0,
      total_players: 0,
      total_friendships: 0,
    }
  );
}

/**
 * Get user growth analytics
 */
export async function getUserGrowthAnalyticsQuery(days = 30) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      DATE(created_at) as date,
      COUNT(*) as new_users
    FROM users
    WHERE deleted_at IS NULL
      AND created_at >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `);

  return result.rows;
}

/**
 * Get game log activity analytics
 */
export async function getGameLogActivityAnalyticsQuery(days = 30) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      DATE(created_at) as date,
      COUNT(*) as new_game_logs,
      AVG(rating_for_game) as average_rating
    FROM game_logs
    WHERE deleted_at IS NULL
      AND created_at >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `);

  return result.rows;
}

/**
 * Get comment activity analytics
 */
export async function getCommentActivityAnalyticsQuery(days = 30) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      DATE(created_at) as date,
      COUNT(*) as new_comments,
      AVG(depth) as average_depth
    FROM comments
    WHERE deleted_at IS NULL
      AND created_at >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `);

  return result.rows;
}

/**
 * Get reaction activity analytics
 */
export async function getReactionActivityAnalyticsQuery(days = 30) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      DATE(created_at) as date,
      COUNT(*) as new_reactions,
      emoji,
      COUNT(*) as emoji_count
    FROM reactions
    WHERE deleted_at IS NULL
      AND created_at >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(created_at), emoji
    ORDER BY date DESC, emoji_count DESC
  `);

  return result.rows;
}

/**
 * Get top users by activity
 */
export async function getTopUsersByActivityQuery(limit = 10) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      u.id,
      u.username,
      u.first_name,
      u.last_name,
      u.image_url,
      u.isAdmin,
      (
        (SELECT COUNT(*) FROM game_logs WHERE user_id = u.id AND deleted_at IS NULL) +
        (SELECT COUNT(*) FROM comments WHERE user_id = u.id AND deleted_at IS NULL) +
        (SELECT COUNT(*) FROM reactions WHERE user_id = u.id AND deleted_at IS NULL)
      ) as total_activity
    FROM users u
    WHERE u.deleted_at IS NULL
    ORDER BY total_activity DESC
    LIMIT ${limit}
  `);

  return result.rows;
}

/**
 * Get top games by game logs
 */
export async function getTopGamesByGameLogsQuery(limit = 10) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      bg.id,
      bg.date,
      bg.teams,
      bg.scores,
      COUNT(gl.id) as game_log_count,
      AVG(gl.rating_for_game) as average_rating
    FROM basketball_games bg
    LEFT JOIN game_logs gl ON bg.id = gl.game_id AND gl.deleted_at IS NULL
    WHERE bg.deleted_at IS NULL
    GROUP BY bg.id, bg.date, bg.teams, bg.scores
    ORDER BY game_log_count DESC
    LIMIT ${limit}
  `);

  return result.rows;
}

/**
 * Get top teams by game logs
 */
export async function getTopTeamsByGameLogsQuery(limit = 10) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      bt.id,
      bt.name,
      COUNT(gl.id) as game_log_count,
      AVG(gl.rating_for_game) as average_rating
    FROM basketball_teams bt
    LEFT JOIN basketball_games bg ON (
      (bg.teams->'home'->>'id')::text = bt.id
      OR (bg.teams->'away'->>'id')::text = bt.id
    ) AND bg.deleted_at IS NULL
    LEFT JOIN game_logs gl ON bg.id = gl.game_id AND gl.deleted_at IS NULL
    WHERE bt.deleted_at IS NULL
    GROUP BY bt.id, bt.name
    ORDER BY game_log_count DESC
    LIMIT ${limit}
  `);

  return result.rows;
}

/**
 * Get engagement metrics
 */
export async function getEngagementMetricsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
      (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '30 days') as active_users_30d,
      (SELECT COUNT(*) FROM game_logs WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '30 days') as game_logs_30d,
      (SELECT COUNT(*) FROM comments WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '30 days') as comments_30d,
      (SELECT COUNT(*) FROM reactions WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '30 days') as reactions_30d,
      (SELECT COUNT(*) FROM friendships WHERE deleted_at IS NULL AND status = 'ACCEPTED' AND created_at >= NOW() - INTERVAL '30 days') as friendships_30d
  `);

  return (
    result.rows[0] || {
      total_users: 0,
      active_users_30d: 0,
      game_logs_30d: 0,
      comments_30d: 0,
      reactions_30d: 0,
      friendships_30d: 0,
    }
  );
}

/**
 * Get content distribution analytics
 */
export async function getContentDistributionAnalyticsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      'game_logs' as content_type,
      classification as category,
      COUNT(*) as count
    FROM game_logs
    WHERE deleted_at IS NULL
    GROUP BY classification

    UNION ALL

    SELECT
      'comments' as content_type,
      parent_type as category,
      COUNT(*) as count
    FROM comments
    WHERE deleted_at IS NULL
    GROUP BY parent_type

    UNION ALL

    SELECT
      'reactions' as content_type,
      target_type as category,
      COUNT(*) as count
    FROM reactions
    WHERE deleted_at IS NULL
    GROUP BY target_type
  `);

  return result.rows;
}

/**
 * Get performance metrics
 */
export async function getPerformanceMetricsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      (SELECT AVG(rating_for_game) FROM game_logs WHERE deleted_at IS NULL) as average_game_rating,
      (SELECT AVG(depth) FROM comments WHERE deleted_at IS NULL) as average_comment_depth,
      (SELECT COUNT(DISTINCT emoji) FROM reactions WHERE deleted_at IS NULL) as unique_reaction_emojis,
      (SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) FROM game_logs WHERE deleted_at IS NULL AND updated_at IS NOT NULL) as average_edit_time_seconds
  `);

  return (
    result.rows[0] || {
      average_game_rating: 0,
      average_comment_depth: 0,
      unique_reaction_emojis: 0,
      average_edit_time_seconds: 0,
    }
  );
}
