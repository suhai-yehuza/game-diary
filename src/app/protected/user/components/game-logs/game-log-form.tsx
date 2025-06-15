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
import {
  WATCHED_SETTING,
  CLASSIFICATION,
  WATCHED_SCOPE,
  type IWatchedSettingValue,
  type IWatchedScopeValue,
} from '@src/lib/types/config.types';
import type { IGame } from '@src/lib/types/game.types';
import type { CreateGameLogInput, Classification } from '@src/lib/types/generated/graphql';
import type { IGameLogFormProps, IReactDatePickerProps } from '@src/lib/types/misc.types';

// Type-safe component wrapper
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
    gameId: '',
    classification: CLASSIFICATION.PROTECTED as Classification,
    watchedSetting: WATCHED_SETTING.TV as IWatchedSettingValue,
    watchedScope: WATCHED_SCOPE.FULL_GAME as IWatchedScopeValue,
    watchedDate: new Date(),
    watchedLocation: '',
    ratingForGame: 3,
    notes: '',
    tags: [],
  });

  const [selectedGame] = useState<IGame | null>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const hasInitialized = useRef(false);

  // Initialize form data from external data only when first provided and user is not interacting
  useEffect(() => {
    if (externalFormData && !hasInitialized.current && !isUserInteracting) {
      const newFormData: CreateGameLogInput = {
        gameId: externalFormData.gameId,
        watchedSetting: externalFormData.watchedSetting,
        watchedDate: externalFormData.watchedDate,
        watchedLocation: externalFormData.watchedLocation,
        ratingForGame: externalFormData.ratingForGame,
        watchedScope: externalFormData.watchedScope,
        notes: externalFormData.notes,
        tags: externalFormData.tags,
        classification: externalFormData.classification as Classification,
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

  const formatGameDateDisplay = (game: IGame | null) => {
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
      setFormData(prev => ({ ...prev, [field]: value as Classification }));
    } else if (field === 'watchedSetting') {
      setFormData(prev => ({ ...prev, [field]: value as IWatchedSettingValue }));
    } else if (field === 'watchedScope') {
      setFormData(prev => ({ ...prev, [field]: value as IWatchedScopeValue }));
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
              selected={formData.watchedDate || new Date()}
              onChange={date => {
                if (date) {
                  updateField('watchedDate', date);
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
