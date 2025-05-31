import { and, eq, gt, lt, or, sql } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';

import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { BusinessLogicError } from '@/lib/graphql/errors';
import { createConnection, parsePaginationArgs } from '@/lib/graphql/utils/pagination';
import type { Context } from '@/lib/types/context.types';

import type { PaginationArgs } from '../common/types';
import { handleResolverError } from '../common/utils';

// Define UserFilters type since it's not exported from graphql types
interface UserFilters {
  search?: string;
  role?: string;
}

// Helper function to map user data
const mapUserData = (user: InferSelectModel<typeof schema.users>) => ({
  id: user.id,
  username: user.username,
  emailAddress: user.emailAddress,
  imageUrl: user.imageUrl,
  firstName: user.firstName,
  lastName: user.lastName,
  inboundFriendshipIds: user.inboundFriendshipIds,
  outboundFriendshipIds: user.outboundFriendshipIds,
  banned: user.banned,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  lastSignInAt: user.last_sign_in_at,
  passwordEnabled: user.password_enabled,
  twoFactorEnabled: user.two_factor_enabled,
  emailVerified: user.email_verified,
  emailVerificationStrategy: user.email_verification_strategy,
  externalId: user.external_id,
  externalAccounts: user.external_accounts,
  deletedAt: user.deletedAt,
  // Add missing fields for transformUser
  avatar_url: user.imageUrl,
  email: user.emailAddress,
  initiatedFriendships: [],
  // Initialize empty arrays for related data
  comments: [],
  gameLogs: [],
  reactions: [],
  friendships: [],
});

export { mapUserData };

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
