import { useMutation, useQuery } from '@apollo/client';
import { format } from 'date-fns';
import { Calendar, Search } from 'lucide-react';
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
import { GameLogFormData, GameLogFormProps } from '@/lib/types/gamelog.types';
import { Game, Team } from '@/lib/types/generated/graphql';
import { getDateFields, formatDate } from '@/lib/utils/index.time';

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
    watchedSetting: '',
    watchedDate: new Date(),
    watchedLocation: '',
    ratingForGame: '',
    ratingStars: 0,
    watchedCount: 1,
    notes: '',
    tags: [],
    classification: '',
  });

  const formData = externalFormData || internalFormData;
  const setFormData = externalSetFormData || setInternalFormData;
  const finalSelectedGame = externalSelectedGame || selectedGame;

  const [createGameLog, { loading: creating }] = useMutation(CREATE_GAME_LOG);

  // Search games using external API
  const { data: searchResults, loading: searching } = useQuery(GET_EXTERNAL_GAMES, {
    variables: {
      filters: {
        search: searchQuery,
        dateRange: searchQuery
          ? undefined
          : {
              start: format(new Date(), 'yyyy-MM-dd'),
            },
      },
      pagination: { first: 10 },
    },
    skip: !searchQuery,
  });

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
      await createGameLog({
        variables: {
          input: {
            gameId: finalSelectedGame.id,
            ...formData,
            watchedDate: format(formData.watchedDate, 'yyyy-MM-dd'),
          },
        },
      });

      toast({
        title: 'Success',
        description: 'Game log created successfully',
      });

      onSuccess?.();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create game log',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

        {searchResults?.games?.items && searchResults.games.items.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {searchResults.games.items.map((game: Game) => {
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
                        {game.teams.map((team: Team) => team.name).join(' vs ')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(game.date.start)} • {game.arena.name}
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
              {finalSelectedGame.teams.map((team: Team) => team.name).join(' vs ')}
            </p>
            <p className="text-gray-600">
              {formatDate(
                'start' in finalSelectedGame.date
                  ? finalSelectedGame.date.start
                  : finalSelectedGame.date
              )}{' '}
              • {finalSelectedGame.arena.name}
            </p>
            {finalSelectedGame.createdAt || finalSelectedGame.createdAt ? (
              <p className="text-xs text-gray-500 mt-1">
                Added: {formatDate(getDateFields(finalSelectedGame).createdAt)}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Watched Setting</label>
            <Select
              value={formData.watchedSetting}
              onValueChange={(value: string) => setFormData({ ...formData, watchedSetting: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select setting" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HOME">Home</SelectItem>
                <SelectItem value="AWAY">Away</SelectItem>
                <SelectItem value="NEUTRAL">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Watched Date</label>
            <div className="relative">
              <DatePicker
                selected={formData.watchedDate}
                onChange={(date: Date | null) =>
                  date && setFormData({ ...formData, watchedDate: date })
                }
                dateFormat="MMMM d, yyyy"
                className="w-full pl-10 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <Input
              value={formData.watchedLocation}
              onChange={e => setFormData({ ...formData, watchedLocation: e.target.value })}
              placeholder="Where did you watch the game?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Rating</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <StarRating rating={formData.ratingStars} size="lg" />
                <span className="text-lg font-medium">{formData.ratingStars}/5</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Button
                    key={star}
                    type="button"
                    variant={formData.ratingStars === star ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, ratingStars: star })}
                    className="w-8 h-8 p-0"
                  >
                    ★
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Watch Count</label>
            <Input
              type="number"
              min={1}
              value={formData.watchedCount}
              onChange={e => setFormData({ ...formData, watchedCount: parseInt(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add your thoughts about the game..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Classification</label>
            <Select
              value={formData.classification}
              onValueChange={(value: string) => setFormData({ ...formData, classification: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REGULAR">Regular Season</SelectItem>
                <SelectItem value="PLAYOFF">Playoff</SelectItem>
                <SelectItem value="FINALS">Finals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={creating}>
            {creating ? 'Creating...' : submitLabel}
          </Button>
        </>
      )}
    </form>
  );
}
