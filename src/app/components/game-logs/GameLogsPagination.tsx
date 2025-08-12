'use client';

import { Button } from '@/app/components/ui/button';
import type { IGameLogsPaginationProps } from '@/lib/types';

export const GameLogsPagination = ({
  hasNextPage,
  loading,
  onLoadMore,
  loadMoreText = 'Load More',
}: IGameLogsPaginationProps) => {
  if (!hasNextPage) {
    return null;
  }

  const loadMoreButtonClass =
    'bg-blue-600 text-white rounded-full px-6 py-2 font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="flex justify-center mt-8 mb-4">
      <Button onClick={onLoadMore} disabled={loading} className={loadMoreButtonClass}>
        {loading ? 'Loading...' : loadMoreText}
      </Button>
    </div>
  );
};
