// Seeding-related type definitions

import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type { PgTable } from 'drizzle-orm/pg-core';

import type * as schema from '@src/lib/db/schema';

export interface ICacheManager {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  clear(): Promise<void>;
}

export type MadeAttempted = { made?: number; attempted?: number } | null | undefined;

// Drizzle insert types
export type UserInsert = InferInsertModel<typeof schema.users>;
export type FriendshipInsert = InferInsertModel<typeof schema.friendships>;
export type GameLogInsert = InferInsertModel<typeof schema.game_logs>;
export type CommentInsert = InferInsertModel<typeof schema.comments>;
export type ReactionInsert = InferInsertModel<typeof schema.reactions>;

// Select type for teams
export type TeamRow = InferSelectModel<typeof schema.teams>;

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
