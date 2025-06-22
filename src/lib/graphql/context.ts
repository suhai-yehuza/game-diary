import { currentUser } from '@clerk/nextjs/server';

import { db } from '@src/lib/db';
import type { IContext } from '@src/lib/types';

import { createLoaders } from './loaders';

export async function createContext(): Promise<IContext> {
  const user = await currentUser();
  const redis = {
    client: null,
    isRedisAvailable: false,
    initializationPromise: Promise.resolve(null),
    clientType: 'none',
    get: async () => null,
    set: async () => {},
    del: async () => {},
    clear: async () => {},
  };

  const loaders = createLoaders();

  return {
    db,
    redis,
    user: user
      ? {
          id: user.id,
          username: user.username || '',
          first_name: user.firstName || undefined,
          last_name: user.lastName || undefined,
          email: user.primaryEmailAddress?.emailAddress || undefined,
          image_url: user.imageUrl || undefined,
        }
      : undefined,
    loaders: {
      reactionLoader: loaders.reactionLoader,
      userLoader: loaders.userLoader,
      gameLoader: loaders.gameLoader,
      gameLogLoader: loaders.gameLogsLoader,
    },
  };
}
