import React, { useState, useCallback } from 'react';

import type { ISortConfig, IUseSortingReturn } from '@/lib/types';
import type { SortDirection } from '@src/app/protected/admin/database/components/ui/sortable-header';

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
