import type { Friendship, Friendship as GraphQLFriendship } from './generated/graphql';

export type { GraphQLFriendship };

// Extend the generated Friendship type
export interface FriendRequest
  extends Pick<GraphQLFriendship, 'id' | 'status' | 'createdAt' | 'updatedAt'> {
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
  target_user_id: string;
  target_username?: string;
  target_avatar?: string;
}

export interface GetFriendshipsForUserResponse {
  friendships: Friendship[];
}
