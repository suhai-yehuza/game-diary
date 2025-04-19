import { z } from 'zod';

import type { GameWithStats } from './game.types';
import type { Game, GameLog, GameLogFilters, GameLogStats } from './generated/graphql';

export type { GameLog, GameLogFilters, GameLogStats };

export interface GameLogFormData {
  watched_setting: string;
  watched_date: Date;
  watched_location: string;
  rating_for_game: string;
  rating_stars: number;
  watched_count: number;
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
    game_id: string;
    user_id: string;
    watched_setting: string;
    watched_date: string;
    watched_location: string;
    rating_for_game: string;
    rating_stars: number;
    watched_count: number;
    notes: string;
    tags: string[];
    classification: string;
    created_at: string;
    updated_at: string;
  };
}

export const createGameLogSchema = z.object({
  game_id: z.string(),
  watched_setting: z.string(),
  watched_count: z.number().min(1),
  classification: z.string(),
  watched_date: z.string().optional(),
  watched_location: z.string().optional(),
  rating_for_game: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
});

export interface GameLogInput {
  game_id: string;
  watched_date: string;
  watched_location?: string;
  watched_setting?: string;
  rating_for_game?: number;
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
  created_at: string;
  updated_at: string;
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
