/**
 * Custom scalar type definitions for GraphQL
 */

import { GraphQLScalarType, Kind } from 'graphql';

export type IAnyScalar = unknown;
export type IJsonScalar = Record<string, unknown>;
export type IDateTimeScalar = Date;

export const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description:
    'A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.',
  serialize(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    throw new Error('GraphQL DateTime Scalar serializer expected a Date object');
  },
  parseValue(value: unknown): Date {
    if (typeof value === 'string') {
      return new Date(value);
    }
    throw new Error('GraphQL DateTime Scalar parser expected a string');
  },
  parseLiteral(ast): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    throw new Error('GraphQL DateTime Scalar parser expected a string literal');
  },
});

export const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description:
    'The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).',
  serialize(value: unknown): IJsonScalar {
    if (typeof value === 'object' && value !== null) {
      return value as IJsonScalar;
    }
    throw new Error('GraphQL JSON Scalar serializer expected an object');
  },
  parseValue(value: unknown): IJsonScalar {
    if (typeof value === 'object' && value !== null) {
      return value as IJsonScalar;
    }
    throw new Error('GraphQL JSON Scalar parser expected an object');
  },
  parseLiteral(ast): IJsonScalar {
    if (ast.kind === Kind.OBJECT) {
      return ast as unknown as IJsonScalar;
    }
    throw new Error('GraphQL JSON Scalar parser expected an object literal');
  },
});

export const anyScalar = new GraphQLScalarType({
  name: 'Any',
  description: 'The `Any` scalar type represents any value.',
  serialize(value: unknown): IAnyScalar {
    return value as IAnyScalar;
  },
  parseValue(value: unknown): IAnyScalar {
    return value as IAnyScalar;
  },
  parseLiteral(ast): IAnyScalar {
    return ast as unknown as IAnyScalar;
  },
});
