import type { DBUser } from './generated/types';

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
  image_url: string;
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

export type FriendRequest = {
  id: string;
  sender: DBUser;
  receiver: DBUser;
  status: string;
  created_at: Date;
  updated_at: Date;
  mutualFriends?: number;
};

export type NavItem = {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  subItems?: NavItem[];
  isActive?: boolean;
};
