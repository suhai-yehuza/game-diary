import type { InferInsertModel } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type { PgTable } from 'drizzle-orm/pg-core';
import type { GraphQLResolveInfo } from 'graphql';
import type * as schema from '@src/lib/db/schema';

// Seeding types
export type MadeAttempted = { made?: number; attempted?: number } | null | undefined;

// Drizzle insert types
export type UserInsert = InferInsertModel<typeof schema.users>;
export type FriendshipInsert = InferInsertModel<typeof schema.friendships>;
export type GameLogInsert = InferInsertModel<typeof schema.game_logs>;
export type CommentInsert = InferInsertModel<typeof schema.comments>;
export type ReactionInsert = InferInsertModel<typeof schema.reactions>;
export type GameInsert = InferInsertModel<typeof schema.nba_games>;

// Database client type
export type DatabaseClient = NeonHttpDatabase<typeof schema>;

// Batch insert options interface
export interface IBatchInsertOptions {
  table: PgTable;
  data: Record<string, unknown>[];
  batchSize?: number;
  tableName?: string;
}

// Database query result types
export interface ITableExistsResult {
  rows: Array<{ exists: boolean }>;
}

export interface ITableCountResult {
  rows: Array<{ count: number }>;
}

// Database types
export type Database = NeonHttpDatabase<typeof schema>;

// GraphQL types
export type GraphQLContext = {
  user?: {
    id: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    banned?: boolean;
  };
};

export type GraphQLResolver<T = unknown, Args = unknown> = (
  parent: T,
  args: Args,
  context: GraphQLContext,
  info: GraphQLResolveInfo
) => Promise<unknown> | unknown;

// ========================================
// SERVICE TYPES
// ========================================

export interface IPlayerFilters {
  searchTerm?: string;
  positionFilter?: string;
  teamFilter?: string;
  collegeFilter?: string;
  countryFilter?: string;
  sortBy?: 'name' | 'position' | 'team' | 'college';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
