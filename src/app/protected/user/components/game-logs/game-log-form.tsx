'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactDatePickerOriginal from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Type-safe component wrapper
const ReactDatePicker =
  ReactDatePickerOriginal as unknown as React.ComponentType<ReactDatePickerProps>;

import { Button } from '@src/components/ui/button';
import { Input } from '@src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/components/ui/select';
import { Textarea } from '@src/components/ui/textarea';
import { Label } from '@src/components/ui/label';
import {
  WATCHED_SETTING,
  CLASSIFICATION,
  WATCHED_SCOPE,
  type WatchedSettingValue,
  type WatchedScopeValue,
} from '@src/lib/types/config.types';
import type { GameLogFormProps, Game } from '@src/lib/types/consolidated.types';
import type { ReactDatePickerProps } from '@src/lib/types/game-log.types';
import type { CreateGameLogInput, Classification } from '@src/lib/types/generated/graphql';
import { logger } from 'lib/core/logger';

export function GameLogForm({
  formData: externalFormData,
  selectedGame: externalSelectedGame,
  loading: externalLoading,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: GameLogFormProps) {
  // Form state with safe defaults - ensure all Select values are always defined
  const [formData, setFormData] = useState<CreateGameLogInput>({
    gameId: '',
    classification: CLASSIFICATION.PROTECTED as Classification,
    watchedSetting: WATCHED_SETTING.TV as WatchedSettingValue,
    watchedScope: WATCHED_SCOPE.FULL_GAME as WatchedScopeValue,
    watchedDate: new Date(),
    watchedLocation: '',
    ratingForGame: 3,
    notes: '',
    tags: [],
  });

  const [selectedGame] = useState<Game | null>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const hasInitialized = useRef(false);

  // Initialize form data from external data only when first provided and user is not interacting
  useEffect(() => {
    if (externalFormData && !hasInitialized.current && !isUserInteracting) {
      const newFormData: CreateGameLogInput = {
        gameId: externalFormData.gameId,
        watchedSetting: externalFormData.watchedSetting as WatchedSettingValue,
        watchedDate: externalFormData.watchedDate,
        watchedLocation: externalFormData.watchedLocation || '',
        ratingForGame: externalFormData.ratingForGame,
        watchedScope: externalFormData.watchedScope as WatchedScopeValue,
        notes: externalFormData.notes || '',
        tags: externalFormData.tags || [],
        classification: externalFormData.classification as Classification,
      };

      setFormData(newFormData);
      hasInitialized.current = true;
    }
  }, [externalFormData, isUserInteracting]); // Include isUserInteracting to prevent conflicts

  // Update gameId when external selected game changes
  useEffect(() => {
    if (externalSelectedGame?.id) {
      setFormData(prev => ({ ...prev, gameId: externalSelectedGame.id }));
    }
  }, [externalSelectedGame]);

  // Use external form data if provided, otherwise use internal state
  const finalSelectedGame = externalSelectedGame || selectedGame;
  const isLoading = externalLoading || false;

  const formatGameDateDisplay = (game: Game | null) => {
    if (!game) return '';
    const date = typeof game.date === 'string' ? new Date(game.date) : new Date(game.date.start);
    return date.toLocaleDateString();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure required fields are never null/undefined before submitting
    const safeFormData = {
      ...formData,
      ratingForGame: formData.ratingForGame ?? 3,
      // Classification should always be valid at this point
    };

    logger.debug('Submitting form data:', safeFormData);
    if (onSubmit) {
      await onSubmit(safeFormData);
    }
  };

  const updateField = <T extends keyof CreateGameLogInput>(
    field: T,
    value: CreateGameLogInput[T]
  ) => {
    if (field === 'classification') {
      setFormData(prev => ({ ...prev, [field]: value as Classification }));
    } else if (field === 'watchedSetting') {
      setFormData(prev => ({ ...prev, [field]: value as WatchedSettingValue }));
    } else if (field === 'watchedScope') {
      setFormData(prev => ({ ...prev, [field]: value as WatchedScopeValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleClassificationChange = (value: string) => {
    updateField('classification', value as Classification);
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
                  updateField('watchedSetting', value);
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
              selected={formData.watchedDate ? new Date(formData.watchedDate) : null}
              onChange={(date: Date | null) => updateField('watchedDate', date)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              dateFormat="MMMM d, yyyy"
              placeholderText="Select date"
            />
          </div>

          <div className="space-y-2">
            <Label>Location (Optional)</Label>
            <Input
              value={formData.watchedLocation || ''}
              onChange={e => {
                setIsUserInteracting(true);
                updateField('watchedLocation', e.target.value);
              }}
              onKeyDown={e => {
                // Ensure spacebar works by explicitly handling it
                if (e.key === ' ' || e.key === 'Space') {
                  e.stopPropagation();
                  // Force the input to include the space
                  const input = e.target as HTMLInputElement;
                  const start = input.selectionStart || 0;
                  const end = input.selectionEnd || 0;
                  const currentValue = input.value;
                  const newValue = currentValue.slice(0, start) + ' ' + currentValue.slice(end);

                  // Prevent default and manually handle the space
                  e.preventDefault();
                  setIsUserInteracting(true);
                  updateField('watchedLocation', newValue);

                  // Restore cursor position after state update
                  setTimeout(() => {
                    input.setSelectionRange(start + 1, start + 1);
                  }, 0);
                }
              }}
              onFocus={() => setIsUserInteracting(true)}
              onBlur={() => setTimeout(() => setIsUserInteracting(false), 100)}
              placeholder="Where did you watch the game? (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label>Watched Scope</Label>
            <Select
              onValueChange={value => {
                // Ignore empty/invalid values to prevent resetting during initialization
                if (!value || value.trim() === '') {
                  return;
                }
                updateField('watchedScope', value);
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
            <Label>Rating</Label>
            <Select
              onValueChange={value => {
                // Ignore empty/invalid values to prevent resetting during initialization
                if (!value || value.trim() === '') {
                  return;
                }
                const rating = parseInt(value);
                // Ensure we never set null/undefined/NaN - default to 3
                updateField('ratingForGame', isNaN(rating) ? 3 : rating);
              }}
              value={(formData.ratingForGame ?? 3).toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(rating => (
                  <SelectItem key={rating} value={rating.toString()}>
                    {rating}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Classification</Label>
            <Select
              onValueChange={handleClassificationChange}
              value={formData.classification as string}
            >
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
              onChange={e => {
                setIsUserInteracting(true);
                updateField('notes', e.target.value);
              }}
              onKeyDown={e => {
                // Ensure spacebar works by explicitly handling it
                if (e.key === ' ' || e.key === 'Space') {
                  e.stopPropagation();
                  // Force the textarea to include the space
                  const textarea = e.target as HTMLTextAreaElement;
                  const start = textarea.selectionStart || 0;
                  const end = textarea.selectionEnd || 0;
                  const currentValue = textarea.value;
                  const newValue = currentValue.slice(0, start) + ' ' + currentValue.slice(end);

                  // Prevent default and manually handle the space
                  e.preventDefault();
                  setIsUserInteracting(true);
                  updateField('notes', newValue);

                  // Restore cursor position after state update
                  setTimeout(() => {
                    textarea.setSelectionRange(start + 1, start + 1);
                  }, 0);
                }
              }}
              onFocus={() => setIsUserInteracting(true)}
              onBlur={() => setTimeout(() => setIsUserInteracting(false), 100)}
              placeholder="Add your thoughts about the game..."
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
