import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auditLogger } from '@/lib/services/audit-logger';

export interface IAdminAuthContext {
  userId: string;
  isAdmin: boolean;
  userEmail?: string;
}

export async function adminAuthMiddleware(
  request: NextRequest
): Promise<NextResponse | IAdminAuthContext> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      await auditLogger.logAuditEvent({
        category: 'authentication',
        action: 'login_failed',
        severity: 'high',
        description: 'Unauthenticated access attempt to admin endpoint',
        endpoint: request.url,
        method: request.method,
        success: false,
        errorMessage: 'User not authenticated',
      });

      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user has admin role
    const userRoles = (sessionClaims?.metadata as { role?: string[] })?.role ?? [];
    const isAdmin = userRoles.includes('admin') || userRoles.includes('Admin');

    if (!isAdmin) {
      await auditLogger.logAuditEvent({
        category: 'authorization',
        action: 'permission_denied',
        severity: 'high',
        userId,
        description: 'Non-admin user attempted to access admin endpoint',
        endpoint: request.url,
        method: request.method,
        success: false,
        errorMessage: 'Insufficient permissions',
        details: { userRoles },
      });

      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Log successful admin access
    await auditLogger.logAuditEvent({
      category: 'authorization',
      action: 'permission_granted',
      severity: 'medium',
      userId,
      description: 'Admin user accessed admin endpoint',
      endpoint: request.url,
      method: request.method,
      success: true,
      details: { userRoles },
    });

    return {
      userId,
      isAdmin: true,
      userEmail: sessionClaims?.email as string,
    };
  } catch (error) {
    console.error('Admin auth middleware error:', error);

    await auditLogger.logAuditEvent({
      category: 'authentication',
      action: 'login_failed',
      severity: 'critical',
      description: 'Error in admin authentication middleware',
      endpoint: request.url,
      method: request.method,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({ error: 'Authentication service error' }, { status: 500 });
  }
}

export function withAdminAuth<T extends unknown[]>(
  handler: (context: IAdminAuthContext, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    const authResult = await adminAuthMiddleware(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    return handler(authResult, ...args);
  };
}
