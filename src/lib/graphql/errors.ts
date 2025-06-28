import type { InferSelectModel } from 'drizzle-orm';
import { GraphQLError } from 'graphql';

import type { users } from '@src/lib/db/schema';
import { RESOURCES } from '@src/lib/types';

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
  constructor(message: string, code = 'FORBIDDEN') {
    super(message, {
      extensions: {
        code,
        http: { status: 403 },
      },
    });
  }
}

export class RateLimitError extends GraphQLError {
  constructor(message: string, code = 'RATE_LIMIT_EXCEEDED') {
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

// Field-level Permission Checker
export const checkFieldPermission = (
  user: Readonly<InferSelectModel<typeof users>>,
  resource: (typeof RESOURCES)[keyof typeof RESOURCES],
  field: string,
  resourceId?: string
) => {
  if (!user) {
    throw new AuthenticationError('Authentication required');
  }

  // Admin has access to all fields
  if (user.banned === true) {
    return true;
  }

  // Check field-specific permissions
  switch (resource) {
    case RESOURCES.USER:
      // Users can only access their own sensitive fields
      if (['emailAddress', 'banned'].includes(field) && resourceId !== user.id) {
        throw new AuthorizationError(`Cannot access ${field} field`);
      }
      return true;

    case RESOURCES.GAME_LOG:
      // Users can only modify their own game logs
      if (['watchedSetting', 'classification'].includes(field) && resourceId !== user.id) {
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
      const { code } = obj.extensions;
      if (code === 'VALIDATION_ERROR') {
        return 'ValidationError';
      }
      if (code === 'NOT_FOUND_ERROR') {
        return 'NotFoundError';
      }
      if (code === 'AUTHENTICATION_ERROR') {
        return 'AuthenticationError';
      }
      if (code === 'AUTHORIZATION_ERROR') {
        return 'AuthorizationError';
      }
      if (code === 'RATE_LIMIT_ERROR') {
        return 'RateLimitError';
      }
      if (code === 'BUSINESS_LOGIC_ERROR') {
        return 'BusinessLogicError';
      }
      return null;
    },
  },
};
