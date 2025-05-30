import { z } from 'zod';

import type { GameWithStats } from './game.types';
import type { Game, GameLog, GameLogFilters, GameLogStats } from './generated/graphql';

export type { GameLog, GameLogFilters, GameLogStats };

export interface GameLogFormData {
  watchedSetting: string;
  watchedDate: Date;
  watchedLocation: string;
  ratingForGame: string;
  ratingStars: number;
  watchedCount: number;
  notes: string;
  tags: string[];
  classification: string;
}

export interface GameLogFormProps {
  onSuccess?: () => void;
  formData?: GameLogFormData;
  setFormData?: (data: GameLogFormData) => void;
  selectedGame?: Game | null;
  loading?: boolean;
  onSubmit?: (e: React.FormEvent) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export interface GameLogViewProps {
  gameLog: {
    id: string;
    gameId: string;
    userId: string;
    watchedSetting: string;
    watchedDate: string;
    watchedLocation: string;
    ratingForGame: string;
    ratingStars: number;
    watchedCount: number;
    notes: string;
    tags: string[];
    classification: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const createGameLogSchema = z.object({
  gameId: z.string(),
  watchedSetting: z.string(),
  watchedCount: z.number().min(1),
  classification: z.string(),
  watchedDate: z.string().optional(),
  watchedLocation: z.string().optional(),
  ratingForGame: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
});

export interface GameLogInput {
  gameId: string;
  watchedDate: string;
  watchedLocation?: string;
  watchedSetting?: string;
  ratingForGame?: number;
  comment?: string;
}

// export interface SharedGameLog extends GameLog {
//   game: GameWithStats;
// }

export interface CustomGameLog extends GameLog {
  game: GameWithStats;
}

export interface CommentResponse {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    photo_url?: string;
  };
  reactions: {
    emoji: string;
    count: number;
    userReactions: {
      userId: string;
      emoji: string;
    }[];
  }[];
}
