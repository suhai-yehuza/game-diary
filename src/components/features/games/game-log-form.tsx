import { useMutation, useQuery } from '@apollo/client';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StarRating } from '@/components/ui/star-rating';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { CREATE_GAME_LOG } from '@/lib/graphql/mutations';
import { GET_EXTERNAL_GAMES } from '@/lib/graphql/queries';
import { WATCHED_SETTING, CLASSIFICATION, WATCHED_SCOPE } from '@/lib/types/config.types';
import type {
  ClassificationValue,
  WatchedSettingValue,
  WatchedScopeValue,
} from '@/lib/types/config.types';
import { GameEdge, GameLogFormData, GameLogFormProps, Game } from '@/lib/types/consolidated.types';
import type { CreateGameLogInput } from '@/lib/types/generated/graphql';

export function GameLogForm({
  onSuccess,
  formData: externalFormData,
  setFormData: externalSetFormData,
  selectedGame: externalSelectedGame,
  loading: _externalLoading,
  onSubmit: _externalOnSubmit,
  onCancel: _onCancel,
  submitLabel = 'Create Game Log',
}: GameLogFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const { toast } = useToast();
  const [internalFormData, setInternalFormData] = useState<GameLogFormData>({
    gameId: '',
    classification: CLASSIFICATION.PROTECTED,
    watchedSetting: WATCHED_SETTING.TV,
    watchedScope: WATCHED_SCOPE.FULL_GAME,
    watchedDate: new Date(),
    watchedLocation: '',
    ratingForGame: 3,
    notes: '',
    tags: [],
  });

  const formData = externalFormData || internalFormData;
  const setFormData = externalSetFormData || setInternalFormData;
  const finalSelectedGame = externalSelectedGame || selectedGame;

  const [createGameLog, { loading: creating }] = useMutation(CREATE_GAME_LOG);

  // Search games using external API
  const { data: searchResults, loading: searching } = useQuery(GET_EXTERNAL_GAMES, {
    variables: {
      filters: {
        dateRange: {
          start: format(new Date(), 'yyyy-MM-dd'),
        },
      },
      pagination: { first: 10 },
    },
  });

  // Filter games client-side by searchQuery
  const filteredGames =
    searchResults?.games?.edges
      ?.map((edge: GameEdge) => edge.node)
      ?.filter((game: Game) => {
        if (!searchQuery) return true;
        const lower = searchQuery.toLowerCase();
        const teamNames =
          game.teams?.home?.name && game.teams?.visitors?.name
            ? `${game.teams.home.name} ${game.teams.visitors.name}`.toLowerCase()
            : '';
        const arena = game.arena?.name?.toLowerCase() || '';
        return teamNames.includes(lower) || arena.includes(lower);
      }) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!finalSelectedGame) {
      toast({
        title: 'Error',
        description: 'Please select a game first',
      });
      return;
    }

    try {
      const input: CreateGameLogInput = {
        gameId: finalSelectedGame.id,
        watchedSetting: formData.watchedSetting,
        watchedDate: formData.watchedDate,
        watchedLocation: formData.watchedLocation,
        ratingForGame: formData.ratingForGame,
        watchedScope: formData.watchedScope,
        notes: formData.notes,
        tags: formData.tags,
        classification: formData.classification,
      };

      const { data } = await createGameLog({
        variables: {
          input,
        },
      });

      if (data?.createGameLog?.gameLog) {
        toast({
          title: 'Success',
          description: 'Game log created successfully',
        });

        onSuccess?.();
      } else {
        throw new Error('Failed to create game log');
      }
    } catch (error: unknown) {
      console.error('Error creating game log:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create game log',
      });
    }
  };

  const formatGameDateDisplay = (game: Game | null) => {
    if (!game?.date) return 'Unknown Date';
    const dateStr = typeof game.date === 'string' ? game.date : game.date.start;
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {/* Game Search Section */}
        <div className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for a game..."
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          </div>

          {searching && <div>Searching games...</div>}

          {filteredGames.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredGames.map((game: Game) => {
                return (
                  <div
                    key={game.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      finalSelectedGame?.id === game.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedGame(game)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {game.teams?.home?.name && game.teams?.visitors?.name
                            ? `${game.teams.home.name} vs ${game.teams.visitors.name}`
                            : 'Unknown Teams'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatGameDateDisplay(game)} • {game.arena?.name || 'Unknown Arena'}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {game.league} • {game.season}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {finalSelectedGame && (
          <>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-bold mb-2">Selected Game</h2>
              <p className="font-medium">
                {finalSelectedGame.teams?.home?.name && finalSelectedGame.teams?.visitors?.name
                  ? `${finalSelectedGame.teams.home.name} vs ${finalSelectedGame.teams.visitors.name}`
                  : 'Unknown Teams'}
              </p>
              <p className="text-gray-600">{formatGameDateDisplay(finalSelectedGame)}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  How did you watch this game?
                </label>
                <Select
                  value={formData.watchedSetting}
                  onValueChange={(value: WatchedSettingValue) =>
                    setFormData({ ...formData, watchedSetting: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select how you watched the game" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(WATCHED_SETTING).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  When did you watch this game?
                </label>
                <DatePicker
                  selected={formData.watchedDate}
                  onChange={(date: Date | null) =>
                    date && setFormData({ ...formData, watchedDate: date })
                  }
                  className="w-full p-2 border rounded-md"
                  dateFormat="MMMM d, yyyy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Where did you watch this game?
                </label>
                <Input
                  type="text"
                  value={formData.watchedLocation}
                  onChange={e => setFormData({ ...formData, watchedLocation: e.target.value })}
                  placeholder="Enter location (e.g., Home, Bar, Stadium)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  How much of the game did you watch?
                </label>
                <Select
                  value={formData.watchedScope}
                  onValueChange={(value: WatchedScopeValue) =>
                    setFormData({ ...formData, watchedScope: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select how much of the game you watched" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(WATCHED_SCOPE).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rate this game
                </label>
                <StarRating
                  ratingForGame={formData.ratingForGame}
                  onRatingChange={ratingForGame =>
                    setFormData({ ...formData, ratingForGame: ratingForGame })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes about the game..."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Classification
                </label>
                <Select
                  value={formData.classification}
                  onValueChange={(value: ClassificationValue) =>
                    setFormData({ ...formData, classification: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CLASSIFICATION).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={_onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={creating || !finalSelectedGame}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
