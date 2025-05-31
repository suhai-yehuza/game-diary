'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  gamesData?: { games: { edges: { node: Game }[] } };
  gamesLoading: boolean;
  defaultValues: Partial<CreateGameLogInput>;
  onSubmit: (data: CreateGameLogInput) => Promise<void>;
  hideGameSelect?: boolean;
}

export function GameLogForm({
  loading,
  gamesData,
  gamesLoading,
  defaultValues,
  onSubmit,
  hideGameSelect = false,
}: GameLogFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery]);

  const form = useForm<CreateGameLogInput>({
    resolver: zodResolver(gameLogInputSchema),
    defaultValues,
  });

  const games = useMemo(() => gamesData?.games?.edges?.map(edge => edge.node) ?? [], [gamesData]);

  const selectedGame = useMemo(() => {
    if (!games.length || !defaultValues.gameId) return null;
    return games.find((game: Game) => game.id === defaultValues.gameId);
  }, [games, defaultValues.gameId]);

  const filteredGames = useMemo(() => {
    if (!games.length) return [];
    if (!debouncedQuery) return games;
    const query = debouncedQuery.toLowerCase();
    return games.filter(
      (game: Game) =>
        game.teams.home.name.toLowerCase().includes(query) ||
        game.teams.visitors.name.toLowerCase().includes(query)
    );
  }, [games, debouncedQuery]);

  const handleSubmit = async (data: CreateGameLogInput) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {!hideGameSelect && (
          <FormField
            control={form.control}
            name="gameId"
            render={({ field }: { field: ControllerRenderProps<CreateGameLogInput, 'gameId'> }) => (
              <FormItem>
                <FormLabel>Game</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value?.toString()}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a game">
                        {selectedGame &&
                          `${selectedGame.teams.home.name} vs ${selectedGame.teams.visitors.name}`}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <div className="flex items-center px-3 pb-2" onClick={e => e.stopPropagation()}>
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <Input
                        placeholder="Search games..."
                        value={searchQuery}
                        onChange={e => {
                          e.stopPropagation();
                          setSearchQuery(e.target.value);
                        }}
                        onClick={e => e.stopPropagation()}
                        className="h-8"
                      />
                    </div>
                    {gamesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading games...
                      </SelectItem>
                    ) : filteredGames.length === 0 ? (
                      <SelectItem value="no-results" disabled>
                        No games found
                      </SelectItem>
                    ) : (
                      filteredGames.map((game: Game) => (
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
