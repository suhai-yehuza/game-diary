import type * as React from 'react';

import type { DbUser, Friendship, FriendshipStatus } from '@src/lib/types/generated/graphql';
import type { IValidatableValue } from '@src/lib/types/shared.types';

// User authentication properties
export interface IAuthUser {
  id: string;
  username?: string;
  email: string;
}

export interface IAuthContextType {
  user: IAuthUser | null;
  loading: boolean;
  userId: string;
  isAuthenticated: boolean;
}

export type IAuthContext = React.Context<IAuthContextType>;

export interface IExternalUserAccount {
  id: string;
  provider: string;
  provider_user_id?: string;
  provider_account_id?: string;
  userId?: string;
  username?: string;
  emailAddress?: string;
  public_metadata?: Record<string, IValidatableValue>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IClerkEmailAddress {
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

export interface IClerkMetadata {
  [key: string]: string | number | boolean | null | undefined;
}

export interface IClerkEnterpriseAccount {
  id: string;
  name: string;
  domain: string;
  created_at: number;
  updated_at: number;
}

export interface IClerkPasskey {
  id: string;
  name: string;
  created_at: number;
  updated_at: number;
}

export interface IClerkPhoneNumber {
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

export interface IClerkSamlAccount {
  id: string;
  provider: string;
  provider_user_id: string;
  created_at: number;
  updated_at: number;
}

export interface IClerkWeb3Wallet {
  id: string;
  address: string;
  chain: string;
  created_at: number;
  updated_at: number;
}

export interface IClerkExternalAccount {
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
  public_metadata: IClerkMetadata;
  updated_at: number;
  username: string | null;
  verification: {
    attempts: number | null;
    expire_at: number | null;
    status: string;
    strategy: string;
  };
}

export interface IClerkUserData {
  backup_code_enabled: boolean;
  banned: boolean;
  create_organization_enabled: boolean;
  created_at: number;
  delete_self_enabled: boolean;
  email_addresses: IClerkEmailAddress[];
  enterprise_accounts: IClerkEnterpriseAccount[];
  external_accounts: IClerkExternalAccount[];
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
  passkeys: IClerkPasskey[];
  password_enabled: boolean;
  phone_numbers: IClerkPhoneNumber[];
  primary_email_address_id: string;
  primary_phone_number_id: string | null;
  primary_web3_wallet_id: string | null;
  private_metadata: IClerkMetadata;
  profile_image_url: string;
  public_metadata: IClerkMetadata;
  saml_accounts: IClerkSamlAccount[];
  totp_enabled: boolean;
  two_factor_enabled: boolean;
  unsafe_metadata: IClerkMetadata;
  updated_at: number;
  username: string | null;
  verification_attempts_remaining: number;
  web3_wallets: IClerkWeb3Wallet[];
}

export interface IClerkDeletedUserData {
  deleted: boolean;
  id: string;
  object: 'user';
}

export interface IUserFields {
  userId: string;
  user?: DbUser;
}

export interface IUserSearchProps {
  users: DbUser[];
  onFilteredUsersChange?: (filteredUsers: DbUser[]) => void;
  onUserSelect?: (userId: string) => void;
  excludeIds?: string[];
}

export interface IUserProfileProps {
  targetUserId: string;
}

export interface IFriendProfileProps {
  friend?: IFriend;
  friendId?: string;
  onClose?: () => void;
}

export interface IUsersTableProps {
  users: DbUser[];
}

export interface IUserPageProps {
  params: {
    id: string;
  };
}

// Core User Types
export interface IUserSummary {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  emailAddress?: string | null;
}

export interface IFriend {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  emailAddress?: string | null;
  friendshipStatus: FriendshipStatus;
  friendship?: Friendship;
}

export interface IFriendGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  members: IFriend[];
}

// User Hook Types
export interface IUseUserProfileProps {
  targetUserId?: string;
}

export interface IUseUserProfileReturn {
  targetUser: IUserSummary | null;
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
export interface IFriendGroupsProps {
  groups: IFriendGroup[];
  friends?: IFriend[];
  onGroupUpdate?: (group: IFriendGroup) => void;
}

// User API Response Types
export interface IGetFriendshipsForUserResponse {
  friendships: Friendship[];
}
