import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language/index.js';

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
    if (value === null || value === undefined) {
      return '';
    }

    // Handle other cases by trying to convert to Date
    try {
      if (typeof value === 'object' && value !== null) {
        // If it's an object with a toISOString method, use it
        const obj = value as Record<string, unknown>;
        if ('toISOString' in obj && typeof obj.toISOString === 'function') {
          return (obj.toISOString as () => string)();
        }
        // If it's a Date-like object, try to create a new Date from it
        return new Date(value as Date | string).toISOString();
      }

      // For other types, throw an error
      throw new TypeError(`DateTime cannot serialize value of type: ${typeof value}`);
    } catch {
      throw new TypeError(
        `DateTime cannot serialize value: ${
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean' ||
          typeof value === 'symbol'
            ? String(value)
            : '[Unknown]'
        }`
      );
    }
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
