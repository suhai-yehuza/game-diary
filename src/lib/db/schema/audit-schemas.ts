import { pgTable, varchar, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';

import { baseTableConfig } from '@/lib/db/schema/base-schemas';

// Audit log categories
export const AUDIT_CATEGORIES = {
  KEY_MANAGEMENT: 'key_management',
  RLS_ACCESS: 'rls_access',
  ENCRYPTION: 'encryption',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  DATA_ACCESS: 'data_access',
  SECURITY: 'security',
} as const;

// Audit log severity levels
export const AUDIT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Audit log actions
export const AUDIT_ACTIONS = {
  // Key management
  KEY_CREATED: 'key_created',
  KEY_ACTIVATED: 'key_activated',
  KEY_ROTATED: 'key_rotated',
  KEY_EXPIRED: 'key_expired',
  KEY_DELETED: 'key_deleted',

  // RLS access
  RLS_CONTEXT_SET: 'rls_context_set',
  RLS_CONTEXT_CLEARED: 'rls_context_cleared',
  RLS_POLICY_VIOLATION: 'rls_policy_violation',
  RLS_ACCESS_GRANTED: 'rls_access_granted',
  RLS_ACCESS_DENIED: 'rls_access_denied',

  // Encryption
  FIELD_ENCRYPTED: 'field_encrypted',
  FIELD_DECRYPTED: 'field_decrypted',
  ENCRYPTION_FAILED: 'encryption_failed',
  DECRYPTION_FAILED: 'decryption_failed',

  // Authentication
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  LOGIN_FAILED: 'login_failed',
  SESSION_EXPIRED: 'session_expired',

  // Authorization
  PERMISSION_GRANTED: 'permission_granted',
  PERMISSION_DENIED: 'permission_denied',
  ROLE_CHANGED: 'role_changed',

  // Data access
  DATA_READ: 'data_read',
  DATA_WRITE: 'data_write',
  DATA_DELETE: 'data_delete',
  SENSITIVE_DATA_ACCESSED: 'sensitive_data_accessed',

  // Security
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  SECURITY_ALERT: 'security_alert',
} as const;

// Audit logs table
export const audit_logs = pgTable(
  'audit_logs',
  {
    // Core audit information
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    category: varchar('category', { length: 50 }).notNull(),
    action: varchar('action', { length: 50 }).notNull(),
    severity: varchar('severity', { length: 20 }).notNull(),

    // User context
    user_id: varchar('user_id', { length: 255 }),
    session_id: varchar('session_id', { length: 255 }),
    ip_address: varchar('ip_address', { length: 45 }), // IPv6 compatible
    user_agent: text('user_agent'),

    // Resource context
    resource_type: varchar('resource_type', { length: 50 }),
    resource_id: varchar('resource_id', { length: 255 }),
    table_name: varchar('table_name', { length: 100 }),
    column_name: varchar('column_name', { length: 100 }),

    // Request context
    request_id: varchar('request_id', { length: 255 }),
    endpoint: varchar('endpoint', { length: 500 }),
    method: varchar('method', { length: 10 }),

    // Details
    description: text('description'),
    details: jsonb('details'), // Flexible JSON for additional data
    metadata: jsonb('metadata'), // Additional context

    // Outcome
    success: boolean('success').notNull().default(true),
    error_message: text('error_message'),
    error_code: varchar('error_code', { length: 50 }),

    // Performance
    duration_ms: integer('duration_ms'),

    // Compliance
    compliance_tags: varchar('compliance_tags', { length: 500 }), // Comma-separated tags

    // Use base table configuration for standard fields
    ...baseTableConfig,
  },
  _table => ({
    // Constraints and checks can be added here if needed
  })
);

// Key rotation audit logs (specialized table for key management)
export const key_rotation_logs = pgTable(
  'key_rotation_logs',
  {
    // Key information
    key_id: varchar('key_id', { length: 255 }).notNull(),
    key_version: varchar('key_version', { length: 100 }).notNull(),
    environment: varchar('environment', { length: 50 }).notNull(),

    // Rotation details
    rotation_type: varchar('rotation_type', { length: 50 }).notNull(), // 'manual', 'automatic', 'emergency'
    previous_key_id: varchar('previous_key_id', { length: 255 }),
    new_key_id: varchar('new_key_id', { length: 255 }),

    // User who performed the rotation
    rotated_by: varchar('rotated_by', { length: 255 }).notNull(),
    rotation_reason: text('rotation_reason'),

    // Impact assessment
    affected_records_count: integer('affected_records_count'),
    re_encryption_required: boolean('re_encryption_required').default(false),
    re_encryption_completed: boolean('re_encryption_completed').default(false),

    // Timing
    rotation_started_at: timestamp('rotation_started_at').notNull(),
    rotation_completed_at: timestamp('rotation_completed_at'),
    re_encryption_started_at: timestamp('re_encryption_started_at'),
    re_encryption_completed_at: timestamp('re_encryption_completed_at'),

    // Status
    status: varchar('status', { length: 50 }).notNull().default('in_progress'), // 'in_progress', 'completed', 'failed', 'rolled_back'

    // Details
    details: jsonb('details'),
    error_message: text('error_message'),

    // Use base table configuration for standard fields
    ...baseTableConfig,
  },
  _table => ({
    // Constraints and checks can be added here if needed
  })
);

// RLS access audit logs (specialized table for RLS monitoring)
export const rls_access_logs = pgTable(
  'rls_access_logs',
  {
    // Access context
    requesting_user_id: varchar('requesting_user_id', { length: 255 }).notNull(),
    target_user_id: varchar('target_user_id', { length: 255 }).notNull(),

    // Table and operation
    table_name: varchar('table_name', { length: 100 }).notNull(),
    operation: varchar('operation', { length: 20 }).notNull(), // 'SELECT', 'INSERT', 'UPDATE', 'DELETE'

    // RLS context
    rls_context_set: boolean('rls_context_set').notNull(),
    rls_policy_applied: varchar('rls_policy_applied', { length: 100 }),

    // Access result
    access_granted: boolean('access_granted').notNull(),
    rows_affected: integer('rows_affected'),
    sensitive_fields_accessed: varchar('sensitive_fields_accessed', { length: 500 }), // Comma-separated

    // Request details
    request_id: varchar('request_id', { length: 255 }),
    endpoint: varchar('endpoint', { length: 500 }),
    query_hash: varchar('query_hash', { length: 64 }), // SHA-256 hash of the query

    // Performance
    query_duration_ms: integer('query_duration_ms'),

    // Security
    ip_address: varchar('ip_address', { length: 45 }),
    user_agent: text('user_agent'),

    // Details
    details: jsonb('details'),
    error_message: text('error_message'),

    // Use base table configuration for standard fields
    ...baseTableConfig,
  },
  _table => ({
    // Constraints and checks can be added here if needed
  })
);
