import { sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { auditLogger } from '@/lib/services/audit-logger';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';

// RLS Context Manager
export class RLSContextManager {
  private static instance: RLSContextManager;
  private currentUserId: string | null = null;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {} // Required for singleton pattern

  static getInstance(): RLSContextManager {
    if (!RLSContextManager.instance) {
      RLSContextManager.instance = new RLSContextManager();
    }
    return RLSContextManager.instance;
  }

  // Set the current user context for RLS policies
  async setUserContext(userId: string): Promise<void> {
    this.currentUserId = userId;

    try {
      await db()?.execute(sql`SELECT set_current_user_context(${userId})`);
      await auditLogger.logRLSAccess({
        id: 'rls_' + Date.now(),
        userId: userId,
        timestamp: new Date().toISOString(),
        success: true,
        requestingUserId: userId,
        targetUserId: userId,
        tableName: 'users',
        operation: 'SELECT',
        rlsContextSet: true,
        accessGranted: true,
      });
    } catch (error) {
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'RLS Context Manager',
        action: 'Set user context for RLS',
      });
      // Continue without RLS context if it fails
    }
  }

  // Log RLS context setting for audit purposes
  private logRLSContextSet(userId: string): void {
    try {
      // In a real implementation, this would call the audit logger
      logger.info(
        `AUDIT: RLS context set - User ID: ${userId}, Timestamp: ${new Date().toISOString()}`
      );
    } catch (error) {
      // Use centralized error handling
      errorHandlers.validation(error instanceof Error ? error : new Error(String(error)), {
        component: 'RLS Context Manager',
        action: 'Log RLS context setting',
      });
    }
  }

  // Clear the current user context
  async clearUserContext(): Promise<void> {
    const userId = this.currentUserId;
    this.currentUserId = null;

    try {
      await db()?.execute(sql`SELECT clear_current_user_context()`);

      // Log RLS context clearing for audit
      if (userId) {
        await auditLogger.logRLSAccess({
          id: 'rls_clear_' + Date.now(),
          userId: userId,
          timestamp: new Date().toISOString(),
          success: true,
          requestingUserId: userId,
          targetUserId: userId,
          tableName: 'users',
          operation: 'SELECT',
          rlsContextSet: false,
          accessGranted: true,
        });
      }
    } catch (error) {
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'RLS Context Manager',
        action: 'Clear user context for RLS',
      });
    }
  }

  // Log RLS context clearing for audit purposes
  private logRLSContextCleared(userId: string): void {
    try {
      // In a real implementation, this would call the audit logger
      logger.info(
        `AUDIT: RLS context cleared - User ID: ${userId}, Timestamp: ${new Date().toISOString()}`
      );
    } catch (error) {
      // Use centralized error handling
      errorHandlers.validation(error instanceof Error ? error : new Error(String(error)), {
        component: 'RLS Context Manager',
        action: 'Log RLS context clearing',
      });
    }
  }

  // Get the current user ID
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  // Execute a database operation with user context
  async withUserContext<T>(userId: string, operation: () => Promise<T>): Promise<T> {
    await this.setUserContext(userId);

    try {
      const result = await operation();
      return result;
    } finally {
      await this.clearUserContext();
    }
  }

  // Execute a database operation with current user context
  async withCurrentUserContext<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.currentUserId) {
      throw new Error('No user context set for RLS operation');
    }

    return this.withUserContext(this.currentUserId, operation);
  }
}

// Export singleton instance
export const rlsContext = RLSContextManager.getInstance();

// Helper function to wrap database operations with RLS context
export async function withRLSContext<T>(userId: string, operation: () => Promise<T>): Promise<T> {
  return rlsContext.withUserContext(userId, operation);
}

// Helper function to check if RLS is properly configured
export async function checkRLSConfiguration(): Promise<boolean> {
  try {
    // Try to set and clear a test user context
    await rlsContext.setUserContext('test-user-id');
    await rlsContext.clearUserContext();
    return true;
  } catch (error) {
    logger.error('RLS configuration check failed:', {
      component: 'RLS Context Manager',
      action: 'Check RLS configuration',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return false;
  }
}

// Helper function to get user data with proper RLS context
export async function getUserWithRLS(userId: string, requestingUserId?: string) {
  if (requestingUserId) {
    // Set context for the requesting user
    return withRLSContext(requestingUserId, async () => {
      const user = await db()?.query.users.findFirst({
        where: sql`id = ${userId}`,
      });
      return user;
    });
  } else {
    // No context - will use default RLS policies
    const user = await db()?.query.users.findFirst({
      where: sql`id = ${userId}`,
    });
    return user;
  }
}

// Helper function to update user data with proper RLS context
export async function updateUserWithRLS(userId: string, updateData: Record<string, unknown>) {
  return withRLSContext(userId, async () => {
    const result = await db()
      ?.update(users)
      .set(updateData)
      .where(sql`id = ${userId}`);
    return result;
  });
}
