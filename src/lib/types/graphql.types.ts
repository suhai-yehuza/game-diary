import type DataLoader from 'dataloader';
import type { z } from 'zod';

import type { IDBPlayer } from '@/lib/types/shared.types';
import type { createCommentSchema } from '@src/lib/validations/comment';

import type {
  UserSummary,
  Game,
  Team,
  GameLog,
  Comment,
  Reaction,
  Friendship,
} from './generated/graphql';

export type ICreateCommentInput = z.infer<typeof createCommentSchema>;

export interface ISendFriendRequestInput {
  subscriberId: string;
}

// Define types generically to avoid circular dependency
export interface IGameRecord {
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
}

export interface IGameLogRecord {
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
}

export interface ICommentRecord {
  id: string;
  userId: string | null;
  parentId: string;
  parentType: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface IReactionRecord {
  id: string;
  userId: string | null;
  targetType: string;
  targetId: string;
  emoji: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define DataLoaders interface to match actual DataLoader instances
export interface IDataLoaders {
  user: DataLoader<string, UserSummary | null>;
  game: DataLoader<string, Game | null>;
  team: DataLoader<string, Team | null>;
  player: DataLoader<string, IDBPlayer | null>;
  gameLog: DataLoader<string, GameLog | null>;
  comment: DataLoader<string, Comment | null>;
  reaction: DataLoader<string, Reaction | null>;
  friendship: DataLoader<string, Friendship | null>;
}
