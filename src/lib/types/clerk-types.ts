// Clerk webhook event types based on example responses

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

export interface IClerkPhoneNumber {
  created_at: number;
  phone_number: string;
  id: string;
  linked_to: Array<{
    id: string;
    type: string;
  }>;
  matches_sso_connection: boolean;
  object: 'phone_number';
  reserved: boolean;
  updated_at: number;
  verification: {
    attempts: number | null;
    expire_at: number | null;
    status: string;
    strategy: string;
  };
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
  public_metadata: Record<string, unknown>;
  updated_at: number;
  username: string | null;
  verification: {
    attempts: number | null;
    expire_at: number;
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
  enterprise_accounts: unknown[];
  external_accounts: IClerkExternalAccount[];
  external_id: string | null;
  first_name: string | null;
  has_image: boolean;
  id: string;
  image_url: string;
  last_active_at: number | null;
  last_name: string | null;
  last_sign_in_at: number | null;
  legal_accepted_at: number | null;
  locked: boolean;
  lockout_expires_in_seconds: number | null;
  mfa_disabled_at: number | null;
  mfa_enabled_at: number | null;
  object: 'user';
  passkeys: unknown[];
  password_enabled: boolean;
  phone_numbers: IClerkPhoneNumber[];
  primary_email_address_id: string | null;
  primary_phone_number_id: string | null;
  primary_web3_wallet_id: string | null;
  private_metadata: Record<string, unknown>;
  profile_image_url: string;
  public_metadata: Record<string, unknown>;
  saml_accounts: unknown[];
  totp_enabled: boolean;
  two_factor_enabled: boolean;
  unsafe_metadata: Record<string, unknown>;
  updated_at: number;
  username: string | null;
  verification_attempts_remaining: number;
  web3_wallets: unknown[];
}

export interface IClerkDeletedUserData {
  deleted: boolean;
  id: string;
  object: 'user';
}

export interface IClerkWebhookEvent {
  data: IClerkUserData | IClerkDeletedUserData;
  event_attributes: {
    http_request: {
      client_ip: string;
      user_agent: string;
    };
  };
  instance_id: string;
  object: 'event';
  timestamp: number;
  type: 'user.created' | 'user.updated' | 'user.deleted';
}
