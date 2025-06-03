import { and, eq, gt, lt, or, sql, gte, lte, desc, asc, type InferSelectModel } from 'drizzle-orm';

import * as schema from '@/lib/db/schema';
import { BusinessLogicError } from '@/lib/graphql/errors';
import { createConnection } from '@/lib/graphql/utils/pagination';
import type { Context } from '@/lib/types/component.types';
import type { DBUser } from '@/lib/types/generated/graphql';

import type { PaginationArgs } from '../common/types';
import { handleResolverError } from '../common/utils';

// Define UserFilters type since it's not exported from graphql types
interface UserFilters {
  search?: string;
  role?: string;
}

// Define UserSearchFilters interface locally until types are generated
interface UserSearchFilters {
  hasGameLogs?: boolean | null;
  minGameLogs?: number | null;
  joinedAfter?: Date | null;
  joinedBefore?: Date | null;
  isVerified?: boolean | null;
  friendshipStatus?: string | null;
  orderBy?: string | null;
}

// Helper function to map user data from either DatabaseRow or InferSelectModel<typeof schema.users>
export function mapUserData(user: InferSelectModel<typeof schema.users>): DBUser {
  return {
    id: user.id,
    username: user.username || '',
    emailAddress: user.emailAddress || '',
    imageUrl: user.imageUrl || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    inboundFriendshipIds: user.inboundFriendshipIds || [],
    outboundFriendshipIds: user.outboundFriendshipIds || [],
    banned: user.banned || false,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
    last_sign_in_at: user.last_sign_in_at,
    password_enabled: user.password_enabled || false,
    two_factor_enabled: user.two_factor_enabled || false,
    email_verified: user.email_verified || false,
    email_verification_strategy: user.email_verification_strategy,
    external_id: user.external_id || '',
    timestamp: user.timestamp,
    comments: [],
    reactions: [],
    gameLogs: [],
    friendships: [],
    initiatedFriendships: [],
    __typename: 'DBUser',
  };
}

