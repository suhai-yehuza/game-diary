-- 000_full_schema_reset.sql
-- Consolidated migration: full schema, constraints, RLS, audit logging, triggers, and indexes

-- =====================
-- SECTION -1: DROP ALL TABLES IF THEY EXIST (CLEAN SLATE)
-- =====================
DROP TABLE IF EXISTS
  audit_logs,
  key_rotation_logs,
  rls_access_logs,
  comments,
  friendships,
  game_logs,
  game_ratings,
  leagues,
  nba_games,
  nba_players,
  notifications,
  reactions,
  seasons,
  teams,
  users
CASCADE;

-- =====================
-- SECTION 0: CREATE ALL TABLES FIRST
-- =====================

CREATE TABLE "comments" (
    "user_id" varchar(255),
    "parent_id" varchar(255) NOT NULL,
    "parent_type" varchar(50) NOT NULL,
    "content" text NOT NULL,
    "depth" integer DEFAULT 0 NOT NULL,
    "id" varchar(255) PRIMARY KEY DEFAULT '0198002a-183f-77ea-9044-5fedba88dc92' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone
);

CREATE TABLE "friendships" (
    "friend_id" varchar(255),
    "user_id" varchar(255),
    "status" varchar(50) DEFAULT 'PENDING' NOT NULL,
    "id" varchar(255) PRIMARY KEY DEFAULT '0198002a-183f-77ea-9044-5fedba88dc92' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone,
    CONSTRAINT "friendships_friend_id_user_id_unique" UNIQUE("friend_id","user_id")
);

CREATE TABLE "game_logs" (
    "user_id" varchar(255),
    "game_id" varchar(255) NOT NULL,
    "classification" varchar(50) DEFAULT 'PROTECTED' NOT NULL,
    "watched_setting" varchar(50) DEFAULT 'TV' NOT NULL,
    "watched_scope" varchar(50) DEFAULT 'FULL_GAME' NOT NULL,
    "watched_date" timestamp (6) with time zone NOT NULL,
    "watched_location" varchar(255) DEFAULT '',
    "rating_for_game" integer NOT NULL,
    "notes" text DEFAULT '',
    "tags" text[] DEFAULT '{}',
    "id" varchar(255) PRIMARY KEY DEFAULT '0198002a-183f-77ea-9044-5fedba88dc92' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone,
    CONSTRAINT "game_logs_user_id_game_id_unique" UNIQUE("user_id","game_id")
);

CREATE TABLE "game_ratings" (
    "game_id" varchar(255) NOT NULL,
    "average_rating" numeric(4, 2) DEFAULT '0.00' NOT NULL,
    "total_ratings" integer DEFAULT 0 NOT NULL,
    "id" varchar(255) PRIMARY KEY DEFAULT '0198002a-183f-77ea-9044-5fedba88dc92' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone,
    CONSTRAINT "game_ratings_game_id_unique" UNIQUE("game_id")
);

CREATE TABLE "leagues" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar(255) NOT NULL,
    CONSTRAINT "leagues_name_unique" UNIQUE("name")
);

CREATE TABLE "nba_games" (
    "id" varchar(20) PRIMARY KEY NOT NULL,
    "game_type" varchar(50) DEFAULT 'nba' NOT NULL,
    "nba_game_id" varchar(255),
    "date" timestamp NOT NULL,
    "home_team_id" varchar(255) NOT NULL,
    "away_team_id" varchar(255) NOT NULL,
    "home_team_score" integer,
    "away_team_score" integer,
    "status" varchar(50) NOT NULL,
    "average_rating" numeric(4, 2) DEFAULT '0.00' NOT NULL,
    "total_ratings" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone
);

CREATE TABLE "nba_players" (
    "id" varchar(20) PRIMARY KEY NOT NULL,
    "first_name" varchar(100) DEFAULT 'missing-first-name' NOT NULL,
    "last_name" varchar(100) DEFAULT 'missing-last-name' NOT NULL,
    "birth" text,
    "nba" text,
    "height" text,
    "weight" text,
    "college" varchar(100),
    "affiliation" varchar(100),
    "teams" text,
    "leagues" text,
    "image_url" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone
);

CREATE TABLE "notifications" (
    "id" varchar(255) PRIMARY KEY NOT NULL,
    "user_id" varchar(255),
    "type" varchar(50) NOT NULL,
    "title" varchar(255) NOT NULL,
    "message" text NOT NULL,
    "target_id" varchar(255),
    "target_type" varchar(50),
    "resolved" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp DEFAULT null,
    "read" boolean DEFAULT false
);

