import React, { useState, useCallback } from 'react';

import type { SortDirection } from '@src/app/protected/admin/database/components/ui/sortable-header';

export interface ISortConfig {
  key: string | null;
  direction: SortDirection;
}

export interface IUseSortingReturn {
  sortConfig: ISortConfig;
  handleSort: (key: string, direction: SortDirection) => void;
  clearSort: () => void;
  getSortParams: () => { sortKey: string | null; sortDirection: SortDirection };
}

export function useSorting(initialSortKey: string | null = null): IUseSortingReturn {
  const [sortConfig, setSortConfig] = useState<ISortConfig>({
    key: initialSortKey,
    direction: initialSortKey ? 'asc' : null,
  });

  const handleSort = useCallback((key: string, direction: SortDirection) => {
    setSortConfig({ key: direction ? key : null, direction });
  }, []);

  const clearSort = useCallback(() => {
    setSortConfig({ key: null, direction: null });
  }, []);

  const getSortParams = useCallback(
    () => ({
      sortKey: sortConfig.key,
      sortDirection: sortConfig.direction,
    }),
    [sortConfig.key, sortConfig.direction]
  );

  return React.useMemo(
    () => ({
      sortConfig,
      handleSort,
      clearSort,
      getSortParams,
    }),
    [sortConfig, handleSort, clearSort, getSortParams]
  );
}
