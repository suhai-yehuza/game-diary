import type {
  Comment as GraphQLComment,
  Reaction as GraphQLReaction,
  UserSummary as GraphQLUserSummary,
  Comment as DBComment,
  Reaction as DBReaction,
  DbUser,
} from '@src/lib/types';

function transformReaction(reaction: DBReaction): GraphQLReaction {
  return {
    id: reaction.id,
    emoji: reaction.emoji,
    targetId: reaction.targetId,
    targetType: reaction.targetType,
    userId: reaction.user.id,
    user: reaction.user,
    createdAt: reaction.createdAt,
    updatedAt: reaction.updatedAt,
  };
}

export function transformUser(user: DbUser): DbUser {
  return {
    id: user.id,
    username: user.username || '',
    emailAddress: user.emailAddress || '',
    image_url: user.image_url || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    inboundFriendshipIds: user.inboundFriendshipIds || [],
    outboundFriendshipIds: user.outboundFriendshipIds || [],
    banned: user.banned || false,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
    last_sign_in_at: user.last_sign_in_at,
    password_enabled: user.password_enabled || false,
    two_factor_enabled: user.two_factor_enabled || false,
    email_verified: user.email_verified || false,
    email_verification_strategy: user.email_verification_strategy,
    external_id: user.external_id,
    comments: [],
    reactions: [],
    gameLogs: [],
    friendships: user.friendships || [],
    initiatedFriendships: user.initiatedFriendships || [],
  };
}

export function transformUserToSummary(user: DbUser): GraphQLUserSummary {
  return {
    id: user.id,
    username: user.username || '',
    emailAddress: user.emailAddress || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    image_url: user.image_url || '',
  };
}

export function transformComment(comment: DBComment): GraphQLComment {
  return {
    id: comment.id,
    userId: String(comment.user?.id || ''),
    content: comment.content,
    parentId: comment.parentId,
    parentType: comment.parentType,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    deletedAt: comment.deletedAt,
    reactions: comment.reactions.map(transformReaction),
    user: comment.user,
    childComments: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: 0,
    },
    depth: 0,
  };
}

export function transformComments(comments: DBComment[]): GraphQLComment[] {
  return comments.map(transformComment);
}
