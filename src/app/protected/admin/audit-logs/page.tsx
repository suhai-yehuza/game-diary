'use client';

import { ErrorBoundary } from '@src/app/protected/admin/database/components/ui/error-boundary';

import { AdminAuditLogsContent } from './components/audit-logs-content';

export default function AdminAuditLogsPage() {
  return (
    <ErrorBoundary componentName="AdminAuditLogsPage">
      <div className="bg-background min-h-screen">
        <AdminAuditLogsContent />
      </div>
    </ErrorBoundary>
  );
}
