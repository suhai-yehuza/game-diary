import { z } from 'zod';

import { CLASSIFICATIONS, WATCHED_SETTINGS } from '@/lib/types/config.types';

export type GameLogClassification = (typeof CLASSIFICATIONS)[keyof typeof CLASSIFICATIONS];
export type GameLogWatchedSetting = (typeof WATCHED_SETTINGS)[keyof typeof WATCHED_SETTINGS];

export type CreateGameLogInput = {
  gameId: string;
  userId: string;
  classification?: GameLogClassification;
  notes?: string;
  rating?: number;
  watchedSetting?: GameLogWatchedSetting;
};

export const createGameLogSchema = z.object({
  gameId: z.string(),
  userId: z.string(),
  classification: z
    .enum([CLASSIFICATIONS.PRIVATE, CLASSIFICATIONS.PROTECTED, CLASSIFICATIONS.PUBLIC])
    .optional()
    .default(CLASSIFICATIONS.PROTECTED),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  watchedSetting: z
    .enum([
      WATCHED_SETTINGS.TV,
      WATCHED_SETTINGS.ARENA,
      WATCHED_SETTINGS.PHONE,
      WATCHED_SETTINGS.LAPTOP,
      WATCHED_SETTINGS.BAR,
      WATCHED_SETTINGS.HOME,
      WATCHED_SETTINGS.OTHER,
    ])
    .optional()
    .default(WATCHED_SETTINGS.TV),
});
