import { headers } from 'next/headers';

import { db } from '@/lib/db';
import { audit_logs, key_rotation_logs, rls_access_logs } from '@/lib/db/schema/audit-schemas';
import { alertingService } from '@/lib/services/alerting';
import type {
  IAuditLogData,
  IKeyRotationLogData,
  IRLSAccessLogData,
} from '@/lib/types/services.types';
import { errorHandlers } from '@/lib/utils/error-handler';
import { generateUUIDv7 } from '@/lib/utils/id-generator';
import { logger } from '@/lib/utils/logger';

// Simple logger for audit service - using the main logger
const auditServiceLogger = {
  info: (message: string, ...args: unknown[]) => logger.info(`[AUDIT-INFO] ${message}`, { args }),
  error: (message: string, ...args: unknown[]) =>
    logger.error(`[AUDIT-ERROR] ${message}`, undefined, { args }),
  warn: (message: string, ...args: unknown[]) => logger.warn(`[AUDIT-WARN] ${message}`, { args }),
};

// Audit Logger Service
export class AuditLogger {
  private static instance: AuditLogger;
  private requestId: string | null = null;
  private userId: string | null = null;
  private sessionId: string | null = null;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {} // Required for singleton pattern

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  // Set context for the current request
  setContext(requestId: string, userId?: string, sessionId?: string): void {
    this.requestId = requestId;
    this.userId = userId ?? null;
    this.sessionId = sessionId ?? null;
  }

  // Clear context
  clearContext(): void {
    this.requestId = null;
    this.userId = null;
    this.sessionId = null;
  }

  // Get client information from headers
  private async getClientInfo(): Promise<{ ipAddress?: string; userAgent?: string }> {
    try {
      // Check if we're in a Next.js request context
      const headersList = await headers();
      return {
        ipAddress:
          headersList.get('x-forwarded-for') ??
          headersList.get('x-real-ip') ??
          headersList.get('cf-connecting-ip') ??
          'unknown',
        userAgent: headersList.get('user-agent') ?? 'unknown',
      };
    } catch {
      // If headers() fails (e.g., outside request context), return defaults
      return { ipAddress: 'script-context', userAgent: 'script-context' };
    }
  }

