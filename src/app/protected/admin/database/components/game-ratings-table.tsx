'use client';

import TableWithSearch from '@/app/protected/admin/database/components/TableWithSearch';

export function GameRatingsTableWithSearch() {
  return (
    <TableWithSearch
      columns={[
        { key: 'id', label: 'id', sortable: true },
        { key: 'game_id', label: 'game_id', sortable: true },
        { key: 'average_rating', label: 'average_rating', sortable: true },
        { key: 'total_ratings', label: 'total_ratings', sortable: true },
        { key: 'created_at', label: 'created_at', sortable: true },
      ]}
      itemLabel="game ratings"
      tableName="game_ratings"
    />
  );
}
