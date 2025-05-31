import {
  Comment as GraphQLComment,
  Reaction as GraphQLReaction,
  User as GraphQLUser,
  UserSummary as GraphQLUserSummary,
  Comment as DBComment,
  Reaction as DBReaction,
  User as DBUser,
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

export function transformUser(user: DBUser): GraphQLUser {
  return {
    id: user.id,
    username: user.username || '',
    emailAddress: user.emailAddress || '',
    imageUrl: user.imageUrl || '',
    avatar_url: user.imageUrl,
    email: user.emailAddress || '',
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: null,
    comments: [],
    reactions: [],
    gameLogs: [],
    initiatedFriendships: [],
    friendships: [],
    __typename: 'User',
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
  };
}

export function transformComments(comments: DBComment[]): GraphQLComment[] {
  return comments.map(transformComment);
}
