'use client';

import { Button } from '@/app/components/ui/button';
import type { ISportsPaginationProps } from '@/lib/types';

// Interface moved to src/lib/types/components.types.ts

export function Pagination({ currentPage, totalPages, onPageChange }: ISportsPaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex justify-center items-center gap-1 sm:gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
      >
        ← Previous
      </Button>

      <div className="flex items-center gap-1">
        {getVisiblePages().map((page, index) => (
          <div key={page === '...' ? `ellipsis-${index}` : `page-${page}`}>
            {page === '...' ? (
              <span className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-gray-500">
                ...
              </span>
            ) : (
              <Button
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className="w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm"
              >
                {page}
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
      >
        Next →
      </Button>
    </div>
  );
}
