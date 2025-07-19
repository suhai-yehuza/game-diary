'use client';

import { AdminDatabaseContent } from '@src/app/protected/admin/database/components/database-content';
import { ErrorBoundary } from '@src/app/protected/admin/database/components/ui/error-boundary';

export default function AdminDatabasePage() {
  return (
    <ErrorBoundary componentName="AdminDatabasePage">
      <div className="bg-background min-h-screen">
        <AdminDatabaseContent />
      </div>
    </ErrorBoundary>
  );
}
