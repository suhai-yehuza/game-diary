import { Resolvers } from '@/lib/types/generated/graphql';

import * as mutations from './mutations';
import * as queries from './queries';
import * as scalars from './scalars';

const { GameLog, ...queryResolvers } = queries;

export const resolvers: Resolvers = {
  ...scalars,
  Query: queryResolvers as unknown as Resolvers['Query'],
  Mutation: mutations as unknown as Resolvers['Mutation'],
  GameLog,
};
