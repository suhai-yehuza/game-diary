/**
 * Database types for the application
 */

import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import type { Schema } from '@/lib/db/schema/types';

export type DatabaseClient = NeonHttpDatabase<Schema>;

export type DatabaseRow = {
  [key: string]:
    | string
    | number
    | boolean
    | Date
    | DatabaseRow
    | (string | number | boolean | Date | DatabaseRow | null)[]
    | null;
};

export type DatabaseConfig = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
};

export type DatabaseConnection = {
  client: DatabaseClient;
  config: DatabaseConfig;
};

export type DatabaseMigration = {
  version: number;
  name: string;
  up: (client: DatabaseClient) => Promise<void>;
  down: (client: DatabaseClient) => Promise<void>;
};

export type DatabaseSeeder = {
  name: string;
  run: (client: DatabaseClient) => Promise<void>;
};

export type DatabaseBackup = {
  timestamp: Date;
  filename: string;
  size: number;
  checksum: string;
};

export type DatabaseStats = {
  totalTables: number;
  totalRows: number;
  totalSize: number;
  lastBackup?: DatabaseBackup;
  lastMigration?: DatabaseMigration;
};
