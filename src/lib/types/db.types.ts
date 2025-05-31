/**
 * Database-related type definitions for the application.
 * This file contains types for database configuration, connections, queries, and operations.
 */
import type DataLoader from 'dataloader';
import { type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { z } from 'zod';

import * as schema from '@/lib/db/schema';

import type { DatabaseRow } from './database.types';
import type { Player, Team } from './generated/graphql';
import type { Game, GameLog, Comment, Reaction, Friendship } from './shared.types';
import type { DbCustomUser } from './user.types';

// Environment Configuration Types
export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_CONNECTION_TIMEOUT: z.string().optional(),
  DATABASE_POOL_SIZE: z.string().optional(),
  DATABASE_RETRY_ATTEMPTS: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_URL: z.string().url().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

// Core Database Types
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface DatabaseConfig {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  ssl?: boolean;
  maxConnections?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  env?: string;
  logger?: boolean;
  skipSchemaPull?: boolean;
}

export type BaseDatabaseClient = NeonHttpDatabase<typeof schema>;

// Use the Drizzle database type directly with proper schema typing
export type DatabaseClient = NeonHttpDatabase<typeof schema>;

// Connection and Pool Types
export interface DatabaseConnection {
  sql: unknown;
  db: NeonHttpDatabase<Record<string, unknown>>;
}

export interface DatabasePool {
  pool: DatabaseConnection[];
  currentIndex: number;
  maxConnections: number;
  getConnection: () => Promise<DatabaseConnection>;
}

export interface DatabaseConnectionOptions {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  maxConnections?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export interface DatabasePoolConfig {
  min: number;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  maxUses: number;
}

// Query Types
export interface QueryOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export type QueryResult = {
  rows: unknown[];
  rowCount: number;
};

export type QueryParams = Record<string, unknown>;

export interface DatabaseQueryOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTTL?: number;
}

// Error Types
export type DatabaseError = {
  code: string;
  message: string;
  detail?: string;
  hint?: string;
  position?: string;
  where?: string;
  schema?: string;
  table?: string;
  column?: string;
  dataType?: string;
  constraint?: string;
};

export interface DatabaseResult<T> {
  data: T;
  error: null;
}

export interface DatabaseErrorResult {
  data: null;
  error: DatabaseError;
}

export type DatabaseResponse<T> = DatabaseResult<T> | DatabaseErrorResult;

// Transaction Types
export interface DatabaseTransaction {
  begin: () => Promise<void>;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
  query: <T>(sql: string, params?: unknown[]) => Promise<DatabaseResult<T>>;
}

export interface DatabaseTransactionOptions {
  isolationLevel?: 'read_committed' | 'repeatable_read' | 'serializable';
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// Migration Types
export interface DatabaseMigration {
  version: number;
  name: string;
  up: (db: DatabaseClient) => Promise<void>;
  down: (db: DatabaseClient) => Promise<void>;
}

export interface DatabaseMigrationOptions {
  tableName?: string;
  lockTimeout?: number;
  retries?: number;
  retryDelay?: number;
}

// Backup and Restore Types
export interface DatabaseBackup {
  filename: string;
  timestamp: Date;
  size: number;
  checksum: string;
}

export interface DatabaseRestore {
  backup: DatabaseBackup;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface DatabaseBackupOptions {
  format?: 'sql' | 'custom' | 'tar' | 'directory';
  compression?: boolean;
  compressionLevel?: number;
  excludeTables?: string[];
  includeTables?: string[];
}

export interface DatabaseRestoreOptions {
  format?: 'sql' | 'custom' | 'tar' | 'directory';
  compression?: boolean;
  compressionLevel?: number;
  excludeTables?: string[];
  includeTables?: string[];
  clean?: boolean;
  create?: boolean;
  dataOnly?: boolean;
  schemaOnly?: boolean;
  noOwner?: boolean;
  noAcl?: boolean;
  noSecurityLabels?: boolean;
  noTablespaces?: boolean;
  noPrivileges?: boolean;
  noPublications?: boolean;
  noSecurity?: boolean;
  noSubscriptions?: boolean;
  noComments?: boolean;
  noCollations?: boolean;
  noExtensions?: boolean;
  noForeignData?: boolean;
  noFunctions?: boolean;
  noIndexes?: boolean;
  noRoles?: boolean;
  noSchemas?: boolean;
  noTables?: boolean;
  noTriggers?: boolean;
  noTypes?: boolean;
  noViews?: boolean;
}

export interface DatabaseStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingConnections: number;
  maxConnections: number;
  queryCount: number;
  errorCount: number;
  avgQueryTime: number;
  lastError?: DatabaseError;
}

export interface DatabaseHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  latency: number;
  errors: DatabaseError[];
  stats: DatabaseStats;
}

export interface DatabaseHealthCheckOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  checkConnections?: boolean;
  checkQueries?: boolean;
  checkTransactions?: boolean;
  checkMigrations?: boolean;
  checkBackups?: boolean;
  checkRestores?: boolean;
}

