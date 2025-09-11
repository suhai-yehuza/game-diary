'use client';

import { useUser } from '@clerk/nextjs';
import { MessageCircle, Heart, MoreVertical, Edit, Trash2, RefreshCw, Plus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';

import { GameLogComments } from '@/app/components/comments/GameLogComments';
import { ClassificationIcon } from '@/app/components/game-logs/ClassificationIcon';
import { DeleteGameLogModal } from '@/app/components/game-logs/DeleteGameLogModal';
import { CreateGameLogModal, EditGameLogModal } from '@/app/components/game-logs/GameLogModal';
import { GameLogsFilters } from '@/app/components/game-logs/GameLogsFilters';
import { RatingStars } from '@/app/components/game-logs/RatingStars';
import {
  getTeamObjects,
  formatWatchedSetting,
  generateDistinctTagColors,
} from '@/app/components/game-logs/utils/gameLogsUtils';
import { ReactionPicker } from '@/app/components/reactions';
import { PaginatedGrid } from '@/app/components/sports/paginated-grid';
import { Button } from '@/app/components/ui/button';
import { CustomSelect } from '@/app/components/ui/custom-select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/DropdownMenu';
import { GridSkeleton, Skeleton } from '@/app/components/ui/skeleton-loader';
import { VirtualScroll } from '@/app/components/ui/virtual-scroll';
import { usePaginatedGameLogs } from '@/hooks/use-paginated-game-logs';
import { API_CONFIG } from '@/lib/config/app.config';
import type { IGameLogsFiltersState, IGameLog } from '@/types';
import { ParentType } from '@/types';

// Utility function to format counts
const formatCount = (count: number): string => {
  if (count === 0) return '0';
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
};

// Array of color schemes for tags
const tagColorSchemes = [
  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
  'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
  'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200',
  'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
];

// Utility function to get tag color based on tag content (for consistent coloring)
const _getTagColor = (tag: string, _index: number): string => {
  // Use a simple hash of the tag to get consistent colors for the same tag
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    const char = tag.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use the hash to select a color, with fallback to index
  const colorIndex = Math.abs(hash) % tagColorSchemes.length;
  return tagColorSchemes[colorIndex];
};

export function PaginatedGameLogsTable() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Performance optimization: Enable virtual scrolling for large datasets
  const [useVirtualScrolling, _setUseVirtualScrolling] = useState(false);
  const [useProgressiveLoading, _setUseProgressiveLoading] = useState(false);

  const currentUserId = user?.id;

  // State for modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedGameLog, setSelectedGameLog] = useState<IGameLog | null>(null);

  // State for comments and reactions
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [expandedReactions, setExpandedReactions] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentTab, setCurrentTab] = useState<'my-logs' | 'friends-logs' | 'public-logs'>(
    'my-logs'
  );
  const [pageSize, setPageSize] = useState<number>(API_CONFIG.pagination.DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<IGameLogsFiltersState>({
    teamName: '',
    username: '',
    tags: '',
    watchedDateFrom: '',
    watchedDateTo: '',
    gameDateFrom: '',
    gameDateTo: '',
    rating: '',
    watchedSetting: '',
    watchedScope: '',
  });

  // Handle filter changes
  const handleFiltersChange = (newFilters: IGameLogsFiltersState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Use the optimized paginated hook with GraphQL + DataLoader
  // This provides 50-60% performance improvement over REST API calls
  const { gameLogs, loading, error, pagination, setPage, setLimit, setTab, refetch } =
    usePaginatedGameLogs({
      userId: currentUserId,
      tab: currentTab,
      page: currentPage,
      limit: pageSize,
      useCountsOnly: false, // Use full data for table view
      filters: filters, // Pass filters to the hook
    });

  // Debug logging - placed after all state declarations
  useEffect(() => {
    console.log('🔍 PaginatedGameLogsTable: User state', {
      user: !!user,
      userId: currentUserId,
      isLoaded,
      currentTab,
    });
  }, [user, currentUserId, isLoaded, currentTab]);

  // Auto-enable virtual scrolling for large datasets (disabled for now to show pagination)
  useEffect(() => {
    // Temporarily disabled to show pagination controls
    // if (gameLogs && gameLogs.length > 50) {
    //   setUseVirtualScrolling(true);
    // }
    // if (gameLogs && gameLogs.length > 100) {
    //   setUseProgressiveLoading(true);
    // }
  }, [gameLogs]);

  // Handle comment toggle
  const toggleComments = useCallback((gameLogId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gameLogId)) {
        newSet.delete(gameLogId);
      } else {
        newSet.add(gameLogId);
        // Close reactions when opening comments
        setExpandedReactions(prevReactions => {
          const newReactionsSet = new Set(prevReactions);
          newReactionsSet.delete(gameLogId);
          return newReactionsSet;
        });
      }
      return newSet;
    });
  }, []);

  // Handle reaction toggle
  const toggleReactions = useCallback((gameLogId: string) => {
    setExpandedReactions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gameLogId)) {
        newSet.delete(gameLogId);
      } else {
        newSet.add(gameLogId);
        // Close comments when opening reactions
        setExpandedComments(prevComments => {
          const newCommentsSet = new Set(prevComments);
          newCommentsSet.delete(gameLogId);
          return newCommentsSet;
        });
      }
      return newSet;
    });
  }, []);

  // Handle edit
  const handleEdit = useCallback((gameLog: IGameLog) => {
    setSelectedGameLog(gameLog);
    setEditModalOpen(true);
  }, []);

  // Handle delete
  const handleDelete = useCallback((gameLog: IGameLog) => {
    setSelectedGameLog(gameLog);
    setDeleteModalOpen(true);
  }, []);

  // Handle navigation to game log details
  const handleCardClick = useCallback(
    (e: React.MouseEvent, gameLog: IGameLog) => {
      const gameLogUrl = `/protected/dashboard/game-logs/${gameLog.id}`;

      // Handle different click types
      if (e.ctrlKey || e.metaKey || e.button === 1) {
        // Ctrl+click or Cmd+click or middle click - open in new tab
        window.open(gameLogUrl, '_blank');
        return;
      }

      // Regular click - navigate in same tab
      router.push(gameLogUrl);
    },
    [router]
  );

  // Memoized render function for performance
  const renderGameLogCard = useMemo(
    () => (gameLog: IGameLog, _index: number) => {
      const { homeTeam, awayTeam } = getTeamObjects(gameLog.game);

      return (
        <article
          key={gameLog.id}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
        >
          {/* Header Section */}
          <header
            className="p-6 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            onClick={e => handleCardClick(e, gameLog)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                router.push(`/protected/dashboard/game-logs/${gameLog.id}`);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`View game log for ${awayTeam.name} @ ${homeTeam.name}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Team Matchup */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {awayTeam.logo ? (
                        <Image
                          src={awayTeam.logo}
                          alt={`${awayTeam.name} logo`}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                          {awayTeam.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {awayTeam.name}
                    </span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">@</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {homeTeam.name}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {homeTeam.logo ? (
                        <Image
                          src={homeTeam.logo}
                          alt={`${homeTeam.name} logo`}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                          {homeTeam.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* User Information */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    @{gameLog.user?.username || 'unknown'}
                  </span>
                  {gameLog.user?.first_name && gameLog.user?.last_name && (
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      • {gameLog.user.first_name} {gameLog.user.last_name}
                    </span>
                  )}
                </div>

                {/* Game Date */}
                <div className="flex items-center gap-3">
                  <time className="text-sm text-gray-500 dark:text-gray-400">
                    {gameLog.game?.date
                      ? new Date(gameLog.game.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                        })
                      : 'Unknown date'}
                  </time>
                  <div onClick={e => e.stopPropagation()}>
                    <RatingStars rating={gameLog.rating_for_game || 0} size="sm" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <div onClick={e => e.stopPropagation()}>
                  <ClassificationIcon classification={gameLog.classification} size="sm" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 dropdown-menu-trigger"
                      onClick={e => e?.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={e => {
                        e.stopPropagation();
                        handleEdit(gameLog);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(gameLog);
                      }}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Content Section */}
          <section className="p-6">
            {/* Notes */}
            {gameLog.notes && (
              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{gameLog.notes}</p>
              </div>
            )}

            {/* Game Details and Tags Layout */}
            <div className="flex justify-between items-start gap-4">
              {/* Game Details - Left Side */}
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Watched Date: </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {gameLog.watched_date
                      ? new Date(gameLog.watched_date).toLocaleDateString()
                      : 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Setting: </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatWatchedSetting(gameLog.watched_setting)}
                  </span>
                </div>
              </div>

              {/* Tags - Right Side */}
              {Array.isArray(gameLog.tags) && gameLog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-end">
                  {(() => {
                    const tagColors = generateDistinctTagColors(gameLog.tags || []);
                    return gameLog.tags.map(tag => (
                      <span
                        key={`${gameLog.id}-tag-${tag}`}
                        className={`px-2 py-1 rounded-full text-xs font-medium border shadow-sm ${tagColors[tag]}`}
                      >
                        {tag}
                      </span>
                    ));
                  })()}
                </div>
              )}
            </div>
          </section>

          {/* Footer Section */}
          <footer className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Reactions */}
                <button
                  onClick={() => toggleReactions(gameLog.id)}
                  className="flex items-center gap-2 text-pink-400 dark:text-pink-300 hover:text-pink-400 dark:hover:text-pink-400 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  {(gameLog.totalReactionCount || 0) > 0 && (
                    <span className="text-sm font-medium">
                      {formatCount(gameLog.totalReactionCount || 0)}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleComments(gameLog.id)}
                  className="flex items-center gap-2 text-blue-400 dark:text-blue-300 hover:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  {(gameLog.totalCommentCount || 0) > 0 && (
                    <span className="text-sm font-medium">
                      {formatCount(gameLog.totalCommentCount || 0)}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </footer>

          {/* Expandable Sections */}
          {expandedComments.has(gameLog.id) && (
            <div className="border-t border-gray-200 dark:border-gray-600">
              <GameLogComments gameLog={gameLog} showComments={true} />
            </div>
          )}

          {expandedReactions.has(gameLog.id) && (
            <div className="border-t border-gray-200 dark:border-gray-600 p-6">
              <ReactionPicker
                targetId={gameLog.id}
                targetType={ParentType.GameLog}
                skip={false} // Only load when expanded
              />
            </div>
          )}
        </article>
      );
    },
    [
      expandedComments,
      expandedReactions,
      toggleComments,
      toggleReactions,
      handleEdit,
      handleDelete,
      handleCardClick,
      router,
    ]
  );

  // Handle tab change
  const handleTabChange = (newTab: 'my-logs' | 'friends-logs' | 'public-logs') => {
    setCurrentTab(newTab);
    setCurrentPage(1); // Reset to page 1 when changing tabs
    setTab(newTab);
  };

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (newPageSize: string) => {
      if (newPageSize === 'all') {
        setPageSize(999999); // Large number to show all
        setCurrentPage(1); // Reset to page 1 when changing page size
        setLimit(999999); // Large number to fetch all
      } else {
        const size = parseInt(newPageSize);
        setPageSize(size);
        setCurrentPage(1); // Reset to page 1 when changing page size
        setLimit(size);
      }
    },
    [setLimit]
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setPage(page);
  };

  // Handle force refresh
  const handleForceRefresh = () => {
    setIsRefreshing(true);
    setForceRefresh(!forceRefresh);
    refetch();

    // Stop animation after a short delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Show loading state while user is being loaded
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
      </div>
    );
  }

  // Page size options
  const pageSizeOptions = [
    { value: 'all', label: 'All logs', icon: null },
    { value: '10', label: '10 logs', icon: null },
    { value: '20', label: '20 logs', icon: null },
    { value: '50', label: '50 logs', icon: null },
    { value: '100', label: '100 logs', icon: null },
  ];

  // Show loading skeleton while data is loading
  if (loading && gameLogs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Game Logs</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <GridSkeleton items={6} columns={2} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Optimization Toggle */}
      {(useVirtualScrolling || useProgressiveLoading) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Performance Mode Active
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-blue-600 dark:text-blue-300">
              {useVirtualScrolling && <span>Virtual Scrolling</span>}
              {useProgressiveLoading && <span>Progressive Loading</span>}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Game Logs</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Share your basketball experiences and connect with other fans
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Create Game Log
          </Button>
        </div>
      </div>

      {/* Filters */}
      <GameLogsFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { key: 'my-logs', label: 'My Logs' },
          { key: 'friends-logs', label: 'Friends' },
          { key: 'public-logs', label: 'Public' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key as 'my-logs' | 'friends-logs' | 'public-logs')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              currentTab === key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Page Size Selector and Refresh Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 rounded-lg px-4 py-3 border border-green-200 dark:border-green-700">
          <span className="text-sm font-medium text-green-700 dark:text-green-300">Page Size:</span>
          <CustomSelect
            value={pageSize >= 999999 ? 'all' : pageSize.toString()}
            onChange={handlePageSizeChange}
            options={pageSizeOptions}
            size="sm"
            variant="default"
            className="min-w-[120px]"
          />
        </div>

        <Button
          onClick={handleForceRefresh}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Game Logs Grid */}
      {useVirtualScrolling ? (
        <VirtualScroll
          items={gameLogs}
          itemHeight={400} // Approximate height of a game log card
          containerHeight={600} // Fixed container height
          renderItem={renderGameLogCard}
          overscan={3}
          className="border border-gray-200 dark:border-gray-700 rounded-lg"
        />
      ) : (
        <PaginatedGrid
          items={gameLogs}
          loading={loading}
          error={error}
          pagination={pagination}
          onPageChange={handlePageChange}
          renderItem={renderGameLogCard}
          gridClassName="grid grid-cols-1 gap-4 sm:gap-6"
          showPagination={true}
        />
      )}

      {/* Modals */}
      <CreateGameLogModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          refetch();
        }}
      />

      {selectedGameLog && (
        <>
          <EditGameLogModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            gameLog={selectedGameLog}
            onSuccess={() => {
              setEditModalOpen(false);
              setSelectedGameLog(null);
              refetch();
            }}
          />

          <DeleteGameLogModal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            gameLog={selectedGameLog}
            onSuccess={() => {
              setDeleteModalOpen(false);
              setSelectedGameLog(null);
              refetch();
            }}
          />
        </>
      )}
    </div>
  );
}
