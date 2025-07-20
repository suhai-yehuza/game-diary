'use client';

import { AdminAuditLogsContent } from '@/app/protected/admin/audit-logs/components/audit-logs-content';
import { ErrorBoundary } from '@src/app/protected/admin/database/components/ui/error-boundary';

export default function AdminAuditLogsPage() {
  return (
    <ErrorBoundary componentName="AdminAuditLogsPage">
      <div className="bg-background min-h-screen">
        <AdminAuditLogsContent />
      </div>
    </ErrorBoundary>
  );
}
