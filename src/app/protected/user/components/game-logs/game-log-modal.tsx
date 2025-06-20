'use client';

import { useQuery, useMutation } from '@apollo/client';
import { SignInButton } from '@clerk/nextjs';
import { X, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
import 'react-datepicker/dist/react-datepicker.css';

import { useAuthContext } from '@/contexts/auth-context';
import { Button } from '@src/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@src/app/components/ui/dialog';
import { Input } from '@src/app/components/ui/input';
import { useToast } from '@src/app/components/ui/use-toast';
import { CREATE_GAME_LOG, UPDATE_GAME_LOG } from '@src/lib/graphql/mutations';
import { GET_EXTERNAL_GAMES, GET_GAME_BY_ID } from '@src/lib/graphql/queries';
import { WATCHED_SETTING, WATCHED_SCOPE, CLASSIFICATION } from '@src/lib/types';
import type { IWatchedSettingValue, IWatchedScopeValue, IGame } from '@src/lib/types';
import type {
  IGameEdge,
  IExtendedGameLogModalProps,
  IGameData,
} from '@src/lib/types/game-log.types';
import type { Classification, CreateGameLogInput } from '@src/lib/types/generated/graphql';
import { getCurrentSeason } from '@src/lib/utils/index';
import { formatGameDate } from '@src/lib/utils/time';

import { GameLogForm } from './game-log-form';

function valueToKey<T extends Record<string, string>>(obj: T, value: string): keyof T | undefined {
  return (Object.keys(obj) as (keyof T)[]).find(key => obj[key] === value);
}

export function GameLogModal({
  isOpen,
  onClose,
  mode,
  gameLog,
  onSuccess,
}: IExtendedGameLogModalProps) {
  const { toast } = useToast();
  const [selectedGame, setSelectedGame] = useState<IGameData | null>(null);

  const { user } = useAuthContext();
  const authUserId = user?.id;
  const router = useRouter();

  // Game search state (only for create mode when no gameId is provided)
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch specific game when gameId is provided (for create mode)
  const { data: specificGameData, loading: loadingSpecificGame } = useQuery(GET_GAME_BY_ID, {
    variables: { id: gameLog?.game ? (gameLog.game as { id: string }).id : undefined },
    skip: !(gameLog?.game && (gameLog.game as { id: string }).id) || mode === 'edit' || !isOpen,
  });

  // Reset selected game when search query changes
  useEffect(() => {
    setSelectedGame(null);
  }, [searchQuery]);

  // Set selectedGame for update mode
  useEffect(() => {
    if (mode === 'edit' && gameLog?.game) {
      setSelectedGame(gameLog.game as unknown as IGameData);
    }
  }, [mode, gameLog]);

  // Auto-select game when fetched by ID
  useEffect(() => {
    if (
      specificGameData?.game &&
      mode === 'create' &&
      gameLog?.game &&
      (gameLog.game as { id: string }).id
    ) {
      setSelectedGame(specificGameData.game as unknown as IGameData);
    }
  }, [specificGameData, mode, gameLog?.game]);

  // Form state - properly load existing values for update mode (memoized to prevent re-creation)
  const initialFormData: CreateGameLogInput = gameLog
    ? {
        gameId: gameLog.game ? (gameLog.game as { id: string }).id : '',
        watchedSetting: (valueToKey(WATCHED_SETTING, gameLog.watchedSetting || '') ??
          'TV') as IWatchedSettingValue,
        watchedDate: gameLog.watchedDate ? new Date(gameLog.watchedDate).toISOString() : undefined,
        watchedLocation: gameLog.watchedLocation ?? undefined,
        ratingForGame: gameLog.ratingForGame,
        watchedScope: (valueToKey(WATCHED_SCOPE, gameLog.watchedScope || '') ??
          'FULL_GAME') as IWatchedScopeValue,
        notes: gameLog.notes ?? undefined,
        tags: gameLog.tags ?? undefined,
        classification: (valueToKey(CLASSIFICATION, gameLog.classification || '') ??
          'Protected') as Classification,
      }
    : {
        gameId: '',
        watchedSetting: 'TV' as IWatchedSettingValue,
        watchedDate: new Date().toISOString(),
        watchedLocation: undefined,
        ratingForGame: 3,
        watchedScope: 'FULL_GAME' as IWatchedScopeValue,
        notes: undefined,
        tags: undefined,
        classification: 'Protected' as Classification,
      };

  // Mutations
  const [createGameLog, { loading: creating }] = useMutation(CREATE_GAME_LOG, {
    onCompleted: data => {
      if (data?.createGameLog?.gameLog) {
        toast({
          title: '🎉 Success!',
          description: 'Your game log has been created successfully.',
        });
        resetForm();
        onClose();
        onSuccess?.();

        // Redirect to game log details page if created from a game details page
        if (gameLog?.game && (gameLog.game as { id: string }).id && data.createGameLog.gameLog.id) {
          router.push(`/protected/user/game-logs/${data.createGameLog.gameLog.id}`);
        }
      } else if (data?.createGameLog?.errors) {
        toast({
          title: '❌ Creation Failed',
          description: data.createGameLog.errors
            .map((e: { message: string }) => e.message)
            .join(', '),
          variant: 'destructive',
        });
      } else {
        toast({
          title: '❌ Unexpected Error',
          description: 'Something went wrong while creating your game log. Please try again.',
          variant: 'destructive',
        });
      }
    },
    onError: error => {
      toast({
        title: '❌ Creation Failed',
        description:
          error.message || 'Failed to create game log. Please check your connection and try again.',
        variant: 'destructive',
      });
    },
  });

  const [updateGameLog, { loading: updating }] = useMutation(UPDATE_GAME_LOG, {
    onCompleted: data => {
      if (data?.updateGameLog?.gameLog) {
        toast({
          title: '✅ Updated!',
          description: 'Your game log has been updated successfully.',
        });
        onClose();
        onSuccess?.();
      } else if (data?.updateGameLog?.errors) {
        toast({
          title: '❌ Update Failed',
          description: data.updateGameLog.errors
            .map((e: { message: string }) => e.message)
            .join(', '),
          variant: 'destructive',
        });
      } else {
        toast({
          title: '❌ Unexpected Error',
          description: 'Something went wrong while updating your game log. Please try again.',
          variant: 'destructive',
        });
      }
    },
    onError: error => {
      toast({
        title: '❌ Update Failed',
        description:
          error.message || 'Failed to update game log. Please check your connection and try again.',
        variant: 'destructive',
      });
    },
  });

  // Fetch games with pagination and search (only for create mode)
  const { data: gamesData, loading: loadingGames } = useQuery(GET_EXTERNAL_GAMES, {
    variables: {
      filters: {
        season: getCurrentSeason(),
      },
      first: 5000,
      after: null,
    },
    skip: !isOpen || mode === 'edit' || !!(gameLog?.game && (gameLog.game as { id: string }).id),
  });

  // Handle search input changes (only for create mode)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  // Filter games based on search query
  const filteredGames = useMemo(() => {
    if (!gamesData?.games?.edges) return [];
    if (!searchQuery) return gamesData.games.edges;

    const searchLower = searchQuery.toLowerCase();
    const filtered = gamesData.games.edges.filter(({ node: game }: { node: IGame }) => {
      const homeTeamMatch =
        game.teams?.home?.name?.toLowerCase().includes(searchLower) ||
        game.teams?.home?.nickname?.toLowerCase().includes(searchLower) ||
        game.teams?.home?.code?.toLowerCase().includes(searchLower);
      const awayTeamMatch =
        game.teams?.visitors?.name?.toLowerCase().includes(searchLower) ||
        game.teams?.visitors?.nickname?.toLowerCase().includes(searchLower) ||
        game.teams?.visitors?.code?.toLowerCase().includes(searchLower);
      const arenaMatch =
        typeof game.arena === 'string'
          ? game.arena.toLowerCase().includes(searchLower)
          : game.arena?.name?.toLowerCase().includes(searchLower);
      const dateMatch = formatGameDate(game.date).toLowerCase().includes(searchLower);
      const statusMatch = game.status?.long?.toLowerCase().includes(searchLower);
      const leagueMatch =
        typeof game.league === 'string' && game.league.toLowerCase().includes(searchLower);
      const seasonMatch =
        typeof game.season === 'number' && String(game.season).includes(searchLower);

      return (
        homeTeamMatch ||
        awayTeamMatch ||
        arenaMatch ||
        dateMatch ||
        statusMatch ||
        leagueMatch ||
        seasonMatch
      );
    });

    return filtered;
  }, [gamesData?.games?.edges, searchQuery]);

  const handleSubmit = async (formData: CreateGameLogInput) => {
    if (mode === 'create') {
      const selectedGameId =
        selectedGame?.id || (gameLog?.game ? (gameLog.game as { id: string }).id : undefined);
      if (!selectedGame || !selectedGameId) {
        toast({
          title: '⚠️ Invalid Game',
          description: 'Please select a valid game before creating your log.',
          variant: 'destructive',
        });
        return;
      }

      try {
        await createGameLog({
          variables: {
            input: {
              ...formData,
              gameId: selectedGameId,
            },
          },
        });
      } catch {
        // Error handled by mutation
      }
    } else if (mode === 'edit' && gameLog?.id) {
      try {
        await updateGameLog({
          variables: {
            id: gameLog.id,
            input: formData,
          },
        });
      } catch {
        // Error handled by mutation
      }
    }
  };

  const resetForm = () => {
    // Only clear selectedGame if we're not using a pre-selected gameId
    if (!(gameLog?.game && (gameLog.game as { id: string }).id)) {
      setSelectedGame(null);
      setSearchQuery('');
    }
  };

  if (!authUserId) {
    return (
      <SignInButton mode="modal">
        <Button
          variant="outline"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
        >
          Sign in to {mode === 'create' ? 'Create' : 'Update'} Game Log
        </Button>
      </SignInButton>
    );
  }

  const dialogContent = (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
      <DialogHeader className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0"
          onClick={() => onClose()}
        >
          <X className="h-4 w-4" />
        </Button>
        <DialogTitle className="text-gray-900 dark:text-white">
          {mode === 'create' ? 'Create a Game Log' : 'Update Game Log'}
        </DialogTitle>
        <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
          {mode === 'create'
            ? 'Fill in the details about where and when you watched the game, along with your rating.'
            : 'Update the details about where and when you watched the game.'}
        </DialogDescription>
      </DialogHeader>

      {mode === 'create' &&
        !(gameLog?.game && (gameLog.game as { id: string }).id) &&
        !selectedGame && (
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by team name, nickname, code, arena, date, status..."
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>

            {loadingGames && <div>Loading games...</div>}

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {filteredGames.map((edge: IGameEdge) => (
                <div
                  key={edge.node.id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setSelectedGame(edge.node as unknown as IGameData);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedGame(edge.node as unknown as IGameData);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select game: ${edge.node.teams?.home?.name || 'Unknown'} vs ${edge.node.teams?.visitors?.name || 'Unknown'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {edge.node.teams?.home?.name && edge.node.teams?.visitors?.name
                          ? `${edge.node.teams.home.name} vs ${edge.node.teams.visitors.name}`
                          : 'Unknown Teams'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatGameDate(edge.node.date)} •{' '}
                        {edge.node.arena?.name || 'Unknown Arena'}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {edge.node.league} • {edge.node.season}
                    </div>
                  </div>
                </div>
              ))}
              {!loadingGames && filteredGames.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No games found matching your search
                </div>
              )}
            </div>
          </div>
        )}

      {mode === 'create' &&
        gameLog?.game &&
        (gameLog.game as { id: string }).id &&
        loadingSpecificGame && (
          <div className="mb-6 text-center">
            <div>Loading game details...</div>
          </div>
        )}

      {mode === 'create' && selectedGame && !loadingSpecificGame && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900">Selected Game</h4>
            {!(gameLog?.game && (gameLog.game as { id: string }).id) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedGame(null);
                  setSearchQuery('');
                }}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              >
                Change Game
              </Button>
            )}
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium">
              {selectedGame.teams?.home?.name && selectedGame.teams?.visitors?.name
                ? `${selectedGame.teams.home.name} vs ${selectedGame.teams.visitors.name}`
                : 'Unknown Teams'}
            </p>
            <p className="text-blue-600">
              {formatGameDate(
                typeof selectedGame.date === 'string'
                  ? selectedGame.date
                  : {
                      start:
                        typeof selectedGame.date.start === 'string'
                          ? selectedGame.date.start
                          : new Date(selectedGame.date.start).toISOString(),
                    }
              )}{' '}
              • {selectedGame.arena?.name || 'Unknown Arena'}
            </p>
          </div>
        </div>
      )}

      <GameLogForm
        key={`${mode}-${gameLog?.id || 'new'}`}
        formData={initialFormData}
        selectedGame={selectedGame}
        loading={mode === 'create' ? creating : updating}
        onSubmit={handleSubmit}
        onCancel={() => onClose()}
        submitLabel={mode === 'create' ? 'Create Log' : 'Update Log'}
      />
    </DialogContent>
  );

  if (mode === 'create') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
          >
            Create a Game Log
          </Button>
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {dialogContent}
    </Dialog>
  );
}
