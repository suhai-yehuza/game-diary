// Services types
import type {
  AUDIT_CATEGORIES,
  AUDIT_SEVERITY,
  AUDIT_ACTIONS,
} from '@/lib/db/schema/audit-schemas';

// Logger Service Types
export interface ILogContext {
  component?: string;
  function?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  ipAddress?: string;
  userAgent?: string;
  [key: string]: unknown;
}

// Audit Logger Service Types
export interface IAuditLogData {
  category: (typeof AUDIT_CATEGORIES)[keyof typeof AUDIT_CATEGORIES];
  action: (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
  severity: (typeof AUDIT_SEVERITY)[keyof typeof AUDIT_SEVERITY];
  userId?: string;
  sessionId?: string;
  resourceType?: string;
  resourceId?: string;
  tableName?: string;
  columnName?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  description?: string;
  details?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  success?: boolean;
  errorMessage?: string;
  errorCode?: string;
  durationMs?: number;
  complianceTags?: string;
}

export interface IKeyRotationLogData {
  keyId: string;
  keyVersion: string;
  environment: string;
  rotationType: 'manual' | 'automatic' | 'emergency';
  previousKeyId?: string;
  newKeyId?: string;
  rotatedBy: string;
  rotationReason?: string;
  affectedRecordsCount?: number;
  reEncryptionRequired?: boolean;
  reEncryptionCompleted?: boolean;
  rotationStartedAt: Date;
  rotationCompletedAt?: Date;
  reEncryptionStartedAt?: Date;
  reEncryptionCompletedAt?: Date;
  status?: 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  details?: Record<string, unknown>;
  errorMessage?: string;
}

export interface IRLSAccessLogData {
  requestingUserId: string;
  targetUserId: string;
  tableName: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  rlsContextSet: boolean;
  rlsPolicyApplied?: string;
  accessGranted: boolean;
  rowsAffected?: number;
  sensitiveFieldsAccessed?: string;
  requestId?: string;
  endpoint?: string;
  queryHash?: string;
  queryDurationMs?: number;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  errorMessage?: string;
  description?: string;
}

// Alerting Service Types
export interface ISlackMessage {
  text: string;
  blocks?: Array<{
    type: string;
    text?: { type: string; text: string };
    fields?: Array<{ type: string; text: string }>;
    elements?: Array<{ type: string; text: string }>;
  }>;
}
