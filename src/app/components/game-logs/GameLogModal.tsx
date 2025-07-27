'use client';

import { useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Star, Search, Calendar, MapPin, ChevronDown, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';

import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/Card';
import { CREATE_GAME_LOG, UPDATE_GAME_LOG } from '@/lib/graphql/mutations';
import type {
  IGameLog,
  CreateGameLogFormData,
  UpdateGameLogFormData,
  ICreateGameLogResponse,
  IUpdateGameLogResponse,
} from '@/lib/types';
import {
  CLASSIFICATION,
  WATCHED_SETTING,
  WATCHED_SCOPE,
  createGameLogSchema,
  updateGameLogSchema,
} from '@/lib/types';
import type { IGameResponse } from '@/lib/types/externalApi.types';
import { getLatestNbaSeason, getRecentNbaSeasons } from '@/lib/utils/nba-season';

// Type predicate for linter and type safety
function isCreateGameLogFormData(data: unknown): data is CreateGameLogFormData {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.gameId === 'string' &&
    typeof obj.rating_for_game === 'number' &&
    typeof obj.classification === 'string'
  );
}

interface ISearchResult {
  id: number;
  name: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  arena: string;
  season: number;
  status: string;
}

export interface IGameLogModalProps {
  mode: 'create' | 'edit';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gameLog?: IGameLog; // Required for edit mode
}

const LATEST_SEASON = getLatestNbaSeason();
const SEASONS = getRecentNbaSeasons(10);

