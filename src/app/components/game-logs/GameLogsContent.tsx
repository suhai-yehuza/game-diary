'use client';

import { GameLogCard } from '@/app/components/game-logs/GameLogCard';
import { GameLogsPagination } from '@/app/components/game-logs/GameLogsPagination';
import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import { TabsContent } from '@/app/components/ui/Tabs';
import type { IGameLogsContentProps } from '@/lib/types';

const getLoadingMessage = (tabValue: string): string => {
  switch (tabValue) {
    case 'my-logs':
      return 'Loading your game logs...';
    case 'friends-logs':
      return "Loading friends' game logs...";
    case 'public-logs':
      return 'Loading public game logs...';
    default:
      return 'Loading...';
  }
};

const getEmptyMessage = (tabValue: string): string => {
  switch (tabValue) {
    case 'my-logs':
      return 'No game logs found. Create your first one!';
    case 'friends-logs':
      return "No friends' game logs found.";
    case 'public-logs':
      return 'No public game logs found.';
    default:
      return 'No game logs found.';
  }
};

export const GameLogsContent = ({
  tabValue,
  logs,
  loading,
  loadingMore = false,
  hasNextPage,
  totalCount,
  showActions = false,
  onLoadMore,
  onEdit,
  onDelete,
  filteredAndSortedLogs,
}: IGameLogsContentProps) => {
  const isMobile = useMobileDetection();

  // Only show loading message for initial load, not for pagination
  const isInitialLoading = loading && !loadingMore;

  return (
    <TabsContent
      value={tabValue}
      className={`space-y-4 ${isMobile ? 'space-y-3' : 'space-y-4'}`}
      data-testid={`tabs-content-${tabValue}`}
    >
      {isInitialLoading ? (
        <div className={`text-center ${isMobile ? 'py-6' : 'py-8'}`}>
          <div className="text-gray-600 mb-2">{getLoadingMessage(tabValue)}</div>
          <div className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Optimized loading with reduced page size
          </div>
        </div>
      ) : Array.isArray(logs) && logs.length === 0 ? (
        <div className={`text-center ${isMobile ? 'py-6' : 'py-8'}`}>
          <p className="text-gray-600">{getEmptyMessage(tabValue)}</p>
        </div>
      ) : Array.isArray(logs) ? (
        <div>
          <div className={`text-white mb-4 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Showing {logs.length} of {totalCount}{' '}
            {tabValue === 'my-logs' ? 'of your' : tabValue === 'friends-logs' ? "friends'" : ''}{' '}
            game logs
          </div>
          <div className={`space-y-3 ${isMobile ? 'space-y-2' : 'space-y-3'}`}>
            {filteredAndSortedLogs.map((log, idx) => (
              <GameLogCard
                key={`${log.id}`}
                log={log}
                showActions={showActions}
                idx={idx}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
          <GameLogsPagination
            hasNextPage={hasNextPage}
            loading={loadingMore}
            onLoadMore={onLoadMore}
          />
        </div>
      ) : null}
    </TabsContent>
  );
};
