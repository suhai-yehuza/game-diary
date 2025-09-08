import { eq, isNull, sql, or, ilike, and, desc } from 'drizzle-orm';

import { API_CONFIG } from '@/lib/config/app.config';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import {
  decryptField,
  deserializeEncryptedField,
  isEncrypted as isEncryptedField,
} from '@/lib/utils/encryption';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import type { GraphQLContext, IUserParent, IUserArgs } from '@/types';

// Use the proper encryption utility function

// Helper function to safely decrypt a field
function safeDecrypt(encryptedValue: string | null | undefined): string | null {
  if (!encryptedValue) return null;

  try {
    if (isEncryptedField(encryptedValue)) {
      return decryptField(deserializeEncryptedField(encryptedValue));
    }
    return encryptedValue; // Return as-is if not encrypted
  } catch (error) {
    // Use centralized error handling
    errorHandlers.validation(error instanceof Error ? error : new Error(String(error)), {
      component: 'GraphQL Resolver',
      action: 'Decrypt field',
    });
    return null; // Return null on decryption failure
  }
}

// User Summary resolver - only show sensitive data to the user themselves
export const userSummaryResolver = {
  email_address: (parent: IUserParent, _args: IUserArgs, context: GraphQLContext) => {
    const requestingUserId = context.user?.id;
    const userId = parent.id;

    // Only decrypt email for the user themselves
    if (requestingUserId === userId) {
      return safeDecrypt(parent.email_address);
    }

    // For other users, return null or a masked version
    return null;
  },

  phone_number: (parent: IUserParent, _args: IUserArgs, context: GraphQLContext) => {
    const requestingUserId = context.user?.id;
    const userId = parent.id;

    // Only decrypt phone for the user themselves
    if (requestingUserId === userId) {
      return safeDecrypt(parent.phone_number);
    }

    // For other users, return null
    return null;
  },

  isAdmin: (_parent: IUserParent) => {
    return false;
  },
};

// DBUser resolver - for internal use with full user data
export const dbUserResolver = {
  email_address: (parent: IUserParent, _args: IUserArgs, context: GraphQLContext) => {
    const requestingUserId = context.user?.id;
    const userId = parent.id;

    // Only decrypt email for the user themselves
    if (requestingUserId === userId) {
      return safeDecrypt(parent.email_address);
    }

    // For other users, return null
    return null;
  },

  phone_number: (parent: IUserParent, _args: IUserArgs, context: GraphQLContext) => {
    const requestingUserId = context.user?.id;
    const userId = parent.id;

    // Only decrypt phone for the user themselves
    if (requestingUserId === userId) {
      return safeDecrypt(parent.phone_number);
    }

    // For other users, return null
    return null;
  },
};

