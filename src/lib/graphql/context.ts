import { currentUser } from '@clerk/nextjs/server';
import type DataLoader from 'dataloader';

import { getDbClient } from '@/lib/db/seed';
import type { Context } from '@/lib/types/component.types';
import type { Reaction, DBUser } from '@/lib/types/generated/graphql';

import { createLoaders } from './loaders';

export type { Context };

export async function createContext(): Promise<Context> {
  const user = await currentUser();
  const db = getDbClient();
  const redis = undefined; // Redis client will be undefined for now

  let dbUser: DBUser | undefined = undefined;
  if (user) {
    dbUser = {
      id: user.id,
      username: user.username ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      emailAddress: user.emailAddresses[0]?.emailAddress ?? '',
      imageUrl: user.imageUrl ?? '',
      banned: user.banned ?? false,
      createdAt: new Date(user.createdAt ?? 0),
      deletedAt: null,
      updatedAt: new Date(user.updatedAt ?? 0),
      timestamp: new Date(),
      last_sign_in_at: new Date(user.lastSignInAt ?? 0),
      password_enabled: user.passwordEnabled ?? false,
      two_factor_enabled: user.twoFactorEnabled ?? false,
      email_verified: true,
      email_verification_strategy: null,
      external_id: user.externalId ?? '',
      inboundFriendshipIds: [],
      outboundFriendshipIds: [],
      comments: [],
      reactions: [],
      gameLogs: [],
      friendships: [],
      initiatedFriendships: [],
      __typename: 'DBUser',
    };
  }

  const loaders = createLoaders(db);

  return {
    db,
    redis,
    user: dbUser
      ? {
          id: dbUser.id,
          username: dbUser.username ?? 'no-username',
          firstName: dbUser.firstName ?? 'no-first-name',
          lastName: dbUser.lastName ?? 'no-last-name',
          emailAddress: dbUser.emailAddress ?? 'no-email-address',
          imageUrl: dbUser.imageUrl ?? '',
        }
      : undefined,
    loaders: {
      reaction: loaders.reaction as DataLoader<string, Reaction>,
    },
  };
}
