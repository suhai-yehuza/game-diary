import { currentUser } from '@clerk/nextjs/server';

import { getDbClient } from '@/lib/db/seed';
import type { Context, DbCustomUser } from '@/lib/types';

import { createLoaders } from './loaders';

export type { Context };

export async function createContext(): Promise<Context> {
  const user = await currentUser();
  const db = getDbClient();
  const redis = null; // Redis client will be null for now

  let dbUser: DbCustomUser | null = null;
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
    loaders,
  };
}
