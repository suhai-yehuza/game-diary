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
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Comment {
  id: string;
  userId: string;
  parent_id?: string;
  parent_type?: string;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  user?: UserSummary;
  reactions: Reaction[];
  replies: Comment[];
}

export interface Reaction {
  id: string;
  emoji: string;
  created_at: string;
  updated_at: string;
  targetId: string;
  targetType: string;
  userId: string;
  user?: UserSummary;
}

export interface UserSummary {
  id: string;
  username?: string;
  imageUrl?: string;
  first_name: string;
  last_name: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  username: string;
  email_address: string;
  imageUrl?: string;
  created_at: string;
  updated_at: string;
  comments: Comment[];
  gameLogs: GameLog[];
  initiated_friendships: Friendship[];
  reactions: Reaction[];
  friendships: Friendship[];
}

export interface GameLogFilters {
  user_id?: string;
  game_id?: string;
  classification?: string;
  watched_date_range?: {
    start?: string;
    end?: string;
  };
}

export interface GqlGameLogFilters {
  user_id?: string;
  game_id?: string;
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
