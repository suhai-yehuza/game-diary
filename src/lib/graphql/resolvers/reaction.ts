import { eq, and } from 'drizzle-orm';

import { db } from '@/lib/db';
import { reactions } from '@/lib/db/schema';
import { AuthorizationError } from '@/lib/graphql/errors';
import type { GraphQLContext } from '@/lib/types/db.types';

// Reaction Query Resolvers
export const reactionQueryResolvers = {
  // Get reactions for a specific target
  reactions: async (
    _parent: unknown,
    args: { targetId: string; targetType: string },
    context: GraphQLContext
  ) => {
    if (!context.user?.id) {
      throw new AuthorizationError('Authentication required');
    }

    const reactionsData = await db()?.query.reactions.findMany({
      where: and(
        eq(reactions.target_id, args.targetId),
        eq(reactions.target_type, args.targetType as 'GAME_LOG' | 'COMMENT')
      ),
      with: {
        user: true,
      },
    });

    return (
      reactionsData?.map(reaction => ({
        id: reaction.id,
        emoji: reaction.emoji,
        user_id: reaction.user_id,
        target_id: reaction.target_id,
        target_type: reaction.target_type,
        created_at: reaction.created_at,
        updated_at: reaction.updated_at,
        user: {
          id: reaction.user?.id ?? '',
          username: reaction.user?.username ?? '',
          first_name: reaction.user?.first_name ?? '',
          last_name: reaction.user?.last_name ?? '',
          email_address: null,
          phone_number: null,
          image_url: reaction.user?.image_url ?? null,
        },
      })) ?? []
    );
  },
};

// Reaction Type Resolvers
export const reactionResolver = {
  // Add any reaction-specific field resolvers here
};