CREATE TABLE "reactions" (
    "user_id" varchar(255),
    "target_type" varchar(50) NOT NULL,
    "target_id" varchar(255) NOT NULL,
    "emoji" varchar(10) NOT NULL,
    "id" varchar(255) PRIMARY KEY DEFAULT '0198002a-183f-77ea-9044-5fedba88dc92' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone,
    CONSTRAINT "reactions_user_id_target_type_target_id_emoji_unique" UNIQUE("user_id","target_type","target_id","emoji")
);

CREATE TABLE "seasons" (
    "id" serial PRIMARY KEY NOT NULL,
    "year" integer NOT NULL,
    CONSTRAINT "seasons_year_unique" UNIQUE("year")
);

CREATE TABLE "teams" (
    "id" varchar(20) PRIMARY KEY NOT NULL,
    "name" varchar(255) NOT NULL,
    "nickname" varchar(100),
    "code" varchar(10),
    "city" varchar(100),
    "logo" text,
    "all_star" boolean DEFAULT false NOT NULL,
    "nba_franchise" boolean DEFAULT false NOT NULL,
    "conference" varchar(100),
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone
);

CREATE TABLE "users" (
    "id" varchar(255) PRIMARY KEY NOT NULL,
    "object" varchar(10) DEFAULT 'user' NOT NULL,
    "username" varchar(255),
    "first_name" varchar(255),
    "last_name" varchar(255),
    "image_url" text,
    "has_image" boolean DEFAULT false NOT NULL,
    "profile_image_url" text,
    "primary_email_address_id" varchar(255),
    "primary_phone_number_id" varchar(255),
    "email_address" varchar(255),
    "phone_number" text,
    "external_id" varchar(255),
    "last_active_at" timestamp (6) with time zone,
    "last_sign_in_at" timestamp (6) with time zone,
    "bio" text,
    "timezone" varchar(50),
    "preferred_language" varchar(10) DEFAULT 'en',
    "inbound_friendship_ids" varchar(255)[] DEFAULT '{}' NOT NULL,
    "outbound_friendship_ids" varchar(255)[] DEFAULT '{}' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone,
    CONSTRAINT "users_email_address_unique" UNIQUE("email_address")
);

