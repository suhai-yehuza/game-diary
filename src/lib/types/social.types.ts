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

export type EditingComment = { id: string; content: string };

export interface CommentsSectionProps {
  parentId: string;
  parentType: 'game_log' | 'comment';
  initialExpanded?: boolean;
}

export interface CommentWithUser {
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

export interface ReactionWithUser {
  id: string;
  emoji: ReactionEmojiType;
  createdAt: Date;
  updatedAt: Date;
  targetId: string;
  targetType: ParentType;
  userId: string | null;
  user: DbUser | null;
}

export interface ReactionPickerProps {
  targetId: string;
  targetType: string;
  existingReactions?: Reaction[];
  onReactionChanged?: () => void;
}

export interface Friend {
  id: string;
  username: string;
  avatar: string;
}

export interface FriendGroup {
  id: string;
  name: string;
  description: string;
  friends: string[];
  color: string;
  imageUrl: string;
}

export interface FriendGroupsProps {
  friends: Friend[];
  onGroupUpdate: (group: FriendGroup) => void;
}

export enum SORT_DIRECTION {
  ASC = 'asc',
  DESC = 'desc',
}

export type SortDirection = 'asc' | 'desc';

export interface FriendRequest
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

export interface FriendRequestButtonProps {
  target_userId: string;
  target_username?: string;
  target_avatar?: string;
}

export interface GetFriendshipsForUserResponse {
  friendships: Friendship[];
}

export type NavItem = {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  subItems?: NavItem[];
  isActive?: boolean;
};
