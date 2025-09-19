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
-- SECTION 1: EXTERNAL API DATA TABLES (No Dependencies)
-- ============================================================================

-- Leagues table - External API data
CREATE TABLE "leagues" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar(255) NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone,
    CONSTRAINT "leagues_name_unique" UNIQUE("name")
);

-- Seasons table - External API data
CREATE TABLE "seasons" (
    "id" serial PRIMARY KEY NOT NULL,
    "year" integer NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone,
    CONSTRAINT "seasons_year_unique" UNIQUE("year")
);

-- Basketball Teams table - External API data
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

-- Basketball Players table - External API data
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

-- Basketball Games table - External API data
CREATE TABLE "basketball_games" (
    "id" varchar(50) PRIMARY KEY NOT NULL, -- Format: ${season}-${game.id}
    "season" varchar(20), -- Season year (e.g., "2023", "2024")
    "game_id" varchar(255),
    "date" timestamp NOT NULL,
    "stage" integer, -- Game stage (e.g., regular season, playoffs, etc.)
    "teams" jsonb, -- Complete teams data with home and away team information
    "status" jsonb, -- Complete status object
    "scores" jsonb, -- Complete scores object with win/loss, series, linescore
    "arena" jsonb, -- Complete arena object
    "periods" jsonb, -- Complete periods object
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
-- SECTION 2: CORE USER TABLES
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
    "user_id" varchar(255) NOT NULL,
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
    CONSTRAINT "game_logs_user_id_game_id_unique" UNIQUE("user_id","game_id"),
    CONSTRAINT "game_logs_rating_check" CHECK (rating_for_game >= 1 AND rating_for_game <= 5),
    CONSTRAINT "game_logs_watched_setting_check" CHECK (
        watched_setting IN ('TV', 'ARENA', 'PHONE', 'LAPTOP', 'BAR', 'HOME', 'OTHER')
    ),
    CONSTRAINT "game_logs_watched_scope_check" CHECK (
        watched_scope IN ('FULL_GAME', 'HALF_GAME', 'HIGHLIGHTS', 'PRE_GAME', 'POST_GAME', 'SHORTS', 'OTHER')
    )
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
    CONSTRAINT "game_ratings_game_id_unique" UNIQUE("game_id"),
    CONSTRAINT "game_ratings_average_rating_check" CHECK (average_rating >= 0 AND average_rating <= 5)
);

-- Friendships table - User relationships
CREATE TABLE "friendships" (
    "id" varchar(255) PRIMARY KEY NOT NULL,
    "user_id" varchar(255) NOT NULL,
    "friend_id" varchar(255) NOT NULL,
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
    CONSTRAINT "friendships_canonical_unique" UNIQUE("canonical_id"),
    CONSTRAINT "friendships_status_uppercase_check" CHECK (status = UPPER(status))
);

-- Comments table - User interactions
CREATE TABLE "comments" (
    "id" varchar(255) PRIMARY KEY NOT NULL,
    "user_id" varchar(255) NOT NULL,
    "parent_id" varchar(255) NOT NULL,
    "parent_type" varchar(50) NOT NULL,
    "content" text NOT NULL,
    "depth" integer DEFAULT 0 NOT NULL,
    "childComments" jsonb[] DEFAULT '{}' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone,
    CONSTRAINT "comments_depth_check" CHECK (depth >= 0 AND depth <= 10),
    CONSTRAINT "comments_parent_type_check" CHECK (parent_type IN ('GAME_LOG', 'COMMENT'))
);

-- Reactions table - User reactions to content
CREATE TABLE "reactions" (
    "id" varchar(255) PRIMARY KEY NOT NULL,
    "user_id" varchar(255) NOT NULL,
    "target_type" varchar(50) NOT NULL,
    "target_id" varchar(255) NOT NULL,
    "emoji" varchar(10) NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone,
    CONSTRAINT "reactions_user_id_target_type_target_id_emoji_unique" UNIQUE("user_id","target_type","target_id","emoji"),
    CONSTRAINT "reactions_target_type_check" CHECK (target_type IN ('GAME_LOG', 'COMMENT'))
);

-- Reaction Emojis table - Source of truth for allowed emojis
CREATE TABLE IF NOT EXISTS "reaction_emojis" (
    "emoji" varchar(10) PRIMARY KEY NOT NULL
);