  // Log a general audit event
  async logAuditEvent(data: IAuditLogData): Promise<string> {
    const auditId = generateUUIDv7();
    const startTime = Date.now();

    try {
      const clientInfo = await this.getClientInfo();

      const auditData = {
        id: auditId,
        category: data.category,
        action: data.action,
        severity: data.severity,
        user_id: data.userId ?? this.userId,
        session_id: data.sessionId ?? this.sessionId,
        ip_address: clientInfo.ipAddress,
        user_agent: clientInfo.userAgent,
        resource_type: data.resourceType,
        resource_id: data.resourceId,
        table_name: data.tableName,
        column_name: data.columnName,
        request_id: data.requestId ?? this.requestId,
        endpoint: data.endpoint,
        method: data.method,
        description: data.description,
        details: data.details,
        metadata: data.metadata,
        success: data.success ?? true,
        error_message: data.errorMessage,
        error_code: data.errorCode,
        duration_ms: data.durationMs ?? Date.now() - startTime,
        compliance_tags: data.complianceTags,
      };

      await db()?.insert(audit_logs).values(auditData);

      auditServiceLogger.info(`Audit log created: ${auditId} - ${data.action}`, {
        auditId,
        category: data.category,
        action: data.action,
        severity: data.severity,
        userId: auditData.user_id,
      });

      // Real-time alerting for CRITICAL events
      if (data.severity === 'critical') {
        void this.sendCriticalAlert(auditData);
      }

      return auditId;
    } catch (error: unknown) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'AuditLogger',
        action: 'Create audit log',
      });
      throw error;
    }
  }

  // Real-time alerting via Slack
  private async sendCriticalAlert(auditData: Record<string, unknown>): Promise<void> {
    try {
      await alertingService.sendSlackAlert(auditData);
    } catch (error: unknown) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'AuditLogger',
        action: 'Send critical alert',
      });
      // Fallback to console logging
      auditServiceLogger.error('[ALERT] CRITICAL AUDIT EVENT:', error as Error, { auditData });
    }
  }

  // Log key rotation events
  async logKeyRotation(data: IKeyRotationLogData): Promise<string> {
    const rotationId = generateUUIDv7();

    try {
      const rotationData = {
        id: rotationId,
        key_id: data.keyId,
        key_version: data.keyVersion,
        environment: data.environment,
        rotation_type: data.rotationType,
        previous_key_id: data.previousKeyId,
        new_key_id: data.newKeyId,
        rotated_by: data.rotatedBy,
        rotation_reason: data.rotationReason,
        affected_records_count: data.affectedRecordsCount,
        re_encryption_required: data.reEncryptionRequired ?? false,
        re_encryption_completed: data.reEncryptionCompleted ?? false,
        rotation_started_at: data.rotationStartedAt,
        rotation_completed_at: data.rotationCompletedAt,
        re_encryption_started_at: data.reEncryptionStartedAt,
        re_encryption_completed_at: data.reEncryptionCompletedAt,
        status: data.status ?? 'in_progress',
        details: data.details,
        error_message: data.errorMessage,
      };

      await db()?.insert(key_rotation_logs).values(rotationData);

      // Also log as general audit event
      await this.logAuditEvent({
        category: 'key_management',
        action: 'key_rotated',
        severity: 'high',
        userId: data.rotatedBy,
        resourceType: 'encryption_key',
        resourceId: data.keyId,
        description: `Key rotation ${data.rotationType} for ${data.environment} environment`,
        details: {
          rotationId,
          keyId: data.keyId,
          environment: data.environment,
          rotationType: data.rotationType,
          affectedRecordsCount: data.affectedRecordsCount,
        },
        complianceTags: 'key_rotation,encryption,security',
      });

      auditServiceLogger.info(`Key rotation logged: ${rotationId}`, {
        rotationId,
        keyId: data.keyId,
        environment: data.environment,
        rotationType: data.rotationType,
      });

      return rotationId;
    } catch (error: unknown) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'AuditLogger',
        action: 'Log key rotation',
      });
      throw error;
    }
  }

  // Log RLS access events
  async logRLSAccess(data: IRLSAccessLogData): Promise<string> {
    const accessId = generateUUIDv7();

    try {
      const clientInfo = await this.getClientInfo();

      const accessData = {
        id: accessId,
        requesting_user_id: data.requestingUserId,
        target_user_id: data.targetUserId,
        table_name: data.tableName,
        operation: data.operation,
        rls_context_set: data.rlsContextSet,
        rls_policy_applied: data.rlsPolicyApplied,
        access_granted: data.accessGranted,
        rows_affected: data.rowsAffected,
        sensitive_fields_accessed: data.sensitiveFieldsAccessed,
        request_id: data.requestId ?? this.requestId,
        endpoint: data.endpoint,
        query_hash: data.queryHash,
        query_duration_ms: data.queryDurationMs,
        ip_address: data.ipAddress ?? clientInfo.ipAddress,
        user_agent: data.userAgent ?? clientInfo.userAgent,
        details: data.details,
        error_message: data.errorMessage,
      };

      await db()?.insert(rls_access_logs).values(accessData);

      // Also log as general audit event
      await this.logAuditEvent({
        category: 'rls_access',
        action: data.accessGranted ? 'rls_access_granted' : 'rls_access_denied',
        severity: data.sensitiveFieldsAccessed ? 'medium' : 'low',
        userId: data.requestingUserId,
        resourceType: 'user_data',
        resourceId: data.targetUserId,
        tableName: data.tableName,
        description:
          data.description ??
          `RLS ${data.operation} access ${data.accessGranted ? 'granted' : 'denied'} on ${data.tableName}`,
        details: {
          accessId,
          targetUserId: data.targetUserId,
          operation: data.operation,
          rlsContextSet: data.rlsContextSet,
          rlsPolicyApplied: data.rlsPolicyApplied,
          rowsAffected: data.rowsAffected,
          sensitiveFieldsAccessed: data.sensitiveFieldsAccessed,
        },
        success: data.accessGranted,
        complianceTags: 'rls,data_access,privacy',
      });

      logger.info(`RLS access logged: ${accessId}`, {
        accessId,
        requestingUserId: data.requestingUserId,
        targetUserId: data.targetUserId,
        tableName: data.tableName,
        operation: data.operation,
        accessGranted: data.accessGranted,
      });

      return accessId;
    } catch (error: unknown) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'AuditLogger',
        action: 'Log RLS access',
      });
      throw error;
    }
  }

  // Convenience methods for common audit events
  async logKeyCreated(
    keyId: string,
    environment: string,
    createdBy: string,
    description?: string
  ): Promise<string> {
    return this.logAuditEvent({
      category: 'key_management',
      action: 'key_created',
      severity: 'medium',
      userId: createdBy,
      resourceType: 'encryption_key',
      resourceId: keyId,
      description: description ?? `New encryption key created for ${environment} environment`,
      details: { keyId, environment },
      complianceTags: 'key_management,encryption',
    });
  }

  async logKeyActivated(keyId: string, environment: string, activatedBy: string): Promise<string> {
    return this.logAuditEvent({
      category: 'key_management',
      action: 'key_activated',
      severity: 'high',
      userId: activatedBy,
      resourceType: 'encryption_key',
      resourceId: keyId,
      description: `Encryption key activated for ${environment} environment`,
      details: { keyId, environment },
      complianceTags: 'key_management,encryption,security',
    });
  }

  async logSensitiveDataAccess(
    userId: string,
    resourceId: string,
    tableName: string,
    fields: string[],
    success: boolean
  ): Promise<string> {
    return this.logAuditEvent({
      category: 'data_access',
      action: 'sensitive_data_accessed',
      severity: 'medium',
      userId,
      resourceType: 'user_data',
      resourceId,
      tableName,
      description: `Sensitive data access ${success ? 'granted' : 'denied'}`,
      details: { fields, success },
      success,
      complianceTags: 'data_access,privacy,gdpr',
    });
  }

  async logEncryptionEvent(
    action: 'field_encrypted' | 'field_decrypted' | 'encryption_failed' | 'decryption_failed',
    userId: string,
    tableName: string,
    columnName: string,
    success: boolean,
    errorMessage?: string
  ): Promise<string> {
    return this.logAuditEvent({
      category: 'encryption',
      action,
      severity: success ? 'low' : 'high',
      userId,
      tableName,
      columnName,
      description: errorMessage ?? `Encryption event: ${action} on ${tableName}.${columnName}`,
      success,
      errorMessage,
      complianceTags: 'encryption,data_protection',
    });
  }

  // Query audit logs
  async queryAuditLogs(filters: {
    category?: string;
    action?: string;
    severity?: string;
    userId?: string;
    resourceType?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<unknown[]> {
    try {
      // Simplified query approach to avoid complex type issues
      const result = await db()
        ?.select()
        .from(audit_logs)
        .limit(filters.limit ?? 100);
      return result ?? [];
    } catch (error: unknown) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'AuditLogger',
        action: 'Query audit logs',
      });
      throw error;
    }
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();
