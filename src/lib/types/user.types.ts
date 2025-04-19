import type { Comment } from './comment.types';
import type { SharedGameLog } from './generated/graphql';
import type { Reaction } from './reaction.types';
import type { BaseUser, BaseFriendship, ValidatableValue } from './shared.types';

export interface ExternalUserAccount {
  id: string;
  provider: string;
  provider_user_id?: string;
  provider_account_id?: string;
  user_id?: string;
  username?: string;
  email_address?: string;
  public_metadata?: Record<string, ValidatableValue>;
  created_at?: Date;
  updated_at?: Date;
}

export interface ClerkUserData {
  id: string;
  username: string | null;
  email_addresses: Array<{
    email_address: string;
    id: string;
    linked_to: Array<{
      id: string;
      type: string;
    }>;
    object: string;
    reserved?: boolean;
    verification?: {
      status: string;
      strategy: string;
      attempts?: number | null;
      expire_at?: number | null;
    };
    created_at?: number;
    updated_at?: number;
    matches_sso_connection?: boolean;
  }>;
  first_name: string;
  last_name: string | null;
  image_url: string;
  profile_image_url: string;
  updated_at: number;
  created_at: number;
  last_sign_in_at: number | null;
  password_enabled: boolean;
  two_factor_enabled: boolean;
  external_id: string | null;
  external_accounts: Array<ExternalUserAccount>;
  object: string;
  phone_numbers: Array<{
    id: string;
    phone_number: string;
    reserved: boolean;
    reserved_for_second_factor: boolean;
    verification: {
      status: string;
      strategy: string;
      attempts: number;
      expire_at: number;
      channel?: string;
    };
    created_at: number;
    updated_at: number;
    object: string;
    linked_to: Array<{
      id: string;
      type: string;
    }>;
    backup_codes: ValidatableValue;
    default_second_factor: boolean;
  }>;
  primary_email_address_id: string;
  primary_phone_number_id: string | null;
  primary_web3_wallet_id: string | null;
  private_metadata: Record<string, ValidatableValue>;
  public_metadata: Record<string, ValidatableValue>;
  unsafe_metadata: Record<string, ValidatableValue>;
  web3_wallets: ValidatableValue[];
  backup_code_enabled: boolean;
  banned: boolean;
  create_organization_enabled: boolean;
  delete_self_enabled: boolean;
  enterprise_accounts: ValidatableValue[];
  has_image: boolean;
  last_active_at: number;
  legal_accepted_at: number | null;
  locked: boolean;
  lockout_expires_in_seconds: number | null;
  mfa_disabled_at: number | null;
  mfa_enabled_at: number | null;
  passkeys: ValidatableValue[];
  saml_accounts: ValidatableValue[];
  totp_enabled: boolean;
  verification_attempts_remaining: number;
}

export interface ClerkDeletedUserData {
  id: string;
  deleted: boolean;
  deletedAt: Date;
}

export interface DbCustomUser extends BaseUser {
  first_name: string;
  last_name: string;
  image_url?: string;
  email?: string;
  email_address?: string;
  email_verified?: boolean;
  password_enabled?: boolean;
  password_last_changed?: Date;
  password_last_set?: Date;
  password_reset_token?: string;
  password_reset_token_expires_at?: Date;
  password_reset_token_sent_at?: Date;
  received_friendships?: BaseFriendship[];
  initiated_friendships?: BaseFriendship[];
  banned?: boolean;
  two_factor_enabled?: boolean;
  last_sign_in_at?: Date;
  email_verification_strategy?: string;
  external_accounts?: ExternalUserAccount[];
  comments?: Comment[];
  reactions?: Reaction[];
  game_logs?: SharedGameLog[];
  created_at?: Date;
  updated_at?: Date;
}

export interface UserFields {
  user_id: string;
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
