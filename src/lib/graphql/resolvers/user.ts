import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import type { GraphQLContext } from '@/lib/types/dbTypes';
import { decryptField, deserializeEncryptedField } from '@/lib/utils/encryption';

// Types for resolver parameters
interface IUserParent {
  id: string;
  email_address?: string | null;
  phone_number?: string | null;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
}

interface IUserArgs {
  id?: string;
}

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
    console.error('Failed to decrypt field:', error);
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
        };
      }) || []
    );
  },

  // Search users (with sensitive data protection)
  searchUsers: async (_parent: unknown, _args: IUserArgs, context: GraphQLContext) => {
    // Implementation for user search
    // This would include pagination and filtering logic
    const allUsers = await db()?.query.users.findMany();

    const edges =
      allUsers?.map(user => {
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
          },
        };
      }) || [];

    return {
      edges,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: edges[0]?.cursor || null,
        endCursor: edges[edges.length - 1]?.cursor || null,
      },
      totalCount: edges.length,
    };
  },
};
