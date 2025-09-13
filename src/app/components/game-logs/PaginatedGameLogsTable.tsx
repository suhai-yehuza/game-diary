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

// Array of color schemes for tags - using semantic colors
const tagColorSchemes = [
  'bg-semantic-info/10 text-semantic-info',
  'bg-semantic-success/10 text-semantic-success',
  'bg-semantic-warning/10 text-semantic-warning',
  'bg-semantic-error/10 text-semantic-error',
  'bg-brand-primary/10 text-brand-primary',
  'bg-brand-secondary/10 text-brand-secondary',
  'bg-theme-muted/10 text-theme-muted',
  'bg-theme-secondary/10 text-theme-secondary',
  'bg-theme-tertiary/10 text-theme-tertiary',
  'bg-theme-primary/10 text-theme-primary',
  'bg-semantic-info/20 text-semantic-info',
  'bg-semantic-success/20 text-semantic-success',
  'bg-semantic-warning/20 text-semantic-warning',
  'bg-semantic-error/20 text-semantic-error',
  'bg-brand-primary/20 text-brand-primary',
  'bg-brand-secondary/20 text-brand-secondary',
  'bg-theme-muted/20 text-theme-muted',
  'bg-theme-secondary/20 text-theme-secondary',
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
          className="bg-surface-card rounded-xl border border-theme-primary shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
        >
          {/* Header Section */}
          <header
            className="p-6 border-b border-theme-primary cursor-pointer transition-all duration-200 hover:bg-bg-theme-secondary"
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
                    <div className="w-8 h-8 rounded-full bg-bg-theme-secondary flex items-center justify-center overflow-hidden">
                      {awayTeam.logo ? (
                        <Image
                          src={awayTeam.logo}
                          alt={`${awayTeam.name} logo`}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-theme-muted">
                          {awayTeam.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-theme-primary">{awayTeam.name}</span>
                  </div>
                  <span className="text-theme-muted">@</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-theme-primary">{homeTeam.name}</span>
                    <div className="w-8 h-8 rounded-full bg-bg-theme-secondary flex items-center justify-center overflow-hidden">
                      {homeTeam.logo ? (
                        <Image
                          src={homeTeam.logo}
                          alt={`${homeTeam.name} logo`}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-theme-muted">
                          {homeTeam.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* User Information */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-theme-muted">
                    @{gameLog.user?.username || 'unknown'}
                  </span>
                  {gameLog.user?.first_name && gameLog.user?.last_name && (
                    <span className="text-sm text-theme-muted">
                      • {gameLog.user.first_name} {gameLog.user.last_name}
                    </span>
                  )}
                </div>

                {/* Game Date */}
                <div className="flex items-center gap-3">
                  <time className="text-sm text-theme-muted">
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
                      className="text-semantic-error"
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
                <p className="text-theme-secondary leading-relaxed">{gameLog.notes}</p>
              </div>
            )}

            {/* Game Details and Tags Layout */}
            <div className="flex justify-between items-start gap-4">
              {/* Game Details - Left Side */}
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-theme-muted">Watched Date: </span>
                  <span className="font-medium text-theme-primary">
                    {gameLog.watched_date
                      ? new Date(gameLog.watched_date).toLocaleDateString()
                      : 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-theme-muted">Setting: </span>
                  <span className="font-medium text-theme-primary">
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
          <footer className="px-6 py-4 bg-bg-theme-secondary border-t border-theme-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Reactions */}
                <button
                  onClick={() => toggleReactions(gameLog.id)}
                  className="flex items-center gap-2 text-semantic-error hover:text-semantic-error transition-colors"
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
                  className="flex items-center gap-2 text-semantic-info hover:text-semantic-info transition-colors"
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
            <div className="border-t border-theme-primary">
              <GameLogComments gameLog={gameLog} showComments={true} />
            </div>
          )}

          {expandedReactions.has(gameLog.id) && (
            <div className="border-t border-theme-primary p-6">
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
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
          <h1 className="text-2xl font-bold text-theme-primary">Game Logs</h1>
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
        <div className="bg-semantic-info/10 border border-semantic-info/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-semantic-success rounded-full animate-pulse" />
              <span className="text-sm font-medium text-theme-primary">
                Performance Mode Active
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-semantic-info">
              {useVirtualScrolling && <span>Virtual Scrolling</span>}
              {useProgressiveLoading && <span>Progressive Loading</span>}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-theme-primary">Game Logs</h2>
          <p className="text-sm text-theme-muted">
            Share your basketball experiences and connect with other fans
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-text-inverse font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Create Game Log
          </Button>
        </div>
      </div>

      {/* Filters */}
      <GameLogsFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />

      {/* Tabs */}
      <div className="flex space-x-1 bg-bg-theme-secondary p-1 rounded-lg">
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
                ? 'bg-surface-card text-theme-primary shadow-sm'
                : 'text-theme-muted hover:text-theme-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Page Size Selector and Refresh Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 bg-surface-card/80 rounded-lg px-4 py-3 border border-semantic-success/30">
          <span className="text-sm font-medium text-semantic-success">Page Size:</span>
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
          className="border border-theme-primary rounded-lg"
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
