'use client';

import { useUser } from '@clerk/nextjs';
import {
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Heart,
  MoreVertical,
  Edit,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import { GameLogComments } from '@/app/components/comments/GameLogComments';
import { CreateGameLogModal } from '@/app/components/game-logs/CreateGameLogModal';
import { DeleteGameLogModal } from '@/app/components/game-logs/DeleteGameLogModal';
import { EditGameLogModal } from '@/app/components/game-logs/EditGameLogModal';
import { getTeamDisplay } from '@/app/components/game-logs/utils/gameLogsUtils';
import { ReactionPicker } from '@/app/components/reactions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/DropdownMenu';
import { GET_FRIENDS_GAME_LOGS_TABLE, GET_GAME_LOGS_TABLE } from '@/lib/graphql/queries';
import { useErrorHandler } from '@/lib/utils/error-handler';
import type { IGameLog } from '@/types';
import { ParentType } from '@/types';

export function SimpleGameLogsTable() {
  // Get current user
  const { user } = useUser();
  const currentUserId = user?.id;

  // Error handling
  const { handleAsync } = useErrorHandler();

  // State for each tab's data
  const [tabData, setTabData] = useState<{
    'my-logs': {
      gameLogs: IGameLog[];
      totalCount: number;
      hasNextPage: boolean;
      cursors: string[];
    };
    'friends-logs': {
      gameLogs: IGameLog[];
      totalCount: number;
      hasNextPage: boolean;
      cursors: string[];
    };
    'public-logs': {
      gameLogs: IGameLog[];
      totalCount: number;
      hasNextPage: boolean;
      cursors: string[];
    };
  }>({
    'my-logs': { gameLogs: [], totalCount: 0, hasNextPage: false, cursors: [] },
    'friends-logs': { gameLogs: [], totalCount: 0, hasNextPage: false, cursors: [] },
    'public-logs': { gameLogs: [], totalCount: 0, hasNextPage: false, cursors: [] },
  });

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'my-logs' | 'public-logs' | 'friends-logs'>(
    'my-logs'
  );
  const [preloadingComplete, setPreloadingComplete] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMode, setLoadingMode] = useState<'pagination' | 'infinite'>('pagination');
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Search and filter state
  const [_searchTerm, _setSearchTerm] = useState('');
  const [_searchField, _setSearchField] = useState('all');
  const [_sortConfig, _setSortConfig] = useState<{
    field: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Get current tab data
  const currentTabData = tabData[selectedTab];
  const gameLogs = currentTabData.gameLogs;

  // Preload data for all tabs in priority order
  const preloadAllTabs = async () => {
    setLoading(true);
    setError(null);

    const tabs = ['my-logs', 'friends-logs', 'public-logs'] as const;

    for (const tab of tabs) {
      await handleAsync(
        async () => {
          await fetchGameLogsForTab(tab, 1, false);
          // Small delay between requests to avoid overwhelming the server
          if (tab !== 'public-logs') {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        },
        {
          component: 'SimpleGameLogsTable',
          action: `Preload game logs for ${tab}`,
          timestamp: new Date().toISOString(),
        }
      );
      // Continue with other tabs even if one fails
    }

    setPreloadingComplete(true);
    setLoading(false);
  };

  // Fetch game logs for a specific tab
  const fetchGameLogsForTab = async (
    tab: 'my-logs' | 'public-logs' | 'friends-logs',
    page = 1,
    append = false,
    retryCount = 0
  ) => {
    // Skip if no current user
    if (!currentUserId) {
      console.warn('No current user ID available');
      return;
    }

    const result = await handleAsync(
      async () => {
        let query: string;
        let variables: {
          filters?: { userId?: string; classification?: string };
          pagination: { first: number; after: string | null };
        };

        if (tab === 'friends-logs') {
          // Use the dedicated friendsGameLogs query
          query = GET_FRIENDS_GAME_LOGS_TABLE.loc?.source.body || '';
          variables = {
            pagination: {
              first: itemsPerPage,
              after: page > 1 ? tabData[tab].cursors[page - 2] || null : null,
            },
          };
        } else {
          // Use the regular gameLogs query for my-logs and public-logs
          query = GET_GAME_LOGS_TABLE.loc?.source.body || '';

          variables = {
            filters: tab === 'my-logs' ? { userId: currentUserId } : { classification: 'PUBLIC' },
            pagination: {
              first: itemsPerPage,
              after: page > 1 ? tabData[tab].cursors[page - 2] || null : null,
            },
          };
        }

        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables,
          }),
        });

        if (!response.ok) {
          console.error('Failed to fetch game logs:', response);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.errors) {
          console.error('GraphQL errors:', result.errors);
          throw new Error(result.errors[0]?.message || 'GraphQL error');
        }

        // Handle both query types
        const data = tab === 'friends-logs' ? result.data?.friendsGameLogs : result.data?.gameLogs;
        const edges = data?.edges || [];
        const logs = edges.map((edge: { node: IGameLog }) => edge.node) || [];
        const pageInfo = data?.pageInfo;
        const totalCount = data?.totalCount || 0;

        // Update tab data
        setTabData(prev => ({
          ...prev,
          [tab]: {
            gameLogs: append ? [...prev[tab].gameLogs, ...logs] : logs,
            totalCount,
            hasNextPage: pageInfo?.hasNextPage || false,
            cursors:
              page > 1
                ? [...prev[tab].cursors, edges[edges.length - 1]?.cursor].filter(Boolean)
                : prev[tab].cursors,
          },
        }));

        // Update current tab's pagination state if this is the selected tab
        if (tab === selectedTab) {
          setHasPreviousPage(pageInfo?.hasPreviousPage || false);
          setTotalCount(totalCount);
        }

        return { logs, pageInfo, totalCount };
      },
      {
        component: 'SimpleGameLogsTable',
        action: `Fetch game logs for ${tab}`,
        timestamp: new Date().toISOString(),
      }
    );

    if (!result) {
      const errorMessage = 'Failed to fetch game logs';

      // Retry logic for timeout errors
      if (errorMessage.includes('timeout') && retryCount < 2) {
        console.warn(`Query timeout for ${tab}, retrying... (attempt ${retryCount + 1}/2)`);
        setTimeout(
          () => {
            void fetchGameLogsForTab(tab, page, append, retryCount + 1);
          },
          1000 * (retryCount + 1)
        );
        return;
      }

      throw new Error(errorMessage);
    }

    return result;
  };

  // GraphQL query function with pagination support (now uses tab-specific function)
  const fetchGameLogs = async (page = 1, append = false, retryCount = 0) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setCurrentPage(1);
    }
    setError(null);

    try {
      await fetchGameLogsForTab(selectedTab, page, append, retryCount);

      if (!append) {
        setCurrentPage(page);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch game logs';

      // Retry logic for timeout errors
      if (errorMessage.includes('timeout') && retryCount < 2) {
        console.warn(`Query timeout, retrying... (attempt ${retryCount + 1}/2)`);
        setRetrying(true);
        setTimeout(
          () => {
            setRetrying(false);
            void fetchGameLogs(page, append, retryCount + 1);
          },
          1000 * (retryCount + 1)
        ); // Exponential backoff
        return;
      }

      // Clear data on error to prevent stale data display
      if (!append) {
        setTabData(prev => ({
          ...prev,
          [selectedTab]: { gameLogs: [], totalCount: 0, hasNextPage: false, cursors: [] },
        }));
        setTotalCount(0);
        setHasPreviousPage(false);
      }

      setError(errorMessage);
      console.error('Error fetching game logs:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Pagination functions
  const handleNextPage = () => {
    if (currentTabData.hasNextPage && !loadingMore) {
      const nextPage = currentPage + 1;
      if (loadingMode === 'infinite') {
        void fetchGameLogs(nextPage, true);
      } else {
        void fetchGameLogs(nextPage, false);
      }
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage && !loading) {
      void fetchGameLogs(currentPage - 1, false);
    }
  };

  const handleLoadMore = () => {
    if (currentTabData.hasNextPage && !loadingMore) {
      void fetchGameLogs(currentPage + 1, true);
    }
  };

  // Infinite scroll effect
  useEffect(() => {
    if (loadingMode !== 'infinite') return;

    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTabData.hasNextPage, loadingMore, loadingMode, currentPage]);

  // Initial preloading on component mount
  useEffect(() => {
    if (!preloadingComplete && currentUserId) {
      void preloadAllTabs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preloadingComplete, currentUserId]);

  // Handle tab switching - use preloaded data if available
  useEffect(() => {
    if (preloadingComplete) {
      // Update pagination state for the selected tab
      const tabData = currentTabData;
      setTotalCount(tabData.totalCount);
      setCurrentPage(1);
    } else {
      // If preloading isn't complete, fetch data for the selected tab
      void fetchGameLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab, preloadingComplete]);

  // Handle redirect to page 1 when no data on current page
  useEffect(() => {
    if (gameLogs.length === 0 && currentPage > 1 && totalCount > 0 && !loading) {
      setCurrentPage(1);
      void fetchGameLogs(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameLogs.length, currentPage, totalCount, loading]);

  if (!currentUserId) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="text-gray-600 dark:text-gray-400 mb-2">Authentication required</div>
          <div className="text-sm text-gray-500 dark:text-gray-500">
            Please sign in to view your game logs
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
        <span className="ml-2">
          {retrying ? 'Retrying after timeout...' : 'Loading game logs...'}
        </span>
      </div>
    );
  }

  if (error) {
    console.error('Error loading game logs:', error);
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Game Logs</h2>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => void fetchGameLogs()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Game Logs</h2>
          <p className="text-gray-600">Track and share your sports viewing experiences</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          + Create New Log
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg w-fit">
        {[
          { key: 'my-logs', label: 'My Logs' },
          { key: 'friends-logs', label: 'Friends Logs' },
          { key: 'public-logs', label: 'Public Logs' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key as 'my-logs' | 'public-logs' | 'friends-logs')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === tab.key
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-300 dark:border-gray-600'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search game logs..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
          }}
        >
          <option>All Fields</option>
          <option>Notes</option>
          <option>Rating</option>
          <option>Team</option>
        </select>
      </div>

      {/* Sort Options */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
        {[
          'Date Created',
          'Rating',
          'Privacy',
          'Setting',
          'Scope',
          'Game ID',
          'Team',
          'Owner',
          'Tags',
        ].map(sort => (
          <button
            key={sort}
            className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded border border-gray-300 dark:border-gray-600 font-medium"
          >
            ↑↓ {sort}
          </button>
        ))}
      </div>

      {/* Results Count and Loading Mode Toggle */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-900 dark:text-gray-100 font-medium bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
          {totalCount === 0
            ? `No ${selectedTab} found`
            : loadingMode === 'pagination'
              ? (() => {
                  const startItem = (currentPage - 1) * itemsPerPage + 1;
                  const endItem = Math.min(currentPage * itemsPerPage, totalCount);
                  const totalPages = Math.ceil(totalCount / itemsPerPage);

                  if (startItem > totalCount) {
                    return `Showing 0 of ${totalCount} ${selectedTab}`;
                  }

                  if (totalPages === 1) {
                    return `Showing all ${totalCount} ${selectedTab}`;
                  }

                  return `Showing ${startItem}-${endItem} of ${totalCount} ${selectedTab} (Page ${currentPage} of ${totalPages})`;
                })()
              : `Showing ${gameLogs.length} of ${totalCount} ${selectedTab}`}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Loading:</span>
            <button
              onClick={() => setLoadingMode('pagination')}
              className={`px-3 py-1 text-xs rounded ${
                loadingMode === 'pagination'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Pagination
            </button>
            <button
              onClick={() => setLoadingMode('infinite')}
              className={`px-3 py-1 text-xs rounded ${
                loadingMode === 'infinite'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Infinite Scroll
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Per page:</span>
            <select
              value={itemsPerPage}
              onChange={e => {
                const newPageSize = parseInt(e.target.value);
                setItemsPerPage(newPageSize);
                setCurrentPage(1);
                // Refresh the game logs data - this will be handled by the parent component
              }}
              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Game Logs List */}
      <div className="space-y-4">
        {gameLogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No game logs found
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Start by creating your first game log!
            </p>
          </div>
        ) : (
          gameLogs.map(gameLog => <GameLogCardEnhanced key={gameLog.id} gameLog={gameLog} />)
        )}
      </div>

      {/* Pagination Controls */}
      {loadingMode === 'pagination' &&
        totalCount > 0 &&
        (currentTabData.hasNextPage || hasPreviousPage) && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePreviousPage}
              disabled={!hasPreviousPage || loading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                hasPreviousPage && !loading
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              }`}
            >
              ← Previous
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Page {currentPage}</span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={!currentTabData.hasNextPage || loadingMore}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentTabData.hasNextPage && !loadingMore
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              }`}
            >
              Next →
            </button>
          </div>
        )}

      {/* Load More Button for Infinite Scroll */}
      {loadingMode === 'infinite' && currentTabData.hasNextPage && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              !loadingMore
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            {loadingMore ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Loading more...</span>
              </div>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}

      {/* Loading More Indicator */}
      {loadingMore && loadingMode === 'infinite' && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Loading more game logs...
          </span>
        </div>
      )}

      {/* Create Game Log Modal */}
      {showCreateModal && (
        <CreateGameLogModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            // Refresh the game logs data
            // Refresh the game logs data - this will be handled by the parent component
          }}
        />
      )}
    </div>
  );
}

// Safe wrapper for ReactionPicker to prevent crashes
function SafeReactionPicker({
  targetId,
  targetType,
  size,
  showCount,
  onError: _onError,
}: {
  targetId: string;
  targetType: ParentType;
  size: 'sm' | 'md' | 'lg';
  showCount: boolean;
  onError: (error: string) => void;
}) {
  const { handleSync } = useErrorHandler();

  return (
    handleSync(
      () => (
        <ReactionPicker
          targetId={targetId}
          targetType={targetType}
          size={size}
          showCount={showCount}
        />
      ),
      {
        component: 'SafeReactionPicker',
        action: 'Render ReactionPicker component',
        timestamp: new Date().toISOString(),
      }
    ) ?? (
      <div className="text-sm text-red-600 dark:text-red-400 p-2 bg-red-50 dark:bg-red-900/20 rounded">
        Reaction picker failed to load
      </div>
    )
  );
}

// Enhanced Game Log Card Component based on GameLogCard
function GameLogCardEnhanced({ gameLog }: { gameLog: IGameLog }) {
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [reactionError, setReactionError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Get current user to check if this is their game log
  const { user: currentUser } = useUser();
  const isOwner = currentUser?.id === gameLog.user.id;

  // Debug logging removed to reduce console noise

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getTeamDisplay(gameLog.game, false)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {gameLog.game?.date
                ? new Date(gameLog.game.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })
                : 'No date'}
            </p>
            {/* User information */}
            {gameLog.user && (
              <div className="mt-2 flex items-center space-x-2">
                {gameLog.user.image_url && (
                  <Image
                    src={gameLog.user.image_url}
                    alt={`${gameLog.user.username || 'User'}'s avatar`}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">
                    @{gameLog.user.first_name || gameLog.user.username || 'Unknown User'}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                gameLog.classification === 'PUBLIC'
                  ? 'bg-green-100 text-green-800'
                  : gameLog.classification === 'PROTECTED'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {gameLog.classification}
            </span>

            {/* Actions dropdown for user's own game logs */}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => setShowEditModal(true)}
                    className="cursor-pointer"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Game Log
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteModal(true)}
                    className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Game Log
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {gameLog.notes && (
          <div className="mb-3">
            <p className="text-gray-700 dark:text-gray-300">{gameLog.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            {gameLog.rating_for_game && <span>Rating: {gameLog.rating_for_game}</span>}
          </div>
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="flex items-center gap-1 text-sm text-pink-300 dark:text-pink-300 hover:text-white dark:hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-pink-400 dark:hover:bg-pink-400"
          >
            <Heart className="w-4 h-4" />
            <span>{gameLog.totalReactionCount || 0}</span>
          </button>
        </div>
      </div>

      {/* Reactions Picker - shown when heart is clicked */}
      {showReactions && (
        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700">
          {reactionError ? (
            <div className="text-sm text-red-600 dark:text-red-400 p-2 bg-red-50 dark:bg-red-900/20 rounded">
              Error loading reactions: {reactionError}
              <button
                onClick={() => {
                  setReactionError(null);
                  setShowReactions(false);
                  setTimeout(() => setShowReactions(true), 100);
                }}
                className="ml-2 text-xs underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <SafeReactionPicker
              targetId={gameLog.id}
              targetType={ParentType.GameLog}
              size="sm"
              showCount={true}
              onError={error => setReactionError(error)}
            />
          )}
        </div>
      )}

      {/* Comments Section */}
      <div className="border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => setShowComments(!showComments)}
          className="w-full flex items-center justify-between px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              Comments{' '}
              {gameLog.totalCommentCount && gameLog.totalCommentCount > 0
                ? `(${gameLog.totalCommentCount})`
                : ''}
            </span>
          </div>
          {showComments ? (
            <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>

        {showComments && (
          <div className="px-6 pb-4">
            <GameLogComments
              gameLog={gameLog as unknown as import('@/types').IGameLog}
              showComments={showComments}
            />
          </div>
        )}
      </div>

      {/* Edit Game Log Modal */}
      {showEditModal && (
        <EditGameLogModal
          gameLog={gameLog as unknown as import('@/types').IGameLog}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            // Refresh the game logs data
            // Refresh the game logs data - this will be handled by the parent component
          }}
        />
      )}

      {/* Delete Game Log Modal */}
      {showDeleteModal && (
        <DeleteGameLogModal
          gameLog={gameLog as unknown as import('@/types').IGameLog}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={() => {
            setShowDeleteModal(false);
            // Refresh the game logs data
            // Refresh the game logs data - this will be handled by the parent component
          }}
        />
      )}
    </div>
  );
}
