import { Resolvers } from '@/lib/types/generated/graphql';

import * as mutations from './mutations';
import * as queries from './queries';
import * as scalars from './scalars';

export const resolvers: Resolvers = {
  ...scalars,
  Query: queries.Query,
  Mutation: mutations as unknown as Resolvers['Mutation'],
  GameLog: queries.GameLog as unknown as Resolvers['GameLog'],
};
