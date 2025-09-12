'use client';

import React from 'react';

import TableWithSearch from '@/app/protected/admin/database/components/TableWithSearch';

export function PublicReactionsTableWithSearch() {
  return (
    <TableWithSearch
      columns={[
        { key: 'id', label: 'id', sortable: true },
        { key: 'user_id', label: 'user_id', sortable: true },
        { key: 'anonymous_name', label: 'anonymous_name', sortable: true },
        { key: 'target_type', label: 'target_type', sortable: true },
        { key: 'target_id', label: 'target_id', sortable: true },
        { key: 'emoji', label: 'emoji', sortable: true },
        { key: 'created_at', label: 'created_at', sortable: true },
      ]}
      itemLabel="public reactions"
      tableName="public_reactions"
    />
  );
}
