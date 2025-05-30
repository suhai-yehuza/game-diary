import type { Comment } from './comment.types';
import type { SharedGameLog } from './generated/graphql';
import type { Reaction } from './reaction.types';
import type { BaseUser, Friendship, ValidatableValue } from './shared.types';

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
  public_metadata: Record<string, any>;
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
  enterprise_accounts: any[];
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
  passkeys: any[];
  password_enabled: boolean;
  phone_numbers: any[];
  primary_email_address_id: string;
  primary_phone_number_id: string | null;
  primary_web3_wallet_id: string | null;
  private_metadata: Record<string, any>;
  profile_image_url: string;
  public_metadata: Record<string, any>;
  saml_accounts: any[];
  totp_enabled: boolean;
  two_factor_enabled: boolean;
  unsafe_metadata: Record<string, any>;
  updated_at: number;
  username: string | null;
  verification_attempts_remaining: number;
  web3_wallets: any[];
}

export interface ClerkDeletedUserData {
  deleted: boolean;
  id: string;
  object: 'user';
}

export interface DbCustomUser extends BaseUser {
  firstName: string;
  lastName: string;
  imageUrl?: string;
  email?: string;
  emailAddress?: string;
  email_verified?: boolean;
  password_enabled?: boolean;
  password_last_changed?: Date;
  password_last_set?: Date;
  password_reset_token?: string;
  password_reset_token_expires_at?: Date;
  password_reset_token_sent_at?: Date;
  received_friendships?: Friendship[];
  initiated_friendships?: Friendship[];
  banned?: boolean;
  two_factor_enabled?: boolean;
  last_sign_in_at?: Date;
  email_verification_strategy?: string;
  external_accounts?: ExternalUserAccount[];
  comments?: Comment[];
  reactions?: Reaction[];
  game_logs?: SharedGameLog[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserFields {
  userId: string;
  user?: DbCustomUser;
}

export interface UserSearchProps {
  users: DbCustomUser[];
  onFilteredUsersChange?: (filteredUsers: DbCustomUser[]) => void;
  onUserSelect?: (userId: string) => void;
  excludeIds?: string[];
}

export interface UserProfileProps {
  targetUserId: string;
}

export interface FriendProfileProps {
  friendId: string;
  onClose: () => void;
}

export interface UsersTableProps {
  users: DbCustomUser[];
}

export interface UserPageProps {
  params: {
    id: string;
  };
}
