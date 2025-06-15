import type * as React from 'react';

import type {
  Comment,
  DbUser,
  ParentType,
  ReactionEmojiType,
  Reaction,
  Friendship,
} from '@src/lib/types/generated/graphql';

export type { Comment, Reaction, Friendship };

export interface IEditingComment {
  id: string;
  content: string;
}

export interface ICommentsSectionProps {
  parentId: string;
  parentType: ParentType;
  initialExpanded?: boolean;
}

export interface ICommentWithUser {
  id: string;
  userId: string;
  parentId: string | null;
  parentType: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  user: DbUser | null;
}

export interface IReactionWithUser {
  id: string;
  emoji: ReactionEmojiType;
  createdAt: Date;
  updatedAt: Date;
  targetId: string;
  targetType: ParentType;
  userId: string | null;
  user: DbUser | null;
}

export interface IReactionPickerProps {
  targetId: string;
  targetType: string;
  existingReactions?: Reaction[];
  onReactionChanged?: () => void;
}

export interface IFriend {
  id: string;
  username: string;
  avatar: string;
}

export interface IFriendGroup {
  id: string;
  name: string;
  description: string;
  friends: string[];
  color: string;
  imageUrl: string;
}

export interface IFriendGroupsProps {
  friends: IFriend[];
  onGroupUpdate: (group: IFriendGroup) => void;
}

export const ISortDirection = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type ISortDirection = (typeof ISortDirection)[keyof typeof ISortDirection];

export interface IFriendRequest
  extends Pick<Friendship, 'id' | 'status' | 'createdAt' | 'updatedAt'> {
  sender: {
    id: string;
    username: string;
    avatar: string;
  };
  receiver: {
    id: string;
    username: string;
    avatar: string;
  };
  mutualFriends?: number;
}

export interface IFriendRequestButtonProps {
  targetUserId: string;
  targetUsername?: string;
  targetAvatar?: string;
}

export interface IGetFriendshipsForUserResponse {
  friendships: Friendship[];
}

export interface INavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  subItems?: INavItem[];
  isActive?: boolean;
}
