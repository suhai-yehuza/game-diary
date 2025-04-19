import type DataLoader from 'dataloader';
import { z } from 'zod';

import { createCommentSchema } from '@/lib/validations/comment';

import type { RedisClient } from './redis.types';
import type { DbCustomUser } from './user.types';

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export interface SendFriendRequestInput {
  subscriberId: string;
}

export interface GameRating {
  id: string;
  game_id: string;
  average_rating: string;
  total_ratings: number;
  created_at: string;
  updated_at: string;
}

// Define types generically to avoid circular dependency
export type GameRecord = {
  id: string;
  league: string;
  season: number;
  date: Date | string;
  stage: number;
  status: { long: string; short: string; clock?: string } | string;
  periods: { current?: number; total?: number; endOfPeriod?: boolean };
  arena: { name: string; city: string; state?: string } | string;
  teams: { home: Record<string, unknown>; visitors: Record<string, unknown> };
  scores: { home: { points: number }; visitors: { points: number } };
  officials: string[] | Record<string, unknown>;
  times_tied?: number;
  lead_changes?: number;
  nugget?: string;
  created_at: Date;
  updated_at: Date;
};

export type GameLogRecord = {
  id: string;
  user_id: string | null;
  game_id: string;
  watched_setting: string;
  watched_date: Date;
  watched_location?: string;
  rating_for_game: number;
  rating_stars?: string;
  watched_count: number;
  notes?: string;
  tags?: string[];
  classification: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
};

export type CommentRecord = {
  id: string;
  user_id: string | null;
  parent_id: string;
  parent_type: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
};

export type ReactionRecord = {
  id: string;
  user_id: string | null;
  target_type: string;
  target_id: string;
  emoji: string;
  created_at: Date;
  updated_at: Date;
};

export interface Context {
  db: import('./db.types').DatabaseClient;
  redis: RedisClient | null;
  user: DbCustomUser | null;
  loaders: DataLoaders;
}

// Define DataLoaders interface to match actual DataLoader instances
export interface DataLoaders {
  user: DataLoader<string, import('./generated/graphql').UserSummary | null>;
  game: DataLoader<string, import('./generated/graphql').Game | null>;
  dbGame: DataLoader<string, import('./generated/types').DbGame | null>;
  team: DataLoader<string, import('./generated/graphql').Team | null>;
  player: DataLoader<string, import('./generated/graphql').Player | null>;
  gameLog: DataLoader<string, import('./generated/graphql').GameLog | null>;
  comment: DataLoader<string, import('./generated/graphql').Comment | null>;
  reaction: DataLoader<string, import('./generated/graphql').Reaction | null>;
  friendship: DataLoader<string, import('./generated/graphql').Friendship | null>;
}
