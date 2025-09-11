import { and, eq, sql, isNull, count, ilike, or, desc, asc } from 'drizzle-orm';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

/**
 * Users SQL Queries
 *
 * Centralized collection of all SQL queries related to users.
 * Includes user search, user data retrieval, and user statistics.
 */

/**
 * Get user by ID
 */
export async function getUserByIdQuery(userId: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select()
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deleted_at)))
    .limit(1);

  return result[0] || null;
}

/**
 * Get user by username
 */
export async function getUserByUsernameQuery(username: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select()
    .from(users)
    .where(and(eq(users.username, username), isNull(users.deleted_at)))
    .limit(1);

  return result[0] || null;
}

/**
 * Get user by email
 */
export async function getUserByEmailQuery(email: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select()
    .from(users)
    .where(and(eq(users.email_address, email), isNull(users.deleted_at)))
    .limit(1);

  return result[0] || null;
}

/**
 * Search users by term
 */
export async function searchUsersQuery(searchTerm: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const searchPattern = `%${searchTerm}%`;

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
      updated_at: users.updated_at,
    })
    .from(users)
    .where(
      and(
        isNull(users.deleted_at),
        or(
          ilike(users.username, searchPattern),
          ilike(users.first_name, searchPattern),
          ilike(users.last_name, searchPattern),
          ilike(users.email_address, searchPattern)
        )
      )
    )
    .orderBy(asc(users.username))
    .limit(limit)
    .offset(offset);
}

/**
 * Get users with pagination
 */
export async function getUsersQuery(limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
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
      updated_at: users.updated_at,
    })
    .from(users)
    .where(isNull(users.deleted_at))
    .orderBy(asc(users.username))
    .limit(limit)
    .offset(offset);
}

/**
 * Get user count
 */
export async function getUserCountQuery(): Promise<number> {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select({ count: count() })
    .from(users)
    .where(isNull(users.deleted_at));

  return result[0]?.count || 0;
}

/**
 * Get users by IDs
 */
export async function getUsersByIdsQuery(userIds: string[]) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  if (userIds.length === 0) {
    return [];
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
      updated_at: users.updated_at,
    })
    .from(users)
    .where(and(sql`${users.id} = ANY(${userIds})`, isNull(users.deleted_at)));
}

/**
 * Get recent users
 */
export async function getRecentUsersQuery(limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
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
      updated_at: users.updated_at,
    })
    .from(users)
    .where(isNull(users.deleted_at))
    .orderBy(desc(users.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get admin users
 */
export async function getAdminUsersQuery(limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
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
      updated_at: users.updated_at,
    })
    .from(users)
    .where(and(eq(users.isAdmin, true), isNull(users.deleted_at)))
    .orderBy(asc(users.username))
    .limit(limit)
    .offset(offset);
}

/**
 * Get user statistics
 */
export async function getUserStatisticsQuery() {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      COUNT(*) as total_users,
      COUNT(CASE WHEN isAdmin = true THEN 1 END) as admin_users,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_users,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_users_this_week
    FROM users
    WHERE deleted_at IS NULL
  `);

  return (
    result.rows[0] || {
      total_users: 0,
      admin_users: 0,
      recent_users: 0,
      new_users_this_week: 0,
    }
  );
}

/**
 * Get users by creation date range
 */
export async function getUsersByDateRangeQuery(
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
    .select({
      id: users.id,
      username: users.username,
      first_name: users.first_name,
      last_name: users.last_name,
      email_address: users.email_address,
      image_url: users.image_url,
      isAdmin: users.isAdmin,
      created_at: users.created_at,
      updated_at: users.updated_at,
    })
    .from(users)
    .where(
      and(
        isNull(users.deleted_at),
        sql`${users.created_at} >= ${startDate}`,
        sql`${users.created_at} <= ${endDate}`
      )
    )
    .orderBy(desc(users.created_at))
    .limit(limit)
    .offset(offset);
}

/**
 * Get user activity statistics
 */
export async function getUserActivityStatisticsQuery(userId: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM game_logs WHERE user_id = ${userId} AND deleted_at IS NULL) as game_logs_count,
      (SELECT COUNT(*) FROM comments WHERE user_id = ${userId} AND deleted_at IS NULL) as comments_count,
      (SELECT COUNT(*) FROM reactions WHERE user_id = ${userId} AND deleted_at IS NULL) as reactions_count,
      (SELECT COUNT(*) FROM friendships WHERE user_id = ${userId} AND status = 'ACCEPTED' AND deleted_at IS NULL) as friends_count
  `);

  return (
    result.rows[0] || {
      game_logs_count: 0,
      comments_count: 0,
      reactions_count: 0,
      friends_count: 0,
    }
  );
}

/**
 * Check if username exists
 */
export async function checkUsernameExistsQuery(
  username: string,
  excludeUserId?: string
): Promise<boolean> {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const conditions = [eq(users.username, username), isNull(users.deleted_at)];

  if (excludeUserId) {
    conditions.push(sql`${users.id} != ${excludeUserId}`);
  }

  const result = await database
    .select({ count: count() })
    .from(users)
    .where(and(...conditions));

  return (result[0]?.count || 0) > 0;
}

/**
 * Check if email exists
 */
export async function checkEmailExistsQuery(
  email: string,
  excludeUserId?: string
): Promise<boolean> {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const conditions = [eq(users.email_address, email), isNull(users.deleted_at)];

  if (excludeUserId) {
    conditions.push(sql`${users.id} != ${excludeUserId}`);
  }

  const result = await database
    .select({ count: count() })
    .from(users)
    .where(and(...conditions));

  return (result[0]?.count || 0) > 0;
}
