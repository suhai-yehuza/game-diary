import type DataLoader from 'dataloader';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import * as schema from '@/lib/db/schema';

import type { Reaction as GqlReaction } from './types/generated/graphql';
import type { RedisClient } from './types/redis.types';
import type { GameLog } from './types/shared.types';

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
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  gameLogs: GameLog[];
  initiatedFriendships: Friendship[];
  reactions: Reaction[];
  friendships: Friendship[];
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

export interface GameLogFilters {
  userId?: string;
  gameId?: string;
  classification?: string;
  createdAt?: {
    start?: Date;
    end?: Date;
  };
  pagination?: {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
  };
}

export interface GqlGameLogFilters {
  userId?: string;
  gameId?: string;
  classification?: string;
  createdAt?: {
    start?: string;
    end?: string;
  };
  pagination?: {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
  };
}