-- Notifications table - User notifications
CREATE TABLE "notifications" (
    "id" varchar(255) PRIMARY KEY NOT NULL,
    "user_id" varchar(255) NOT NULL,
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

-- ============================================================================
-- SECTION 4: PUBLIC/ANONYMOUS TABLES
-- ============================================================================

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
-- SECTION 5: AUDIT & SECURITY TABLES
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
-- SECTION 6: FOREIGN KEY CONSTRAINTS
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

-- Reaction emoji constraint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_emoji_fk"
    FOREIGN KEY ("emoji") REFERENCES "reaction_emojis"("emoji");

-- ============================================================================
-- SECTION 7: ESSENTIAL INDEXES
-- ============================================================================

-- Note: Comprehensive performance indexes are in 002_consolidated_indexes.sql
-- This section contains only essential indexes needed for basic functionality

-- Essential user indexes for authentication and basic queries
CREATE INDEX IF NOT EXISTS "idx_users_username_basic" ON "users" ("username");
CREATE INDEX IF NOT EXISTS "idx_users_email_basic" ON "users" ("email_address");

-- Essential game log indexes for basic functionality
CREATE INDEX IF NOT EXISTS "idx_game_logs_user_basic" ON "game_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_game_logs_game_basic" ON "game_logs" ("game_id");

-- Essential friendship indexes for basic functionality
CREATE INDEX IF NOT EXISTS "idx_friendships_user_basic" ON "friendships" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_friendships_friend_basic" ON "friendships" ("friend_id");

-- Create index for performance on canonical_id
CREATE INDEX "idx_friendships_canonical_id" ON "friendships" ("canonical_id");

-- ============================================================================
-- SECTION 8: TABLE DOCUMENTATION
-- ============================================================================

-- External API Tables
COMMENT ON TABLE leagues IS 'External API data: NBA leagues';
COMMENT ON TABLE seasons IS 'External API data: NBA seasons';
COMMENT ON TABLE basketball_teams IS 'External API data: NBA teams with comprehensive team information';
COMMENT ON TABLE basketball_players IS 'External API data: NBA players with career and physical data';
COMMENT ON TABLE basketball_games IS 'External API data: NBA games with complete game information';

-- Core User Tables
COMMENT ON TABLE users IS 'Core user data integrated with Clerk authentication';

-- Application Data Tables
COMMENT ON TABLE game_logs IS 'User game experiences and ratings with detailed watching information';
COMMENT ON TABLE game_ratings IS 'Aggregated game ratings calculated from user game logs';
COMMENT ON TABLE friendships IS 'User friendship relationships with bidirectional status tracking';
COMMENT ON TABLE comments IS 'User comments on game logs and other comments (supports nested comments up to 10 levels)';
COMMENT ON TABLE reactions IS 'User reactions to game logs and comments using approved emojis';
COMMENT ON TABLE reaction_emojis IS 'Source of truth for allowed reaction emojis - must be kept in sync with application constants';
COMMENT ON TABLE notifications IS 'User notifications for social interactions and system events';

-- Public/Anonymous Tables
COMMENT ON TABLE public_comments IS 'Public comments on NBA games, players, and teams (no authentication required, supports anonymous users)';
COMMENT ON TABLE public_reactions IS 'Public reactions on NBA games, players, and teams (no authentication required, supports anonymous users)';

-- Audit & Security Tables
COMMENT ON TABLE audit_logs IS 'Comprehensive audit log for all security and data access events';
COMMENT ON TABLE key_rotation_logs IS 'Specialized audit log for encryption key rotation events';
COMMENT ON TABLE rls_access_logs IS 'Specialized audit log for Row-Level Security access events';

-- Constraint Documentation
COMMENT ON CONSTRAINT "reactions_emoji_fk" ON "reactions" IS 'Ensures only valid reaction emojis are stored - source of truth is reaction_emojis table, which should be kept in sync with application constants.';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Note: This migration creates a complete base table structure with:
-- - All tables with proper relationships and constraints
-- - Essential indexes for basic functionality
-- - Data validation constraints for data integrity
-- - Complete documentation and comments
-- - Proper field ordering and naming conventions
-- - Consistent constraint placement and naming
--
-- ============================================================================
-- TEAM RATINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "team_ratings" (
    "id" varchar(255) PRIMARY KEY NOT NULL,
    "team_id" varchar(255) NOT NULL,
    "average_rating" numeric(4, 2) DEFAULT '0.00' NOT NULL,
    "total_ratings" integer DEFAULT 0 NOT NULL,
    "total_comments" integer DEFAULT 0 NOT NULL,
    "total_reactions" integer DEFAULT 0 NOT NULL,
    "public_comments" integer DEFAULT 0 NOT NULL,
    "public_reactions" integer DEFAULT 0 NOT NULL,
    "total_game_logs" integer DEFAULT 0 NOT NULL,
    "public_game_logs" integer DEFAULT 0 NOT NULL,
    "popularity_score" numeric(10, 6) DEFAULT '0.000000' NOT NULL,
    "last_calculated_at" timestamp DEFAULT now() NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone,

    -- Foreign key constraint
    CONSTRAINT "team_ratings_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "basketball_teams"("id") ON DELETE CASCADE
);

-- ============================================================================
-- PLAYER RATINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "player_ratings" (
    "id" varchar(255) PRIMARY KEY NOT NULL,
    "player_id" varchar(255) NOT NULL,
    "average_rating" numeric(4, 2) DEFAULT '0.00' NOT NULL,
    "total_ratings" integer DEFAULT 0 NOT NULL,
    "total_comments" integer DEFAULT 0 NOT NULL,
    "total_reactions" integer DEFAULT 0 NOT NULL,
    "public_comments" integer DEFAULT 0 NOT NULL,
    "public_reactions" integer DEFAULT 0 NOT NULL,
    "total_game_logs" integer DEFAULT 0 NOT NULL,
    "public_game_logs" integer DEFAULT 0 NOT NULL,
    "popularity_score" numeric(10, 6) DEFAULT '0.000000' NOT NULL,
    "last_calculated_at" timestamp DEFAULT now() NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone,

    -- Foreign key constraint
    CONSTRAINT "player_ratings_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "basketball_players"("id") ON DELETE CASCADE
);

-- Performance indexes, functions, triggers, and RLS are applied in separate migrations:
-- - 001_consolidated_functions.sql - All database functions
-- - 002_consolidated_indexes.sql - Comprehensive performance indexes
-- - 003_consolidated_triggers.sql - Database triggers
-- - 004_performance_monitoring.sql - Performance monitoring
-- - 005_rls_policies.sql - Row-level security
-- - 006_reaction_emojis.sql - Reference data
