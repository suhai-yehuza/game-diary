'use client';

import React, { useState, useEffect } from 'react';
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
import { WATCHED_SETTING, CLASSIFICATION, WATCHED_SCOPE } from '@src/lib/types/config.types';
import type { GameLogFormProps, Game } from '@src/lib/types/consolidated.types';
import type { ReactDatePickerProps } from '@src/lib/types/game-log.types';
import type { CreateGameLogInput } from '@src/lib/types/generated/graphql';

export function GameLogForm({
  formData: externalFormData,
  selectedGame: externalSelectedGame,
  loading: externalLoading,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: GameLogFormProps) {
  // Form state
  const [formData, setFormData] = useState<CreateGameLogInput>({
    gameId: '',
    classification: CLASSIFICATION.PROTECTED as any,
    watchedSetting: WATCHED_SETTING.TV as any,
    watchedScope: WATCHED_SCOPE.FULL_GAME as any,
    watchedDate: new Date(),
    watchedLocation: '',
    ratingForGame: 3,
    notes: '',
    tags: [],
  });

  const [selectedGame] = useState<Game | null>(null);

  // Sync external formData with local state
  useEffect(() => {
    if (externalFormData) {
      setFormData(prev => ({ ...prev, ...externalFormData }));
    }
  }, [externalFormData]);

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
    
    // Ensure ratingForGame is never null/undefined before submitting
    const safeFormData = {
      ...formData,
      ratingForGame: formData.ratingForGame ?? 3,
    };
    
    console.log('Submitting form data:', safeFormData);
    if (onSubmit) {
      await onSubmit(safeFormData);
    }
  };

  const updateField = (field: keyof CreateGameLogInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              onValueChange={value => updateField('watchedSetting', value)}
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
              onChange={e => updateField('watchedLocation', e.target.value)}
              placeholder="Where did you watch the game? (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label>Watched Scope</Label>
            <Select
              onValueChange={value => updateField('watchedScope', value)}
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
              onValueChange={value => updateField('classification', value)}
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
              onChange={e => updateField('notes', e.target.value)}
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
