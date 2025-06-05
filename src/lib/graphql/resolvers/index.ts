import { Resolvers } from '@/lib/types/generated/graphql';

import * as mutations from './mutations';
import * as queries from './queries';
import * as scalars from './scalars';

export const resolvers: Resolvers = {
  ...scalars,
  Query: queries.Query,
  Mutation: mutations as unknown as Resolvers['Mutation'],
  DBUser: queries.DBUser as unknown as Resolvers['DBUser'],
  GameLog: queries.GameLog as unknown as Resolvers['GameLog'],
  Comment: queries.Comment as unknown as Resolvers['Comment'],
  Reaction: queries.Reaction as unknown as Resolvers['Reaction'],
};
