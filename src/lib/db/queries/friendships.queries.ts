import { and, eq, sql, isNull, count, or } from 'drizzle-orm';

import { db } from '@/lib/db';
import { friendships, users } from '@/lib/db/schema';
import { FRIENDSHIP_STATUS } from '@/types';

/**
 * Friendships SQL Queries
 *
 * Centralized collection of all SQL queries related to friendships.
 * Includes friendship status checks, friend lists, and friend requests.
 */

/**
 * Check if two users are friends
 */
export async function checkFriendshipStatusQuery(
  userId1: string,
  userId2: string
): Promise<boolean> {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT EXISTS(
      SELECT 1 FROM friendships
      WHERE status = ${FRIENDSHIP_STATUS.ACCEPTED}
      AND (
        (user_id = ${userId1} AND friend_id = ${userId2})
        OR
        (user_id = ${userId2} AND friend_id = ${userId1})
      )
      AND deleted_at IS NULL
    ) as is_friend
  `);

  return Boolean(result?.rows?.[0]?.is_friend);
}

/**
 * Get friendship between two users
 */
export async function getFriendshipQuery(userId1: string, userId2: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database
    .select()
    .from(friendships)
    .where(
      and(
        isNull(friendships.deleted_at),
        or(
          and(eq(friendships.user_id, userId1), eq(friendships.friend_id, userId2)),
          and(eq(friendships.user_id, userId2), eq(friendships.friend_id, userId1))
        )
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Get user's friends (accepted friendships)
 */
export async function getUserFriendsQuery(userId: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      id: friendships.id,
      status: friendships.status,
      created_at: friendships.created_at,
      updated_at: friendships.updated_at,
      user_id: friendships.user_id,
      friend_id: friendships.friend_id,
      // Get friend user data
      friend: {
        id: users.id,
        username: users.username,
        first_name: users.first_name,
        last_name: users.last_name,
        image_url: users.image_url,
        isAdmin: users.isAdmin,
      },
    })
    .from(friendships)
    .innerJoin(users, eq(friendships.friend_id, users.id))
    .where(
      and(
        eq(friendships.user_id, userId),
        eq(friendships.status, FRIENDSHIP_STATUS.ACCEPTED),
        isNull(friendships.deleted_at)
      )
    )
    .limit(limit)
    .offset(offset);
}

/**
 * Get pending friend requests for a user (received)
 */
export async function getPendingFriendRequestsQuery(userId: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      id: friendships.id,
      status: friendships.status,
      created_at: friendships.created_at,
      updated_at: friendships.updated_at,
      user_id: friendships.user_id,
      friend_id: friendships.friend_id,
      // Get requester user data
      requester: {
        id: users.id,
        username: users.username,
        first_name: users.first_name,
        last_name: users.last_name,
        image_url: users.image_url,
        isAdmin: users.isAdmin,
      },
    })
    .from(friendships)
    .innerJoin(users, eq(friendships.user_id, users.id))
    .where(
      and(
        eq(friendships.friend_id, userId),
        eq(friendships.status, FRIENDSHIP_STATUS.PENDING),
        isNull(friendships.deleted_at)
      )
    )
    .limit(limit)
    .offset(offset);
}

/**
 * Get sent friend requests for a user
 */
export async function getSentFriendRequestsQuery(userId: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database
    .select({
      id: friendships.id,
      status: friendships.status,
      created_at: friendships.created_at,
      updated_at: friendships.updated_at,
      user_id: friendships.user_id,
      friend_id: friendships.friend_id,
      // Get recipient user data
      recipient: {
        id: users.id,
        username: users.username,
        first_name: users.first_name,
        last_name: users.last_name,
        image_url: users.image_url,
        isAdmin: users.isAdmin,
      },
    })
    .from(friendships)
    .innerJoin(users, eq(friendships.friend_id, users.id))
    .where(
      and(
        eq(friendships.user_id, userId),
        eq(friendships.status, FRIENDSHIP_STATUS.PENDING),
        isNull(friendships.deleted_at)
      )
    )
    .limit(limit)
    .offset(offset);
}

/**
 * Get friendship counts for a user
 */
export async function getFriendshipCountsQuery(userId: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const [friendsCount, pendingReceivedCount, pendingSentCount] = await Promise.all([
    // Friends count
    database
      .select({ count: count() })
      .from(friendships)
      .where(
        and(
          eq(friendships.user_id, userId),
          eq(friendships.status, FRIENDSHIP_STATUS.ACCEPTED),
          isNull(friendships.deleted_at)
        )
      ),
    // Pending received count
    database
      .select({ count: count() })
      .from(friendships)
      .where(
        and(
          eq(friendships.friend_id, userId),
          eq(friendships.status, FRIENDSHIP_STATUS.PENDING),
          isNull(friendships.deleted_at)
        )
      ),
    // Pending sent count
    database
      .select({ count: count() })
      .from(friendships)
      .where(
        and(
          eq(friendships.user_id, userId),
          eq(friendships.status, FRIENDSHIP_STATUS.PENDING),
          isNull(friendships.deleted_at)
        )
      ),
  ]);

  return {
    friendsCount: friendsCount[0]?.count || 0,
    pendingReceivedCount: pendingReceivedCount[0]?.count || 0,
    pendingSentCount: pendingSentCount[0]?.count || 0,
  };
}

/**
 * Get mutual friends between two users
 */
export async function getMutualFriendsQuery(
  userId1: string,
  userId2: string,
  limit = 20,
  offset = 0
) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database.execute(sql`
    SELECT DISTINCT u.id, u.username, u.first_name, u.last_name, u.image_url, u.isAdmin
    FROM users u
    INNER JOIN friendships f1 ON f1.friend_id = u.id
    INNER JOIN friendships f2 ON f2.friend_id = u.id
    WHERE f1.user_id = ${userId1}
      AND f1.status = ${FRIENDSHIP_STATUS.ACCEPTED}
      AND f1.deleted_at IS NULL
      AND f2.user_id = ${userId2}
      AND f2.status = ${FRIENDSHIP_STATUS.ACCEPTED}
      AND f2.deleted_at IS NULL
    ORDER BY u.username
    LIMIT ${limit}
    OFFSET ${offset}
  `);
}

/**
 * Get friendship activity (recent friend requests and acceptances)
 */
export async function getFriendshipActivityQuery(userId: string, limit = 20, offset = 0) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  return database.execute(sql`
    SELECT
      f.id,
      f.status,
      f.created_at,
      f.updated_at,
      f.user_id,
      f.friend_id,
      u.username,
      u.first_name,
      u.last_name,
      u.image_url,
      u.isAdmin,
      CASE
        WHEN f.user_id = ${userId} THEN 'sent'
        WHEN f.friend_id = ${userId} THEN 'received'
      END as direction
    FROM friendships f
    INNER JOIN users u ON (
      CASE
        WHEN f.user_id = ${userId} THEN f.friend_id = u.id
        WHEN f.friend_id = ${userId} THEN f.user_id = u.id
      END
    )
    WHERE (f.user_id = ${userId} OR f.friend_id = ${userId})
      AND f.deleted_at IS NULL
      AND f.status IN (${FRIENDSHIP_STATUS.PENDING}, ${FRIENDSHIP_STATUS.ACCEPTED})
    ORDER BY f.updated_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `);
}

/**
 * Search for potential friends (users not already friends)
 */
export async function searchPotentialFriendsQuery(
  userId: string,
  searchTerm: string,
  limit = 20,
  offset = 0
) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const searchPattern = `%${searchTerm}%`;

  return database.execute(sql`
    SELECT u.id, u.username, u.first_name, u.last_name, u.image_url, u.isAdmin
    FROM users u
    WHERE u.id != ${userId}
      AND u.deleted_at IS NULL
      AND (
        u.username ILIKE ${searchPattern}
        OR u.first_name ILIKE ${searchPattern}
        OR u.last_name ILIKE ${searchPattern}
      )
      AND NOT EXISTS (
        SELECT 1 FROM friendships f
        WHERE f.deleted_at IS NULL
          AND (
            (f.user_id = ${userId} AND f.friend_id = u.id)
            OR (f.user_id = u.id AND f.friend_id = ${userId})
          )
      )
    ORDER BY u.username
    LIMIT ${limit}
    OFFSET ${offset}
  `);
}

/**
 * Get friendship statistics
 */
export async function getFriendshipStatisticsQuery(userId: string) {
  const database = db();
  if (!database) {
    throw new Error('Database connection not available');
  }

  const result = await database.execute(sql`
    SELECT
      COUNT(CASE WHEN status = ${FRIENDSHIP_STATUS.ACCEPTED} AND user_id = ${userId} THEN 1 END) as friends_count,
      COUNT(CASE WHEN status = ${FRIENDSHIP_STATUS.PENDING} AND user_id = ${userId} THEN 1 END) as sent_requests_count,
      COUNT(CASE WHEN status = ${FRIENDSHIP_STATUS.PENDING} AND friend_id = ${userId} THEN 1 END) as received_requests_count,
      COUNT(CASE WHEN status = ${FRIENDSHIP_STATUS.ACCEPTED} AND user_id = ${userId} AND created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_friends_count
    FROM friendships
    WHERE deleted_at IS NULL
      AND (user_id = ${userId} OR friend_id = ${userId})
  `);

  return (
    result.rows[0] || {
      friends_count: 0,
      sent_requests_count: 0,
      received_requests_count: 0,
      recent_friends_count: 0,
    }
  );
}
