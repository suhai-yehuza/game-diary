'use client';

import React from 'react';

import { TableWithSearch } from '@/app/protected/admin/database/components/TableWithSearch';

export function NotificationsTableWithSearch() {
  return (
    <TableWithSearch
      endpoint="/api/admin/database/notifications"
      columns={[
        { key: 'id', label: 'id', sortable: true },
        { key: 'user_id', label: 'user_id', sortable: true },
        { key: 'type', label: 'type', sortable: true },
        { key: 'title', label: 'title', sortable: true },
        { key: 'read', label: 'read', sortable: true },
        { key: 'created_at', label: 'created_at', sortable: true },
      ]}
      itemLabel="notifications"
      tableName="Notifications"
    />
  );
}
