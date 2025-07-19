'use client';

import { AdminDatabaseContent } from '@src/app/protected/admin/database/components/database-content';

export default function AdminDatabasePage() {
  return (
    <div className="bg-background min-h-screen">
      <AdminDatabaseContent />
    </div>
  );
}
