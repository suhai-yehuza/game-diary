'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal, SkipBack, SkipForward } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/app/components/ui/button';
import type { ISportsPaginationProps } from '@/types';

export function Pagination({ currentPage, totalPages, onPageChange }: ISportsPaginationProps) {
  const [goToPage, setGoToPage] = useState('');

  if (totalPages <= 1) return null;

  const handleGoToPage = () => {
    const page = parseInt(goToPage);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setGoToPage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGoToPage();
    }
  };

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
    <div className="flex flex-col items-center gap-6 mt-12">
      {/* Main pagination controls */}
      <div className="flex items-center gap-1 sm:gap-2 bg-surface-card rounded-xl p-2 shadow-lg border border-theme-primary">
        {/* First page button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0 hover:bg-bg-theme-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        {/* Previous page button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 px-3 hover:bg-semantic-info/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            <div key={page === '...' ? `ellipsis-${index}` : `page-${page}`}>
              {page === '...' ? (
                <div className="flex items-center justify-center h-9 w-9">
                  <MoreHorizontal className="h-4 w-4 text-theme-muted" />
                </div>
              ) : (
                <Button
                  variant={currentPage === page ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className={`h-9 w-9 p-0 font-medium transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                      : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Next page button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 px-3 hover:bg-semantic-info/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>

        {/* Last page button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 p-0 hover:bg-bg-theme-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Go to page input */}
      {totalPages > 1 && (
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Jump to:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={totalPages}
              value={goToPage}
              onChange={e => setGoToPage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={currentPage.toString()}
              className="w-20 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoToPage}
              disabled={!goToPage || parseInt(goToPage) < 1 || parseInt(goToPage) > totalPages}
              className="px-4 py-1.5 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
            >
              Go
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
