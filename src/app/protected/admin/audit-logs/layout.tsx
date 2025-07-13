import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { auditLogger } from '@/lib/services/audit-logger';

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

export default async function AdminAuditLogsLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user has admin role
  const userRoles = getUserRoles(sessionClaims);
  const isAdmin = userRoles.includes('admin') || userRoles.includes('Admin');

  if (!isAdmin) {
    // Log unauthorized access attempt
    void auditLogger.logAuditEvent({
      category: 'authorization',
      action: 'permission_denied',
      severity: 'high',
      userId,
      description: 'Non-admin user attempted to access admin audit logs page',
      success: false,
      errorMessage: 'Insufficient permissions',
      details: { userRoles, page: '/admin/audit-logs' },
    });

    redirect('/protected/user');
  }

  // Log successful admin page access
  void auditLogger.logAuditEvent({
    category: 'authorization',
    action: 'permission_granted',
    severity: 'medium',
    userId,
    description: 'Admin user accessed audit logs page',
    success: true,
    details: { userRoles, page: '/admin/audit-logs' },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Audit Logs</h1>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
