import { useMutation, useQuery } from '@apollo/client';
import { SignInButton } from '@clerk/nextjs';
import { X, Search } from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { CREATE_GAME_LOG, UPDATE_GAME_LOG } from '@/lib/graphql/mutations';
import { GET_EXTERNAL_GAMES } from '@/lib/graphql/queries';
import {
  CLASSIFICATION,
  WATCHED_SETTING,
  WATCHED_SCOPE,
  type ClassificationValue,
  type WatchedSettingValue,
  type WatchedScopeValue,
} from '@/lib/types/config.types';
import { GameEdge, GameLogFormData } from '@/lib/types/consolidated.types';
import { GameLogModalProps } from '@/lib/types/game-log.types';
import type { Game } from '@/lib/types/generated/graphql';
import { getCurrentSeason } from '@/lib/utils/index';
import { formatGameDate } from '@/lib/utils/index.time';

import { GameLogForm } from './game-log-form';

export function GameLogModal({
  mode,
  gameId,
  gameLog,
  isOpen: externalIsOpen,
  onClose,
  onSuccess,
}: GameLogModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen ?? internalIsOpen;
  const setIsOpen = typeof onClose === 'function' ? onClose : setInternalIsOpen;

  const { toast } = useToast();
  const { user } = useAuthContext();
  const authUserId = user?.id;

  // Game search state (only for create mode)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Reset selected game when search query changes
  useEffect(() => {
    setSelectedGame(null);
  }, [searchQuery]);

  // Set selectedGame for update mode
  useEffect(() => {
    if (mode === 'update' && gameLog?.game) {
      setSelectedGame(gameLog.game as unknown as Game);
    }
  }, [mode, gameLog]);

  // Form state
  const [formData, setFormData] = useState<GameLogFormData>({
    gameId: gameLog?.gameId || gameId || '',
    watchedSetting: (gameLog?.watchedSetting as WatchedSettingValue) || WATCHED_SETTING.TV,
    watchedDate: gameLog?.watchedDate ? new Date(gameLog.watchedDate) : new Date(),
    watchedLocation: gameLog?.watchedLocation || '',
    ratingForGame: gameLog?.ratingForGame || 3,
    watchedScope: (gameLog?.watchedScope as WatchedScopeValue) || WATCHED_SCOPE.FULL_GAME,
    notes: gameLog?.notes || '',
    tags: gameLog?.tags || [],
    classification: (gameLog?.classification as ClassificationValue) || CLASSIFICATION.PROTECTED,
  });

  // Mutations
  const [createGameLog, { loading: creating }] = useMutation(CREATE_GAME_LOG, {
    onCompleted: data => {
      if (data?.createGameLog?.gameLog) {
        toast({
          title: 'Success',
          description: 'Game log created successfully',
        });
        resetForm();
        setIsOpen(false);
        onSuccess?.();
      } else if (data?.createGameLog?.errors) {
        console.error('GameLogModal: Server returned errors:', data.createGameLog.errors);
        toast({
          title: 'Error',
          description: data.createGameLog.errors
            .map((e: { message: string }) => e.message)
            .join(', '),
          variant: 'destructive',
        });
      }
    },
    onError: error => {
      console.error('GameLogModal: Error creating game log:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const [updateGameLog, { loading: updating }] = useMutation(UPDATE_GAME_LOG, {
    onCompleted: data => {
      if (data?.updateGameLog?.gameLog) {
        toast({
          title: 'Success',
          description: 'Game log updated successfully',
        });
        setIsOpen(false);
        onSuccess?.();
      } else if (data?.updateGameLog?.errors) {
        console.error('GameLogModal: Server returned errors:', data.updateGameLog.errors);
        toast({
          title: 'Error',
          description: data.updateGameLog.errors
            .map((e: { message: string }) => e.message)
            .join(', '),
          variant: 'destructive',
        });
      }
    },
    onError: error => {
      console.error('GameLogModal: Error updating game log:', error);
      toast({
        title: 'Error',
        description: error.message,
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
    skip: !isOpen || mode === 'update',
  });

  // Handle search input changes (only for create mode)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  // Filter games based on search query
  const filteredGames = useMemo(() => {
    if (!gamesData?.games?.edges) {
      return [];
    }
    if (!searchQuery.trim()) {
      console.log('No search query, returning all games');
      return gamesData.games.edges;
    }
    console.log('Filtering games with search query:', searchQuery);
    console.log('Total games before filtering:', gamesData.games.edges.length);

    const searchLower = searchQuery.toLowerCase();
    const filtered = gamesData.games.edges.filter((edge: GameEdge) => {
      const game = edge.node;

      // Team search fields
      const homeTeam = game.teams?.home;
      const awayTeam = game.teams?.visitors;

      // Check home team fields
      const homeTeamMatch =
        homeTeam &&
        ((typeof homeTeam.name === 'string' && homeTeam.name.toLowerCase().includes(searchLower)) ||
          (typeof homeTeam.nickname === 'string' &&
            homeTeam.nickname.toLowerCase().includes(searchLower)) ||
          (typeof homeTeam.code === 'string' &&
            homeTeam.code.toLowerCase().includes(searchLower)) ||
          (typeof homeTeam.id === 'string' && homeTeam.id.toLowerCase().includes(searchLower)));

      // Check away team fields
      const awayTeamMatch =
        awayTeam &&
        ((typeof awayTeam.name === 'string' && awayTeam.name.toLowerCase().includes(searchLower)) ||
          (typeof awayTeam.nickname === 'string' &&
            awayTeam.nickname.toLowerCase().includes(searchLower)) ||
          (typeof awayTeam.code === 'string' &&
            awayTeam.code.toLowerCase().includes(searchLower)) ||
          (typeof awayTeam.id === 'string' && awayTeam.id.toLowerCase().includes(searchLower)));

      // Arena search fields
      const arena = game.arena;
      const arenaMatch =
        arena &&
        ((typeof arena.name === 'string' && arena.name.toLowerCase().includes(searchLower)) ||
          (typeof arena.city === 'string' && arena.city.toLowerCase().includes(searchLower)) ||
          (typeof arena.state === 'string' && arena.state.toLowerCase().includes(searchLower)) ||
          (typeof arena.country === 'string' && arena.country.toLowerCase().includes(searchLower)));

      // Game date
      const dateMatch =
        typeof game.date === 'string'
          ? game.date.toLowerCase().includes(searchLower)
          : formatGameDate(game.date).toLowerCase().includes(searchLower);

      // Game status
      const statusMatch =
        (typeof game.status?.long === 'string' &&
          game.status.long.toLowerCase().includes(searchLower)) ||
        (typeof game.status?.short === 'string' &&
          game.status.short.toLowerCase().includes(searchLower));

      // League and season
      const leagueMatch =
        typeof game.league === 'string' && game.league.toLowerCase().includes(searchLower);
      const seasonMatch =
        typeof game.season === 'number' && game.season.toString().includes(searchLower);

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

    console.log('Filtered games count:', filtered.length);
    return filtered;
  }, [gamesData?.games?.edges, searchQuery]);

  const handleSubmit = async (e: React.FormEvent<Element>) => {
    e.preventDefault();

    if (mode === 'create') {
      if (!selectedGame?.id) {
        toast({
          title: 'Error',
          description: 'Please select a game first',
          variant: 'destructive',
        });
        return;
      }

      try {
        await createGameLog({
          variables: {
            input: {
              gameId: selectedGame.id,
              watchedSetting: formData.watchedSetting,
              watchedDate: formData.watchedDate,
              watchedLocation: formData.watchedLocation,
              ratingForGame: formData.ratingForGame,
              watchedScope: formData.watchedScope,
              notes: formData.notes,
              tags: formData.tags,
              classification: formData.classification,
            },
          },
        });
      } catch (error) {
        console.error('GameLogModal: Error creating game log:', error);
      }
    } else if (mode === 'update' && gameLog?.id) {
      try {
        await updateGameLog({
          variables: {
            id: gameLog.id,
            input: {
              watchedSetting: formData.watchedSetting,
              watchedDate: formData.watchedDate,
              watchedLocation: formData.watchedLocation,
              ratingForGame: formData.ratingForGame,
              watchedScope: formData.watchedScope,
              notes: formData.notes,
              tags: formData.tags,
              classification: formData.classification,
            },
          },
        });
      } catch (error) {
        console.error('GameLogModal: Error updating game log:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      gameId: '',
      watchedSetting: WATCHED_SETTING.TV,
      watchedDate: new Date(),
      watchedLocation: '',
      ratingForGame: 3,
      watchedScope: WATCHED_SCOPE.FULL_GAME,
      notes: '',
      tags: [],
      classification: CLASSIFICATION.PROTECTED,
    });
    setSelectedGame(null);
    setSearchQuery('');
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
          onClick={() => setIsOpen(false)}
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

      {mode === 'create' && (
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
            {filteredGames.map((edge: GameEdge) => (
              <div
                key={edge.node.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedGame?.id === edge.node.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedGame(edge.node as unknown as Game)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedGame(edge.node as unknown as Game);
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
                      {formatGameDate(edge.node.date)} • {edge.node.arena?.name || 'Unknown Arena'}
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

      <GameLogForm
        formData={formData}
        setFormData={setFormData}
        selectedGame={
          selectedGame
            ? {
                ...selectedGame,
                date: {
                  start: (() => {
                    try {
                      if (typeof selectedGame.date === 'string') {
                        return new Date(selectedGame.date).toISOString();
                      }
                      if (typeof selectedGame.date.start === 'string') {
                        return selectedGame.date.start;
                      }
                      if (selectedGame.date.start instanceof Date) {
                        return selectedGame.date.start.toISOString();
                      }
                      console.warn('Invalid start date:', selectedGame.date.start);
                      return new Date().toISOString();
                    } catch (error) {
                      console.error('Error parsing start date:', error);
                      return new Date().toISOString();
                    }
                  })(),
                  end: (() => {
                    try {
                      if (typeof selectedGame.date === 'string') {
                        return '';
                      }
                      if (!selectedGame.date.end) {
                        return '';
                      }
                      if (typeof selectedGame.date.end === 'string') {
                        const date = new Date(selectedGame.date.end);
                        return isNaN(date.getTime()) ? '' : date.toISOString();
                      }
                      if (selectedGame.date.end instanceof Date) {
                        return selectedGame.date.end.toISOString();
                      }
                      console.warn('Invalid end date:', selectedGame.date.end);
                      return '';
                    } catch (error) {
                      console.error('Error parsing end date:', error);
                      return '';
                    }
                  })(),
                  duration:
                    typeof selectedGame.date === 'string' ? '' : selectedGame.date.duration || '',
                },
                status: {
                  long: selectedGame.status.long || '',
                  short: selectedGame.status.short || '',
                  clock: selectedGame.status.clock || null,
                  halftime: selectedGame.status.halftime || false,
                },
                arena: {
                  name: selectedGame.arena.name || '',
                  city: selectedGame.arena.city || '',
                  state: selectedGame.arena.state || undefined,
                  country: selectedGame.arena.country || undefined,
                },
                timesTied: selectedGame.timesTied || undefined,
                leadChanges: selectedGame.leadChanges || undefined,
                nugget: selectedGame.nugget || undefined,
                officials: selectedGame.officials || [],
                periods: selectedGame.periods || undefined,
                createdAt:
                  typeof selectedGame.createdAt === 'string'
                    ? selectedGame.createdAt
                    : selectedGame.createdAt instanceof Date
                      ? selectedGame.createdAt.toISOString()
                      : new Date().toISOString(),
                updatedAt:
                  typeof selectedGame.updatedAt === 'string'
                    ? selectedGame.updatedAt
                    : selectedGame.updatedAt instanceof Date
                      ? selectedGame.updatedAt.toISOString()
                      : new Date().toISOString(),
              }
            : null
        }
        loading={mode === 'create' ? creating : updating}
        onSubmit={handleSubmit}
        onCancel={() => setIsOpen(false)}
        submitLabel={mode === 'create' ? 'Create Log' : 'Update Log'}
      />
    </DialogContent>
  );

  if (mode === 'create') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
