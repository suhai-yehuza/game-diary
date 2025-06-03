'use client';

import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import ReactDatePickerOriginal from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useForm, type ControllerRenderProps } from 'react-hook-form';

// Type-safe component wrapper
const ReactDatePicker =
  ReactDatePickerOriginal as unknown as React.ComponentType<ReactDatePickerProps>;

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { CREATE_GAME_LOG } from '@/lib/graphql/mutations';
import { logger } from '@/lib/logger';
import { WATCHED_SETTING, CLASSIFICATION, WATCHED_SCOPE } from '@/lib/types/config.types';
import { GameLogFormProps, Game } from '@/lib/types/consolidated.types';
import { ReactDatePickerProps } from '@/lib/types/game-log.types';
import type { CreateGameLogInput } from '@/lib/types/generated/graphql';
import { createGameLogSchema } from '@/lib/validations/game-log';
export function GameLogForm({
  onSuccess,
  formData: externalFormData,
  selectedGame: externalSelectedGame,
  loading: externalLoading,
  onSubmit: externalOnSubmit,
  onCancel,
  submitLabel = 'Save',
}: GameLogFormProps) {
  const { toast } = useToast();
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

  // Use external form data if provided, otherwise use internal state
  const finalSelectedGame = externalSelectedGame || selectedGame;
  const isLoading = externalLoading || false;

  const [createGameLog, { loading: creating }] = useMutation(CREATE_GAME_LOG);

  const loading = isLoading || creating;

  const handleInternalSubmit = async (data: CreateGameLogInput) => {
    if (!finalSelectedGame) {
      toast({
        title: 'Error',
        description: 'Please select a game first',
        variant: 'destructive',
      });
      return;
    }

    try {
      const input: CreateGameLogInput = {
        gameId: finalSelectedGame.id,
        watchedSetting: data.watchedSetting,
        watchedDate: data.watchedDate,
        watchedLocation: data.watchedLocation,
        ratingForGame: data.ratingForGame,
        watchedScope: data.watchedScope,
        notes: data.notes,
        tags: data.tags,
        classification: data.classification,
      };

      const { data: result } = await createGameLog({
        variables: {
          input,
        },
      });

      if (result?.createGameLog?.gameLog) {
        toast({
          title: '🎉 Success!',
          description: 'Game log created successfully',
          variant: 'default',
        });

        onSuccess?.();
      } else {
        throw new Error('Failed to create game log');
      }
    } catch (error: unknown) {
      logger.error('Error creating game log:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create game log',
        variant: 'destructive',
      });
    }
  };

  const formatGameDateDisplay = (game: Game | null) => {
    if (!game) return '';
    const date = typeof game.date === 'string' ? new Date(game.date) : new Date(game.date.start);
    return date.toLocaleDateString();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (externalOnSubmit) {
      // If external onSubmit is provided, call it with the event
      externalOnSubmit(e);
    } else {
      // Otherwise, use react-hook-form's handleSubmit
      form.handleSubmit(handleInternalSubmit)(e);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="flex flex-col h-full">
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
            render={({
              field,
            }: {
              field: ControllerRenderProps<CreateGameLogInput, 'watchedSetting'>;
            }) => (
              <FormItem>
                <FormLabel>Watched Setting</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            )}
          />

          <FormField
            control={form.control}
            name="watchedDate"
            render={({
              field,
            }: {
              field: ControllerRenderProps<CreateGameLogInput, 'watchedDate'>;
            }) => (
              <FormItem>
                <FormLabel>Watched Date</FormLabel>
                <FormControl>
                  <ReactDatePicker
                    selected={field.value || null}
                    onChange={(date: Date | null) => date && field.onChange(date)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    dateFormat="MMMM d, yyyy"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="watchedLocation"
            render={({
              field,
            }: {
              field: ControllerRenderProps<CreateGameLogInput, 'watchedLocation'>;
            }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ''}
                    placeholder="Where did you watch the game?"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="watchedScope"
            render={({
              field,
            }: {
              field: ControllerRenderProps<CreateGameLogInput, 'watchedScope'>;
            }) => (
              <FormItem>
                <FormLabel>Watched Scope</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            )}
          />

          <FormField
            control={form.control}
            name="ratingForGame"
            render={({
              field,
            }: {
              field: ControllerRenderProps<CreateGameLogInput, 'ratingForGame'>;
            }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <Select
                  onValueChange={value => field.onChange(parseInt(value))}
                  defaultValue={field.value.toString()}
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
            )}
          />

          <FormField
            control={form.control}
            name="classification"
            render={({
              field,
            }: {
              field: ControllerRenderProps<CreateGameLogInput, 'classification'>;
            }) => (
              <FormItem>
                <FormLabel>Classification</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }: { field: ControllerRenderProps<CreateGameLogInput, 'notes'> }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ''}
                    placeholder="Add your thoughts about the game..."
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
      </form>
    </Form>
  );
}
