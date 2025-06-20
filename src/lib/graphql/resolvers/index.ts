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
  DBUser: queries.DbUser,
  GameLog: queries.GameLog,
  Comment: queries.Comment,
};
