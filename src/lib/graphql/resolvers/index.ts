import type { Resolvers } from '@src/lib/types/generated/types';

import * as mutations from './mutations';
import * as queries from './queries';
import * as scalars from './scalars';
import { Reaction } from './reactions';

export const resolvers = {
  ...scalars,
  Query: queries.Query,
  Mutation: {
    ...mutations,
  },
  Reaction,
  DBUser: queries.DbUser as unknown as Resolvers['DBUser'],
  GameLog: queries.GameLog as unknown as Resolvers['GameLog'],
  Comment: queries.Comment as unknown as Resolvers['Comment'],
} as Resolvers;
