import {
  Comment as GraphQLComment,
  Reaction as GraphQLReaction,
  UserSummary as GraphQLUserSummary,
  Comment as DBComment,
  Reaction as DBReaction,
  DBUser,
} from '@/lib/types/generated/graphql';

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

export function transformUser(user: DBUser): DBUser {
  return {
    id: user.id,
    username: user.username || '',
    emailAddress: user.emailAddress || '',
    imageUrl: user.imageUrl || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
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
    timestamp: user.timestamp,
    comments: [],
    reactions: [],
    gameLogs: [],
    friendships: user.friendships || [],
    initiatedFriendships: user.initiatedFriendships || [],
    __typename: 'DBUser',
  };
}

export function transformUserToSummary(user: DBUser): GraphQLUserSummary {
  return {
    id: user.id,
    username: user.username || '',
    emailAddress: user.emailAddress || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    imageUrl: user.imageUrl || '',
    __typename: 'UserSummary',
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
    __typename: 'Comment',
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
