'use client';

import { useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import { Star, Eye, EyeOff, Lock, Users, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { useState } from 'react';

import { CreateGameLogModal } from '@/app/components/game-logs/CreateGameLogModal';
import { DeleteGameLogModal } from '@/app/components/game-logs/DeleteGameLogModal';
import { EditGameLogModal } from '@/app/components/game-logs/EditGameLogModal';
import { Button } from '@/app/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/app/components/ui/Card';
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
          className={`w-3 h-3 ${star <= rating ? 'text-orange-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
};

const getTeamDisplay = (game: IGameLog['game']): string => {
  if (!game || typeof game !== 'object' || !('home_team' in game && 'away_team' in game)) {
    return 'Unknown Teams';
  }

  const { home_team, away_team } = game as {
    home_team: { code?: string; nickname?: string; name: string };
    away_team: { code?: string; nickname?: string; name: string };
  };
  const homeTeamCode = home_team.code ?? home_team.nickname ?? home_team.name;
  const awayTeamCode = away_team.code ?? away_team.nickname ?? away_team.name;

  return `${awayTeamCode} @ ${homeTeamCode}`;
};

export function MobileGameLogsTable() {
  const { user } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGameLog, setEditingGameLog] = useState<IGameLog | null>(null);
  const [deletingGameLog, setDeletingGameLog] = useState<IGameLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const {
    gameLogs: myLogs,
    loading: myLogsLoading,
    error: myLogsError,
    refetch: refetchMyLogs,
  } = useGameLogs();

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

  const filteredLogs =
    myLogs?.filter(log => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        getTeamDisplay(log.game).toLowerCase().includes(searchLower) ||
        log.notes?.toLowerCase().includes(searchLower) ||
        log.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }) || [];

  const renderGameLogCard = (log: IGameLog) => {
    return (
      <Card key={log.id} className="mb-3 border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1">
              <ClassificationIcon classification={log.classification} />
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-semibold truncate">
                  {getTeamDisplay(log.game)}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <RatingStars rating={log.rating_for_game} />
                  <span className="text-xs text-gray-500">
                    {log.created_at && format(new Date(log.created_at), 'MMM dd')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingGameLog(log)}
                className="p-1 h-8 w-8"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeletingGameLog(log)}
                className="p-1 h-8 w-8 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        {log.notes && (
          <CardContent className="pt-0 pb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{log.notes}</p>
          </CardContent>
        )}
        {log.tags && log.tags.length > 0 && (
          <CardFooter className="pt-0">
            <div className="flex flex-wrap gap-1">
              {log.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                >
                  {tag}
                </span>
              ))}
              {log.tags.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                  +{log.tags.length - 3}
                </span>
              )}
            </div>
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

  if (myLogsError) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>An error occurred while loading game logs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Game Logs</h2>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="sm"
          className="bg-blue-600 text-white rounded-full px-4 py-2"
        >
          <Plus className="w-4 h-4 mr-1" />
          New
        </Button>
      </div>

      {/* Mobile Search with improved contrast */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search game logs..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border-none outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Game Logs List */}
      <div className="space-y-3">
        {myLogsLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              {searchTerm
                ? 'No logs found matching your search.'
                : 'No game logs yet. Create your first one!'}
            </p>
          </div>
        ) : (
          filteredLogs.map(log => renderGameLogCard(log))
        )}
      </div>

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
