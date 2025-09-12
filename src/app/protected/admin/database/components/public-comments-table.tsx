'use client';

import React from 'react';

import TableWithSearch from '@/app/protected/admin/database/components/TableWithSearch';

export function PublicCommentsTableWithSearch() {
  return (
    <TableWithSearch
      columns={[
        { key: 'id', label: 'id', sortable: true },
        { key: 'user_id', label: 'user_id', sortable: true },
        { key: 'anonymous_name', label: 'anonymous_name', sortable: true },
        { key: 'parent_id', label: 'parent_id', sortable: true },
        { key: 'parent_type', label: 'parent_type', sortable: true },
        { key: 'content', label: 'content', sortable: true },
        { key: 'is_approved', label: 'is_approved', sortable: true },
        { key: 'created_at', label: 'created_at', sortable: true },
      ]}
      itemLabel="public comments"
      tableName="public_comments"
    />
  );
}
