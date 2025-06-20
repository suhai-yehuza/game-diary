'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactDatePickerOriginal from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

import { Button } from '@src/app/components/ui/button';
import { Input } from '@src/app/components/ui/input';
import { Label } from '@src/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/app/components/ui/select';
import { Textarea } from '@src/app/components/ui/textarea';
import { WATCHED_SETTING, CLASSIFICATION, WATCHED_SCOPE } from '@src/lib/types';
import type { IWatchedSettingValue, IWatchedScopeValue } from '@src/lib/types';
import type { IReactDatePickerProps, IGameLogFormProps } from '@src/lib/types/game-log-form.types';
import type { IGameData } from '@src/lib/types/game-log.types';
import type { Classification, CreateGameLogInput } from '@src/lib/types/generated/graphql';

// Type-safe component wrapper with proper type casting
const ReactDatePicker =
  ReactDatePickerOriginal as unknown as React.ComponentType<IReactDatePickerProps>;

export function GameLogForm({
  formData: externalFormData,
  selectedGame: externalSelectedGame,
  loading: externalLoading,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: IGameLogFormProps) {
  // Form state with safe defaults - ensure all Select values are always defined
  const [formData, setFormData] = useState<CreateGameLogInput>({
    gameId: externalFormData?.gameId || '',
    classification: (externalFormData?.classification as Classification) || 'Protected',
    watchedSetting: externalFormData?.watchedSetting || 'TV',
    watchedScope: externalFormData?.watchedScope || 'FULL_GAME',
    watchedDate: externalFormData?.watchedDate || new Date().toISOString(),
    watchedLocation: externalFormData?.watchedLocation || undefined,
    ratingForGame: externalFormData?.ratingForGame || 3,
    notes: externalFormData?.notes || undefined,
    tags: externalFormData?.tags || undefined,
  });

  const [selectedGame] = useState<IGameData | null>(externalSelectedGame || null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const hasInitialized = useRef(false);

  // Initialize form data from external data only when first provided and user is not interacting
  useEffect(() => {
    if (externalFormData && !hasInitialized.current && !isUserInteracting) {
      const newFormData: CreateGameLogInput = {
        gameId: externalFormData.gameId,
        watchedSetting: externalFormData.watchedSetting || 'TV',
        watchedDate: externalFormData.watchedDate || new Date().toISOString(),
        watchedLocation: externalFormData.watchedLocation || undefined,
        ratingForGame: externalFormData.ratingForGame || 3,
        watchedScope: externalFormData.watchedScope || 'FULL_GAME',
        notes: externalFormData.notes || undefined,
        tags: externalFormData.tags || undefined,
        classification: (externalFormData.classification as Classification) || 'Protected',
      };

      setFormData(newFormData);
      hasInitialized.current = true;
    }
  }, [externalFormData, isUserInteracting]);

  // Update gameId when external selected game changes
  useEffect(() => {
    if (externalSelectedGame?.id) {
      setFormData(prev => ({ ...prev, gameId: externalSelectedGame.id }));
    }
  }, [externalSelectedGame]);

  // Use external form data if provided, otherwise use internal state
  const finalSelectedGame = externalSelectedGame || selectedGame;
  const isLoading = externalLoading || false;

  const formatGameDateDisplay = (game: IGameData | null) => {
    if (!game) return '';
    const date = typeof game.date === 'string' ? new Date(game.date) : new Date(game.date.start);
    return date.toLocaleDateString();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure required fields are never null/undefined before submitting
    const safeFormData: CreateGameLogInput = {
      ...formData,
      gameId: formData.gameId || '',
      ratingForGame: formData.ratingForGame || 3,
      classification: (formData.classification as Classification) || 'Protected',
      watchedSetting: formData.watchedSetting || 'TV',
      watchedScope: formData.watchedScope || 'FULL_GAME',
      watchedDate: formData.watchedDate || new Date().toISOString(),
      watchedLocation: formData.watchedLocation || undefined,
      notes: formData.notes || undefined,
      tags: formData.tags || undefined,
    };

    if (onSubmit) {
      await onSubmit(safeFormData);
    }
  };

  const updateField = <T extends keyof CreateGameLogInput>(
    field: T,
    value: CreateGameLogInput[T]
  ) => {
    if (field === 'classification') {
      const safeValue = (value as string) || 'Protected';
      setFormData(prev => ({ ...prev, [field]: safeValue as Classification }));
    } else if (field === 'watchedSetting') {
      const safeValue = (value as string) || 'TV';
      setFormData(prev => ({ ...prev, [field]: safeValue as IWatchedSettingValue }));
    } else if (field === 'watchedScope') {
      const safeValue = (value as string) || 'FULL_GAME';
      setFormData(prev => ({ ...prev, [field]: safeValue as IWatchedScopeValue }));
    } else if (field === 'ratingForGame') {
      const safeValue = typeof value === 'number' ? value : 3;
      setFormData(prev => ({ ...prev, [field]: safeValue }));
    } else if (field === 'watchedDate') {
      const safeValue = value instanceof Date ? value.toISOString() : (value as string);
      setFormData(prev => ({ ...prev, [field]: safeValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleClassificationChange = (value: string) => {
    const safeValue = value || 'Protected';
    updateField('classification', safeValue as Classification);
  };

  // Convert string date to Date object for the date picker
  const getDateForPicker = (dateString?: string | null): Date | null => {
    if (!dateString) return null;
    try {
      return new Date(dateString);
    } catch {
      return null;
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {finalSelectedGame && (
            <div className="space-y-2">
              <Label>Game</Label>
              <div className="text-sm text-muted-foreground">
                {finalSelectedGame.teams.home.name} vs {finalSelectedGame.teams.visitors.name} -{' '}
                {formatGameDateDisplay(finalSelectedGame)}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Watched Setting</Label>
            <Select
              onValueChange={value => {
                // Only update if we receive a valid non-empty value
                if (value && typeof value === 'string' && value.trim() !== '') {
                  updateField('watchedSetting', value as IWatchedSettingValue);
                }
              }}
              value={formData.watchedSetting as string}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select setting" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(WATCHED_SETTING).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Watched Date</Label>
            <ReactDatePicker
              selected={getDateForPicker(formData.watchedDate)}
              onChange={(date: Date | null) => {
                if (date) {
                  updateField('watchedDate', date.toISOString());
                }
              }}
              onFocus={() => setIsUserInteracting(true)}
              onBlur={() => setTimeout(() => setIsUserInteracting(false), 100)}
              placeholderText="Select date"
              dateFormat="MMMM d, yyyy"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Watched Location</Label>
            <Input
              type="text"
              value={formData.watchedLocation || ''}
              onChange={e => updateField('watchedLocation', e.target.value || undefined)}
              placeholder="e.g., Home, Arena, Bar, etc."
            />
          </div>

          <div className="space-y-2">
            <Label>Rating</Label>
            <Select
              onValueChange={value => {
                const rating = parseInt(value, 10);
                if (!isNaN(rating)) {
                  updateField('ratingForGame', rating);
                }
              }}
              value={formData.ratingForGame.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(rating => (
                  <SelectItem key={rating} value={rating.toString()}>
                    {rating} {rating === 1 ? 'Star' : 'Stars'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Watched Scope</Label>
            <Select
              onValueChange={value => {
                // Only update if we receive a valid non-empty value
                if (value && typeof value === 'string' && value.trim() !== '') {
                  updateField('watchedScope', value as IWatchedScopeValue);
                }
              }}
              value={formData.watchedScope as string}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(WATCHED_SCOPE).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Classification</Label>
            <Select onValueChange={handleClassificationChange} value={formData.classification}>
              <SelectTrigger>
                <SelectValue placeholder="Select classification" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CLASSIFICATION).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes || ''}
              onChange={e => updateField('notes', e.target.value || undefined)}
              placeholder="Share your thoughts about the game..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <Input
              type="text"
              value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
              onChange={e => {
                const tags = e.target.value
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag.length > 0);
                updateField('tags', tags.length > 0 ? tags : undefined);
              }}
              placeholder="Enter tags separated by commas (e.g., overtime, buzzer-beater, rivalry)"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
