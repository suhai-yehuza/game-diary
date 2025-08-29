'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

import { CreateGameLogModal } from '@/app/components/game-logs/CreateGameLogModal';
import { DeleteGameLogModal } from '@/app/components/game-logs/DeleteGameLogModal';
import { EditGameLogModal } from '@/app/components/game-logs/EditGameLogModal';
import { GameLogsContent } from '@/app/components/game-logs/GameLogsContent';
import { GameLogsFilters } from '@/app/components/game-logs/GameLogsFilters';
import { GameLogsHeader } from '@/app/components/game-logs/GameLogsHeader';
import { GameLogsTabs } from '@/app/components/game-logs/GameLogsTabs';
import { filterAndSortGameLogs } from '@/app/components/game-logs/utils/gameLogsUtils';
import { useGameLogs, useFriendsGameLogs } from '@/hooks/use-game-logs';
import { API_CONFIG } from '@/lib/config/app.config';
import type { IGameLog } from '@/lib/types';
import { CLASSIFICATION } from '@/lib/types';

export function GameLogsTable() {
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState('my-logs');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGameLog, setEditingGameLog] = useState<IGameLog | null>(null);
  const [deletingGameLog, setDeletingGameLog] = useState<IGameLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(
    null
  );

  const {
    gameLogs: myLogs,
    loading: myLogsLoading,
    loadingMore: myLogsLoadingMore,
    error: myLogsError,
    refetch: refetchMyLogs,
    gameLogsHasNextPage: myLogsHasNextPage,
    gameLogsTotalCount: myLogsTotalCount,
    loadMoreGameLogs: loadMoreMyLogs,
  } = useGameLogs({
    filters: { userId: user?.id },
    pagination: { first: API_CONFIG.pagination.DEFAULT_PAGE_SIZE },
  });

  const {
    gameLogs: publicLogs,
    loading: publicLogsLoading,
    loadingMore: publicLogsLoadingMore,
    error: publicLogsError,
    gameLogsHasNextPage: publicLogsHasNextPage,
    gameLogsTotalCount: publicLogsTotalCount,
    loadMoreGameLogs: loadMorePublicLogs,
  } = useGameLogs({
    filters: { classification: CLASSIFICATION.PUBLIC },
    pagination: { first: API_CONFIG.pagination.DEFAULT_PAGE_SIZE },
  });

  const {
    logs: friendsLogs,
    loading: friendsLogsLoading,
    loadingMore: friendsLogsLoadingMore,
    error: friendsLogsError,
    hasNextPage: friendsLogsHasNextPage,
    totalCount: friendsLogsTotalCount,
    loadMore: loadMoreFriendsLogs,
  } = useFriendsGameLogs();

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    void refetchMyLogs();
  };

  const handleEditSuccess = () => {
    setEditingGameLog(null);
    void refetchMyLogs();
  };

  const handleDeleteSuccess = () => {
    setDeletingGameLog(null);
    void refetchMyLogs();
  };

  const handleSearchChange = (term: string, field: string) => {
    setSearchTerm(term);
    setSearchField(field);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
    setSearchField('all');
  };

  const handleSort = (key: string, direction: 'asc' | 'desc' | null) => {
    if (direction === null) {
      setSortConfig(null);
    } else {
      setSortConfig({ field: key, direction });
    }
  };

  const getCurrentTabTotalCount = () => {
    switch (selectedTab) {
      case 'my-logs':
        return { displayed: myLogs?.length ?? 0, total: myLogsTotalCount };
      case 'friends-logs':
        return { displayed: friendsLogs?.length ?? 0, total: friendsLogsTotalCount };
      case 'public-logs':
        return { displayed: publicLogs?.length ?? 0, total: publicLogsTotalCount };
      default:
        return { displayed: 0, total: 0 };
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-600">Please sign in to view game logs.</p>
      </div>
    );
  }

  // Check for any errors and display them
  const hasError = myLogsError ?? publicLogsError ?? friendsLogsError;
  if (hasError) {
    return (
      <div className="text-center py-8">
        <p className="text-semantic-error">Error loading game logs. Please try again.</p>
        <p className="text-sm text-neutral-500 mt-2">
          {hasError.message || 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <GameLogsHeader onCreateClick={() => setIsCreateModalOpen(true)} />

        <GameLogsTabs selectedTab={selectedTab} onTabChange={setSelectedTab}>
          <GameLogsFilters
            searchTerm={searchTerm}
            searchField={searchField}
            sortConfig={sortConfig}
            displayedCount={getCurrentTabTotalCount().displayed}
            totalCount={getCurrentTabTotalCount().total}
            classification={selectedTab}
            onSearchChange={handleSearchChange}
            onSearchClear={handleSearchClear}
            onSort={handleSort}
          />

          <GameLogsContent
            tabValue="my-logs"
            logs={myLogs ?? []}
            loading={myLogsLoading}
            loadingMore={myLogsLoadingMore}
            hasNextPage={myLogsHasNextPage}
            totalCount={myLogsTotalCount}
            showActions={true}
            onLoadMore={() => void loadMoreMyLogs()}
            onEdit={setEditingGameLog}
            onDelete={setDeletingGameLog}
            filteredAndSortedLogs={filterAndSortGameLogs(
              myLogs ?? [],
              searchTerm,
              searchField,
              sortConfig
            )}
          />

          <GameLogsContent
            tabValue="friends-logs"
            logs={friendsLogs ?? []}
            loading={friendsLogsLoading}
            loadingMore={friendsLogsLoadingMore}
            hasNextPage={friendsLogsHasNextPage}
            totalCount={friendsLogsTotalCount}
            showActions={false}
            onLoadMore={() => void loadMoreFriendsLogs()}
            filteredAndSortedLogs={filterAndSortGameLogs(
              friendsLogs ?? [],
              searchTerm,
              searchField,
              sortConfig
            )}
          />

          <GameLogsContent
            tabValue="public-logs"
            logs={publicLogs ?? []}
            loading={publicLogsLoading}
            loadingMore={publicLogsLoadingMore}
            hasNextPage={publicLogsHasNextPage}
            totalCount={publicLogsTotalCount}
            showActions={false}
            onLoadMore={() => void loadMorePublicLogs()}
            filteredAndSortedLogs={filterAndSortGameLogs(
              publicLogs ?? [],
              searchTerm,
              searchField,
              sortConfig
            )}
          />
        </GameLogsTabs>

        {/* Modals */}
        <CreateGameLogModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />

        {editingGameLog && (
          <EditGameLogModal
            gameLog={editingGameLog}
            isOpen={!!editingGameLog}
            onClose={() => setEditingGameLog(null)}
            onSuccess={handleEditSuccess}
          />
        )}

        {deletingGameLog && (
          <DeleteGameLogModal
            gameLog={deletingGameLog}
            isOpen={!!deletingGameLog}
            onClose={() => setDeletingGameLog(null)}
            onSuccess={handleDeleteSuccess}
          />
        )}
      </div>
    </div>
  );
}
