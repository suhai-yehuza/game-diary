import { eq, isNull, or, ilike, and, desc } from 'drizzle-orm';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import {
  decryptField,
  deserializeEncryptedField,
  isEncrypted as isEncryptedField,
} from '@/lib/utils/encryption';
import { errorHandlers } from '@/lib/utils/error-handler';
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

  // User search - return all results with scrollability
  searchUsers: async (
    _parent: unknown,
    args: { searchTerm?: string; limit?: number },
    _context: GraphQLContext
  ) => {
    const searchTerm = args.searchTerm?.trim() || '';
    const limit = Math.min(args.limit || 100, 200); // Cap at 200 results total

    // If no search term, return empty results
    if (!searchTerm) {
      return {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      };
    }

    // Simple search across username, first_name, last_name
    const searchPattern = `%${searchTerm}%`;

    try {
      const results =
        (await db()?.query.users.findMany({
          where: and(
            isNull(users.deleted_at),
            or(
              ilike(users.username, searchPattern),
              ilike(users.first_name, searchPattern),
              ilike(users.last_name, searchPattern)
            )
          ),
          orderBy: [desc(users.created_at)],
          limit,
        })) ?? [];

      const edges = results.map(user => {
        const userParent = {
          ...user,
          name: user.username || '',
          email_address: user.email_address || undefined,
          phone_number: user.phone_number || undefined,
        };

        return {
          node: {
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            email_address: userSummaryResolver.email_address(userParent, { id: user.id }, _context),
            phone_number: userSummaryResolver.phone_number(userParent, { id: user.id }, _context),
            image_url: user.image_url,
            isAdmin: user.isAdmin,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
          cursor: user.id,
        };
      });

      return {
        edges,
        pageInfo: {
          hasNextPage: false, // No pagination - show all results
          hasPreviousPage: false,
          startCursor: edges[0]?.cursor ?? null,
          endCursor: edges[edges.length - 1]?.cursor ?? null,
        },
        totalCount: results.length,
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 0,
      };
    }
  },
};
