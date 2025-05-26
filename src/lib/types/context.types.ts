import type { BaseContext } from '@apollo/server';
import type DataLoader from 'dataloader';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import * as schema from '@/lib/db/schema';

import type { Reaction } from './generated/graphql';
import type { RedisClient } from './redis.types';

export interface Context extends BaseContext {
  db: NeonHttpDatabase<typeof schema>;
  user?: {
    id: string;
    email?: string;
    image_url?: string;
    username?: string;
    role?: string;
  };
  redis?: RedisClient;
  loaders?: {
    reaction?: DataLoader<string, Reaction>;
  };
}
