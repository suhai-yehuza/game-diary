'use client';

import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Star, Search } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { GameSearch } from '@/app/components/game-logs/GameSearch';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/Card';
import { CREATE_GAME_LOG } from '@/lib/graphql/mutations';
import type { CreateGameLogFormData, ICreateGameLogModalProps } from '@/lib/types';
import { CLASSIFICATION, WATCHED_SETTING, WATCHED_SCOPE, createGameLogSchema } from '@/lib/types';
import type { ICreateGameLogResponse } from '@/lib/types/gameLog.types';

// Reminder: Ensure <Toaster /> from 'sonner' is mounted in your root layout or _app.tsx for toasts to work.

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

export function CreateGameLogModal({ isOpen, onClose, onSuccess }: ICreateGameLogModalProps) {
  const [rating, setRating] = useState(3);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedGameId, setSelectedGameId] = useState('');
  const [selectedGameName, setSelectedGameName] = useState('');
  const [showGameSearch, setShowGameSearch] = useState(false);

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
    mode: 'onChange', // Enable real-time validation
  });

  const [createGameLog, { loading }] = useMutation<ICreateGameLogResponse>(CREATE_GAME_LOG, {
    onCompleted: data => {
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
      } else {
        const errorObj = data?.createGameLog?.errors?.[0] as { message?: string } | undefined;
        const errorMsg =
          errorObj && typeof errorObj.message === 'string'
            ? errorObj.message
            : 'Game log creation failed (no gameLog in response)';
        toast.error(errorMsg);
      }
    },
    onError: () => {
      toast.error('Failed to create game log.');
      if (typeof onClose === 'function') onClose(); // fallback close
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
    setShowGameSearch(false);
  };

  // Update form when rating changes
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setValue('rating_for_game', newRating, { shouldValidate: true });
  };

  // Change parameter type to unknown for strict type safety
  const handleFormSubmit = async (data: unknown) => {
    try {
      if (!isCreateGameLogFormData(data)) {
        throw new Error('Invalid form data');
      }
      // Now data is CreateGameLogFormData
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
      await createGameLog({
        variables: { input },
      });
    } catch {
      toast.error('Failed to create game log.');
      if (typeof onClose === 'function') onClose(); // fallback close
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Create New Game Log</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={e => void handleSubmit(handleFormSubmit)(e)} className="space-y-6">
              {/* Game Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Find/Search for Games *
                </label>
                {selectedGameName ? (
                  <div className="flex items-center gap-2 p-3 border border-gray-300 rounded-md bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{selectedGameName}</p>
                      <p className="text-sm text-gray-600">Game ID: {selectedGameId}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedGameId('');
                        setSelectedGameName('');
                        setValue('gameId', '');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      {...register('gameId')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter game ID manually or search for games"
                    />
                    <Button type="button" variant="outline" onClick={() => setShowGameSearch(true)}>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                )}
                {/* Hidden input to ensure form validation works */}
                <input type="hidden" {...register('gameId')} value={selectedGameId} />
                {errors.gameId && (
                  <p className="text-red-600 text-sm mt-1">{errors.gameId.message}</p>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
                </div>
                {/* Hidden input for form validation */}
                <input type="hidden" {...register('rating_for_game')} value={rating} />
                {errors.rating_for_game && (
                  <p className="text-red-600 text-sm mt-1">{errors.rating_for_game.message}</p>
                )}
              </div>

              {/* Classification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Privacy Level *
                </label>
                <select
                  {...register('classification')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={CLASSIFICATION.PRIVATE}>Private (Only you)</option>
                  <option value={CLASSIFICATION.PROTECTED}>Protected (Friends only)</option>
                  <option value={CLASSIFICATION.PUBLIC}>Public (Everyone)</option>
                </select>
                {errors.classification && (
                  <p className="text-red-600 text-sm mt-1">{errors.classification.message}</p>
                )}
              </div>

              {/* Watched Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Watched Date</label>
                <input
                  type="date"
                  {...register('watched_date')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Watched Setting */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How did you watch?
                </label>
                <select
                  {...register('watched_setting')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={WATCHED_SETTING.TV}>TV</option>
                  <option value={WATCHED_SETTING.LAPTOP}>Laptop/Computer</option>
                  <option value={WATCHED_SETTING.PHONE}>Phone</option>
                  <option value={WATCHED_SETTING.ARENA}>Arena</option>
                  <option value={WATCHED_SETTING.OTHER}>Other</option>
                </select>
              </div>

              {/* Watched Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  {...register('watched_location')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Home, Arena, Bar"
                />
              </div>

              {/* Watched Scope */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What did you watch?
                </label>
                <select
                  {...register('watched_scope')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  {...register('notes')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your thoughts about the game..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a tag"
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className={!isValid ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {isSubmitting || loading ? 'Creating...' : 'Create Game Log'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>

      {/* Game Search Modal */}
      {showGameSearch && (
        <GameSearch onGameSelect={handleGameSelect} onClose={() => setShowGameSearch(false)} />
      )}
    </>
  );
}
