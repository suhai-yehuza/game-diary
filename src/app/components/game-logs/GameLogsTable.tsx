'use client';

import { useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import { Star, Eye, EyeOff, Lock, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { CreateGameLogModal } from '@/app/components/game-logs/CreateGameLogModal';
import { DeleteGameLogModal } from '@/app/components/game-logs/DeleteGameLogModal';
import { EditGameLogModal } from '@/app/components/game-logs/EditGameLogModal';
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
import { useGameLogs, useFriendsGameLogs } from '@/hooks/use-game-logs';
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

  const {
    gameLogs: myGameLogsRaw,
    loading: myLogsLoading,
    error: myLogsError,
    refetch: refetchMyLogs,
  } = useGameLogs({ filters: { userId: user?.id } });

  const myGameLogs = myGameLogsRaw;

  const {
    gameLogs: publicGameLogsRaw,
    loading: publicLogsLoading,
    error: publicLogsError,
  } = useGameLogs({ filters: { classification: CLASSIFICATION.PUBLIC } });

  const publicGameLogs = publicGameLogsRaw;

  const {
    gameLogs: friendsGameLogsRaw,
    loading: friendsLogsLoading,
    error: friendsLogsError,
  } = useFriendsGameLogs();

  const friendsGameLogs = friendsGameLogsRaw;

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

  const renderGameLogCard = (log: IGameLog, showActions = false) => {
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
        key={log.id}
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
            {normalizedLog.watched_date && (
              <div>Watched: {format(new Date(normalizedLog.watched_date), 'MMM dd, yyyy')}</div>
            )}
            {normalizedLog.watched_setting && <div>Setting: {normalizedLog.watched_setting}</div>}
            {normalizedLog.watched_location && (
              <div>Location: {normalizedLog.watched_location}</div>
            )}
          </div>
          <div className="text-xs text-gray-400">
            Created: {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
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
              friendsLogsError?.message ??
              'Unknown error'}
          </pre>
        </details>
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
          ) : myGameLogs?.edges?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No game logs found. Create your first one!</p>
            </div>
          ) : (
            <div>
              {myGameLogs?.edges?.map(edge =>
                renderGameLogCard(
                  {
                    ...edge.node,
                    notes: edge.node.notes ?? undefined,
                    tags: edge.node.tags ?? undefined,
                    watched_date: edge.node.watched_date ?? undefined,
                    watched_setting: edge.node.watched_setting ?? undefined,
                    watched_location: edge.node.watched_location ?? undefined,
                    watched_scope: edge.node.watched_scope ?? undefined,
                    game: edge.node.game,
                  } as IGameLog,
                  true
                )
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="friends-logs" className="space-y-4">
          {friendsLogsLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading friends&apos; game logs...</p>
            </div>
          ) : !friendsGameLogs ||
            !Array.isArray(friendsGameLogs.edges) ||
            friendsGameLogs.edges.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No friends&apos; game logs found.</p>
            </div>
          ) : (
            <div>
              {Array.isArray(friendsGameLogs.edges) &&
                friendsGameLogs.edges.map(edge => {
                  if (!edge?.node) return null;
                  const gameLogData = {
                    ...edge.node,
                    notes: edge.node.notes ?? undefined,
                    tags: edge.node.tags ?? undefined,
                    watched_date: edge.node.watched_date
                      ? new Date(edge.node.watched_date)
                      : undefined,
                    watched_setting: edge.node.watched_setting ?? undefined,
                    watched_location: edge.node.watched_location ?? undefined,
                    watched_scope: edge.node.watched_scope ?? undefined,
                    game: edge.node.game,
                  };
                  return renderGameLogCard(gameLogData as IGameLog);
                })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public-logs" className="space-y-4">
          {publicLogsLoading || !publicGameLogs ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading public game logs...</p>
            </div>
          ) : publicGameLogs.edges.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No public game logs found.</p>
            </div>
          ) : (
            <div>
              {publicGameLogs.edges.map(edge =>
                renderGameLogCard({
                  ...edge.node,
                  notes: edge.node.notes ?? undefined,
                  tags: edge.node.tags ?? undefined,
                  watched_date: edge.node.watched_date ?? undefined,
                  watched_setting: edge.node.watched_setting ?? undefined,
                  watched_location: edge.node.watched_location ?? undefined,
                  watched_scope: edge.node.watched_scope ?? undefined,
                  game: edge.node.game,
                } as IGameLog)
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