export function GameLogModal({ mode, isOpen, onClose, onSuccess, gameLog }: IGameLogModalProps) {
  const { user } = useUser();
  const [rating, setRating] = useState(mode === 'edit' ? (gameLog?.rating_for_game ?? 3) : 3);
  const [tags, setTags] = useState<string[]>(mode === 'edit' ? (gameLog?.tags ?? []) : []);
  const [newTag, setNewTag] = useState('');

  // Create mode specific state
  const [selectedGameId, setSelectedGameId] = useState('');
  const [selectedGameName, setSelectedGameName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<ISearchResult[]>([]);
  const [allGames, setAllGames] = useState<IGameResponse[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<'latest' | number | 'all'>('latest');
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);

  // Use appropriate schema and form data type based on mode
  const schema = mode === 'create' ? createGameLogSchema : updateGameLogSchema;
  const defaultValues =
    mode === 'create'
      ? {
          gameId: '',
          rating_for_game: 3,
          classification: CLASSIFICATION.PROTECTED,
          watched_setting: WATCHED_SETTING.TV,
          watched_scope: WATCHED_SCOPE.FULL_GAME,
          watched_date: new Date().toISOString().split('T')[0],
          notes: '',
          watched_location: '',
        }
      : {
          rating_for_game: gameLog?.rating_for_game ?? 3,
          notes: gameLog?.notes ?? '',
          classification:
            (gameLog?.classification as keyof typeof CLASSIFICATION) ?? CLASSIFICATION.PROTECTED,
          watched_setting: gameLog?.watched_setting ?? WATCHED_SETTING.TV,
          watched_scope: gameLog?.watched_scope ?? WATCHED_SCOPE.FULL_GAME,
          watched_date: gameLog?.watched_date
            ? new Date(gameLog.watched_date).toISOString().split('T')[0]
            : '',
          watched_location: gameLog?.watched_location ?? '',
        };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    setValue,
  } = useForm<CreateGameLogFormData | UpdateGameLogFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as CreateGameLogFormData & UpdateGameLogFormData,
    mode: mode === 'create' ? 'onChange' : 'onBlur',
  });

  // Update form when gameLog changes (edit mode)
  useEffect(() => {
    if (mode === 'edit' && gameLog) {
      setRating(gameLog.rating_for_game);
      setTags(gameLog.tags ?? []);
      reset({
        rating_for_game: gameLog.rating_for_game,
        notes: gameLog.notes ?? '',
        classification: gameLog.classification as keyof typeof CLASSIFICATION,
        watched_setting: gameLog.watched_setting ?? WATCHED_SETTING.TV,
        watched_scope: gameLog.watched_scope ?? WATCHED_SCOPE.FULL_GAME,
        watched_date: gameLog.watched_date
          ? new Date(gameLog.watched_date).toISOString().split('T')[0]
          : '',
        watched_location: gameLog.watched_location ?? '',
      });
    }
  }, [gameLog, reset, mode]);

  // Set gameId form value when selectedGameId changes (create mode only)
  useEffect(() => {
    if (mode === 'create') {
      setValue('gameId', selectedGameId);
    }
  }, [selectedGameId, setValue, mode]);

  // Load all games for the selected scope
  const loadAllGames = useCallback(async (season: number | 'all' | 'latest') => {
    setGamesLoading(true);
    setSearchError(null);

    try {
      let games: IGameResponse[] = [];
      let effectiveSeason = season;
      if (season === 'latest') {
        effectiveSeason = LATEST_SEASON;
      }

      if (effectiveSeason === 'all') {
        // Fetch games for all seasons in parallel
        const allGamesPromises = SEASONS.map(async s => {
          const response = await fetch(`/api/proxy/games?season=${s}&league=standard`);
          if (!response.ok) return [];
          const data = (await response.json()) as {
            errors?: string[];
            response?: IGameResponse[];
          };
          return data.response ?? [];
        });

        const allGamesResults = await Promise.all(allGamesPromises);
        games = allGamesResults.flat();
      } else {
        const response = await fetch(`/api/proxy/games?season=${effectiveSeason}&league=standard`);
        if (!response.ok) throw new Error('Failed to fetch games');
        const data = (await response.json()) as { errors?: string[]; response?: IGameResponse[] };
        games = data.response ?? [];
      }

      // Sort games by date (most recent first), handle null dates
      const sortedGames = games.sort((a, b) => {
        const dateA = a.date?.start ? new Date(a.date.start).getTime() : 0;
        const dateB = b.date?.start ? new Date(b.date.start).getTime() : 0;
        return dateB - dateA;
      });

      setAllGames(sortedGames);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'An error occurred');
      setAllGames([]);
    } finally {
      setGamesLoading(false);
    }
  }, []);

  // Filter games based on search term (local filtering)
  const filterGames = useCallback(
    (term: string) => {
      if (!term.trim()) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);

      try {
        const filteredGames = allGames.filter(game => {
          // Skip invalid games
          if (!game || typeof game !== 'object') return false;

          const searchLower = term.toLowerCase();

          // Add null checks for team names
          const homeTeam = game.teams?.home?.name?.toLowerCase() ?? '';
          const awayTeam = game.teams?.visitors?.name?.toLowerCase() ?? '';
          const arena = game.arena?.name?.toLowerCase() ?? '';

          // Add null check for date
          const gameDate = game.date?.start
            ? new Date(game.date.start).toLocaleDateString().toLowerCase()
            : '';

          return (
            homeTeam.includes(searchLower) ||
            awayTeam.includes(searchLower) ||
            arena.includes(searchLower) ||
            gameDate.includes(searchLower)
          );
        });

        // Convert to search results format (no limit on results)
        const searchResults: ISearchResult[] = filteredGames.map(game => ({
          id: game.id,
          name: `${game.teams?.visitors?.name ?? 'Unknown Team'} @ ${game.teams?.home?.name ?? 'Unknown Team'}`,
          date: game.date?.start
            ? new Date(game.date.start).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : 'Unknown Date',
          homeTeam: game.teams?.home?.name ?? 'Unknown Team',
          awayTeam: game.teams?.visitors?.name ?? 'Unknown Team',
          arena: game.arena?.name ?? 'Unknown Arena',
          season: game.season ?? 0,
          status: game.status?.long ?? game.status?.short ?? 'Unknown',
        }));

        setSearchResults(searchResults);
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : 'An error occurred');
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [allGames]
  );

  // Load all games when season changes
  useEffect(() => {
    if (mode === 'create') {
      void loadAllGames(selectedSeason);
    }
  }, [selectedSeason, loadAllGames, mode]);

  // Filter games when search term changes
  useEffect(() => {
    if (mode === 'create') {
      filterGames(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, filterGames, mode]);

  // Mutations
  const [createGameLog, { loading: createLoading }] = useMutation<ICreateGameLogResponse>(
    CREATE_GAME_LOG,
    {
      onCompleted: data => {
        const created = data?.createGameLog?.gameLog;
        if (created) {
          toast.success('Game log created!');
          onSuccess();
          onClose();
          reset();
          setRating(3);
          setTags([]);
          setNewTag('');
          setSelectedGameId('');
          setSelectedGameName('');
          setSearchTerm('');
          setSearchResults([]);
          setAllGames([]);
        } else {
          const errorObj = data?.createGameLog?.errors?.[0] as { message?: string } | undefined;
          const errorMsg = errorObj?.message ?? 'Game log creation failed';
          toast.error(errorMsg);
        }
      },
      onError: () => {
        toast.error('Failed to create game log.');
        onClose();
      },
    }
  );

  const [updateGameLog, { loading: updateLoading }] = useMutation<IUpdateGameLogResponse>(
    UPDATE_GAME_LOG,
    {
      onCompleted: (data: { updateGameLog: { gameLog: IGameLog; errors: unknown[] } }) => {
        if (data?.updateGameLog?.gameLog) {
          toast.success('Game log updated!');
          if (onSuccess) {
            onSuccess();
          }
          onClose();
        } else {
          // Show detailed error message from backend
          const errors = data?.updateGameLog?.errors as Array<{ message?: string }>;
          if (errors && errors.length > 0) {
            const errorMessage = errors[0]?.message ?? 'Failed to update game log';
            toast.error(errorMessage);
          } else {
            toast.error('Failed to update game log.');
          }
        }
      },
      onError: (error: Error) => {
        toast.error(`Failed to update game log: ${error.message}`);
        onClose();
      },
    }
  );

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleGameSelect = (gameId: string, gameName: string) => {
    setSelectedGameId(gameId);
    setSelectedGameName(gameName);
    setValue('gameId', gameId, { shouldValidate: true });
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setValue('rating_for_game', newRating, { shouldValidate: true });
  };

  const handleFormSubmit = async (data: unknown) => {
    try {
      if (mode === 'create') {
        if (!isCreateGameLogFormData(data)) {
          throw new Error('Invalid form data');
        }
        const input = {
          gameId: data.gameId,
          rating_for_game: data.rating_for_game,
          notes: data.notes,
          classification: data.classification,
          watched_date: data.watched_date ? new Date(data.watched_date) : new Date(),
          watched_setting: data.watched_setting,
          watched_location: data.watched_location,
          watched_scope: data.watched_scope,
          tags,
        };
        await createGameLog({ variables: { input } });
      } else {
        // Edit mode
        const updateData = data as UpdateGameLogFormData;
        const input = {
          rating_for_game: updateData.rating_for_game,
          notes: updateData.notes,
          classification: updateData.classification,
          watched_setting: updateData.watched_setting,
          watched_location: updateData.watched_location,
          watched_scope: updateData.watched_scope,
          tags: updateData.tags,
          watched_date: updateData.watched_date
            ? new Date(updateData.watched_date).toISOString()
            : undefined,
        };
        if (!gameLog) {
          throw new Error('Game log is required for edit mode');
        }
        await updateGameLog({
          variables: {
            id: gameLog.id,
            input,
          },
        });
      }
    } catch {
      toast.error(`Failed to ${mode} game log.`);
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSearchResults(true);

    if (!value.trim()) {
      setSelectedGameId('');
      setSelectedGameName('');
      setValue('gameId', '');
      setSearchResults([]);
    }
  };

  if (!isOpen) return null;

  const isUserAuthenticated = !!user;
  const loading = createLoading || updateLoading;
  const isFormValid = mode === 'create' ? isValid && selectedGameId : isValid;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 border border-gray-300 dark:border-gray-700 rounded-xl shadow-2xl">
        <div className="p-3 text-gray-900 dark:text-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">
              {mode === 'create' ? 'Create New Game Log' : 'Edit Game Log'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {!isUserAuthenticated && (
            <div className="mb-3 p-2 bg-yellow-100 text-yellow-800 rounded text-center text-sm font-semibold">
              You must be signed in to {mode} a game log.
            </div>
          )}

          <form onSubmit={e => void handleSubmit(handleFormSubmit)(e)} className="space-y-3">
            {/* Game Selection - Only for create mode */}
            {mode === 'create' && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Find/Search for Games *
                </label>
                {selectedGameName ? (
                  <div className="flex items-center gap-3 p-3 border-2 border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {selectedGameName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Game ID: {selectedGameId}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedGameId('');
                        setSelectedGameName('');
                        setValue('gameId', '');
                        setSearchTerm('');
                      }}
                      className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        onFocus={() => setShowSearchResults(true)}
                        disabled={gamesLoading}
                        className="w-full pl-8 pr-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder={
                          gamesLoading
                            ? 'Loading games...'
                            : 'Search by team name, arena, or date...'
                        }
                      />
                    </div>

                    {/* Season selector */}
                    <div className="mt-2">
                      <select
                        value={selectedSeason}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === 'all' || val === 'latest') setSelectedSeason(val);
                          else setSelectedSeason(Number(val));
                        }}
                        disabled={gamesLoading}
                        className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="latest">
                          {gamesLoading
                            ? 'Loading...'
                            : `${LATEST_SEASON}-${LATEST_SEASON + 1} Season (Latest)`}
                        </option>
                        <option value="all">All Seasons</option>
                        {SEASONS.map(season => (
                          <option key={season} value={season}>
                            {season}-{season + 1} Season
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Search Results Dropdown */}
                    {showSearchResults && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {gamesLoading && (
                          <div className="p-3 text-center text-gray-600 text-sm">
                            <p>Loading games for selected season...</p>
                          </div>
                        )}

                        {searchLoading && !gamesLoading && (
                          <div className="p-3 text-center text-gray-600 text-sm">
                            <p>Searching for games...</p>
                          </div>
                        )}

                        {searchError && (
                          <div className="p-3 text-center text-red-600 text-sm">
                            <p>Error: {searchError}</p>
                          </div>
                        )}

                        {!gamesLoading &&
                          !searchLoading &&
                          !searchError &&
                          searchResults.length === 0 &&
                          searchTerm.trim() && (
                            <div className="p-3 text-center text-gray-600 text-sm">
                              <p>No games found matching your search.</p>
                              <p className="text-xs mt-1">Try a different search term.</p>
                            </div>
                          )}

                        {!gamesLoading &&
                          !searchLoading &&
                          !searchError &&
                          searchResults.length > 0 && (
                            <div className="py-1">
                              {searchResults.map(game => (
                                <div
                                  key={game.id}
                                  onClick={() => handleGameSelect(game.id.toString(), game.name)}
                                  className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                >
                                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-0.5">
                                    {game.name}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {game.date}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {game.arena}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {searchResults.length > 0 && (
                                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
                                  Showing {searchResults.length} result
                                  {searchResults.length !== 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          )}

                        {!gamesLoading && !searchLoading && !searchError && !searchTerm.trim() && (
                          <div className="p-3 text-center text-gray-600 text-sm">
                            <p>Start typing to search for games...</p>
                            <p className="text-xs mt-1">Search by team name, arena, or date</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {mode === 'create' && 'gameId' in errors && errors.gameId && (
                  <p className="text-red-600 text-sm mt-1">
                    {(errors.gameId as { message?: string })?.message}
                  </p>
                )}
              </div>
            )}

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rating *
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'text-orange-400 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">({rating}/5)</span>
              </div>
              <input type="hidden" {...register('rating_for_game')} value={rating} />
              {errors.rating_for_game && (
                <p className="text-red-600 text-xs">{errors.rating_for_game.message}</p>
              )}
            </div>

            {/* Privacy Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Privacy Level *
              </label>
              <select
                {...register('classification')}
                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value={CLASSIFICATION.PRIVATE}>Private (Only you)</option>
                <option value={CLASSIFICATION.PROTECTED}>Protected (Friends only)</option>
                <option value={CLASSIFICATION.PUBLIC}>Public (Everyone)</option>
              </select>
              {errors.classification && (
                <p className="text-red-600 text-xs mt-1">{errors.classification.message}</p>
              )}
            </div>

            {/* Watched Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Watched Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  {...register('watched_date')}
                  className="w-full px-2 py-1.5 pr-8 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 [&::-webkit-calendar-picker-indicator]:opacity-0"
                  id="watched-date-input"
                />
                <div
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  onClick={() => {
                    const input = document.getElementById('watched-date-input') as HTMLInputElement;
                    if (input) {
                      input.focus();
                      if (typeof input.showPicker === 'function') {
                        input.showPicker();
                      } else {
                        input.click();
                      }
                    }
                  }}
                >
                  <Calendar className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Watched Setting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                How did you watch?
              </label>
              <select
                {...register('watched_setting')}
                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value={WATCHED_SETTING.TV}>TV</option>
                <option value={WATCHED_SETTING.LAPTOP}>Laptop/Computer</option>
                <option value={WATCHED_SETTING.PHONE}>Phone</option>
                <option value={WATCHED_SETTING.ARENA}>Arena</option>
                <option value={WATCHED_SETTING.BAR}>Bar</option>
                <option value={WATCHED_SETTING.HOME}>Home</option>
                <option value={WATCHED_SETTING.OTHER}>Other</option>
              </select>
            </div>

            {/* Watched Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location (optional)
              </label>
              <input
                type="text"
                {...register('watched_location')}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="e.g., Home, Arena, Bar"
              />
            </div>

            {/* Watched Scope */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                What did you watch?
              </label>
              <select
                {...register('watched_scope')}
                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value={WATCHED_SCOPE.FULL_GAME}>Full Game</option>
                <option value={WATCHED_SCOPE.HALF_GAME}>Half Game</option>
                <option value={WATCHED_SCOPE.HIGHLIGHTS}>Highlights</option>
                <option value={WATCHED_SCOPE.PRE_GAME}>Pre-Game</option>
                <option value={WATCHED_SCOPE.POST_GAME}>Post-Game</option>
                <option value={WATCHED_SCOPE.SHORTS}>Shorts</option>
                <option value={WATCHED_SCOPE.OTHER}>Other</option>
              </select>
            </div>

            {/* Notes */}
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700"
              >
                {isNotesExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                Notes (optional)
              </button>
              {isNotesExpanded && (
                <textarea
                  {...register('notes')}
                  rows={2}
                  className="w-full px-3 py-2 border-0 bg-transparent focus:outline-none focus:ring-0 text-sm resize-none"
                  placeholder="Share your thoughts..."
                />
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 min-h-[40px] flex-1">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-xs flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 min-w-[120px] border-none outline-none bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm text-gray-900 dark:text-gray-100"
                      placeholder={tags.length === 0 ? 'Type a tag and press Enter' : ''}
                    />
                  </div>
                  {newTag.trim() && (
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      size="sm"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm text-xs whitespace-nowrap"
                    >
                      Add Tag
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-between pt-4 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-10 px-6 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || loading || !isFormValid || !isUserAuthenticated}
                className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || loading
                  ? mode === 'create'
                    ? 'Creating...'
                    : 'Updating...'
                  : mode === 'create'
                    ? 'Create Game Log'
                    : 'Update Game Log'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
