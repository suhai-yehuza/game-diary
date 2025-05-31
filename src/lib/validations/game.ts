import { z } from 'zod';

import { WATCHED_SETTING, WATCHED_SCOPE } from '@/lib/types/config.types';

export const gameTypeEnum = z.enum(['nba', 'nfl', 'mlb', 'nhl']);

export const gameLogInputSchema = z.object({
  gameId: z.string().min(1, 'Game ID is required'),
  watchedSetting: z.enum(Object.values(WATCHED_SETTING) as [string, ...string[]]),
  watchedDate: z.date().optional(),
  watchedLocation: z.string().optional(),
  ratingForGame: z.number().min(1).max(5).optional(),
  ratingStars: z.number().optional(),
  watchedScope: z.enum(Object.values(WATCHED_SCOPE) as [string, ...string[]]),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  classification: z.enum(['public', 'protected', 'private']).optional(),
});
