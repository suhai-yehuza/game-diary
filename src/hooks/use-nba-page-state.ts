import { useCallback, useState } from 'react';

import { API_CONFIG } from '@/lib/config/app.config';
import type { INBAPageState, INBAPageActions } from '@/types';

export function useNBAPageState(
  initialPageSize = API_CONFIG.pagination.DEFAULT_PAGE_SIZE
): INBAPageState & INBAPageActions {
  const [forceRefresh, setForceRefresh] = useState(false);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: string) => {
    const newSize = parseInt(newPageSize);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const handleForceRefresh = useCallback(() => {
    setForceRefresh(true);
    setTimeout(() => setForceRefresh(false), 1000);
  }, []);

  return {
    // State
    forceRefresh,
    pageSize,
    currentPage,
    // Actions
    setForceRefresh,
    setPageSize,
    setCurrentPage,
    handlePageChange,
    handlePageSizeChange,
    handleForceRefresh,
  };
}
