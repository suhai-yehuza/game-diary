'use client';

import React from 'react';

import { TableWithSearch } from '@/app/protected/admin/database/components/TableWithSearch';

export function GameLogsTableWithSearch() {
  // TODO: Add custom search support if needed in TableWithSearch
  return (
    <TableWithSearch
      endpoint="/api/admin/database/game_logs"
      columns={[
        { key: 'id', label: 'id', sortable: true },
        { key: 'user_id', label: 'user_id', sortable: true },
        { key: 'game_id', label: 'game_id', sortable: true },
        { key: 'rating_for_game', label: 'rating_for_game', sortable: true },
        { key: 'classification', label: 'classification', sortable: true },
        { key: 'created_at', label: 'created_at', sortable: true },
      ]}
      itemLabel="game logs"
      tableName="GameLogs"
    />
  );
}
