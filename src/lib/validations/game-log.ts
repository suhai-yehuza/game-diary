import { z } from 'zod';

import { CLASSIFICATION, WATCHED_SCOPE, WATCHED_SETTING } from '@/lib/types/config.types';

export const createGameLogSchema = z.object({
  gameId: z.string().min(1, 'Game ID is required'),
  watchedSetting: z.enum(
    [
      WATCHED_SETTING.TV,
      WATCHED_SETTING.ARENA,
      WATCHED_SETTING.PHONE,
      WATCHED_SETTING.LAPTOP,
      WATCHED_SETTING.BAR,
      WATCHED_SETTING.HOME,
      WATCHED_SETTING.OTHER,
    ],
    {
      required_error: 'Watched setting is required',
    }
  ),
  watchedDate: z.date({
    required_error: 'Watched date is required',
  }),
  watchedLocation: z.string().min(1, 'Watched location is required'),
  ratingForGame: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  watchedScope: z.enum(
    [
      WATCHED_SCOPE.FULL_GAME,
      WATCHED_SCOPE.HALF_GAME,
      WATCHED_SCOPE.HIGHLIGHTS,
      WATCHED_SCOPE.PRE_GAME,
      WATCHED_SCOPE.POST_GAME,
      WATCHED_SCOPE.SHORTS,
      WATCHED_SCOPE.OTHER,
    ],
    {
      required_error: 'Watched scope is required',
    }
  ),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  classification: z.enum(
    [CLASSIFICATION.PUBLIC, CLASSIFICATION.PROTECTED, CLASSIFICATION.PRIVATE],
    {
      required_error: 'Classification is required',
    }
  ),
});

export const updateGameLogSchema = createGameLogSchema.omit({ gameId: true });

export type CreateGameLogInput = z.infer<typeof createGameLogSchema>;
export type UpdateGameLogInput = z.infer<typeof updateGameLogSchema>;
