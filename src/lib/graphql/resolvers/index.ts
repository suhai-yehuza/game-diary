import type { Resolvers } from '@src/lib/types/generated/types';

import * as mutations from './mutations';
import * as queries from './queries';
import { Reaction } from './reactions';
import * as scalars from './scalars';

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
} as unknown as Resolvers;
