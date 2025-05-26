import { currentUser } from '@clerk/nextjs/server';
import type DataLoader from 'dataloader';

import { getDbClient } from '@/lib/db/seed';
import type { Context } from '@/lib/types/context.types';
import type { Reaction } from '@/lib/types/generated/graphql';
import type { DbCustomUser } from '@/lib/types/user.types';

import { createLoaders } from './loaders';

export type { Context };

export async function createContext(): Promise<Context> {
  const user = await currentUser();
  const db = getDbClient();
  const redis = undefined; // Redis client will be undefined for now

  let dbUser: DbCustomUser | undefined = undefined;
  if (user) {
    dbUser = {
      id: user.id,
      username: user.username ?? '',
      first_name: user.firstName || '',
      last_name: user.lastName || '',
      email_address: user.emailAddresses[0]?.emailAddress || '',
      image_url: user.imageUrl,
    };
  }

  const loaders = createLoaders(db);

  return {
    db,
    redis,
    user: dbUser,
    loaders: {
      reaction: loaders.reaction as DataLoader<string, Reaction>,
    },
  };
}
