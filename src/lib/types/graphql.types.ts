import type DataLoader from 'dataloader';
import type { z } from 'zod';

import type { createCommentSchema } from '@src/lib/validations/comment';
import type { DBPlayer } from '@/lib/types/shared.types';
import type {
  UserSummary,
  Game,
  Team,
  GameLog,
  Comment,
  Reaction,
  Friendship,
} from './generated/graphql';

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export interface SendFriendRequestInput {
  subscriberId: string;
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
  arena: { name: string; city: string; state?: string; country?: string } | string;
  teams: { home: Record<string, unknown>; visitors: Record<string, unknown> };
  scores: { home: { points: number }; visitors: { points: number } };
  officials: string[] | Record<string, unknown>;
  timesTied?: number;
  leadChanges?: number;
  nugget?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GameLogRecord = {
  id: string;
  userId: string | null;
  gameId: string;
  watchedSetting: string;
  watchedDate: Date;
  watchedLocation?: string;
  ratingForGame: number;
  watchedScope: string;
  notes?: string;
  tags?: string[];
  classification: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export type CommentRecord = {
  id: string;
  userId: string | null;
  parentId: string;
  parentType: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export type ReactionRecord = {
  id: string;
  userId: string | null;
  targetType: string;
  targetId: string;
  emoji: string;
  createdAt: Date;
  updatedAt: Date;
};

// Define DataLoaders interface to match actual DataLoader instances
export interface DataLoaders {
  user: DataLoader<string, UserSummary | null>;
  game: DataLoader<string, Game | null>;
  team: DataLoader<string, Team | null>;
  player: DataLoader<string, DBPlayer | null>;
  gameLog: DataLoader<string, GameLog | null>;
  comment: DataLoader<string, Comment | null>;
  reaction: DataLoader<string, Reaction | null>;
  friendship: DataLoader<string, Friendship | null>;
}
