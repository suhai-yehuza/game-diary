import { z } from 'zod';

import { WATCHED_SETTINGS } from '@/lib/types/config.types';

export const gameTypeEnum = z.enum(['nba', 'nfl', 'mlb', 'nhl']);

export const gameLogInputSchema = z.object({
  game_id: z.string().min(1, 'Game ID is required'),
  watched_setting: z.enum(Object.values(WATCHED_SETTINGS) as [string, ...string[]]),
  watched_date: z.date().optional(),
  watched_location: z.string().optional(),
  rating_for_game: z.number().min(1).max(5).optional(),
  rating_stars: z.number().optional(),
  watched_count: z.number().min(0).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  classification: z.enum(['public', 'protected', 'private']).optional(),
});
