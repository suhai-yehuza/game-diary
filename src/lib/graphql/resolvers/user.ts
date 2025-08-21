import { eq } from 'drizzle-orm';

import { API_CONFIG } from '@/lib/config/app.config';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import type { GraphQLContext, IUserParent, IUserArgs } from '@/lib/types';
import { decryptField, deserializeEncryptedField } from '@/lib/utils/encryption';
import { logger } from '@/lib/utils/logger';

// Helper function to check if a value is encrypted
function isEncrypted(value: string | null): boolean {
  if (!value) return false;
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return (
      parsed &&
      typeof parsed === 'object' &&
      'iv' in parsed &&
      'content' in parsed &&
      'tag' in parsed
    );
  } catch {
    return false;
  }
}

// Helper function to safely decrypt a field
function safeDecrypt(encryptedValue: string | null | undefined): string | null {
  if (!encryptedValue) return null;

  try {
    if (isEncrypted(encryptedValue)) {
      return decryptField(deserializeEncryptedField(encryptedValue));
    }
    return encryptedValue; // Return as-is if not encrypted
  } catch (error) {
    logger.error('Failed to decrypt field:', error as Error);
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
      created_at: user.created_at,
    };
  },

  // Get users list (with sensitive data protection)
  users: async (_parent: unknown, _args: IUserArgs, context: GraphQLContext) => {
    const allUsers = await db()?.query.users.findMany();

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
          created_at: user.created_at,
        };
      }) ?? []
    );
  },

  // Search users (with sensitive data protection)
  searchUsers: async (
    _parent: unknown,
    args: { first?: number; after?: string; searchTerm?: string; searchField?: string },
    context: GraphQLContext
  ) => {
    const limit = args.first ?? API_CONFIG.pagination.DEFAULT_PAGE_SIZE;
    const searchTerm = args.searchTerm ?? '';
    const searchField = args.searchField ?? 'all';

    // Get all users first (simplified approach to avoid circular dependency)
    const allUsers = (await db()?.query.users.findMany()) ?? [];

    // Filter by search term if provided
    let filteredUsers = allUsers;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();

      filteredUsers = allUsers.filter(user => {
        switch (searchField) {
          case 'username':
            return user.username?.toLowerCase().includes(searchLower) ?? false;
          case 'first_name':
            return user.first_name?.toLowerCase().includes(searchLower) ?? false;
          case 'last_name':
            return user.last_name?.toLowerCase().includes(searchLower) ?? false;
          case 'email_address':
            return user.email_address?.toLowerCase().includes(searchLower) ?? false;
          case 'all':
          default: {
            // Check each field individually and return true if any match
            const usernameMatch = user.username?.toLowerCase().includes(searchLower) ?? false;
            const firstNameMatch = user.first_name?.toLowerCase().includes(searchLower) ?? false;
            const lastNameMatch = user.last_name?.toLowerCase().includes(searchLower) ?? false;
            const emailMatch = user.email_address?.toLowerCase().includes(searchLower) ?? false;

            return usernameMatch || firstNameMatch || lastNameMatch || emailMatch;
          }
        }
      });

      // Debug logging (remove in production)
      logger.debug(`Search: "${searchTerm}" in field "${searchField}"`);
      logger.debug(`Total users: ${allUsers.length}, Filtered: ${filteredUsers.length}`);
      if (filteredUsers.length > 0) {
        logger.debug('Sample matches:', {
          matches: filteredUsers.slice(0, 3).map(u => ({
            username: u.username,
            first_name: u.first_name,
            last_name: u.last_name,
            email: u.email_address,
          })),
        });
      }
    }

    // Apply cursor-based pagination
    let paginatedUsers = filteredUsers;
    if (args.after) {
      const afterIndex = filteredUsers.findIndex(user => user.id === args.after);
      if (afterIndex !== -1) {
        paginatedUsers = filteredUsers.slice(afterIndex + 1);
      }
    }

    // Apply limit
    const hasNextPage = paginatedUsers.length > limit;
    const users = hasNextPage ? paginatedUsers.slice(0, limit) : paginatedUsers;

    const edges = users.map(user => {
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
          created_at: user.created_at,
        },
      };
    });

    return {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!args.after,
        startCursor: edges[0]?.cursor ?? null,
        endCursor: edges[edges.length - 1]?.cursor ?? null,
      },
      totalCount: filteredUsers.length,
    };
  },
};
