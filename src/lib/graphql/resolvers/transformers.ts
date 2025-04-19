import {
  Comment as GraphQLComment,
  Reaction as GraphQLReaction,
  User as GraphQLUser,
  UserSummary as GraphQLUserSummary,
  Comment as DBComment,
  Reaction as DBReaction,
  User as DBUser,
} from '@/lib/types';

function transformReaction(reaction: DBReaction): GraphQLReaction {
  return {
    id: reaction.id,
    emoji: reaction.emoji,
    targetId: reaction.targetId,
    targetType: reaction.targetType,
    userId: reaction.user.id,
    user: reaction.user,
    created_at: reaction.created_at,
    updated_at: reaction.updated_at,
  };
}

export function transformUser(user: DBUser): GraphQLUser {
  return {
    id: user.id,
    username: user.username || '',
    email_address: user.email_address || '',
    imageUrl: user.imageUrl || '',
    avatar_url: user.imageUrl,
    email: user.email_address || '',
    first_name: user.first_name,
    last_name: user.last_name,
    created_at: user.created_at,
    updated_at: user.updated_at,
    deleted_at: null,
    comments: [],
    reactions: [],
    gameLogs: [],
    initiated_friendships: [],
    friendships: [],
    __typename: 'User',
  };
}

export function transformUserToSummary(user: DBUser): GraphQLUserSummary {
  return {
    id: user.id,
    username: user.username || '',
    email_address: user.email_address || '',
    imageUrl: user.imageUrl || '',
    __typename: 'UserSummary',
  };
}

export function transformComment(comment: DBComment): GraphQLComment {
  return {
    id: comment.id,
    userId: String(comment.user.id),
    content: comment.content,
    parent_id: comment.parent_id,
    parent_type: comment.parent_type,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    deleted_at: comment.deleted_at,
    reactions: comment.reactions.map(transformReaction),
    user: comment.user,
    __typename: 'Comment',
  };
}

export function transformComments(comments: DBComment[]): GraphQLComment[] {
  return comments.map(transformComment);
}
