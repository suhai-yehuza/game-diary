import { currentUser } from '@clerk/nextjs/server';
import type DataLoader from 'dataloader';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import { db } from '@src/lib/db';
import * as schema from '@src/lib/db/schema';
import type { Context } from '@src/lib/types/component.types';
import type { Reaction, UserSummary, Game, GameLog } from '@src/lib/types/generated/graphql';

import { createLoaders } from './loaders';

export type { Context };

export async function createContext(): Promise<Context> {
  const user = await currentUser();
  const redis = undefined; // Redis client will be undefined for now

  const loaders = createLoaders();

  return {
    db: db as unknown as NeonHttpDatabase<typeof schema>,
    redis,
    user: user ?? null,
    loaders: {
      reactionLoader: loaders.reactionLoader as DataLoader<string, Reaction>,
      userLoader: loaders.userLoader as DataLoader<string, UserSummary>,
      gameLoader: loaders.gameLoader as DataLoader<string, Game>,
      gameLogLoader: loaders.gameLogsLoader as DataLoader<string, GameLog>,
    },
  };
}
