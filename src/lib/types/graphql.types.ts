import type DataLoader from 'dataloader';
import { z } from 'zod';

import { createCommentSchema } from '@/lib/validations/comment';

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
  user: DataLoader<string, import('./generated/graphql').UserSummary | null>;
  game: DataLoader<string, import('./generated/graphql').Game | null>;
  team: DataLoader<string, import('./generated/graphql').Team | null>;
  player: DataLoader<string, import('./generated/graphql').Player | null>;
  gameLog: DataLoader<string, import('./generated/graphql').GameLog | null>;
  comment: DataLoader<string, import('./generated/graphql').Comment | null>;
  reaction: DataLoader<string, import('./generated/graphql').Reaction | null>;
  friendship: DataLoader<string, import('./generated/graphql').Friendship | null>;
}
