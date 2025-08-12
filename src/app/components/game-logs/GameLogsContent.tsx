'use client';

import { GameLogCard } from '@/app/components/game-logs/GameLogCard';
import { GameLogsPagination } from '@/app/components/game-logs/GameLogsPagination';
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
  hasNextPage,
  totalCount,
  showActions = false,
  onLoadMore,
  onEdit,
  onDelete,
  filteredAndSortedLogs,
}: IGameLogsContentProps) => {
  return (
    <TabsContent value={tabValue} className="space-y-4" data-testid={`tabs-content-${tabValue}`}>
      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-600 mb-2">{getLoadingMessage(tabValue)}</div>
          <div className="text-sm text-gray-500">Optimized loading with reduced page size</div>
        </div>
      ) : Array.isArray(logs) && logs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">{getEmptyMessage(tabValue)}</p>
        </div>
      ) : Array.isArray(logs) ? (
        <div>
          <div className="text-sm text-gray-500 mb-4">
            Showing {logs.length} of {totalCount}{' '}
            {tabValue === 'my-logs' ? 'of your' : tabValue === 'friends-logs' ? "friends'" : ''}{' '}
            game logs
          </div>
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
          <GameLogsPagination hasNextPage={hasNextPage} loading={loading} onLoadMore={onLoadMore} />
        </div>
      ) : null}
    </TabsContent>
  );
};
