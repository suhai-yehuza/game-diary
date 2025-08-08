'use client';

import { useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import { Star, Eye, EyeOff, Lock, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { GameLogComments } from '@/app/components/comments/GameLogComments';
import { CreateGameLogModal } from '@/app/components/game-logs/CreateGameLogModal';
import { DeleteGameLogModal } from '@/app/components/game-logs/DeleteGameLogModal';
import { EditGameLogModal } from '@/app/components/game-logs/EditGameLogModal';
import { GameLogsSearch } from '@/app/components/game-logs/GameLogsSearch';
import { GameLogsSort } from '@/app/components/game-logs/GameLogsSort';
import { ReactionPicker, ReactionDisplay } from '@/app/components/reactions';
import { Button } from '@/app/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/app/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/Tabs';
import { useGameLogs, useFriendsGameLogs } from '@/hooks/use-game-logs';
import { API_CONFIG } from '@/lib/config/app.config';
import type { IGameLog } from '@/lib/types';
import { CLASSIFICATION } from '@/lib/types';
import { ParentType } from '@/lib/types/generated/graphql';

const ClassificationIcon = ({ classification }: { classification: string }) => {
  switch (classification) {
    case CLASSIFICATION.PUBLIC:
      return <Eye className="w-4 h-4 text-green-600" />;
    case CLASSIFICATION.PROTECTED:
      return <Users className="w-4 h-4 text-yellow-600" />;
    case CLASSIFICATION.PRIVATE:
      return <Lock className="w-4 h-4 text-red-600" />;
    default:
      return <EyeOff className="w-4 h-4 text-gray-400" />;
  }
};

const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-orange-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
};

// Helper function to get team display from game data
const getTeamDisplay = (game: IGameLog['game']): string => {
  if (!game || typeof game !== 'object' || !('home_team' in game && 'away_team' in game)) {
    return 'Unknown Teams';
  }

  const { home_team, away_team, date } = game as {
    home_team: { code?: string; nickname?: string; name: string };
    away_team: { code?: string; nickname?: string; name: string };
    date?: string | Date;
  };
  const homeTeamCode = home_team.code ?? home_team.nickname ?? home_team.name;
  const awayTeamCode = away_team.code ?? away_team.nickname ?? away_team.name;

  // Format the date if available
  let dateString = '';
  if (date) {
    const gameDate = new Date(date);
    if (!isNaN(gameDate.getTime())) {
      dateString = ` on ${gameDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    }
  }

  return `${awayTeamCode} @ ${homeTeamCode}${dateString}`;
};

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

  const filterAndSortGameLogs = (logs: IGameLog[]) => {
    let filtered = logs;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(log => {
        if (searchField === 'all') {
          return (
            getTeamDisplay(log.game).toLowerCase().includes(searchLower) ||
            log.notes?.toLowerCase().includes(searchLower) ||
            log.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
            log.classification.toLowerCase().includes(searchLower) ||
            log.watched_setting?.toLowerCase().includes(searchLower) ||
            log.watched_scope?.toLowerCase().includes(searchLower)
          );
        }
        if (searchField === 'classification') {
          return log.classification.toLowerCase().includes(searchLower);
        }
        if (searchField === 'watched_setting') {
          return log.watched_setting?.toLowerCase().includes(searchLower) ?? false;
        }
        if (searchField === 'watched_scope') {
          return log.watched_scope?.toLowerCase().includes(searchLower) ?? false;
        }
        if (searchField === 'notes') {
          return log.notes?.toLowerCase().includes(searchLower) ?? false;
        }
        if (searchField === 'tags') {
          return log.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ?? false;
        }
        if (searchField === 'team') {
          return getTeamDisplay(log.game).toLowerCase().includes(searchLower);
        }
        return true;
      });
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue: string | number | Date;
        let bValue: string | number | Date;

        switch (sortConfig.field) {
          case 'rating_for_game':
            aValue = a.rating_for_game ?? 0;
            bValue = b.rating_for_game ?? 0;
            break;
          case 'created_at':
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
            break;
          case 'classification':
            aValue = a.classification;
            bValue = b.classification;
            break;
          case 'watched_setting':
            aValue = a.watched_setting ?? '';
            bValue = b.watched_setting ?? '';
            break;
          case 'watched_scope':
            aValue = a.watched_scope ?? '';
            bValue = b.watched_scope ?? '';
            break;
          case 'game_id':
            aValue = a.game_id;
            bValue = b.game_id;
            break;
          case 'team':
            aValue = a.game?.home_team?.name ?? '';
            bValue = b.game?.home_team?.name ?? '';
            break;
          case 'owner':
            aValue = a.user?.username ?? '';
            bValue = b.user?.username ?? '';
            break;
          case 'tags':
            aValue = a.tags?.join(', ') ?? '';
            bValue = b.tags?.join(', ') ?? '';
            break;
          default:
            // Use type assertion for dynamic property access
            aValue = (a as unknown as Record<string, unknown>)[sortConfig.field] as
              | string
              | number
              | Date;
            bValue = (b as unknown as Record<string, unknown>)[sortConfig.field] as
              | string
              | number
              | Date;
        }

        if (sortConfig.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filtered;
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

  const loadMoreButtonClass =
    'bg-blue-600 text-white rounded-full px-6 py-2 font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed';

  const renderGameLogCard = (log: IGameLog, showActions = false, idx?: number) => {
    return (
      <div key={`${log.id}-${idx ?? ''}`} className="mb-6">
        <Card className="border-2 border-gray-300 dark:border-gray-500 bg-neutral-100 dark:bg-neutral-800 shadow-md">
          <CardHeader className="flex flex-row justify-between items-start pb-2 text-gray-900 dark:text-gray-100">
            <div className="flex items-center gap-2">
              <ClassificationIcon classification={log.classification} />
              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold">
                  <a
                    href={`/games/${log.game_id}`}
                    className="text-gray-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
                  >
                    {getTeamDisplay(log.game)}
                  </a>
                </CardTitle>
                <span className="text-xs text-gray-500">
                  {log.user?.id ? (
                    <a href={`/users/${log.user.id}`} className="hover:underline text-blue-600">
                      @{log.user.first_name ?? log.user.username ?? 'Unknown User'}
                    </a>
                  ) : (
                    '@Unknown User'
                  )}
                </span>
              </div>
            </div>
            <RatingStars rating={log.rating_for_game} />
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Game Details */}
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                  {log.classification}
                </span>
                {log.watched_setting && (
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    {log.watched_setting}
                  </span>
                )}
                {log.watched_scope && (
                  <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                    {log.watched_scope}
                  </span>
                )}
              </div>

              {/* Notes */}
              {log.notes && (
                <div className="text-gray-700 dark:text-gray-300">
                  <p className="text-sm">{log.notes}</p>
                </div>
              )}

              {/* Tags */}
              {log.tags && log.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {log.tags.map(tag => (
                    <span
                      key={`${log.id}-tag-${tag}`}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Watched Date */}
              {log.watched_date && (
                <div className="text-xs text-gray-500">
                  Watched: {format(new Date(log.watched_date), 'MMM dd, yyyy')}
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between mt-3 text-gray-900 dark:text-gray-100">
            <div className="flex items-center gap-2">
              {showActions && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingGameLog(log)}
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition shadow-sm"
                  >
                    <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingGameLog(log)}
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-gray-700 transition shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Game Log Reactions */}
            <div className="flex items-center gap-2">
              <ReactionDisplay
                targetId={log.id}
                targetType={ParentType.GameLog}
                size="sm"
                maxReactions={8}
              />
              <ReactionPicker
                targetId={log.id}
                targetType={ParentType.GameLog}
                size="sm"
                showCount={false}
              />
            </div>
          </CardFooter>

          {/* Comments Section - Inside the Card */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            <GameLogComments gameLog={log} />
          </div>
        </Card>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please sign in to view game logs.</p>
      </div>
    );
  }

  // Check for any errors and display them
  const hasError = myLogsError ?? publicLogsError ?? friendsLogsError;
  if (hasError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading game logs. Please try again.</p>
        <p className="text-sm text-gray-500 mt-2">
          {hasError.message || 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Game Logs</h2>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white rounded-full px-5 py-2 font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        >
          <Plus className="w-4 h-4" />
          Create New Log
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <GameLogsSearch
          onSearchChange={handleSearchChange}
          onClear={handleSearchClear}
          searchTerm={searchTerm}
          searchField={searchField}
        />
        <GameLogsSort
          sortKey={sortConfig?.field ?? ''}
          sortDirection={sortConfig?.direction ?? 'asc'}
          onSort={handleSort}
          displayedCount={getCurrentTabTotalCount().displayed}
          totalCount={getCurrentTabTotalCount().total}
          classification={selectedTab}
        />
        <TabsList className="grid w-full grid-cols-3 gap-2 bg-transparent p-0 mb-4">
          <TabsTrigger
            value="my-logs"
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 data-[state=active]:border-b-4 data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-t-lg transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-none"
          >
            My Logs
          </TabsTrigger>
          <TabsTrigger
            value="friends-logs"
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 data-[state=active]:border-b-4 data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-t-lg transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-none"
          >
            Friends&apos; Logs
          </TabsTrigger>
          <TabsTrigger
            value="public-logs"
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 data-[state=active]:border-b-4 data-[state=active]:border-blue-500 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-t-lg transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-none"
          >
            Public Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-logs" className="space-y-4">
          {myLogsLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-600 mb-2">Loading your game logs...</div>
              <div className="text-sm text-gray-500">Optimized loading with reduced page size</div>
            </div>
          ) : Array.isArray(myLogs) && myLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No game logs found. Create your first one!</p>
            </div>
          ) : Array.isArray(myLogs) ? (
            <div>
              <div className="text-sm text-gray-500 mb-4">
                Showing {myLogs.length} of {myLogsTotalCount} of your game logs
              </div>
              {filterAndSortGameLogs(myLogs).map((log, idx) => renderGameLogCard(log, true, idx))}
              {myLogsHasNextPage && (
                <div className="flex justify-center mt-8 mb-4">
                  <Button
                    onClick={() => void loadMoreMyLogs()}
                    disabled={myLogsLoading}
                    className={loadMoreButtonClass}
                  >
                    {myLogsLoading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="friends-logs" className="space-y-4">
          {friendsLogsLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-600 mb-2">Loading friends&apos; game logs...</div>
              <div className="text-sm text-gray-500">Optimized loading with reduced page size</div>
            </div>
          ) : Array.isArray(friendsLogs) && friendsLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No friends&apos; game logs found.</p>
            </div>
          ) : Array.isArray(friendsLogs) ? (
            <div>
              <div className="text-sm text-gray-500 mb-4">
                Showing {friendsLogs.length} of {friendsLogsTotalCount} friends&apos; game logs
              </div>
              {filterAndSortGameLogs(friendsLogs).map((log, idx) =>
                renderGameLogCard(log, false, idx)
              )}
              {friendsLogsHasNextPage && (
                <div className="flex justify-center mt-8 mb-4">
                  <Button
                    onClick={() => void loadMoreFriendsLogs()}
                    disabled={friendsLogsLoading}
                    className={loadMoreButtonClass}
                  >
                    {friendsLogsLoading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="public-logs" className="space-y-4">
          {publicLogsLoading || !Array.isArray(publicLogs) ? (
            <div className="text-center py-8">
              <div className="text-gray-600 mb-2">Loading public game logs...</div>
              <div className="text-sm text-gray-500">Optimized loading with reduced page size</div>
            </div>
          ) : publicLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No public game logs found.</p>
            </div>
          ) : (
            <div>
              <div className="text-sm text-gray-500 mb-4">
                Showing {publicLogs.length} of {publicLogsTotalCount} public game logs
              </div>
              {filterAndSortGameLogs(publicLogs).map((log, idx) =>
                renderGameLogCard(log, false, idx)
              )}
              {publicLogsHasNextPage && (
                <div className="flex justify-center mt-8 mb-4">
                  <Button
                    onClick={() => void loadMorePublicLogs()}
                    disabled={publicLogsLoading}
                    className={loadMoreButtonClass}
                  >
                    {publicLogsLoading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
  );
}
