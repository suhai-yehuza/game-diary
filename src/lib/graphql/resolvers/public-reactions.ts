import { eq, and } from 'drizzle-orm';

import type { TARGET_TYPES } from '@/lib/constants';
import { db } from '@/lib/db';
import { publicReactions } from '@/lib/db/schema';
import type { GraphQLContext } from '@/types';

// Public Reaction Query Resolvers
export const publicReactionQueryResolvers = {
  // Get public reactions for a specific target
  publicReactions: async (
    _parent: unknown,
    args: {
      targetId: string;
      targetType: string;
    },
    _context: GraphQLContext
  ) => {
    const { targetId, targetType } = args;

    const reactions = await db()?.query.publicReactions.findMany({
      where: and(
        eq(publicReactions.target_id, targetId),
        eq(
          publicReactions.target_type,
          targetType as (typeof TARGET_TYPES)[keyof typeof TARGET_TYPES]
        )
      ),
      with: {
        user: true,
      },
    });

    return (
      reactions?.map(reaction => ({
        id: reaction.id,
        emoji: reaction.emoji,
        user: reaction.user
          ? {
              id: reaction.user.id,
              username: reaction.user.username,
              first_name: reaction.user.first_name,
              last_name: reaction.user.last_name,
              image_url: reaction.user.image_url,
            }
          : null,
        user_id: reaction.user_id,
        anonymous_name: reaction.anonymous_name,
        anonymous_email: reaction.anonymous_email,
        target_id: reaction.target_id,
        target_type: reaction.target_type,
        is_approved: reaction.is_approved,
        created_at: reaction.created_at,
        updated_at: reaction.updated_at,
        deleted_at: reaction.deleted_at,
      })) || []
    );
  },
};
