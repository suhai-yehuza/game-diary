-- 000_base_schema.sql
-- Base database schema - tables only
--
-- This file contains only the essential table structures.
-- Complex SQL (triggers, functions, RLS) is in separate files.
--
-- For schema changes, edit src/lib/db/schema/*.ts files and run:
-- pnpm db:generate:dev

-- ============================================================================
-- SECTION 0: CLEAN SLATE - DROP ALL EXISTING OBJECTS
-- ============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop all tables in dependency order to avoid constraint violations
DROP TABLE IF EXISTS
  audit_logs,
  key_rotation_logs,
  rls_access_logs,
  comments,
  friendships,
  game_logs,
  game_ratings,
  leagues,
  basketball_games,
  basketball_players,
  notifications,
  public_comments,
  public_reactions,
  reactions,
  seasons,
  basketball_teams,
  users
CASCADE;

-- Drop any existing functions that might conflict
DROP FUNCTION IF EXISTS get_current_user_id() CASCADE;
DROP FUNCTION IF EXISTS set_current_user_context(TEXT) CASCADE;
DROP FUNCTION IF EXISTS clear_current_user_context() CASCADE;
DROP FUNCTION IF EXISTS generate_uuid_v7() CASCADE;

-- ============================================================================
-- SECTION 1: CORE TABLES - External API Data (No Dependencies)
-- ============================================================================

-- Leagues table - External API data
CREATE TABLE "leagues" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar(255) NOT NULL,
    CONSTRAINT "leagues_name_unique" UNIQUE("name")
);

-- Seasons table - External API data
CREATE TABLE "seasons" (
    "id" serial PRIMARY KEY NOT NULL,
    "year" integer NOT NULL,
    CONSTRAINT "seasons_year_unique" UNIQUE("year")
);

-- Teams table - External API data
CREATE TABLE "basketball_teams" (
    "id" varchar(255) PRIMARY KEY NOT NULL,
    "name" varchar(255) NOT NULL,
    "nickname" varchar(100),
    "code" varchar(10),
    "city" varchar(100),
    "logo" text,
    "all_star" boolean DEFAULT false NOT NULL,
    "nba_franchise" boolean DEFAULT false NOT NULL,
    "conference" varchar(100),
    "leagues" jsonb,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone
);

-- NBA Players table - External API data
CREATE TABLE "basketball_players" (
    "id" varchar(255) PRIMARY KEY NOT NULL,
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

-- NBA Games table - External API data
CREATE TABLE "basketball_games" (
    "id" varchar(50) PRIMARY KEY NOT NULL, -- Format: ${season}-${game.id}
    "game_type" varchar(50) DEFAULT 'nba' NOT NULL,
    "season" varchar(20), -- Season year (e.g., "2023", "2024")
    "basketball_game_id" varchar(255),
    "date" timestamp NOT NULL,
    "stage" integer, -- Game stage (e.g., regular season, playoffs, etc.)
    "teams" jsonb, -- Complete teams data with home and away team information
    "game_status" varchar(50) NOT NULL, -- Keep for backward compatibility
    "status" jsonb, -- New field to store complete status object
    "scores" jsonb, -- New field to store complete scores object with win/loss, series, linescore
    "arena" jsonb, -- New field to store complete arena object
    "periods" jsonb, -- New field to store complete periods object
    "officials" text[], -- Array of official names
    "times_tied" integer, -- Number of times the game was tied
    "lead_changes" integer, -- Number of lead changes
    "nugget" text, -- Game summary/description
    "average_rating" numeric(4, 2) DEFAULT '0.00' NOT NULL,
    "total_ratings" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone
);

-- ============================================================================
-- SECTION 2: USER DATA TABLES
-- ============================================================================

-- Users table - Core user data
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
    "isAdmin" boolean DEFAULT false NOT NULL,
    "inbound_friendship_ids" varchar(255)[] DEFAULT '{}' NOT NULL,
    "outbound_friendship_ids" varchar(255)[] DEFAULT '{}' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone,
    CONSTRAINT "users_email_address_unique" UNIQUE("email_address")
);

-- ============================================================================
-- SECTION 3: APPLICATION DATA TABLES
-- ============================================================================

-- Game Logs table - User game experiences
CREATE TABLE "game_logs" (
    "id" varchar(255) PRIMARY KEY NOT NULL,
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
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone,
    CONSTRAINT "game_logs_user_id_game_id_unique" UNIQUE("user_id","game_id")
);

-- Game Ratings table - Aggregated game ratings
CREATE TABLE "game_ratings" (
    "id" varchar(255) PRIMARY KEY NOT NULL,
    "game_id" varchar(255) NOT NULL,
    "average_rating" numeric(4, 2) DEFAULT '0.00' NOT NULL,
    "total_ratings" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone,
    CONSTRAINT "game_ratings_game_id_unique" UNIQUE("game_id")
);

-- Friendships table - User relationships
CREATE TABLE "friendships" (
    "id" varchar(255) PRIMARY KEY NOT NULL,
    "user_id" varchar(255),
    "friend_id" varchar(255),
    "status" varchar(50) DEFAULT 'PENDING' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone,
    -- Canonical ID for bidirectional uniqueness
    "canonical_id" TEXT GENERATED ALWAYS AS (
        CASE
            WHEN user_id < friend_id THEN user_id || '|' || friend_id
            ELSE friend_id || '|' || user_id
        END
    ) STORED,
    CONSTRAINT "friendships_canonical_unique" UNIQUE("canonical_id")
);

-- Friendship status must be uppercase
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_status_uppercase_check"
  CHECK (status = UPPER(status));

-- Create index for performance on canonical_id
CREATE INDEX "idx_friendships_canonical_id" ON "friendships" ("canonical_id");

-- Comments table - User interactions
CREATE TABLE "comments" (
    "id" varchar(255) PRIMARY KEY NOT NULL,
    "user_id" varchar(255),
    "parent_id" varchar(255) NOT NULL,
    "parent_type" varchar(50) NOT NULL,
    "content" text NOT NULL,
    "depth" integer DEFAULT 0 NOT NULL,
    "childComments" jsonb[] DEFAULT '{}' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone
);

-- Reactions table - User reactions to content
CREATE TABLE "reactions" (
    "id" varchar(255) PRIMARY KEY NOT NULL,
    "user_id" varchar(255),
    "target_type" varchar(50) NOT NULL,
    "target_id" varchar(255) NOT NULL,
    "emoji" varchar(10) NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone,
    CONSTRAINT "reactions_user_id_target_type_target_id_emoji_unique" UNIQUE("user_id","target_type","target_id","emoji")
);

-- Reaction Emojis table - Source of truth for allowed emojis
CREATE TABLE "reaction_emojis" (
    "emoji" varchar(10) PRIMARY KEY NOT NULL
);

-- Add foreign key constraint to ensure only valid reaction emojis are stored
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_emoji_fk"
FOREIGN KEY ("emoji") REFERENCES "reaction_emojis"("emoji");

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT "reactions_emoji_fk" ON "reactions" IS 'Ensures only valid reaction emojis are stored - source of truth is reaction_emojis table, which should be kept in sync with application constants.';

-- Notifications table - User notifications
CREATE TABLE "notifications" (
    "id" varchar(255) PRIMARY KEY NOT NULL,
    "user_id" varchar(255),
    "type" varchar(50) NOT NULL,
    "title" varchar(255) NOT NULL,
    "message" text NOT NULL,
    "target_id" varchar(255),
    "target_type" varchar(50),
    "resolved" boolean DEFAULT false NOT NULL,
    "read" boolean DEFAULT false,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp DEFAULT null,
    CONSTRAINT "notifications_user_target_type_unique" UNIQUE("user_id", "target_id", "target_type", "type")
);

-- Public Comments table - for NBA games, players, and teams (no authentication required)
CREATE TABLE "public_comments" (
    "id" varchar(255) PRIMARY KEY NOT NULL,
    "user_id" varchar(255),
    "anonymous_name" varchar(255),
    "anonymous_email" varchar(255),
    "parent_id" varchar(255) NOT NULL,
    "parent_type" varchar(50) NOT NULL,
    "content" text NOT NULL,
    "childComments" jsonb[] DEFAULT '{}',
    "depth" integer DEFAULT 0 NOT NULL,
    "is_approved" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone,
    -- Ensure either user_id or anonymous_name is provided
    CONSTRAINT "public_comments_user_or_anonymous_check" CHECK (
        (user_id IS NOT NULL) OR
        (anonymous_name IS NOT NULL AND LENGTH(TRIM(anonymous_name)) > 0)
    ),
    -- Parent type validation
    CONSTRAINT "public_comments_parent_type_check" CHECK (
        parent_type IN ('BASKETBALL_GAME', 'BASKETBALL_PLAYER', 'BASKETBALL_TEAM', 'PUBLIC_COMMENT')
    ),
    -- Depth validation
    CONSTRAINT "public_comments_depth_check" CHECK (depth >= 0 AND depth <= 10)
);

-- Public Reactions table - for NBA games, players, and teams (no authentication required)
CREATE TABLE "public_reactions" (
    "id" varchar(255) PRIMARY KEY NOT NULL,
    "user_id" varchar(255),
    "anonymous_name" varchar(255),
    "anonymous_email" varchar(255),
    "target_type" varchar(50) NOT NULL,
    "target_id" varchar(255) NOT NULL,
    "emoji" varchar(10) NOT NULL,
    "is_approved" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone,
    -- Unique constraint: one reaction per user/anonymous per target per emoji
    CONSTRAINT "public_reactions_unique_reaction" UNIQUE("user_id", "anonymous_name", "target_type", "target_id", "emoji"),
    -- Target type validation
    CONSTRAINT "public_reactions_target_type_check" CHECK (
        target_type IN ('BASKETBALL_GAME', 'BASKETBALL_PLAYER', 'BASKETBALL_TEAM', 'PUBLIC_COMMENT')
    ),
    -- Ensure either user_id or anonymous_name is provided
    CONSTRAINT "public_reactions_user_or_anonymous_check" CHECK (
        (user_id IS NOT NULL) OR
        (anonymous_name IS NOT NULL AND LENGTH(TRIM(anonymous_name)) > 0)
    )
);

-- ============================================================================
-- SECTION 4: AUDIT LOGGING TABLES
-- ============================================================================

-- Audit Logs table - Comprehensive security audit
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

-- Key Rotation Logs table - Encryption key management
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

-- RLS Access Logs table - Row-level security monitoring
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

-- ============================================================================
-- SECTION 5: FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- User relationships
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friend_id_users_id_fk"
    FOREIGN KEY ("friend_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Game relationships
ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_game_id_basketball_games_id_fk"
    FOREIGN KEY ("game_id") REFERENCES "basketball_games"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "game_ratings" ADD CONSTRAINT "game_ratings_game_id_basketball_games_id_fk"
    FOREIGN KEY ("game_id") REFERENCES "basketball_games"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Content relationships
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Public table relationships
ALTER TABLE "public_comments" ADD CONSTRAINT "public_comments_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "public_reactions" ADD CONSTRAINT "public_reactions_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ============================================================================
-- SECTION 6: DATA CONSTRAINTS AND VALIDATIONS
-- ============================================================================

-- User contact constraints
ALTER TABLE "users" ADD CONSTRAINT "users_contact_constraint"
CHECK (
    username IS NOT NULL AND
    LENGTH(TRIM(username)) > 0 AND
    (email_address IS NOT NULL OR phone_number IS NOT NULL)
);

ALTER TABLE "users" ADD CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number");

-- Game log constraints
ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_rating_check"
    CHECK (rating_for_game >= 1 AND rating_for_game <= 5);

ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_watched_setting_check"
    CHECK (watched_setting IN ('TV', 'ARENA', 'PHONE', 'LAPTOP', 'BAR', 'HOME', 'OTHER'));

ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_watched_scope_check"
    CHECK (watched_scope IN ('FULL_GAME', 'HALF_GAME', 'HIGHLIGHTS', 'PRE_GAME', 'POST_GAME', 'SHORTS', 'OTHER'));

-- Comment constraints
ALTER TABLE "comments" ADD CONSTRAINT "comments_depth_check"
    CHECK (depth >= 0 AND depth <= 10);

ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_type_check"
    CHECK (parent_type IN ('GAME_LOG', 'COMMENT'));

-- Game ratings constraints
ALTER TABLE "game_ratings" ADD CONSTRAINT "game_ratings_average_rating_check"
    CHECK (average_rating >= 0 AND average_rating <= 5);

-- ============================================================================
-- SECTION 7: PERFORMANCE INDEXES
-- ============================================================================

-- User indexes
CREATE INDEX IF NOT EXISTS "idx_users_username" ON "users" ("username");
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email_address");
CREATE INDEX IF NOT EXISTS "idx_users_created_at" ON "users" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_users_deleted_at" ON "users" ("deleted_at");

-- Friendship indexes
-- Core performance indexes for friendships
CREATE INDEX IF NOT EXISTS "idx_friendships_status_users" ON "friendships" ("status", "user_id", "friend_id");
CREATE INDEX IF NOT EXISTS "idx_friendships_bidirectional" ON "friendships" ("user_id", "friend_id", "status");

-- Individual column indexes for filtering
CREATE INDEX IF NOT EXISTS "idx_friendships_status" ON "friendships" ("status");
CREATE INDEX IF NOT EXISTS "idx_friendships_user_id" ON "friendships" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_friendships_friend_id" ON "friendships" ("friend_id");

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "idx_friendships_user_friend_status" ON "friendships" ("user_id", "friend_id", "status");
CREATE INDEX IF NOT EXISTS "idx_friendships_friend_user_status" ON "friendships" ("friend_id", "user_id", "status");

-- Game log indexes
-- Core performance indexes for game logs
CREATE INDEX IF NOT EXISTS "idx_game_logs_user_created" ON "game_logs" ("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_game_logs_classification_created" ON "game_logs" ("classification", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_game_logs_user_classification_created" ON "game_logs" ("user_id", "classification", "created_at" DESC);

-- Individual column indexes for filtering
CREATE INDEX IF NOT EXISTS "idx_game_logs_user_id" ON "game_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_game_logs_game_id" ON "game_logs" ("game_id");
CREATE INDEX IF NOT EXISTS "idx_game_logs_classification" ON "game_logs" ("classification");
CREATE INDEX IF NOT EXISTS "idx_game_logs_watched_date" ON "game_logs" ("watched_date");
CREATE INDEX IF NOT EXISTS "idx_game_logs_rating" ON "game_logs" ("rating_for_game");
CREATE INDEX IF NOT EXISTS "idx_game_logs_created_at" ON "game_logs" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_game_logs_deleted_at" ON "game_logs" ("deleted_at");

-- Comment indexes
CREATE INDEX IF NOT EXISTS "idx_comments_parent" ON "comments" ("parent_id", "parent_type");
CREATE INDEX IF NOT EXISTS "idx_comments_user" ON "comments" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_comments_created_at" ON "comments" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_comments_deleted_at" ON "comments" ("deleted_at");
CREATE INDEX IF NOT EXISTS "idx_comments_depth" ON "comments" ("depth");
-- Index for childComments JSONB array operations
CREATE INDEX IF NOT EXISTS "idx_comments_child_comments" ON "comments" USING gin ("childComments");

-- Reaction indexes
CREATE INDEX IF NOT EXISTS "idx_reactions_target" ON "reactions" ("target_id", "target_type");
CREATE INDEX IF NOT EXISTS "idx_reactions_user" ON "reactions" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_reactions_emoji" ON "reactions" ("emoji");

-- Optimized partial index for non-deleted reactions
CREATE INDEX IF NOT EXISTS "idx_reactions_target_deleted" ON "reactions" ("target_id", "target_type", "deleted_at")
WHERE "deleted_at" IS NULL;
COMMENT ON INDEX "idx_reactions_target_deleted" IS 'Partial index for non-deleted reactions - improves query performance by excluding soft-deleted records';

-- Notification indexes
CREATE INDEX IF NOT EXISTS "idx_notifications_user_resolved" ON "notifications" ("user_id", "resolved");
CREATE INDEX IF NOT EXISTS "idx_notifications_target" ON "notifications" ("target_id", "target_type");
CREATE INDEX IF NOT EXISTS "idx_notifications_created_at" ON "notifications" ("created_at");

-- NBA Games table performance indexes
CREATE INDEX IF NOT EXISTS "idx_basketball_games_season" ON "basketball_games" ("season");
CREATE INDEX IF NOT EXISTS "idx_basketball_games_date" ON "basketball_games" ("date");
CREATE INDEX IF NOT EXISTS "idx_basketball_games_status" ON "basketball_games" ("status");
-- Team indexes removed - basketball_teams data is now in JSONB
CREATE INDEX IF NOT EXISTS "idx_basketball_games_season_date" ON "basketball_games" ("season", "date");
CREATE INDEX IF NOT EXISTS "idx_basketball_games_basketball_game_id" ON "basketball_games" ("basketball_game_id");

-- NBA Players table performance indexes
CREATE INDEX IF NOT EXISTS "idx_basketball_players_first_name" ON "basketball_players" ("first_name");
CREATE INDEX IF NOT EXISTS "idx_basketball_players_last_name" ON "basketball_players" ("last_name");
CREATE INDEX IF NOT EXISTS "idx_basketball_players_teams" ON "basketball_players" USING gin (to_tsvector('english', "teams"));

-- Audit log indexes
CREATE INDEX IF NOT EXISTS "audit_logs_timestamp_idx" ON "audit_logs" ("timestamp");
CREATE INDEX IF NOT EXISTS "audit_logs_category_idx" ON "audit_logs" ("category");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs" ("action");
CREATE INDEX IF NOT EXISTS "audit_logs_severity_idx" ON "audit_logs" ("severity");
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "audit_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "audit_logs_resource_type_idx" ON "audit_logs" ("resource_type");
CREATE INDEX IF NOT EXISTS "audit_logs_resource_id_idx" ON "audit_logs" ("resource_id");
CREATE INDEX IF NOT EXISTS "audit_logs_success_idx" ON "audit_logs" ("success");

-- Key rotation log indexes
CREATE INDEX IF NOT EXISTS "key_rotation_logs_key_id_idx" ON "key_rotation_logs" ("key_id");
CREATE INDEX IF NOT EXISTS "key_rotation_logs_environment_idx" ON "key_rotation_logs" ("environment");
CREATE INDEX IF NOT EXISTS "key_rotation_logs_status_idx" ON "key_rotation_logs" ("status");
CREATE INDEX IF NOT EXISTS "key_rotation_logs_rotated_by_idx" ON "key_rotation_logs" ("rotated_by");

-- RLS access log indexes
CREATE INDEX IF NOT EXISTS "rls_access_logs_requesting_user_id_idx" ON "rls_access_logs" ("requesting_user_id");
CREATE INDEX IF NOT EXISTS "rls_access_logs_target_user_id_idx" ON "rls_access_logs" ("target_user_id");
CREATE INDEX IF NOT EXISTS "rls_access_logs_table_name_idx" ON "rls_access_logs" ("table_name");
CREATE INDEX IF NOT EXISTS "rls_access_logs_operation_idx" ON "rls_access_logs" ("operation");
CREATE INDEX IF NOT EXISTS "rls_access_logs_access_granted_idx" ON "rls_access_logs" ("access_granted");
CREATE INDEX IF NOT EXISTS "rls_access_logs_created_at_idx" ON "rls_access_logs" ("created_at");

-- ============================================================================
-- SECTION 8: INDEX COMMENTS FOR DOCUMENTATION
-- ============================================================================

-- Game logs index comments
COMMENT ON INDEX "idx_game_logs_user_created" IS 'Optimizes queries for user''s game logs ordered by creation date';
COMMENT ON INDEX "idx_game_logs_classification_created" IS 'Optimizes queries for public/protected game logs';
COMMENT ON INDEX "idx_game_logs_user_classification_created" IS 'Optimizes friends game logs queries';
COMMENT ON INDEX "idx_game_logs_user_id" IS 'Optimizes user-specific game log lookups';
COMMENT ON INDEX "idx_game_logs_classification" IS 'Optimizes classification filtering';
COMMENT ON INDEX "idx_game_logs_game_id" IS 'Optimizes game-specific game log lookups';
COMMENT ON INDEX "idx_game_logs_created_at" IS 'Optimizes chronological ordering';
COMMENT ON INDEX "idx_game_logs_deleted_at" IS 'Optimizes soft delete filtering';
COMMENT ON INDEX "idx_game_logs_rating" IS 'Optimizes rating range queries';
COMMENT ON INDEX "idx_game_logs_watched_date" IS 'Optimizes watched date queries';

-- Friendships index comments
COMMENT ON INDEX "idx_friendships_status_users" IS 'Optimizes friendship status queries';
COMMENT ON INDEX "idx_friendships_bidirectional" IS 'Optimizes bidirectional friendship lookups';
COMMENT ON INDEX "idx_friendships_user_id" IS 'Optimizes user-specific friendship lookups';
COMMENT ON INDEX "idx_friendships_friend_id" IS 'Optimizes friend-specific friendship lookups';
COMMENT ON INDEX "idx_friendships_status" IS 'Optimizes status filtering';
COMMENT ON INDEX "idx_friendships_user_friend_status" IS 'Optimizes user-friend-status queries';
COMMENT ON INDEX "idx_friendships_friend_user_status" IS 'Optimizes friend-user-status queries';

-- NBA games index comments
COMMENT ON INDEX "idx_basketball_games_season" IS 'Optimizes season-based game queries';
COMMENT ON INDEX "idx_basketball_games_date" IS 'Optimizes date-based game queries';
COMMENT ON INDEX "idx_basketball_games_status" IS 'Optimizes status-based game filtering';
COMMENT ON INDEX "idx_basketball_games_season_date" IS 'Optimizes season and date range queries';
COMMENT ON INDEX "idx_basketball_games_basketball_game_id" IS 'Optimizes external API ID lookups';

-- NBA players index comments
COMMENT ON INDEX "idx_basketball_players_first_name" IS 'Optimizes first name searches';
COMMENT ON INDEX "idx_basketball_players_last_name" IS 'Optimizes last name searches';
COMMENT ON INDEX "idx_basketball_players_teams" IS 'Optimizes JSON team data searches using GIN index';

-- ============================================================================
-- SECTION 9: TABLE DOCUMENTATION
-- ============================================================================

-- Table documentation
COMMENT ON TABLE users IS 'Core user data integrated with Clerk authentication';
COMMENT ON TABLE friendships IS 'User friendship relationships with status tracking';
COMMENT ON TABLE game_logs IS 'User game experiences and ratings';
COMMENT ON TABLE comments IS 'User comments on game logs and other comments (nested)';
COMMENT ON TABLE reactions IS 'User reactions to game logs and comments';
COMMENT ON TABLE public_comments IS 'Public comments on NBA games, players, and teams (no authentication required)';
COMMENT ON TABLE public_reactions IS 'Public reactions on NBA games, players, and teams (no authentication required)';
COMMENT ON TABLE notifications IS 'User notifications for social interactions';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit log for all security and data access events';
COMMENT ON TABLE key_rotation_logs IS 'Specialized audit log for encryption key rotation events';
COMMENT ON TABLE rls_access_logs IS 'Specialized audit log for Row-Level Security access events';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Note: This migration creates a complete base table structure with:
-- - All tables with proper relationships and constraints
-- - Comprehensive performance indexes for optimal query performance
-- - Data validation constraints for data integrity
-- - Complete documentation and comments
-- - Proper field ordering and naming conventions
--
-- Complex SQL (triggers, functions, RLS) is applied separately.
