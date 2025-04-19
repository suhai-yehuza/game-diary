import * as mutations from '@/lib/graphql/resolvers/mutations';
import * as queries from '@/lib/graphql/resolvers/queries';
import * as scalars from '@/lib/graphql/resolvers/scalars';
import { Resolvers } from '@/lib/types';

export const resolvers: Resolvers = {
  DateTime: scalars.DateTime,
  ErrorResult: scalars.ErrorResult,
  PaginatedItem: {
    __resolveType(parent: Record<string, unknown>) {
      if ('game_type' in parent) return 'Game';
      if ('player_type' in parent) return 'Player';
      if ('emailAddress' in parent) return 'UserBase';
      if ('content' in parent) return 'Comment';
      if ('watchedSetting' in parent) return 'GameLog';
      if ('player_id' in parent) return 'PlayerStats';
      return null;
    },
  },
  Query: queries as unknown as Resolvers['Query'],
  Mutation: mutations as unknown as Resolvers['Mutation'],
};
