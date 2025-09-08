import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import type { IPaginationControlsProps } from '@/types';
import { Button } from '@src/app/protected/admin/database/components/ui/button';

export function PaginationControls({
  totalCount,
  currentPage,
  pageInfo,
  loading,
  onFirst,
  onPrev,
  onNext,
  onLast,
}: IPaginationControlsProps) {
  if (totalCount === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-4">
      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          onClick={onFirst}
          disabled={!pageInfo?.hasPreviousPage || loading}
          variant="outline"
          size="sm"
          className="flex items-center space-x-1 text-xs"
        >
          <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">First</span>
        </Button>
        <Button
          onClick={onPrev}
          disabled={!pageInfo?.hasPreviousPage || loading}
          variant="outline"
          size="sm"
          className="flex items-center space-x-1 text-xs"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
      </div>

      <div className="px-2 sm:px-4 py-1 sm:py-2 bg-muted rounded-md">
        <span className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Page {currentPage}
        </span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          onClick={onNext}
          disabled={!pageInfo?.hasNextPage || loading}
          variant="outline"
          size="sm"
          className="flex items-center space-x-1 text-xs"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button
          onClick={onLast}
          disabled={!pageInfo?.hasNextPage || loading}
          variant="outline"
          size="sm"
          className="flex items-center space-x-1 text-xs"
        >
          <span className="hidden sm:inline">Last</span>
          <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
}