export interface DatabaseStatsOptions {
  interval?: number;
  history?: number;
  includeQueries?: boolean;
  includeErrors?: boolean;
  includeConnections?: boolean;
  includeTransactions?: boolean;
  includeMigrations?: boolean;
  includeBackups?: boolean;
  includeRestores?: boolean;
}

export interface DatabaseConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DatabaseConfigOptions {
  validate?: boolean;
  validateConnections?: boolean;
  validatePool?: boolean;
  validateQueries?: boolean;
  validateTransactions?: boolean;
  validateMigrations?: boolean;
  validateBackups?: boolean;
  validateRestores?: boolean;
  validateHealth?: boolean;
  validateStats?: boolean;
}

export interface DatabaseOptions {
  config?: DatabaseConfigOptions;
  connections?: DatabaseConnectionOptions;
  pool?: DatabasePoolConfig;
  queries?: DatabaseQueryOptions;
  transactions?: DatabaseTransactionOptions;
  migrations?: DatabaseMigrationOptions;
  backups?: DatabaseBackupOptions;
  restores?: DatabaseRestoreOptions;
  health?: DatabaseHealthCheckOptions;
  stats?: DatabaseStatsOptions;
}

// Database query result types
export type DatabaseQueryResult<T = DatabaseRow> = T[];
export type DatabaseSingleResult<T = DatabaseRow> = T | undefined;

// Redis Types
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  ttl?: number;
}

// Seeder Types
export interface SeederConfig {
  batchSize: number;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

export interface SeederResult {
  success: boolean;
  total: number;
  processed: number;
  failed: number;
  errors: Array<{
    message: string;
    data?: unknown;
  }>;
  duration: number;
}

// Database Migration Types
export interface Migration {
  id: string;
  name: string;
  up: string;
  down: string;
  createdAt: Date;
  appliedAt?: Date;
}

export interface MigrationResult {
  success: boolean;
  applied: string[];
  reverted: string[];
  errors: Array<{
    migration: string;
    error: string;
  }>;
}

// Database Query Types
export interface PaginatedQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, unknown>;
}

export interface PaginatedQueryResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Database Transaction Types
export interface Transaction {
  id: string;
  status: 'pending' | 'committed' | 'rolled_back';
  startedAt: Date;
  endedAt?: Date;
  error?: string;
}

// Database Index Types
export interface Index {
  name: string;
  table: string;
  columns: string[];
  type: 'btree' | 'hash' | 'gist' | 'gin';
  unique: boolean;
}

// Database Constraint Types
export interface Constraint {
  name: string;
  table: string;
  type: 'primary_key' | 'foreign_key' | 'unique' | 'check';
  columns: string[];
  references?: {
    table: string;
    columns: string[];
  };
  onDelete?: 'cascade' | 'restrict' | 'set_null';
  onUpdate?: 'cascade' | 'restrict' | 'set_null';
}

// Context and Loader Types
export interface Loaders {
  user: DataLoader<string, DbCustomUser | null>;
  game: DataLoader<string, Game | null>;
  gameLog: DataLoader<string, GameLog | null>;
  comment: DataLoader<string, Comment | null>;
  reaction: DataLoader<string, Reaction | null>;
  friendship: DataLoader<string, Friendship | null>;
  player: DataLoader<string, Player | null>;
  gameRating: DataLoader<string, GameRating | null>;
  team: DataLoader<string, Team | null>;
}

// Game Rating Type
export interface GameRating {
  id: string;
  gameId: string;
  averageRating: string;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}