// Query resolvers
export const userQueryResolvers = {
  // Get current user
  me: async (_parent: unknown, _args: IUserArgs, context: GraphQLContext) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    const user = await db()?.query.users.findFirst({
      where: eq(users.id, context.user.id),
    });

    if (!user) {
      throw new AuthorizationError('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email_address: safeDecrypt(user.email_address), // Decrypt for own user
      phone_number: safeDecrypt(user.phone_number), // Decrypt for own user
      image_url: user.image_url,
      isAdmin: user.isAdmin ?? false,
      created_at: user.created_at,
    };
  },

  // Get user by ID
  user: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
    const user = await db()?.query.users.findFirst({
      where: eq(users.id, args.id),
    });

    if (!user) {
      return null;
    }

    const requestingUserId = context.user?.id;
    const isOwnUser = requestingUserId === user.id;

    return {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email_address: isOwnUser ? safeDecrypt(user.email_address) : null,
      phone_number: isOwnUser ? safeDecrypt(user.phone_number) : null,
      image_url: user.image_url,
      isAdmin: user.isAdmin ?? false,
      created_at: user.created_at,
    };
  },

  // Get users list (with sensitive data protection)
  users: async (_parent: unknown, _args: IUserArgs, context: GraphQLContext) => {
    const allUsers = await db()?.query.users.findMany({
      where: isNull(users.deleted_at),
    });

    return (
      allUsers?.map(user => {
        const requestingUserId = context.user?.id;
        const isOwnUser = requestingUserId === user.id;

        return {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          email_address: isOwnUser ? safeDecrypt(user.email_address) : null,
          phone_number: isOwnUser ? safeDecrypt(user.phone_number) : null,
          image_url: user.image_url,
          isAdmin: user.isAdmin ?? false,
          created_at: user.created_at,
        };
      }) ?? []
    );
  },

  // Search users (optimized with database-level filtering)
  searchUsers: async (
    _parent: unknown,
    args: { first?: number; after?: string; searchTerm?: string; searchField?: string },
    context: GraphQLContext
  ) => {
    const limit = args.first ?? API_CONFIG.pagination.DEFAULT_PAGE_SIZE;
    const searchTerm = args.searchTerm ?? '';
    const searchField = args.searchField ?? 'all';

    // Build WHERE conditions for database-level filtering
    const whereConditions = [isNull(users.deleted_at)];

    // Add search conditions if searchTerm is provided
    if (searchTerm?.trim()) {
      const searchPattern = `%${searchTerm.trim()}%`;

      switch (searchField) {
        case 'username':
          whereConditions.push(ilike(users.username, searchPattern));
          break;
        case 'first_name':
          whereConditions.push(ilike(users.first_name, searchPattern));
          break;
        case 'last_name':
          whereConditions.push(ilike(users.last_name, searchPattern));
          break;
        case 'email_address':
          whereConditions.push(ilike(users.email_address, searchPattern));
          break;
        case 'all':
        default: {
          // Search across all fields using OR conditions
          const orCondition = or(
            ilike(users.username, searchPattern),
            ilike(users.first_name, searchPattern),
            ilike(users.last_name, searchPattern),
            ilike(users.email_address, searchPattern)
          );
          if (orCondition) {
            whereConditions.push(orCondition);
          }
          break;
        }
      }
    }

    // Build the base query with proper WHERE conditions
    const baseQuery = db()?.query.users.findMany({
      where: and(...whereConditions),
      orderBy: [desc(users.created_at)],
      limit: limit + 1, // Get one extra to check if there's a next page
    });

    // Execute the query
    const allUsers = (await baseQuery) ?? [];

    // Check if there are more results (for hasNextPage)
    const hasNextPage = allUsers.length > limit;
    const limitedUsers = hasNextPage ? allUsers.slice(0, limit) : allUsers;

    // Apply cursor-based pagination if needed
    let paginatedUsers = limitedUsers;
    if (args.after) {
      const afterIndex = limitedUsers.findIndex(user => user.id === args.after);
      if (afterIndex !== -1) {
        paginatedUsers = limitedUsers.slice(afterIndex + 1);
      }
    }

    // Get total count for the search (only if search term is provided)
    let totalCount = paginatedUsers.length;
    if (searchTerm?.trim()) {
      const countQuery = db()
        ?.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(and(...whereConditions));
      const countResult = await countQuery;
      totalCount = countResult?.[0]?.count ?? 0;
    }

    const edges = paginatedUsers.map(user => {
      const requestingUserId = context.user?.id;
      const isOwnUser = requestingUserId === user.id;

      return {
        cursor: user.id,
        node: {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          email_address: isOwnUser ? safeDecrypt(user.email_address) : null,
          phone_number: isOwnUser ? safeDecrypt(user.phone_number) : null,
          image_url: user.image_url,
          isAdmin: user.isAdmin ?? false,
          created_at: user.created_at,
        },
      };
    });

    // Debug logging for performance monitoring
    if (searchTerm?.trim()) {
      logger.debug(`Optimized search: "${searchTerm}" in field "${searchField}"`);
      logger.debug(`Results: ${edges.length} users found, hasNextPage: ${hasNextPage}`);
    }

    return {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!args.after,
        startCursor: edges[0]?.cursor ?? null,
        endCursor: edges[edges.length - 1]?.cursor ?? null,
      },
      totalCount,
    };
  },
};
