'use client';

import { useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import { Star, Eye, EyeOff, Lock, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { CreateGameLogModal } from '@/app/components/game-logs/CreateGameLogModal';
import { DeleteGameLogModal } from '@/app/components/game-logs/DeleteGameLogModal';
import { EditGameLogModal } from '@/app/components/game-logs/EditGameLogModal';
import { GameLogsSearch } from '@/app/components/game-logs/GameLogsSearch';
import { GameLogsSort } from '@/app/components/game-logs/GameLogsSort';
import { Button } from '@/app/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/app/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/Tabs';
import { useGameLogs } from '@/hooks/use-game-logs';
import type { IGameLog } from '@/lib/types';
import { CLASSIFICATION } from '@/lib/types';

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
  const [sortKey, setSortKey] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const {
    gameLogs: myLogs,
    loading: myLogsLoading,
    error: myLogsError,
    refetch: refetchMyLogs,
    gameLogsHasNextPage: myLogsHasNextPage,
    loadMoreGameLogs: loadMoreMyLogs,
  } = useGameLogs({ filters: { userId: user?.id } });

  const {
    gameLogs: publicLogs,
    loading: publicLogsLoading,
    error: publicLogsError,
    gameLogsHasNextPage: publicLogsHasNextPage,
    loadMoreGameLogs: loadMorePublicLogs,
  } = useGameLogs({ filters: { classification: CLASSIFICATION.PUBLIC } });

  // Friends logs tab is not supported as CLASSIFICATION.FRIENDS does not exist.
  // You can implement this with a custom hook or remove the tab.
  const friendsLogs: IGameLog[] = [];
  const friendsLogsLoading = false;
  const friendsLogsError = null;
  const friendsLogsHasNextPage = false;
  const loadMoreFriendsLogs = (): void => {
    // TODO: Implement friends logs pagination
  };

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
    // Client-side search filtering is implemented in the render logic below
  };

  const handleSearchClear = () => {
    setSearchTerm('');
    setSearchField('all');
    // TODO: Clear server-side search filters
  };

  const handleSort = (key: string, direction: 'asc' | 'desc' | null) => {
    if (direction === null) {
      setSortKey('');
      setSortDirection('asc');
    } else {
      setSortKey(key);
      setSortDirection(direction);
    }
    // Client-side sorting is implemented in the render logic below
  };

  // Client-side filtering and sorting function
  const filterAndSortGameLogs = (logs: IGameLog[]): IGameLog[] => {
    let filteredLogs = [...logs];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredLogs = filteredLogs.filter(log => {
        if (searchField === 'all') {
          // Search across all relevant fields
          return (
            (log.classification?.toLowerCase().includes(term) ?? false) ||
            (log.watched_setting?.toLowerCase().includes(term) ?? false) ||
            (log.watched_scope?.toLowerCase().includes(term) ?? false) ||
            (log.notes?.toLowerCase().includes(term) ?? false) ||
            (log.tags?.some(tag => tag.toLowerCase().includes(term)) ?? false) ||
            (log.game?.home_team?.name?.toLowerCase().includes(term) ?? false) ||
            (log.game?.away_team?.name?.toLowerCase().includes(term) ?? false) ||
            (log.game?.home_team?.nickname?.toLowerCase().includes(term) ?? false) ||
            (log.game?.away_team?.nickname?.toLowerCase().includes(term) ?? false)
          );
        } else {
          // Search in specific field
          switch (searchField) {
            case 'classification':
              return log.classification?.toLowerCase().includes(term);
            case 'watched_setting':
              return log.watched_setting?.toLowerCase().includes(term);
            case 'watched_scope':
              return log.watched_scope?.toLowerCase().includes(term);
            case 'notes':
              return log.notes?.toLowerCase().includes(term);
            case 'tags':
              return log.tags?.some(tag => tag.toLowerCase().includes(term));
            case 'team':
              return (
                (log.game?.home_team?.name?.toLowerCase().includes(term) ?? false) ||
                (log.game?.away_team?.name?.toLowerCase().includes(term) ?? false) ||
                (log.game?.home_team?.nickname?.toLowerCase().includes(term) ?? false) ||
                (log.game?.away_team?.nickname?.toLowerCase().includes(term) ?? false)
              );
            default:
              return true;
          }
        }
      });
    }

    // Apply sorting
    if (sortKey && sortDirection) {
      filteredLogs.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortKey) {
          case 'created_at':
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
            break;
          case 'rating_for_game':
            aValue = a.rating_for_game;
            bValue = b.rating_for_game;
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
          case 'team': {
            // Sort by home team name, then away team name
            const aHomeTeam = a.game?.home_team?.name ?? '';
            const bHomeTeam = b.game?.home_team?.name ?? '';
            const aAwayTeam = a.game?.away_team?.name ?? '';
            const bAwayTeam = b.game?.away_team?.name ?? '';
            aValue = `${aHomeTeam} vs ${aAwayTeam}`;
            bValue = `${bHomeTeam} vs ${bAwayTeam}`;
            break;
          }
          case 'owner': {
            // Sort by username, then first name, then last name
            const aUsername = a.user?.username ?? '';
            const bUsername = b.user?.username ?? '';
            const aFirstName = a.user?.first_name ?? '';
            const bFirstName = b.user?.first_name ?? '';
            const aLastName = a.user?.last_name ?? '';
            const bLastName = b.user?.last_name ?? '';
            aValue = `${aUsername} ${aFirstName} ${aLastName}`.toLowerCase();
            bValue = `${bUsername} ${bFirstName} ${bLastName}`.toLowerCase();
            break;
          }
          case 'tags': {
            // Sort by first tag, then by number of tags
            const aTags = a.tags ?? [];
            const bTags = b.tags ?? [];
            const aFirstTag = aTags.length > 0 ? aTags[0] : '';
            const bFirstTag = bTags.length > 0 ? bTags[0] : '';
            aValue = aFirstTag || `zzz-${aTags.length}`; // Empty tags go to end
            bValue = bFirstTag || `zzz-${bTags.length}`;
            break;
          }
          default:
            return 0;
        }

        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });
    }

    return filteredLogs;
  };

  // Get total count for current tab with filtering applied
  const getCurrentTabTotalCount = (): { displayed: number; total: number } => {
    let logs: IGameLog[] = [];

    switch (selectedTab) {
      case 'my-logs':
        logs = Array.isArray(myLogs) ? myLogs : [];
        break;
      case 'friends-logs':
        logs = Array.isArray(friendsLogs) ? friendsLogs : [];
        break;
      case 'public-logs':
        logs = Array.isArray(publicLogs) ? publicLogs : [];
        break;
      default:
        return { displayed: 0, total: 0 };
    }

    // Get total count before filtering
    const totalCount = logs.length;

    // Apply the same filtering logic to get displayed count
    const filteredLogs = filterAndSortGameLogs(logs);
    const displayedCount = filteredLogs.length;

    return { displayed: displayedCount, total: totalCount };
  };

  const renderGameLogCard = (log: IGameLog, showActions = false, idx?: number) => {
    // Normalize null fields to undefined for compatibility
    const normalizedLog = {
      ...log,
      notes: log.notes ?? undefined,
      tags: log.tags ?? undefined,
      watched_date: log.watched_date ?? undefined,
      watched_setting: log.watched_setting ?? undefined,
      watched_location: log.watched_location ?? undefined,
      watched_scope: log.watched_scope ?? undefined,
    };
    return (
      <Card
        key={`${log.id}-${idx ?? ''}`}
        className="mb-4 border-2 border-gray-300 dark:border-gray-500 bg-neutral-100 dark:bg-neutral-800 shadow-md"
      >
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
        <CardContent className="text-gray-900 dark:text-gray-100">
          {normalizedLog.notes && (
            <CardDescription className="mb-2 text-gray-600">{normalizedLog.notes}</CardDescription>
          )}
          {normalizedLog.tags && normalizedLog.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {normalizedLog.tags.map(tag => (
                <span key={tag} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="text-sm text-gray-500 mb-2">
            {normalizedLog.watched_date &&
              !isNaN(new Date(normalizedLog.watched_date).getTime()) &&
              (() => {
                try {
                  return (
                    <div>
                      Watched: {format(new Date(normalizedLog.watched_date), 'MMM dd, yyyy')}
                    </div>
                  );
                } catch {
                  return <div>Watched: Invalid date</div>;
                }
              })()}
            {normalizedLog.watched_setting && <div>Setting: {normalizedLog.watched_setting}</div>}
            {normalizedLog.watched_location && (
              <div>Location: {normalizedLog.watched_location}</div>
            )}
          </div>
          <div className="text-xs text-gray-400">
            {log.created_at && !isNaN(new Date(log.created_at).getTime()) ? (
              (() => {
                try {
                  return <>Created: {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}</>;
                } catch {
                  return <>Created: Invalid date</>;
                }
              })()
            ) : (
              <>Created: Unknown</>
            )}
          </div>
        </CardContent>
        {showActions && (
          <CardFooter className="gap-2 mt-3 text-gray-900 dark:text-gray-100">
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
          </CardFooter>
        )}
      </Card>
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
      <div className="text-center py-8 text-red-600">
        <p>An error occurred while loading game logs.</p>
        <p className="text-sm mt-2">Please check your connection and try again.</p>
        <details className="mt-4 text-left">
          <summary className="cursor-pointer">Error Details</summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
            {myLogsError?.message ??
              publicLogsError?.message ??
              (friendsLogsError as Error | null)?.message ??
              'Unknown error'}
          </pre>
        </details>
      </div>
    );
  }

  // Add animation classes for the Load More button
  const loadMoreButtonClass =
    'px-8 py-3 text-lg rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition-all duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 active:opacity-80';

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
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
          displayedCount={getCurrentTabTotalCount().displayed}
          totalCount={getCurrentTabTotalCount().total}
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
              <p className="text-gray-600">Loading your game logs...</p>
            </div>
          ) : Array.isArray(myLogs) && myLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No game logs found. Create your first one!</p>
            </div>
          ) : Array.isArray(myLogs) ? (
            <div>
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
              <p className="text-gray-600">Loading friends&apos; game logs...</p>
            </div>
          ) : !Array.isArray(friendsLogs) || friendsLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No friends&apos; game logs found.</p>
            </div>
          ) : (
            <div>
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
          )}
        </TabsContent>

        <TabsContent value="public-logs" className="space-y-4">
          {publicLogsLoading || !Array.isArray(publicLogs) ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading public game logs...</p>
            </div>
          ) : publicLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No public game logs found.</p>
            </div>
          ) : (
            <div>
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
