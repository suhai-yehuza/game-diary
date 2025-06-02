import type { BaseContext } from '@apollo/server';
import type DataLoader from 'dataloader';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import * as schema from '@/lib/db/schema';

import type { Reaction, UserSummary, Game } from './generated/graphql';
import type { RedisClient } from './redis.types';

export interface Context extends BaseContext {
  db: NeonHttpDatabase<typeof schema>;
  user?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    imageUrl: string;
  };
  redis?: RedisClient;
  loaders?: {
    reaction?: DataLoader<string, Reaction>;
    user?: DataLoader<string, UserSummary>;
    game?: DataLoader<string, Game>;
  };
}
