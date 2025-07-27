import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button } from '@src/app/protected/admin/database/components/ui/button';

interface IPaginationControlsProps {
  totalCount: number;
  currentPage: number;
  pageInfo: {
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  loading: boolean;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
}

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
    <div className="flex items-center justify-center space-x-2 mt-4">
      <Button
        onClick={onFirst}
        disabled={!pageInfo.hasPreviousPage || loading}
        variant="outline"
        size="sm"
        className="flex items-center space-x-1"
      >
        <ChevronsLeft className="h-4 w-4" />
        <span>First</span>
      </Button>
      <Button
        onClick={onPrev}
        disabled={!pageInfo.hasPreviousPage || loading}
        variant="outline"
        size="sm"
        className="flex items-center space-x-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Previous</span>
      </Button>

      <div className="px-4 py-2 bg-muted rounded-md">
        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Page {currentPage}
        </span>
      </div>

      <Button
        onClick={onNext}
        disabled={!pageInfo.hasNextPage || loading}
        variant="outline"
        size="sm"
        className="flex items-center space-x-1"
      >
        <span>Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        onClick={onLast}
        disabled={!pageInfo.hasNextPage || loading}
        variant="outline"
        size="sm"
        className="flex items-center space-x-1"
      >
        <span>Last</span>
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
