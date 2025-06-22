-- Migration: Update users table to match IDbUser interface
-- Add all missing Clerk-specific fields

-- Core user fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS object varchar(10) DEFAULT 'user' NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name varchar(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name varchar(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_image boolean DEFAULT false NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url text;

-- Email and contact fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_phone_number_id varchar(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_web3_wallet_id varchar(255);

-- Authentication and security fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled boolean DEFAULT false NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS backup_code_enabled boolean DEFAULT false NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_attempts_remaining varchar(10) DEFAULT '100' NOT NULL;

-- External accounts and metadata
ALTER TABLE users ADD COLUMN IF NOT EXISTS public_metadata jsonb DEFAULT '{}' NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS private_metadata jsonb DEFAULT '{}' NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS unsafe_metadata jsonb DEFAULT '{}' NOT NULL;

-- Status and flags
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lockout_expires_in_seconds varchar(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS delete_self_enabled boolean DEFAULT true NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS create_organization_enabled boolean DEFAULT true NOT NULL;

-- Timestamps
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at timestamp(6) with time zone;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled_at timestamp(6) with time zone;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_disabled_at timestamp(6) with time zone;
ALTER TABLE users ADD COLUMN IF NOT EXISTS legal_accepted_at timestamp(6) with time zone;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at timestamp(6) with time zone;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamp(6) with time zone;

-- Update existing records to set default values for required fields
UPDATE users SET 
  object = 'user',
  has_image = false,
  totp_enabled = false,
  backup_code_enabled = false,
  verification_attempts_remaining = '100',
  public_metadata = '{}',
  private_metadata = '{}',
  unsafe_metadata = '{}',
  locked = false,
  delete_self_enabled = true,
  create_organization_enabled = true
WHERE object IS NULL OR has_image IS NULL OR totp_enabled IS NULL OR backup_code_enabled IS NULL 
   OR verification_attempts_remaining IS NULL OR public_metadata IS NULL 
   OR private_metadata IS NULL OR unsafe_metadata IS NULL OR locked IS NULL 
   OR delete_self_enabled IS NULL OR create_organization_enabled IS NULL; 