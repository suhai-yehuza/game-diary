'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm, ControllerRenderProps } from 'react-hook-form';

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
import { CLASSIFICATIONS, WATCHED_SETTINGS } from '@/lib/types/config.types';
import { Game } from '@/lib/types/game.types';
import { CreateGameLogInput } from '@/lib/types/generated/graphql';
import { gameLogInputSchema } from '@/lib/validations/game';

interface GameLogFormProps {
  loading: boolean;
  gamesData?: { games: Game[] };
  gamesLoading: boolean;
  defaultValues: Partial<CreateGameLogInput>;
  onSubmit: (data: CreateGameLogInput) => Promise<void>;
}

export function GameLogForm({
  loading,
  gamesData,
  gamesLoading,
  defaultValues,
  onSubmit,
}: GameLogFormProps) {
  const form = useForm<CreateGameLogInput>({
    resolver: zodResolver(gameLogInputSchema),
    defaultValues,
  });

  const handleSubmit = async (data: CreateGameLogInput) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="gameId"
          render={({ field }: { field: ControllerRenderProps<CreateGameLogInput, 'gameId'> }) => (
            <FormItem>
              <FormLabel>Game</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {gamesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading games...
                    </SelectItem>
                  ) : (
                    gamesData?.games.map((game: Game) => (
                      <SelectItem key={game.id} value={game.id}>
                        {game.teams.home.name} vs {game.teams.visitors.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
                    <SelectValue placeholder="Select where you watched" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(WATCHED_SETTINGS).map(([key, setting]) => (
                    <SelectItem key={key} value={setting}>
                      {setting.charAt(0).toUpperCase() + setting.slice(1)}
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
                <Input
                  type="datetime-local"
                  {...field}
                  value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                  onChange={e => field.onChange(e.target.value)}
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
              <FormLabel>Location (Optional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? undefined} />
              </FormControl>
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
              <FormLabel>Rating (1-5)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  {...field}
                  value={field.value ?? undefined}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="watchedCount"
          render={({
            field,
          }: {
            field: ControllerRenderProps<CreateGameLogInput, 'watchedCount'>;
          }) => (
            <FormItem>
              <FormLabel>Times Watched</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  value={field.value ?? undefined}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
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
                  {Object.entries(CLASSIFICATIONS).map(([key, classification]) => (
                    <SelectItem key={key} value={classification}>
                      {classification.charAt(0).toUpperCase() + classification.slice(1)}
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
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating...' : 'Create Game Log'}
        </Button>
      </form>
    </Form>
  );
}
