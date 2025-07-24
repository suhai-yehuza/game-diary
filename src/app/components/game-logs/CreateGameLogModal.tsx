'use client';

import { useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Star, Search, Calendar, MapPin } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';

import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/Card';
import { CREATE_GAME_LOG } from '@/lib/graphql/mutations';
import type { CreateGameLogFormData, ICreateGameLogModalProps } from '@/lib/types';
import { CLASSIFICATION, WATCHED_SETTING, WATCHED_SCOPE, createGameLogSchema } from '@/lib/types';
import type { IGameResponse } from '@/lib/types/externalApi.types';
import type { ICreateGameLogResponse } from '@/lib/types/gameLog.types';
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

const LATEST_SEASON = getLatestNbaSeason();
const SEASONS = getRecentNbaSeasons(10);

export function CreateGameLogModal({ isOpen, onClose, onSuccess }: ICreateGameLogModalProps) {
  const { user } = useUser();
  const [rating, setRating] = useState(3);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedGameId, setSelectedGameId] = useState('');
  const [selectedGameName, setSelectedGameName] = useState('');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<ISearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<'latest' | number | 'all'>('latest');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    setValue,
  } = useForm<CreateGameLogFormData>({
    resolver: zodResolver(createGameLogSchema),
    defaultValues: {
      gameId: '',
      rating_for_game: 3,
      classification: CLASSIFICATION.PROTECTED,
      watched_setting: WATCHED_SETTING.TV,
      watched_scope: WATCHED_SCOPE.FULL_GAME,
      watched_date: new Date().toISOString().split('T')[0],
    },
    mode: 'onChange',
  });

  const searchGames = useCallback(async (term: string, season: number | 'all' | 'latest') => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      let games: IGameResponse[] = [];
      let effectiveSeason = season;
      if (season === 'latest') {
        effectiveSeason = LATEST_SEASON;
      }
      if (effectiveSeason === 'all') {
        // Fetch games for all seasons in parallel
        const allGames = await Promise.all(
          SEASONS.map(async s => {
            const response = await fetch(`/api/proxy/games?season=${s}&league=standard`);
            if (!response.ok) return [];
            const data = (await response.json()) as {
              errors?: string[];
              response?: IGameResponse[];
            };
            return data.response ?? [];
          })
        );
        games = allGames.flat();
      } else {
        const response = await fetch(`/api/proxy/games?season=${effectiveSeason}&league=standard`);
        if (!response.ok) throw new Error('Failed to fetch games');
        const data = (await response.json()) as { errors?: string[]; response?: IGameResponse[] };
        games = data.response ?? [];
      }

      const filteredGames = games.filter(game => {
        const searchLower = term.toLowerCase();
        const homeTeam = game.teams.home.name.toLowerCase();
        const awayTeam = game.teams.visitors.name.toLowerCase();
        const arena = game.arena?.name?.toLowerCase() ?? '';
        const gameDate = new Date(game.date.start).toLocaleDateString().toLowerCase();
        return (
          homeTeam.includes(searchLower) ||
          awayTeam.includes(searchLower) ||
          arena.includes(searchLower) ||
          gameDate.includes(searchLower)
        );
      });

      const sortedGames = filteredGames
        .sort((a, b) => new Date(b.date.start).getTime() - new Date(a.date.start).getTime())
        .slice(0, 10);

      const searchResults: ISearchResult[] = sortedGames.map(game => ({
        id: game.id,
        name: `${game.teams.visitors.name} @ ${game.teams.home.name}`,
        date: new Date(game.date.start).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        homeTeam: game.teams.home.name,
        awayTeam: game.teams.visitors.name,
        arena: game.arena?.name ?? 'Unknown Arena',
        season: game.season,
        status: game.status?.long ?? game.status?.short ?? 'Unknown',
      }));

      setSearchResults(searchResults);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'An error occurred');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    void searchGames(debouncedSearchTerm, selectedSeason);
  }, [debouncedSearchTerm, selectedSeason, searchGames]);

  const [createGameLog, { loading }] = useMutation<ICreateGameLogResponse>(CREATE_GAME_LOG, {
    onCompleted: data => {
      console.log('createGameLog mutation response:', data);
      const created = data?.createGameLog?.gameLog;
      if (created) {
        toast.success('Game log created!');
        if (typeof onSuccess === 'function') onSuccess();
        if (typeof onClose === 'function') onClose();
        reset();
        setRating(3);
        setTags([]);
        setNewTag('');
        setSelectedGameId('');
        setSelectedGameName('');
        setSearchTerm('');
        setSearchResults([]);
      } else {
        const errorObj = data?.createGameLog?.errors?.[0] as { message?: string } | undefined;
        const errorMsg =
          errorObj && typeof errorObj.message === 'string'
            ? errorObj.message
            : 'Game log creation failed (no gameLog in response)';
        console.error('Game log creation error:', errorMsg, data?.createGameLog?.errors);
        toast.error(errorMsg);
      }
    },
    onError: () => {
      toast.error('Failed to create game log.');
      if (typeof onClose === 'function') onClose();
    },
  });

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
      console.log('handleFormSubmit called with data:', data);
      if (!isCreateGameLogFormData(data)) {
        console.error('Invalid form data', data);
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
      console.log('Submitting createGameLog mutation with input:', input);
      await createGameLog({
        variables: { input },
      });
      console.log('createGameLog mutation completed');
    } catch (err) {
      console.error('Failed to create game log:', err);
      toast.error('Failed to create game log.');
      if (typeof onClose === 'function') onClose();
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
    }
  };

  if (!isOpen) return null;

  const isUserAuthenticated = !!user;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Create New Game Log</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {!isUserAuthenticated && (
            <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded text-center font-semibold">
              You must be signed in to create a game log.
            </div>
          )}

          <form onSubmit={e => void handleSubmit(handleFormSubmit)(e)} className="space-y-2">
            {/* Game Selection */}
            <div className="relative mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Find/Search for Games *
              </label>
              {selectedGameName ? (
                <div className="flex items-center gap-2 p-1 border border-gray-300 rounded-none bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium text-xs text-gray-900">{selectedGameName}</p>
                    <p className="text-xs text-gray-600">Game ID: {selectedGameId}</p>
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
                      className="w-full pl-8 pr-2 py-1 text-xs border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search by team name, arena, or date..."
                    />
                  </div>

                  {/* Season selector */}
                  <div className="mt-1">
                    <select
                      value={selectedSeason}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === 'all' || val === 'latest') setSelectedSeason(val);
                        else setSelectedSeason(Number(val));
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    >
                      <option value="latest">
                        {`${LATEST_SEASON}-${LATEST_SEASON + 1} Season (Latest)`}
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
                  {showSearchResults && (searchTerm.trim() || searchLoading) && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {searchLoading && (
                        <div className="p-4 text-center text-gray-600">
                          <p>Searching for games...</p>
                        </div>
                      )}

                      {searchError && (
                        <div className="p-4 text-center text-red-600">
                          <p>Error: {searchError}</p>
                        </div>
                      )}

                      {!searchLoading &&
                        !searchError &&
                        searchResults.length === 0 &&
                        searchTerm.trim() && (
                          <div className="p-4 text-center text-gray-600">
                            <p>No games found matching your search.</p>
                          </div>
                        )}

                      {!searchLoading && !searchError && searchResults.length > 0 && (
                        <div className="py-1">
                          {searchResults.map(game => (
                            <div
                              key={game.id}
                              onClick={() => handleGameSelect(game.id.toString(), game.name)}
                              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900 mb-1">{game.name}</div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
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
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Hidden input to ensure form validation works */}
              <input type="hidden" {...register('gameId')} value={selectedGameId} />
              {errors.gameId && (
                <p className="text-red-700 font-bold text-xs mt-1">{errors.gameId.message}</p>
              )}
            </div>

            {/* Rating */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Rating *</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="focus:outline-none h-5 w-5"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-1 text-xs text-gray-600">({rating}/5)</span>
              </div>
              <input type="hidden" {...register('rating_for_game')} value={rating} />
              {errors.rating_for_game && (
                <p className="text-red-600 text-xs mt-1">{errors.rating_for_game.message}</p>
              )}
            </div>

            {/* Classification */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Privacy Level *
              </label>
              <select
                {...register('classification')}
                className="w-full px-2 py-1 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
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
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Watched Date</label>
              <input
                type="date"
                {...register('watched_date')}
                className="w-full px-2 py-1 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            {/* Watched Setting */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Setting (optional)
              </label>
              <select
                {...register('watched_setting')}
                className="w-full px-2 py-1 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              >
                <option value={WATCHED_SETTING.TV}>TV</option>
                <option value={WATCHED_SETTING.ARENA}>Arena</option>
                <option value={WATCHED_SETTING.PHONE}>Phone</option>
                <option value={WATCHED_SETTING.LAPTOP}>Laptop/Computer</option>
                <option value={WATCHED_SETTING.BAR}>Bar</option>
                <option value={WATCHED_SETTING.HOME}>Home</option>
                <option value={WATCHED_SETTING.OTHER}>Other</option>
              </select>
            </div>

            {/* Watched Location */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Location (optional)
              </label>
              <input
                type="text"
                {...register('watched_location')}
                className="w-full px-2 py-1 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                placeholder="e.g., Home, Arena, Bar"
              />
            </div>

            {/* Watched Scope */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Scope (optional)
              </label>
              <select
                {...register('watched_scope')}
                className="w-full px-2 py-1 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
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
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                {...register('notes')}
                rows={2}
                className="w-full px-2 py-1 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                placeholder="Share your thoughts about the game..."
              />
            </div>

            {/* Tags */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tags (optional, to easily filter your game logs)
              </label>
              <div className="flex flex-wrap gap-0 border border-gray-300 rounded-none focus-within:ring-2 focus-within:ring-blue-500 bg-white dark:bg-black">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center bg-blue-100 text-blue-800 rounded-none text-[10px] px-0.5 py-0 gap-0 leading-none"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-600 hover:text-blue-800 p-0 m-0 h-auto min-h-0 bg-transparent border-none align-middle"
                      style={{ lineHeight: 1 }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-1 py-0 border-none focus:outline-none bg-transparent text-[10px]"
                  placeholder="Add a tag"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-[10px]"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || loading || !selectedGameId || !isUserAuthenticated}
                className={
                  !isValid || !selectedGameId || !isUserAuthenticated
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }
              >
                {isSubmitting || loading ? 'Creating...' : 'Create Game Log'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
