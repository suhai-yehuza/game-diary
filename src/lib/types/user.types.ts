import type * as React from 'react';
import type { DbUser } from '@src/lib/types/generated/graphql';
import type { ValidatableValue } from '@src/lib/types/shared.types';

import type { Friendship, FriendshipStatus } from './generated/graphql';

// Consolidated from auth.types.ts
export type AuthUser = {
  id: string;
  username?: string;
  email: string;
};

export type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  userId: string;
  isAuthenticated: boolean;
};

export type AuthContext = React.Context<AuthContextType>;

export interface ExternalUserAccount {
  id: string;
  provider: string;
  provider_user_id?: string;
  provider_account_id?: string;
  userId?: string;
  username?: string;
  emailAddress?: string;
  public_metadata?: Record<string, ValidatableValue>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClerkEmailAddress {
  created_at: number;
  email_address: string;
  id: string;
  linked_to: Array<{
    id: string;
    type: string;
  }>;
  matches_sso_connection: boolean;
  object: 'email_address';
  reserved: boolean;
  updated_at: number;
  verification: {
    attempts: number | null;
    expire_at: number | null;
    status: string;
    strategy: string;
  };
}

export interface ClerkMetadata {
  [key: string]: string | number | boolean | null | undefined;
}

export interface ClerkEnterpriseAccount {
  id: string;
  name: string;
  domain: string;
  created_at: number;
  updated_at: number;
}

export interface ClerkPasskey {
  id: string;
  name: string;
  created_at: number;
  updated_at: number;
}

export interface ClerkPhoneNumber {
  id: string;
  phone_number: string;
  verification: {
    attempts: number | null;
    expire_at: number | null;
    status: string;
    strategy: string;
  };
  created_at: number;
  updated_at: number;
}

export interface ClerkSamlAccount {
  id: string;
  provider: string;
  provider_user_id: string;
  created_at: number;
  updated_at: number;
}

export interface ClerkWeb3Wallet {
  id: string;
  address: string;
  chain: string;
  created_at: number;
  updated_at: number;
}

export interface ClerkExternalAccount {
  approved_scopes: string;
  avatar_url: string;
  created_at: number;
  email_address: string;
  external_account_id: string;
  family_name: string;
  first_name: string;
  given_name: string;
  google_id: string;
  id: string;
  identification_id: string;
  image_url: string;
  label: string | null;
  last_name: string;
  object: string;
  picture: string;
  provider: string;
  provider_user_id: string;
  public_metadata: ClerkMetadata;
  updated_at: number;
  username: string | null;
  verification: {
    attempts: number | null;
    expire_at: number | null;
    status: string;
    strategy: string;
  };
}

export interface ClerkUserData {
  backup_code_enabled: boolean;
  banned: boolean;
  create_organization_enabled: boolean;
  created_at: number;
  delete_self_enabled: boolean;
  email_addresses: ClerkEmailAddress[];
  enterprise_accounts: ClerkEnterpriseAccount[];
  external_accounts: ClerkExternalAccount[];
  external_id: string | null;
  first_name: string | null;
  has_image: boolean;
  id: string;
  image_url: string | null;
  last_active_at: number;
  last_name: string | null;
  last_sign_in_at: number | null;
  legal_accepted_at: number | null;
  locked: boolean;
  lockout_expires_in_seconds: number | null;
  mfa_disabled_at: number | null;
  mfa_enabled_at: number | null;
  object: 'user';
  passkeys: ClerkPasskey[];
  password_enabled: boolean;
  phone_numbers: ClerkPhoneNumber[];
  primary_email_address_id: string;
  primary_phone_number_id: string | null;
  primary_web3_wallet_id: string | null;
  private_metadata: ClerkMetadata;
  profile_image_url: string;
  public_metadata: ClerkMetadata;
  saml_accounts: ClerkSamlAccount[];
  totp_enabled: boolean;
  two_factor_enabled: boolean;
  unsafe_metadata: ClerkMetadata;
  updated_at: number;
  username: string | null;
  verification_attempts_remaining: number;
  web3_wallets: ClerkWeb3Wallet[];
}

export interface ClerkDeletedUserData {
  deleted: boolean;
  id: string;
  object: 'user';
}

export interface UserFields {
  userId: string;
  user?: DbUser;
}

export interface UserSearchProps {
  users: DbUser[];
  onFilteredUsersChange?: (filteredUsers: DbUser[]) => void;
  onUserSelect?: (userId: string) => void;
  excludeIds?: string[];
}

export interface UserProfileProps {
  targetUserId: string;
}

export interface FriendProfileProps {
  friend?: Friend;
  friendId?: string;
  onClose?: () => void;
}

export interface UsersTableProps {
  users: DbUser[];
}

export interface UserPageProps {
  params: {
    id: string;
  };
}

// Core User Types
export interface UserSummary {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  emailAddress?: string | null;
}

export interface Friend {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  emailAddress?: string | null;
  friendshipStatus: FriendshipStatus;
  friendship?: Friendship;
}

export interface FriendGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  members: Friend[];
}

// User Hook Types
export interface UseUserProfileProps {
  targetUserId?: string;
}

export interface UseUserProfileReturn {
  targetUser: UserSummary | null;
  dbUserId: string | null;
  currentUserDbId: string | null;
  friendshipStatus: FriendshipStatus | null | 'loading';
  currentFriendship: Friendship | null;
  isLoading: boolean;
  isOwnProfile: boolean;
  handleSendFriendRequest: () => void;
  handleAcceptFriendRequest: () => void;
  handleRemoveFriend: () => void;
  sendingRequest: boolean;
  acceptingRequest: boolean;
  removingFriend: boolean;
}

// User Component Props
export interface FriendGroupsProps {
  groups: FriendGroup[];
  friends?: Friend[];
  onGroupUpdate?: (group: FriendGroup) => void;
}

export interface FriendRequestButtonProps {
  targetUserId: string;
  className?: string;
}

// User API Response Types
export interface GetFriendshipsForUserResponse {
  friendships: Friendship[];
}
