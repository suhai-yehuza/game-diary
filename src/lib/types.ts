import type DataLoader from 'dataloader';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import * as schema from '@/lib/db/schema';

import type { Reaction as GqlReaction } from './types/generated/graphql';
import type { RedisClient } from './types/redis.types';

export const WATCHED_SETTINGS = {
  LIVE: 'live',
  REPLAY: 'replay',
  HIGHLIGHTS: 'highlights',
  HIGHLIGHT_REEL: 'highlight_reel',
} as const;

export interface BaseContext {
  request?: unknown;
  response?: unknown;
}

export interface Context extends BaseContext {
  db: NeonHttpDatabase<typeof schema>;
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
  redis?: RedisClient;
  loaders?: {
    reaction?: DataLoader<string, GqlReaction>;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export interface GameLog {
  id: string;
  userId: string;
  gameId: string;
  watchedSetting: string;
  watchedDate: string;
  watchedLocation?: string;
  ratingForGame?: number;
  watchedCount: number;
  notes?: string;
  tags?: string[];
  classification: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Comment {
  id: string;
  userId: string;
  parentId?: string;
  parentType?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  user?: UserSummary;
  reactions: Reaction[];
  replies: Comment[];
}

export interface Reaction {
  id: string;
  emoji: string;
  createdAt: string;
  updatedAt: string;
  targetId: string;
  targetType: string;
  userId: string;
  user?: UserSummary;
}

export interface UserSummary {
  id: string;
  username?: string;
  imageUrl?: string;
  firstName: string;
  lastName: string;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  emailAddress: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  gameLogs: GameLog[];
  initiated_friendships: Friendship[];
  reactions: Reaction[];
  friendships: Friendship[];
}

export interface GameLogFilters {
  userId?: string;
  gameId?: string;
  classification?: string;
  watched_date_range?: {
    start?: string;
    end?: string;
  };
}

export interface GqlGameLogFilters {
  userId?: string;
  gameId?: string;
  classification?: string;
  watched_date_range?: {
    start?: string;
    end?: string;
  };
}

export interface DatabaseRow {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | Date
    | DatabaseRow
    | (string | number | boolean | null | Date | DatabaseRow)[];
}
