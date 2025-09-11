import { sql as _sql } from 'drizzle-orm';
import { pgTable, varchar, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

import { baseTableConfig as _baseTableConfig } from '@/lib/db/schema/base-schemas';

// Audit Logs table - System audit and compliance logging
export const auditLogs = pgTable('audit_logs', {
  id: varchar('id', { length: 255 }).primaryKey(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  severity: varchar('severity', { length: 20 }).notNull(),
  user_id: varchar('user_id', { length: 255 }),
  session_id: varchar('session_id', { length: 255 }),
  ip_address: varchar('ip_address', { length: 45 }),
  user_agent: text('user_agent'),
  resource_type: varchar('resource_type', { length: 50 }),
  resource_id: varchar('resource_id', { length: 255 }),
  table_name: varchar('table_name', { length: 100 }),
  column_name: varchar('column_name', { length: 100 }),
  request_id: varchar('request_id', { length: 255 }),
  endpoint: varchar('endpoint', { length: 500 }),
  method: varchar('method', { length: 10 }),
  description: text('description'),
  details: jsonb('details'),
  metadata: jsonb('metadata'),
  success: boolean('success').notNull().default(true),
  error_message: text('error_message'),
  error_code: varchar('error_code', { length: 50 }),
  duration_ms: integer('duration_ms'),
  compliance_tags: varchar('compliance_tags', { length: 500 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Key Rotation Logs table - Encryption key management
export const keyRotationLogs = pgTable('key_rotation_logs', {
  id: varchar('id', { length: 255 }).primaryKey(),
  key_id: varchar('key_id', { length: 255 }).notNull(),
  key_version: varchar('key_version', { length: 100 }).notNull(),
  environment: varchar('environment', { length: 50 }).notNull(),
  rotation_type: varchar('rotation_type', { length: 50 }).notNull(),
  previous_key_id: varchar('previous_key_id', { length: 255 }),
  new_key_id: varchar('new_key_id', { length: 255 }),
  rotated_by: varchar('rotated_by', { length: 255 }).notNull(),
  rotation_reason: text('rotation_reason'),
  affected_records_count: integer('affected_records_count'),
  re_encryption_required: boolean('re_encryption_required').notNull().default(false),
  re_encryption_completed: boolean('re_encryption_completed').notNull().default(false),
  rotation_started_at: timestamp('rotation_started_at').notNull(),
  rotation_completed_at: timestamp('rotation_completed_at'),
  re_encryption_started_at: timestamp('re_encryption_started_at'),
  re_encryption_completed_at: timestamp('re_encryption_completed_at'),
  status: varchar('status', { length: 50 }).notNull().default('in_progress'),
  details: jsonb('details'),
  error_message: text('error_message'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// RLS Access Logs table - Row-level security monitoring
export const rlsAccessLogs = pgTable('rls_access_logs', {
  id: varchar('id', { length: 255 }).primaryKey(),
  requesting_user_id: varchar('requesting_user_id', { length: 255 }).notNull(),
  target_user_id: varchar('target_user_id', { length: 255 }).notNull(),
  table_name: varchar('table_name', { length: 100 }).notNull(),
  operation: varchar('operation', { length: 20 }).notNull(),
  rls_context_set: boolean('rls_context_set').notNull(),
  rls_policy_applied: varchar('rls_policy_applied', { length: 100 }),
  access_granted: boolean('access_granted').notNull(),
  rows_affected: integer('rows_affected'),
  sensitive_fields_accessed: varchar('sensitive_fields_accessed', { length: 500 }),
  request_id: varchar('request_id', { length: 255 }),
  endpoint: varchar('endpoint', { length: 500 }),
  query_hash: varchar('query_hash', { length: 64 }),
  query_duration_ms: integer('query_duration_ms'),
  ip_address: varchar('ip_address', { length: 45 }),
  user_agent: text('user_agent'),
  details: jsonb('details'),
  error_message: text('error_message'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});
