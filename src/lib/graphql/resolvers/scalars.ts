import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

export const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    throw new TypeError('DateTime cannot serialize value: ' + value);
  },
  parseValue(value: unknown): Date | null {
    if (typeof value === 'string' || value instanceof Date) {
      return new Date(value);
    }
    return null;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

export const ErrorResult = {
  __resolveType(parent: unknown) {
    if (typeof parent === 'object' && parent !== null) {
      const p = parent as Record<string, unknown>;
      if (p.field && p.message) return 'ValidationError';
      if (p.resource && p.id) return 'NotFoundError';
      if (p.message && p.requiredRole) return 'AuthorizationError';
      if (p.message && p.retryAfter) return 'RateLimitError';
      if (p.message && p.code) return 'BusinessLogicError';
    }
    return 'AuthenticationError';
  },
};

export const PaginatedItem = {
  __resolveType(parent: Record<string, unknown>) {
    if ('watched_date' in parent) return 'GameLog';
    if ('content' in parent) return 'Comment';
    if ('date' in parent) return 'Game';
    if ('position' in parent) return 'Player';
    if ('points' in parent) return 'PlayerStats';
    if ('username' in parent) return 'UserBase';
    return null;
  },
};
