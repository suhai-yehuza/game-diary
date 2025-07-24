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
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
};

export function GameLogsTable() {
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState('public-logs');
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
  } = useGameLogs({ filters: { classification: CLASSIFICATION.PROTECTED } });

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
    return (
      <Card key={log.id} className="mb-4 border-2 border-red-400 bg-white">
        <CardHeader className="flex flex-row justify-between items-start pb-2">
          <div className="flex items-center gap-2">
            <ClassificationIcon classification={log.classification} />
            <CardTitle className="text-base font-medium">Game {log.game_id}</CardTitle>
          </div>
          <RatingStars rating={log.rating_for_game} />
        </CardHeader>
        <CardContent>
          {log.notes && (
            <CardDescription className="mb-2 text-gray-600">{log.notes}</CardDescription>
          )}
          {log.tags && log.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {log.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="text-sm text-gray-500 mb-2">
            {log.watched_date && (
              <div>Watched: {format(new Date(log.watched_date), 'MMM dd, yyyy')}</div>
            )}
            {log.watched_setting && <div>Setting: {log.watched_setting}</div>}
            {log.watched_location && <div>Location: {log.watched_location}</div>}
          </div>
          <div className="text-xs text-gray-400">
            Created: {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
          </div>
        </CardContent>
        {showActions && (
          <CardFooter className="gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={() => setEditingGameLog(log)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingGameLog(log)}
              className="text-red-600 hover:text-red-700"
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
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Log
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-logs">My Logs</TabsTrigger>
          <TabsTrigger value="friends-logs">Friends&apos; Logs</TabsTrigger>
          <TabsTrigger value="public-logs">Public Logs</TabsTrigger>
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
              {myGameLogs?.edges?.map((edge: { node: IGameLog }) =>
                renderGameLogCard(edge.node, true)
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="friends-logs" className="space-y-4">
          {friendsLogsLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading friends&apos; game logs...</p>
            </div>
          ) : friendsGameLogs?.edges?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No friends&apos; game logs found.</p>
            </div>
          ) : (
            <div>
              {friendsGameLogs?.edges?.map((edge: { node: IGameLog }) =>
                renderGameLogCard(edge.node)
              )}
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
              {publicGameLogs.edges.map((edge: { node: IGameLog }) => renderGameLogCard(edge.node))}
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
