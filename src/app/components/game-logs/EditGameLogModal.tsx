'use client';

import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/Card';
import { UPDATE_GAME_LOG } from '@/lib/graphql/mutations';
import type { IGameLog, UpdateGameLogFormData, IEditGameLogModalProps } from '@/lib/types';
import { CLASSIFICATION, WATCHED_SETTING, WATCHED_SCOPE, updateGameLogSchema } from '@/lib/types';

export function EditGameLogModal({ gameLog, isOpen, onClose, onSuccess }: IEditGameLogModalProps) {
  const [rating, setRating] = useState(gameLog.rating_for_game);
  const [tags, setTags] = useState<string[]>(gameLog.tags ?? []);
  const [newTag, setNewTag] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateGameLogFormData>({
    resolver: zodResolver(updateGameLogSchema),
    defaultValues: {
      rating_for_game: gameLog.rating_for_game,
      notes: gameLog.notes ?? '',
      classification: gameLog.classification as keyof typeof CLASSIFICATION,
      watched_setting: gameLog.watched_setting ?? WATCHED_SETTING.TV,
      watched_scope: gameLog.watched_scope ?? WATCHED_SCOPE.FULL_GAME,
      watched_date: gameLog.watched_date
        ? new Date(gameLog.watched_date).toISOString().split('T')[0]
        : '',
      watched_location: gameLog.watched_location ?? '',
    },
  });

  // Update form when gameLog changes
  useEffect(() => {
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
  }, [gameLog, reset]);

  const [updateGameLog, { loading }] = useMutation(UPDATE_GAME_LOG, {
    onCompleted: (data: { updateGameLog: { gameLog: IGameLog; errors: unknown[] } }) => {
      if (data?.updateGameLog?.gameLog) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      console.error('Error updating game log:', error);
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

  const handleFormSubmit = async (data: UpdateGameLogFormData) => {
    try {
      await updateGameLog({
        variables: {
          id: gameLog.id,
          input: {
            ...data,
            rating_for_game: rating,
            tags,
            watched_date: data.watched_date ? new Date(data.watched_date) : undefined,
          },
        },
      });
    } catch (error) {
      console.error('Error updating game log:', error);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Edit Game Log</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={e => void handleSubmit(handleFormSubmit)(e)} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
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
              <Button type="submit" disabled={isSubmitting || loading}>
                {isSubmitting || loading ? 'Updating...' : 'Update Game Log'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
