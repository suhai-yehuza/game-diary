'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState, useEffect } from 'react';
import ReactDatePickerOriginal from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// @ts-expect-error - react-hook-form types issue
import { useForm } from 'react-hook-form';

// Generic type definitions for react-hook-form compatibility
type BaseControllerRenderProps = {
  name: string;
  onBlur?: () => void;
  ref?: React.Ref<HTMLElement>;
};

type StringFieldProps = BaseControllerRenderProps & {
  value: string;
  onChange: (value: string) => void;
};

type DateFieldProps = BaseControllerRenderProps & {
  value: Date | null;
  onChange: (value: Date | null) => void;
};

type NumberFieldProps = BaseControllerRenderProps & {
  value: number;
  onChange: (value: number) => void;
};

type OptionalStringFieldProps = BaseControllerRenderProps & {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
};

// Type-safe component wrapper
const ReactDatePicker =
  ReactDatePickerOriginal as unknown as React.ComponentType<ReactDatePickerProps>;

import { Button } from '@src/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@src/components/ui/form';
import { Input } from '@src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/components/ui/select';
import { Textarea } from '@src/components/ui/textarea';
import { WATCHED_SETTING, CLASSIFICATION, WATCHED_SCOPE } from '@src/lib/types/config.types';
import type { GameLogFormProps, Game } from '@src/lib/types/consolidated.types';
import type { ReactDatePickerProps } from '@src/lib/types/game-log.types';
import type { CreateGameLogInput } from '@src/lib/types/generated/graphql';
import { createGameLogSchema } from '@src/lib/validations/game-log';

export function GameLogForm({
  formData: externalFormData,
  selectedGame: externalSelectedGame,
  loading: externalLoading,
  onCancel,
  submitLabel = 'Save',
}: GameLogFormProps) {
  const form = useForm<CreateGameLogInput>({
    resolver: zodResolver(createGameLogSchema),
    defaultValues: externalFormData || {
      gameId: '',
      classification: CLASSIFICATION.PROTECTED,
      watchedSetting: WATCHED_SETTING.TV,
      watchedScope: WATCHED_SCOPE.FULL_GAME,
      watchedDate: new Date(),
      watchedLocation: '',
      ratingForGame: 3,
      notes: '',
      tags: [],
    },
  });

  const [selectedGame] = useState<Game | null>(null);

  // Sync external formData with react-hook-form
  useEffect(() => {
    if (externalFormData) {
      form.reset(externalFormData);
    }
  }, [externalFormData, form]);

  // Update gameId when external selected game changes
  useEffect(() => {
    if (externalSelectedGame?.id) {
      form.setValue('gameId', externalSelectedGame.id);
    }
  }, [externalSelectedGame, form]);

  // Use external form data if provided, otherwise use internal state
  const finalSelectedGame = externalSelectedGame || selectedGame;
  const isLoading = externalLoading || false;

  const loading = isLoading;

  const formatGameDateDisplay = (game: Game | null) => {
    if (!game) return '';
    const date = typeof game.date === 'string' ? new Date(game.date) : new Date(game.date.start);
    return date.toLocaleDateString();
  };

  return (
    <Form {...form}>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {finalSelectedGame && (
            <div className="space-y-2">
              <FormLabel>Game</FormLabel>
              <div className="text-sm text-muted-foreground">
                {finalSelectedGame.teams.home.name} vs {finalSelectedGame.teams.visitors.name} -{' '}
                {formatGameDateDisplay(finalSelectedGame)}
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="watchedSetting"
            render={({ field }) => {
              const typedField = field as StringFieldProps;
              return (
                <FormItem>
                  <FormLabel>Watched Setting</FormLabel>
                  <Select onValueChange={typedField.onChange} defaultValue={typedField.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select setting" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(WATCHED_SETTING).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="watchedDate"
            render={({ field }) => {
              const typedField = field as DateFieldProps;
              return (
                <FormItem>
                  <FormLabel>Watched Date</FormLabel>
                  <FormControl>
                    <ReactDatePicker
                      selected={typedField.value}
                      onChange={(date: Date | null) => typedField.onChange(date)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      dateFormat="MMMM d, yyyy"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="watchedLocation"
            render={({ field }) => {
              const typedField = field as OptionalStringFieldProps;
              return (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      name={typedField.name}
                      value={typedField.value || ''}
                      onChange={e => typedField.onChange(e.target.value)}
                      onBlur={typedField.onBlur}
                      placeholder="Where did you watch the game? (optional)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="watchedScope"
            render={({ field }) => {
              const typedField = field as StringFieldProps;
              return (
                <FormItem>
                  <FormLabel>Watched Scope</FormLabel>
                  <Select onValueChange={typedField.onChange} defaultValue={typedField.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scope" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(WATCHED_SCOPE).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="ratingForGame"
            render={({ field }) => {
              const typedField = field as NumberFieldProps;
              return (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <Select
                    onValueChange={value => typedField.onChange(parseInt(value))}
                    defaultValue={typedField.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(rating => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="classification"
            render={({ field }) => {
              const typedField = field as StringFieldProps;
              return (
                <FormItem>
                  <FormLabel>Classification</FormLabel>
                  <Select onValueChange={typedField.onChange} defaultValue={typedField.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select classification" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CLASSIFICATION).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => {
              const typedField = field as OptionalStringFieldProps;
              return (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      name={typedField.name}
                      value={typedField.value || ''}
                      onChange={e => typedField.onChange(e.target.value)}
                      onBlur={typedField.onBlur}
                      placeholder="Add your thoughts about the game..."
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </div>
    </Form>
  );
}
