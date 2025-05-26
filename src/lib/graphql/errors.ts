import { InferSelectModel } from 'drizzle-orm';
import { GraphQLError } from 'graphql';

import { users } from '@/lib/db/schema';
import { RESOURCES, PERMISSIONS } from '@/lib/types/config.types';

// Custom Error Classes
export class ValidationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'VALIDATION_ERROR',
      },
    });
  }
}

export class NotFoundError extends GraphQLError {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`, {
      extensions: {
        code: 'NOT_FOUND',
      },
    });
  }
}

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'AUTHENTICATION_ERROR',
      },
    });
  }
}

export class AuthorizationError extends GraphQLError {
  constructor(message: string, code: string = 'FORBIDDEN') {
    super(message, {
      extensions: {
        code,
        http: { status: 403 },
      },
    });
  }
}

export class RateLimitError extends GraphQLError {
  constructor(message: string, code: string = 'RATE_LIMIT_EXCEEDED') {
    super(message, {
      extensions: {
        code,
        http: { status: 429 },
      },
    });
  }
}

export class BusinessLogicError extends GraphQLError {
  constructor(
    message: string,
    public code: string
  ) {
    super(message, {
      extensions: {
        code,
      },
    });
  }
}

export class ForeignKeyViolationError extends BusinessLogicError {
  constructor(
    message: string,
    public table: string,
    public field: string
  ) {
    super(message, 'FOREIGN_KEY_VIOLATION');
  }
}

// Permission Checker
export const checkPermission = (
  user: InferSelectModel<typeof users>,
  resource: (typeof RESOURCES)[keyof typeof RESOURCES],
  permission: (typeof PERMISSIONS)[keyof typeof PERMISSIONS],
  resourceId?: string
) => {
  if (!user) {
    throw new AuthenticationError('Authentication required');
  }

  // Admin has all permissions
  if (!user.banned) {
    return true;
  }

  // Check resource-specific permissions
  switch (resource) {
    case RESOURCES.USER:
      // Users can only read/write their own data
      if (resourceId && resourceId !== user.id) {
        throw new AuthorizationError('Cannot access other user data');
      }
      return true;

    case RESOURCES.GAME_LOG:
      // Users can read public game logs and their own
      if (permission === PERMISSIONS.READ) {
        return true;
      }
      // Users can only write/delete their own game logs
      if (resourceId && resourceId !== user.id) {
        throw new AuthorizationError('Cannot modify other user game logs');
      }
      return true;

    case RESOURCES.COMMENT:
      // Users can read all comments
      if (permission === PERMISSIONS.READ) {
        return true;
      }
      // Users can only write/delete their own comments
      if (resourceId && resourceId !== user.id) {
        throw new AuthorizationError('Cannot modify other user comments');
      }
      return true;

    case RESOURCES.REACTION:
      // Users can read all reactions
      if (permission === PERMISSIONS.READ) {
        return true;
      }
      // Users can only write/delete their own reactions
      if (resourceId && resourceId !== user.id) {
        throw new AuthorizationError('Cannot modify other user reactions');
      }
      return true;

    case RESOURCES.FRIENDSHIP:
      // Users can read their own friendships
      if (permission === PERMISSIONS.READ) {
        return true;
      }
      // Users can only write/delete their own friendships
      if (resourceId && resourceId !== user.id) {
        throw new AuthorizationError('Cannot modify other user friendships');
      }
      return true;

    case RESOURCES.GAME_RATING:
      // Users can read all game ratings
      if (permission === PERMISSIONS.READ) {
        return true;
      }
      // Users can only write/delete their own game ratings
      if (resourceId && resourceId !== user.id) {
        throw new AuthorizationError('Cannot modify other user game ratings');
      }
      return true;

    default:
      throw new AuthorizationError(`Unknown resource: ${resource}`);
  }
};

// Field-level Permission Checker
export const checkFieldPermission = (
  user: InferSelectModel<typeof users>,
  resource: (typeof RESOURCES)[keyof typeof RESOURCES],
  field: string,
  resourceId?: string
) => {
  if (!user) {
    throw new AuthenticationError('Authentication required');
  }

  // Admin has access to all fields
  if (!user.banned) {
    return true;
  }

  // Check field-specific permissions
  switch (resource) {
    case RESOURCES.USER:
      // Users can only access their own sensitive fields
      if (['email_address', 'banned'].includes(field) && resourceId !== user.id) {
        throw new AuthorizationError(`Cannot access ${field} field`);
      }
      return true;

    case RESOURCES.GAME_LOG:
      // Users can only modify their own game logs
      if (['watched_setting', 'classification'].includes(field) && resourceId !== user.id) {
        throw new AuthorizationError(`Cannot modify ${field} field`);
      }
      return true;

    default:
      return true;
  }
};

export const errorTypeResolver = {
  ErrorResult: {
    __resolveType(obj: GraphQLError) {
      if (obj.extensions?.code === 'VALIDATION_ERROR') {
        return 'ValidationError';
      }
      if (obj.extensions?.code === 'NOT_FOUND_ERROR') {
        return 'NotFoundError';
      }
      if (obj.extensions?.code === 'AUTHENTICATION_ERROR') {
        return 'AuthenticationError';
      }
      if (obj.extensions?.code === 'AUTHORIZATION_ERROR') {
        return 'AuthorizationError';
      }
      if (obj.extensions?.code === 'RATE_LIMIT_ERROR') {
        return 'RateLimitError';
      }
      if (obj.extensions?.code === 'BUSINESS_LOGIC_ERROR') {
        return 'BusinessLogicError';
      }
      return null;
    },
  },
};