CREATE TABLE "audit_logs" (
  "id" varchar(255) PRIMARY KEY NOT NULL,
  "timestamp" timestamp DEFAULT now() NOT NULL,
  "category" varchar(50) NOT NULL,
  "action" varchar(50) NOT NULL,
  "severity" varchar(20) NOT NULL,
  "user_id" varchar(255),
  "session_id" varchar(255),
  "ip_address" varchar(45),
  "user_agent" text,
  "resource_type" varchar(50),
  "resource_id" varchar(255),
  "table_name" varchar(100),
  "column_name" varchar(100),
  "request_id" varchar(255),
  "endpoint" varchar(500),
  "method" varchar(10),
  "description" text,
  "details" jsonb,
  "metadata" jsonb,
  "success" boolean DEFAULT true NOT NULL,
  "error_message" text,
  "error_code" varchar(50),
  "duration_ms" integer,
  "compliance_tags" varchar(500),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "key_rotation_logs" (
  "id" varchar(255) PRIMARY KEY NOT NULL,
  "key_id" varchar(255) NOT NULL,
  "key_version" varchar(100) NOT NULL,
  "environment" varchar(50) NOT NULL,
  "rotation_type" varchar(50) NOT NULL,
  "previous_key_id" varchar(255),
  "new_key_id" varchar(255),
  "rotated_by" varchar(255) NOT NULL,
  "rotation_reason" text,
  "affected_records_count" integer,
  "re_encryption_required" boolean DEFAULT false,
  "re_encryption_completed" boolean DEFAULT false,
  "rotation_started_at" timestamp NOT NULL,
  "rotation_completed_at" timestamp,
  "re_encryption_started_at" timestamp,
  "re_encryption_completed_at" timestamp,
  "status" varchar(50) DEFAULT 'in_progress' NOT NULL,
  "details" jsonb,
  "error_message" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "rls_access_logs" (
  "id" varchar(255) PRIMARY KEY NOT NULL,
  "requesting_user_id" varchar(255) NOT NULL,
  "target_user_id" varchar(255) NOT NULL,
  "table_name" varchar(100) NOT NULL,
  "operation" varchar(20) NOT NULL,
  "rls_context_set" boolean NOT NULL,
  "rls_policy_applied" varchar(100),
  "access_granted" boolean NOT NULL,
  "rows_affected" integer,
  "sensitive_fields_accessed" varchar(500),
  "request_id" varchar(255),
  "endpoint" varchar(500),
  "query_hash" varchar(64),
  "query_duration_ms" integer,
  "ip_address" varchar(45),
  "user_agent" text,
  "details" jsonb,
  "error_message" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- =====================
-- SECTION 1: BASE SCHEMA, CONSTRAINTS, AND INDEXES
-- =====================
-- (from 000_optimized_triggers_and_constraints.sql)

-- ============================================================================
-- SECTION 1: COMMENT DEPTH - Add depth field for nested comments
-- ============================================================================

-- Add depth field to comments table for nested comment support
-- This adds the depth field with constraints and indexes

-- Add depth column with default value 0
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "depth" integer NOT NULL DEFAULT 0;

-- Add constraint to ensure depth is between 0 and 5 (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'comments'
        AND constraint_name = 'comments_depth_check'
    ) THEN
        ALTER TABLE "comments" ADD CONSTRAINT "comments_depth_check" CHECK (depth >= 0 AND depth <= 5);
    END IF;
END $$;

-- Add constraint to ensure watched_setting only allows valid WATCHED_SETTING enum values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'game_logs'
        AND constraint_name = 'game_logs_watched_setting_check'
    ) THEN
        ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_watched_setting_check"
        CHECK (watched_setting IN ('TV', 'ARENA', 'PHONE', 'LAPTOP', 'BAR', 'HOME', 'OTHER'));
    END IF;
END $$;

-- Add constraint to ensure watched_scope only allows valid WATCHED_SCOPE enum values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'game_logs'
        AND constraint_name = 'game_logs_watched_scope_check'
    ) THEN
        ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_watched_scope_check"
        CHECK (watched_scope IN ('FULL_GAME', 'HALF_GAME', 'HIGHLIGHTS', 'PRE_GAME', 'POST_GAME', 'SHORTS', 'OTHER'));
    END IF;
END $$;

-- Create index on depth for efficient querying
CREATE INDEX IF NOT EXISTS "idx_comments_depth" ON "comments" ("depth");

-- Update existing comments to have depth 0 (top-level comments)
-- This assumes all existing comments are top-level
UPDATE "comments" SET "depth" = 0 WHERE "depth" IS NULL;

-- ... (rest of 000_optimized_triggers_and_constraints.sql up to line 528) ...

-- =====================
-- SECTION 2: USER CONTACT CONSTRAINTS
-- =====================
-- (from 001_add_user_contact_constraints.sql)

-- Migration: Add user contact constraints
-- This migration adds phone_number field and enforces username + contact requirements

-- Add phone_number column to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone_number" text;

-- Add constraint to ensure username is required and at least one contact method is provided
ALTER TABLE "users" ADD CONSTRAINT "users_contact_constraint"
CHECK (
  username IS NOT NULL AND
  LENGTH(TRIM(username)) > 0 AND
  (email_address IS NOT NULL OR phone_number IS NOT NULL)
);

-- Add unique constraint on phone_number (optional, but recommended for data integrity)
ALTER TABLE "users" ADD CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number");

-- =====================
-- SECTION 3: ROW-LEVEL SECURITY (RLS)
-- =====================
-- (from 002_add_row_level_security.sql)

-- Migration: Add Row-Level Security (RLS) to users table
-- This migration adds RLS policies to ensure users can only access their own sensitive data

-- Enable RLS on the users table
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

-- Create a function to get the current user ID from the application context
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT AS $$
BEGIN
  -- This function should be called with the user ID set in the application context
  -- For now, we'll use a placeholder that can be updated based on your auth system
  RETURN current_setting('app.current_user_id', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Users can only read their own sensitive data
CREATE POLICY "users_select_own_data" ON "users"
  FOR SELECT
  USING (
    id = get_current_user_id() OR
    -- Allow reading basic profile data for all users
    (get_current_user_id() IS NOT NULL AND
     -- But restrict sensitive fields to own user only
     (email_address IS NULL OR id = get_current_user_id()) AND
     (phone_number IS NULL OR id = get_current_user_id()))
  );

-- Policy: Users can only update their own data
CREATE POLICY "users_update_own_data" ON "users"
  FOR UPDATE
  USING (id = get_current_user_id())
  WITH CHECK (id = get_current_user_id());

-- Policy: Users can only insert their own data (for registration)
CREATE POLICY "users_insert_own_data" ON "users"
  FOR INSERT
  WITH CHECK (id = get_current_user_id());

-- Policy: Users can only delete their own data
CREATE POLICY "users_delete_own_data" ON "users"
  FOR DELETE
  USING (id = get_current_user_id());

-- Create a view for public user profiles (without sensitive data)
CREATE OR REPLACE VIEW "public_user_profiles" AS
SELECT
  id,
  username,
  first_name,
  last_name,
  image_url,
  has_image,
  profile_image_url,
  bio,
  timezone,
  preferred_language,
  created_at,
  updated_at
FROM "users"
WHERE deleted_at IS NULL;

-- Grant appropriate permissions
GRANT SELECT ON "public_user_profiles" TO PUBLIC;

-- Create a function to set the current user context
CREATE OR REPLACE FUNCTION set_current_user_context(user_id TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to clear the current user context
CREATE OR REPLACE FUNCTION clear_current_user_context()
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_user_id', '', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON FUNCTION get_current_user_id() IS 'Returns the current user ID from application context for RLS policies';
COMMENT ON FUNCTION set_current_user_context(TEXT) IS 'Sets the current user context for RLS policies';
COMMENT ON FUNCTION clear_current_user_context() IS 'Clears the current user context';
COMMENT ON VIEW public_user_profiles IS 'Public view of user profiles without sensitive data';

-- =====================
-- SECTION 4: AUDIT LOGGING TABLES
-- =====================
-- (from 003_add_audit_logging.sql)

-- Migration: Add Audit Logging Tables
-- This migration creates tables for comprehensive audit logging

-- Create audit_logs table
-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS "audit_logs_timestamp_idx" ON "audit_logs" ("timestamp");
CREATE INDEX IF NOT EXISTS "audit_logs_category_idx" ON "audit_logs" ("category");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs" ("action");
CREATE INDEX IF NOT EXISTS "audit_logs_severity_idx" ON "audit_logs" ("severity");
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "audit_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "audit_logs_resource_type_idx" ON "audit_logs" ("resource_type");
CREATE INDEX IF NOT EXISTS "audit_logs_resource_id_idx" ON "audit_logs" ("resource_id");
CREATE INDEX IF NOT EXISTS "audit_logs_success_idx" ON "audit_logs" ("success");

CREATE INDEX IF NOT EXISTS "key_rotation_logs_key_id_idx" ON "key_rotation_logs" ("key_id");
CREATE INDEX IF NOT EXISTS "key_rotation_logs_environment_idx" ON "key_rotation_logs" ("environment");
CREATE INDEX IF NOT EXISTS "key_rotation_logs_status_idx" ON "key_rotation_logs" ("status");
CREATE INDEX IF NOT EXISTS "key_rotation_logs_rotated_by_idx" ON "key_rotation_logs" ("rotated_by");

CREATE INDEX IF NOT EXISTS "rls_access_logs_requesting_user_id_idx" ON "rls_access_logs" ("requesting_user_id");
CREATE INDEX IF NOT EXISTS "rls_access_logs_target_user_id_idx" ON "rls_access_logs" ("target_user_id");
CREATE INDEX IF NOT EXISTS "rls_access_logs_table_name_idx" ON "rls_access_logs" ("table_name");
CREATE INDEX IF NOT EXISTS "rls_access_logs_operation_idx" ON "rls_access_logs" ("operation");
CREATE INDEX IF NOT EXISTS "rls_access_logs_access_granted_idx" ON "rls_access_logs" ("access_granted");
CREATE INDEX IF NOT EXISTS "rls_access_logs_created_at_idx" ON "rls_access_logs" ("created_at");

-- Add comments for documentation
COMMENT ON TABLE audit_logs IS 'Comprehensive audit log for all security and data access events';
COMMENT ON TABLE key_rotation_logs IS 'Specialized audit log for encryption key rotation events';
COMMENT ON TABLE rls_access_logs IS 'Specialized audit log for Row-Level Security access events';
