'use client';

import { useMutation, useQuery } from '@apollo/client';
import { SignInButton } from '@clerk/nextjs';
import { X, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useMemo, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';

import { Button } from '@src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@src/components/ui/dialog';
import { Input } from '@src/components/ui/input';
import { useToast } from '@src/components/ui/use-toast';
import { useAuthContext } from '@/contexts/auth-context';
import { CREATE_GAME_LOG, UPDATE_GAME_LOG } from '@src/lib/graphql/mutations';
import { GET_EXTERNAL_GAMES, GET_GAME_BY_ID } from '@src/lib/graphql/queries';
import {
  CLASSIFICATION,
  WATCHED_SETTING,
  WATCHED_SCOPE,
  type ClassificationValue,
  type WatchedSettingValue,
  type WatchedScopeValue,
} from '@src/lib/types/config.types';
import type { GameEdge, GameLogFormData } from '@src/lib/types/consolidated.types';
import type { GameLogModalProps } from '@src/lib/types/game-log.types';
import type { GameWithPossibleId } from '@src/lib/types/game.types';
import type { Game, CreateGameLogInput } from '@src/lib/types/generated/graphql';
import { getCurrentSeason } from '@src/lib/utils/index';
import { formatGameDate } from '@src/lib/utils/time';

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
  
  // Safe modal close function that ensures proper cleanup
  const handleModalClose = (newOpen?: boolean) => {
    console.log('🔧 handleModalClose called with:', newOpen, 'onClose type:', typeof onClose);
    
    // Close the modal when Dialog wants to close (newOpen === false) or when called directly (undefined)
    if (newOpen === false || newOpen === undefined) {
      // For externally controlled modals (update mode), use the provided onClose
      if (typeof onClose === 'function') {
        console.log('🔧 Calling external onClose function');
        onClose();
      } else {
        // For internally controlled modals (create mode), use local state
        console.log('🔧 Using internal state setInternalIsOpen');
        setInternalIsOpen(false);
      }
    } else {
      console.log('🔧 Modal close ignored, newOpen was:', newOpen);
    }
  };

  const { toast } = useToast();
  const { user } = useAuthContext();
  const authUserId = user?.id;
  const router = useRouter();

  // Game search state (only for create mode when no gameId is provided)
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

  // Fetch specific game when gameId is provided (for create mode)
  const { data: specificGameData, loading: loadingSpecificGame } = useQuery(GET_GAME_BY_ID, {
    variables: { id: gameId },
    skip: !gameId || mode === 'update' || !isOpen,
  });

  // Auto-select game when fetched by ID
  useEffect(() => {
    if (specificGameData?.game && mode === 'create' && gameId) {
      setSelectedGame(specificGameData.game as unknown as Game);
    }
  }, [specificGameData, mode, gameId]);

  // Form state - properly load existing values for update mode (memoized to prevent re-creation)
  const initialFormData: GameLogFormData = useMemo(() => {
    if (mode === 'update' && gameLog) {
      // Debug: Log the actual database values
      console.log('🔍 Loading game log for update:', gameLog.id);
      
      // For update mode, use all existing values from the database
      // Add fallbacks for required fields that might be undefined or empty due to data integrity issues
      const formData = {
        gameId: gameLog.game?.id || '',
        // Use database value directly to see what we're getting
        watchedSetting: gameLog.watchedSetting as WatchedSettingValue,
        watchedDate: gameLog.watchedDate ? new Date(gameLog.watchedDate) : new Date(),
        watchedLocation: gameLog.watchedLocation ?? '',
        ratingForGame: gameLog.ratingForGame || 3,
        // Use database value directly to see what we're getting
        watchedScope: gameLog.watchedScope as WatchedScopeValue,
        notes: gameLog.notes ?? '',
        tags: gameLog.tags ?? [],
        // Use database value directly to see what we're getting  
        classification: gameLog.classification as ClassificationValue,
      };
      
      console.log('🎯 Form data ready for:', formData.gameId);
      return formData;
    } else {
      // For create mode, use defaults
      return {
        gameId: gameId || '',
        watchedSetting: WATCHED_SETTING.TV,
        watchedDate: new Date(),
        watchedLocation: '',
        ratingForGame: 3,
        watchedScope: WATCHED_SCOPE.FULL_GAME,
        notes: '',
        tags: [],
        classification: CLASSIFICATION.PROTECTED,
      };
    }
  }, [gameLog, gameId, mode]);

  // Mutations
  const [createGameLog, { loading: creating }] = useMutation(CREATE_GAME_LOG, {
    onCompleted: data => {
      if (data?.createGameLog?.gameLog) {
        toast({
          title: '🎉 Success!',
          description: 'Your game log has been created successfully.',
        });
        resetForm();
        handleModalClose();
        onSuccess?.();

        // Redirect to game log details page if created from a game details page
        if (gameId && data.createGameLog.gameLog.id) {
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
      console.log('🔧 UPDATE_GAME_LOG onCompleted called', data);
      if (data?.updateGameLog?.gameLog) {
        console.log('🔧 Update successful, about to close modal and call onSuccess');
        toast({
          title: '✅ Updated!',
          description: 'Your game log has been updated successfully.',
        });
        console.log('🔧 Calling handleModalClose...');
        handleModalClose();
        console.log('🔧 Calling onSuccess callback...');
        onSuccess?.();
        console.log('🔧 onSuccess callback completed');
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
    // Let the onSuccess callback handle cache refresh to avoid race conditions
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
    skip: !isOpen || mode === 'update' || !!gameId,
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
      return gamesData.games.edges;
    }

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
          ? (game.date as string).toLowerCase().includes(searchLower)
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

    return filtered;
  }, [gamesData?.games?.edges, searchQuery]);

  const handleSubmit = async (data: CreateGameLogInput) => {
    // Ensure ratingForGame is never null/undefined - this is a critical field
    const safeRatingForGame = data.ratingForGame ?? 3;
    
    // CRITICAL: Validate all enum fields to prevent empty strings being sent to GraphQL
    const safeClassification = (data.classification && 
      typeof data.classification === 'string' && 
      data.classification.trim() !== '' && 
      Object.values(CLASSIFICATION).includes(data.classification as any))
      ? data.classification 
      : CLASSIFICATION.PROTECTED;
      
    const safeWatchedSetting = (data.watchedSetting && 
      typeof data.watchedSetting === 'string' && 
      data.watchedSetting.trim() !== '' && 
      Object.values(WATCHED_SETTING).includes(data.watchedSetting as any))
      ? data.watchedSetting 
      : WATCHED_SETTING.TV;
      
    const safeWatchedScope = (data.watchedScope && 
      typeof data.watchedScope === 'string' && 
      data.watchedScope.trim() !== '' && 
      Object.values(WATCHED_SCOPE).includes(data.watchedScope as any))
      ? data.watchedScope 
      : WATCHED_SCOPE.FULL_GAME;
      
    console.log('🔍 Pre-mutation validation:', {
      originalData: data,
      safeClassification,
      safeWatchedSetting,
      safeWatchedScope,
      safeRatingForGame
    });
    
    if (mode === 'create') {
      // More robust check for selectedGame and its ID - handles different possible field names
      const selectedGameId =
        selectedGame?.id || (selectedGame as unknown as GameWithPossibleId)?.gameId || gameId;

      if (!selectedGame) {
        toast({
          title: '⚠️ No Game Selected',
          description: 'Please select a game before creating your log.',
          variant: 'destructive',
        });
        return;
      }

      if (!selectedGameId) {
        toast({
          title: '⚠️ Invalid Game',
          description:
            'The selected game appears to be invalid. Please try selecting a different game.',
          variant: 'destructive',
        });
        return;
      }

      try {
        const mutationInput = {
          gameId: selectedGameId,
          watchedSetting: safeWatchedSetting,
          watchedDate: data.watchedDate,
          watchedLocation: data.watchedLocation || '',
          ratingForGame: safeRatingForGame,
          watchedScope: safeWatchedScope,
          notes: data.notes || '',
          tags: data.tags || [],
          classification: safeClassification,
        };

        await createGameLog({
          variables: {
            input: mutationInput,
          },
        });
      } catch {
        // Error is already handled by the mutation's onError callback
        // No additional handling needed here
      }
    } else if (mode === 'update' && gameLog?.id) {
      try {
        // Use validated safe values to prevent empty strings
        const updateInput = {
          gameId: gameLog.game?.id || data.gameId,
          watchedSetting: safeWatchedSetting,
          watchedDate: data.watchedDate,
          watchedLocation: data.watchedLocation || '',
          ratingForGame: safeRatingForGame,
          watchedScope: safeWatchedScope,
          notes: data.notes || '',
          tags: data.tags || [],
          classification: safeClassification,
        };

        console.log('Update input payload:', updateInput);

        await updateGameLog({
          variables: {
            id: gameLog.id,
            input: updateInput,
          },
        });
      } catch {
        // Error is already handled by the mutation's onError callback
        // No additional handling needed here
      }
    }
  };

  const resetForm = () => {
    // Only clear selectedGame if we're not using a pre-selected gameId
    if (!gameId) {
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
          onClick={() => handleModalClose()}
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

      {mode === 'create' && !gameId && !selectedGame && (
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
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  setSelectedGame(edge.node as unknown as Game);
                }}
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

      {mode === 'create' && gameId && loadingSpecificGame && (
        <div className="mb-6 text-center">
          <div>Loading game details...</div>
        </div>
      )}

      {mode === 'create' && selectedGame && !loadingSpecificGame && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900">Selected Game</h4>
            {!gameId && (
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
                        selectedGame.date.start instanceof Date
                          ? selectedGame.date.start.toISOString()
                          : selectedGame.date.start,
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
        // @ts-expect-error - Type mismatch between generated GraphQL Game type and consolidated Game type
        selectedGame={selectedGame}
        loading={mode === 'create' ? creating : updating}
        onSubmit={handleSubmit}
        onCancel={() => handleModalClose()}
        submitLabel={mode === 'create' ? 'Create Log' : 'Update Log'}
      />
    </DialogContent>
  );

  if (mode === 'create') {
    return (
      <Dialog open={isOpen} onOpenChange={handleModalClose}>
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
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      {dialogContent}
    </Dialog>
  );
}
