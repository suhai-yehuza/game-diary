'use client';

import React from 'react';

import TableWithSearch from '@/app/protected/admin/database/components/TableWithSearch';

export function UsersTableWithSearch() {
  // TODO: Add custom search support if needed in TableWithSearch
  return (
    <TableWithSearch
      columns={[
        { key: 'id', label: 'id', sortable: true },
        { key: 'username', label: 'username', sortable: true },
        { key: 'first_name', label: 'first_name', sortable: true },
        { key: 'last_name', label: 'last_name', sortable: true },
        { key: 'created_at', label: 'created_at', sortable: true },
      ]}
      itemLabel="users"
      tableName="users"
    />
  );
}