export const searchUsers = async (
  _parent: unknown,
  args: PaginationArgs & { searchTerm?: string; filters?: UserSearchFilters },
  { db, user: _currentUser }: Context
) => {
  try {
    const { first = 20, after, searchTerm, filters } = args;
    const limit = first || 20;

    // Build query conditions
    const conditions = [];

    // Search term - search in username, firstName, lastName, emailAddress
    if (searchTerm && searchTerm.trim()) {
      const searchPattern = `%${searchTerm.trim()}%`;
      conditions.push(
        or(
          sql`${schema.users.username} ILIKE ${searchPattern}`,
          sql`${schema.users.firstName} ILIKE ${searchPattern}`,
          sql`${schema.users.lastName} ILIKE ${searchPattern}`,
          sql`${schema.users.emailAddress} ILIKE ${searchPattern}`,
          sql`CONCAT(${schema.users.firstName}, ' ', ${schema.users.lastName}) ILIKE ${searchPattern}`
        )
      );
    }

    // Filter by join date
    if (filters?.joinedAfter) {
      conditions.push(gte(schema.users.createdAt, filters.joinedAfter));
    }
    if (filters?.joinedBefore) {
      conditions.push(lte(schema.users.createdAt, filters.joinedBefore));
    }

    // Filter by email verification
    if (filters?.isVerified !== undefined && filters.isVerified !== null) {
      conditions.push(eq(schema.users.email_verified, filters.isVerified));
    }

    // Pagination cursor
    if (after) {
      conditions.push(gt(schema.users.id, after));
    }

    // Add game log filters to conditions
    if (filters?.hasGameLogs === true || filters?.minGameLogs) {
      const minLogs = filters.minGameLogs || 1;
      conditions.push(
        sql`(
          SELECT COUNT(*) 
          FROM ${schema.game_logs} 
          WHERE ${schema.game_logs.userId} = ${schema.users.id}
        ) >= ${minLogs}`
      );
    } else if (filters?.hasGameLogs === false) {
      conditions.push(
        sql`(
          SELECT COUNT(*) 
          FROM ${schema.game_logs} 
          WHERE ${schema.game_logs.userId} = ${schema.users.id}
        ) = 0`
      );
    }

    // Build the query with all conditions
    const query = db
      .select({
        user: schema.users,
        gameLogCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${schema.game_logs} 
          WHERE ${schema.game_logs.userId} = ${schema.users.id}
        )`,
      })
      .from(schema.users)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Apply ordering
    let orderByClause;
    switch (filters?.orderBy) {
      case 'USERNAME_ASC':
        orderByClause = asc(schema.users.username);
        break;
      case 'USERNAME_DESC':
        orderByClause = desc(schema.users.username);
        break;
      case 'CREATED_AT_ASC':
        orderByClause = asc(schema.users.createdAt);
        break;
      case 'CREATED_AT_DESC':
        orderByClause = desc(schema.users.createdAt);
        break;
      case 'GAME_LOGS_DESC':
        orderByClause = desc(sql`(
          SELECT COUNT(*) 
          FROM ${schema.game_logs} 
          WHERE ${schema.game_logs.userId} = ${schema.users.id}
        )`);
        break;
      case 'GAME_LOGS_ASC':
        orderByClause = asc(sql`(
          SELECT COUNT(*) 
          FROM ${schema.game_logs} 
          WHERE ${schema.game_logs.userId} = ${schema.users.id}
        )`);
        break;
      default:
        orderByClause = desc(schema.users.createdAt);
    }

    // Execute query with ordering and limit
    const results = await query.orderBy(orderByClause).limit(limit + 1);

    // Check if there are more items
    const hasNextPage = results.length > limit;
    const actualResults = hasNextPage ? results.slice(0, -1) : results;

    // Map users with game log data
    const mappedUsers = await Promise.all(
      actualResults.map(async result => {
        const userData = mapUserData(result.user);

        // Fetch game log IDs for this user (limit to avoid performance issues)
        const gameLogs = await db
          .select({ id: schema.game_logs.id })
          .from(schema.game_logs)
          .where(eq(schema.game_logs.userId, result.user.id))
          .limit(100);

        return {
          ...userData,
          gameLogs,
        };
      })
    );

    // Get total count for pagination info
    const totalCountQuery = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(schema.users)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalCount = totalCountQuery[0]?.count || 0;

    return createConnection(mappedUsers, totalCount, { first: limit, after });
  } catch (error) {
    handleResolverError(error, 'search users');
  }
};

export const users = async (
  _parent: unknown,
  args: PaginationArgs & { filters?: UserFilters },
  { db }: Context
) => {
  try {
    const { first = 10, after, last, before, filters } = args;

    // Build the query
    const conditions = [];
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          sql`${schema.users.firstName} ILIKE ${searchTerm}`,
          sql`${schema.users.lastName} ILIKE ${searchTerm}`,
          sql`${schema.users.emailAddress} ILIKE ${searchTerm}`,
          sql`${schema.users.username} ILIKE ${searchTerm}`
        )
      );
    }
    if (after) {
      conditions.push(gt(schema.users.id, after));
    }
    if (before) {
      conditions.push(lt(schema.users.id, before));
    }

    const limit = last || first || 10;
    const query = db
      .select()
      .from(schema.users)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(schema.users.createdAt)
      .limit(limit + 1);

    // Execute query
    const items = await query;

    // Check if there are more items
    const hasNextPage = items.length > limit;
    const actualItems = hasNextPage ? items.slice(0, -1) : items;

    const mappedUsers = actualItems.map(mapUserData);

    return createConnection(mappedUsers, actualItems.length, args);
  } catch (error) {
    handleResolverError(error, 'fetch users');
  }
};

export const user = async (_parent: unknown, { id }: { id: string }, { db }: Context) => {
  try {
    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1)
      .then(rows => rows[0]);

    if (!user) throw new BusinessLogicError(`User with id ${id} not found`, 'USER_NOT_FOUND');

    return mapUserData(user);
  } catch (error) {
    handleResolverError(error, 'fetch user');
  }
};

export const me = async (_parent: unknown, _args: unknown, { db, user }: Context) => {
  try {
    if (!user) throw new BusinessLogicError('Not authenticated', 'NOT_AUTHENTICATED');

    const userData = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.id))
      .limit(1)
      .then(rows => rows[0]);

    if (!userData) throw new BusinessLogicError('User not found', 'USER_NOT_FOUND');

    return mapUserData(userData);
  } catch (error) {
    handleResolverError(error, 'fetch current user');
  }
};
