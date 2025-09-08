import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auditLogger } from '@/lib/services/audit-logger';
import type { IAdminAuthContext } from '@/types';

// Helper to safely extract user roles
function getUserRoles(sessionClaims: unknown): string[] {
  if (
    sessionClaims &&
    typeof sessionClaims === 'object' &&
    'metadata' in sessionClaims &&
    typeof (sessionClaims as { metadata?: unknown }).metadata === 'object' &&
    sessionClaims.metadata !== null &&
    Array.isArray((sessionClaims as { metadata: { role?: unknown } }).metadata.role)
  ) {
    return (sessionClaims as { metadata: { role: string[] } }).metadata.role;
  }
  return [];
}

// Helper to safely extract email
function getUserEmail(sessionClaims: unknown): string | undefined {
  if (
    sessionClaims &&
    typeof sessionClaims === 'object' &&
    'email' in sessionClaims &&
    typeof (sessionClaims as { email?: unknown }).email === 'string'
  ) {
    return (sessionClaims as { email: string }).email;
  }
  return undefined;
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
        details: { endpoint: request.url, method: request.method },
      });

      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user has admin role
    const userRoles = getUserRoles(sessionClaims);
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
      user: null, // Middleware doesn't provide full user object
      isAdmin: true,
      permissions: ['admin'], // Basic admin permissions
      loading: false,
      error: null,
      userId,
      userEmail: getUserEmail(sessionClaims),
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Admin auth middleware error:', err);

    await auditLogger.logAuditEvent({
      category: 'authentication',
      action: 'login_failed',
      severity: 'critical',
      description: 'Error in admin authentication middleware',
      endpoint: request.url,
      method: request.method,
      success: false,
      errorMessage: err.message,
      details: { error: err.message, endpoint: request.url, method: request.method },
    });

    return NextResponse.json({ error: 'Authentication service error' }, { status: 500 });
  }
}

export function withAdminAuth<T extends unknown[]>(
  handler: (context: IAdminAuthContext, request: NextRequest, ...args: T) => Promise<Response>
) {
  return async (
    request: NextRequest,
    context: { params: Promise<{ [key: string]: string }> },
    ...args: T
  ): Promise<Response> => {
    const authResult = await adminAuthMiddleware(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    return handler(authResult, request, ...args);
  };
}
