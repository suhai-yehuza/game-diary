'use client';

import React from 'react';

import { TableWithSearch } from '@/app/protected/admin/database/components/TableWithSearch';

export function FriendshipsTableWithSearch() {
  return (
    <TableWithSearch
      endpoint="/api/admin/database/friendships"
      columns={[
        { key: 'id', label: 'id', sortable: true },
        { key: 'user_id', label: 'user_id', sortable: true },
        { key: 'friend_id', label: 'friend_id', sortable: true },
        { key: 'status', label: 'status', sortable: true },
        { key: 'created_at', label: 'created_at', sortable: true },
      ]}
      itemLabel="friendships"
      tableName="Friendships"
    />
  );
}
