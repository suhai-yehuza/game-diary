'use client';

import React from 'react';

import { TableWithSearch } from '@/app/protected/admin/database/components/TableWithSearch';

export function CommentsTableWithSearch() {
  return (
    <TableWithSearch
      endpoint="/api/admin/database/comments"
      columns={[
        { key: 'id', label: 'id', sortable: true },
        { key: 'user_id', label: 'user_id', sortable: true },
        { key: 'parent_id', label: 'parent_id', sortable: true },
        { key: 'parent_type', label: 'parent_type', sortable: true },
        { key: 'content', label: 'content', sortable: true },
        { key: 'created_at', label: 'created_at', sortable: true },
      ]}
      itemLabel="comments"
      tableName="Comments"
    />
  );
}
