-- 000_full_schema_reset.sql
-- Game Diary Database Schema - Complete Reset Migration
--
-- This migration provides a complete database setup including:
-- - All tables with proper structure and constraints
-- - Foreign key relationships with cascade delete
-- - Row-level security policies
-- - Audit logging infrastructure
-- - Performance indexes and constraints
-- - Database triggers and functions
--
-- Last Updated: 2024-07-14
-- UUID v7 Standardization: Application-level ID generation

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
  nba_games,
  nba_players,
  notifications,
  reactions,
  seasons,
  teams,
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

-- NBA Players table - External API data
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

-- NBA Games table - External API data
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

-- ============================================================================
-- SECTION 2: USER MANAGEMENT TABLES
-- ============================================================================

-- Users table - Core user data (Clerk integration)
CREATE TABLE "users" (
    "id" varchar(255) PRIMARY KEY NOT NULL, -- Clerk user ID
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

-- ============================================================================
-- SECTION 3: APPLICATION CORE TABLES
-- ============================================================================

-- Friendships table - User relationships
CREATE TABLE "friendships" (
    "id" varchar(255) PRIMARY KEY NOT NULL,
    "user_id" varchar(255),
    "friend_id" varchar(255),
    "status" varchar(50) DEFAULT 'PENDING' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp (6) with time zone,
    CONSTRAINT "friendships_friend_id_user_id_unique" UNIQUE("friend_id","user_id")
);
-- Friendship status must be uppercase
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_status_uppercase_check"
  CHECK (status = UPPER(status));

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

-- Comments table - User interactions
CREATE TABLE "comments" (
    "id" varchar(255) PRIMARY KEY NOT NULL,
    "user_id" varchar(255),
    "parent_id" varchar(255) NOT NULL,
    "parent_type" varchar(50) NOT NULL,
    "content" text NOT NULL,
    "depth" integer DEFAULT 0 NOT NULL,
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
    "deleted_at" timestamp DEFAULT null
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

ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_game_id_nba_games_id_fk"
    FOREIGN KEY ("game_id") REFERENCES "nba_games"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "game_ratings" ADD CONSTRAINT "game_ratings_game_id_nba_games_id_fk"
    FOREIGN KEY ("game_id") REFERENCES "nba_games"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Content relationships
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

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
    CHECK (depth >= 0 AND depth <= 5);

ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_type_check"
    CHECK (parent_type IN ('GAME_LOG', 'COMMENT'));

-- Game ratings constraints
ALTER TABLE "game_ratings" ADD CONSTRAINT "game_ratings_average_rating_check"
    CHECK (average_rating >= 1 AND average_rating <= 5);

-- ============================================================================
-- SECTION 7: PERFORMANCE INDEXES
-- ============================================================================

-- User indexes
CREATE INDEX IF NOT EXISTS "idx_users_username" ON "users" ("username");
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email_address");
CREATE INDEX IF NOT EXISTS "idx_users_created_at" ON "users" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_users_deleted_at" ON "users" ("deleted_at");

-- Friendship indexes
CREATE INDEX IF NOT EXISTS "idx_friendships_status" ON "friendships" ("status");
CREATE INDEX IF NOT EXISTS "idx_friendships_user_id" ON "friendships" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_friendships_friend_id" ON "friendships" ("friend_id");
CREATE INDEX IF NOT EXISTS "idx_friendships_user_friend_status" ON "friendships" ("user_id", "friend_id", "status");
CREATE INDEX IF NOT EXISTS "idx_friendships_friend_user_status" ON "friendships" ("friend_id", "user_id", "status");

-- Game log indexes
CREATE INDEX IF NOT EXISTS "idx_game_logs_user_id" ON "game_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_game_logs_game_id" ON "game_logs" ("game_id");
CREATE INDEX IF NOT EXISTS "idx_game_logs_classification" ON "game_logs" ("classification");
CREATE INDEX IF NOT EXISTS "idx_game_logs_watched_date" ON "game_logs" ("watched_date");
CREATE INDEX IF NOT EXISTS "idx_game_logs_rating" ON "game_logs" ("rating_for_game");
CREATE INDEX IF NOT EXISTS "idx_game_logs_created_at" ON "game_logs" ("created_at");

-- Comment indexes
CREATE INDEX IF NOT EXISTS "idx_comments_parent" ON "comments" ("parent_id", "parent_type");
CREATE INDEX IF NOT EXISTS "idx_comments_user" ON "comments" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_comments_created_at" ON "comments" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_comments_deleted_at" ON "comments" ("deleted_at");
CREATE INDEX IF NOT EXISTS "idx_comments_depth" ON "comments" ("depth");

-- Reaction indexes
CREATE INDEX IF NOT EXISTS "idx_reactions_target" ON "reactions" ("target_id", "target_type");
CREATE INDEX IF NOT EXISTS "idx_reactions_user" ON "reactions" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_reactions_emoji" ON "reactions" ("emoji");

-- Notification indexes
CREATE INDEX IF NOT EXISTS "idx_notifications_user_resolved" ON "notifications" ("user_id", "resolved");
CREATE INDEX IF NOT EXISTS "idx_notifications_target" ON "notifications" ("target_id", "target_type");
CREATE INDEX IF NOT EXISTS "idx_notifications_created_at" ON "notifications" ("created_at");

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
-- SECTION 8: ROW-LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on users table
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

-- Create RLS helper functions
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT AS $$
BEGIN
    RETURN current_setting('app.current_user_id', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_current_user_context(user_id TEXT)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION clear_current_user_context()
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', '', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for users table
CREATE POLICY "users_select_own_data" ON "users"
    FOR SELECT
    USING (
        id = get_current_user_id() OR
        (get_current_user_id() IS NOT NULL AND
         (email_address IS NULL OR id = get_current_user_id()) AND
         (phone_number IS NULL OR id = get_current_user_id()))
    );

CREATE POLICY "users_update_own_data" ON "users"
    FOR UPDATE
    USING (id = get_current_user_id())
    WITH CHECK (id = get_current_user_id());

CREATE POLICY "users_insert_own_data" ON "users"
    FOR INSERT
    WITH CHECK (id = get_current_user_id());

CREATE POLICY "users_delete_own_data" ON "users"
    FOR DELETE
    USING (id = get_current_user_id());

-- Public user profiles view (without sensitive data)
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

GRANT SELECT ON "public_user_profiles" TO PUBLIC;

-- ============================================================================
-- SECTION 9: DATABASE FUNCTIONS AND TRIGGERS
-- ============================================================================

-- UUID v7 generation function for PostgreSQL
CREATE OR REPLACE FUNCTION generate_uuid_v7()
RETURNS VARCHAR AS $$
DECLARE
    timestamp_ms BIGINT;
    random_bytes BYTEA;
    uuid_v7 VARCHAR;
BEGIN
    -- Get current timestamp in milliseconds since Unix epoch
    timestamp_ms := EXTRACT(EPOCH FROM NOW()) * 1000;

    -- Generate random bytes for the rest of the UUID
    random_bytes := gen_random_bytes(10);

    -- Construct UUID v7 format: timestamp (48 bits) + version (4 bits) + random (74 bits)
    uuid_v7 :=
        lpad(to_hex((timestamp_ms >> 16) & x'FFFFFFFFFFFF'::bigint), 12, '0') || '-' ||
        lpad(to_hex((timestamp_ms & x'FFFF'::bigint) << 4 | (x'7'::bigint)), 4, '0') || '-' ||
        lpad(to_hex((x'8'::bigint << 4) | ((get_byte(random_bytes, 0) & x'3F'::bigint))), 4, '0') || '-' ||
        lpad(to_hex((get_byte(random_bytes, 0) & x'C0'::bigint) << 8 | get_byte(random_bytes, 1)), 4, '0') || '-' ||
        lpad(to_hex(get_byte(random_bytes, 2)::bigint << 8 | get_byte(random_bytes, 3)), 4, '0') ||
        lpad(to_hex(get_byte(random_bytes, 4)::bigint << 8 | get_byte(random_bytes, 5)), 4, '0') ||
        lpad(to_hex(get_byte(random_bytes, 6)::bigint << 8 | get_byte(random_bytes, 7)), 4, '0') ||
        lpad(to_hex(get_byte(random_bytes, 8)::bigint << 8 | get_byte(random_bytes, 9)), 4, '0');

    RETURN uuid_v7;
END;
$$ LANGUAGE plpgsql;

-- Game ratings trigger function
CREATE OR REPLACE FUNCTION update_game_ratings()
RETURNS TRIGGER AS $$
DECLARE
    v_id VARCHAR(255);
BEGIN
    IF (TG_OP = 'DELETE') THEN
        IF NOT EXISTS (SELECT 1 FROM game_logs WHERE game_id = OLD.game_id) THEN
            DELETE FROM game_ratings WHERE game_id = OLD.game_id;
        ELSE
            UPDATE game_ratings
            SET
                average_rating = (
                    SELECT ROUND(AVG(rating_for_game)::numeric, 2)
                    FROM game_logs
                    WHERE game_id = OLD.game_id
                ),
                total_ratings = (
                    SELECT COUNT(*)
                    FROM game_logs
                    WHERE game_id = OLD.game_id
                ),
                updated_at = NOW()
            WHERE game_id = OLD.game_id;
        END IF;
        RETURN OLD;
    END IF;

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO game_ratings (id, game_id, average_rating, total_ratings, created_at, updated_at)
        SELECT
            generate_uuid_v7(),
            NEW.game_id,
            ROUND(AVG(rating_for_game)::numeric, 2),
            COUNT(*),
            NOW(),
            NOW()
        FROM game_logs
        WHERE game_id = NEW.game_id
        ON CONFLICT (game_id) DO UPDATE
        SET
            average_rating = EXCLUDED.average_rating,
            total_ratings = EXCLUDED.total_ratings,
            updated_at = NOW();
        RETURN NEW;
    END IF;

    IF (TG_OP = 'UPDATE') THEN
        UPDATE game_ratings
        SET
            average_rating = (
                SELECT ROUND(AVG(rating_for_game)::numeric, 2)
                FROM game_logs
                WHERE game_id = NEW.game_id
            ),
            total_ratings = (
                SELECT COUNT(*)
                FROM game_logs
                WHERE game_id = NEW.game_id
            ),
            updated_at = NOW()
        WHERE game_id = NEW.game_id;
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Friendship notification function
CREATE OR REPLACE FUNCTION create_friend_request_notification()
RETURNS TRIGGER AS $$
DECLARE
    sender_username VARCHAR;
    sender_name VARCHAR;
BEGIN
    -- Create notification for new pending friend requests
    IF UPPER(NEW.status) = 'PENDING' AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND UPPER(OLD.status) != 'PENDING')) THEN
        -- Get sender's username and name
        SELECT username, CONCAT(first_name, ' ', last_name)
        INTO sender_username, sender_name
        FROM users
        WHERE id = NEW.user_id;

        -- Use username if name is not available
        IF sender_name IS NULL OR sender_name = ' ' THEN
            sender_name := sender_username;
        END IF;

        -- Create notification for the recipient
        INSERT INTO notifications (
            id, user_id, type, title, message, target_id, target_type,
            resolved, created_at, updated_at
        ) VALUES (
            generate_uuid_v7(), NEW.friend_id, 'friend_request', 'New Friend Request',
            sender_name || ' sent you a friend request', NEW.id, 'friendship',
            false, NOW(), NOW()
        );
    END IF;

    -- Create notification when friend request is accepted
    IF UPPER(NEW.status) = 'ACCEPTED' AND TG_OP = 'UPDATE' AND UPPER(OLD.status) = 'PENDING' THEN
        -- Get acceptor's username and name
        SELECT username, CONCAT(first_name, ' ', last_name)
        INTO sender_username, sender_name
        FROM users
        WHERE id = NEW.friend_id;

        -- Use username if name is not available
        IF sender_name IS NULL OR sender_name = ' ' THEN
            sender_name := sender_username;
        END IF;

        -- Create notification for the original sender
        INSERT INTO notifications (
            id, user_id, type, title, message, target_id, target_type,
            resolved, created_at, updated_at
        ) VALUES (
            generate_uuid_v7(), NEW.user_id, 'friend_request_accepted', 'Friend Request Accepted',
            sender_name || ' accepted your friend request', NEW.id, 'friendship',
            false, NOW(), NOW()
        );
    END IF;

    -- Create notification when friend request is rejected
    IF UPPER(NEW.status) = 'REJECTED' AND TG_OP = 'UPDATE' AND UPPER(OLD.status) = 'PENDING' THEN
        -- Get rejector's username and name
        SELECT username, CONCAT(first_name, ' ', last_name)
        INTO sender_username, sender_name
        FROM users
        WHERE id = NEW.friend_id;

        -- Use username if name is not available
        IF sender_name IS NULL OR sender_name = ' ' THEN
            sender_name := sender_username;
        END IF;

        -- Create notification for the original sender
        INSERT INTO notifications (
            id, user_id, type, title, message, target_id, target_type,
            resolved, created_at, updated_at
        ) VALUES (
            generate_uuid_v7(), NEW.user_id, 'friend_request_rejected', 'Friend Request Declined',
            sender_name || ' declined your friend request', NEW.id, 'friendship',
            false, NOW(), NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comment notification function
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
    commenter_username VARCHAR;
    commenter_name VARCHAR;
    target_owner_id VARCHAR;
    target_title VARCHAR;
    target_content VARCHAR;
BEGIN
    -- Skip if user is commenting on their own content
    IF TG_OP = 'INSERT' THEN
        -- Get commenter's info
        SELECT username, CONCAT(first_name, ' ', last_name)
        INTO commenter_username, commenter_name
        FROM users
        WHERE id = NEW.user_id;

        -- Use username if name is not available
        IF commenter_name IS NULL OR commenter_name = ' ' THEN
            commenter_name := commenter_username;
        END IF;

        -- Handle different parent types
        IF NEW.parent_type = 'GAME_LOG' THEN
            -- Get game log owner and content
            SELECT user_id, notes
            INTO target_owner_id, target_content
            FROM game_logs
            WHERE id = NEW.parent_id;

            -- Skip if commenting on own game log
            IF target_owner_id = NEW.user_id THEN
                RETURN NEW;
            END IF;

            -- Create notification for game log owner
            INSERT INTO notifications (
                id, user_id, type, title, message, target_id, target_type,
                resolved, created_at, updated_at
            ) VALUES (
                generate_uuid_v7(), target_owner_id, 'comment_added', 'New Comment on Your Game Log',
                commenter_name || ' commented on your game log', NEW.id, 'comment',
                false, NOW(), NOW()
            );

        ELSIF NEW.parent_type = 'COMMENT' THEN
            -- Get parent comment owner and content
            SELECT user_id, content
            INTO target_owner_id, target_content
            FROM comments
            WHERE id = NEW.parent_id;

            -- Skip if replying to own comment
            IF target_owner_id = NEW.user_id THEN
                RETURN NEW;
            END IF;

            -- Create notification for parent comment owner
            INSERT INTO notifications (
                id, user_id, type, title, message, target_id, target_type,
                resolved, created_at, updated_at
            ) VALUES (
                generate_uuid_v7(), target_owner_id, 'comment_reply', 'New Reply to Your Comment',
                commenter_name || ' replied to your comment', NEW.id, 'comment',
                false, NOW(), NOW()
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Reaction notification function
CREATE OR REPLACE FUNCTION create_reaction_notification()
RETURNS TRIGGER AS $$
DECLARE
    reactor_username VARCHAR;
    reactor_name VARCHAR;
    target_owner_id VARCHAR;
    target_content VARCHAR;
    target_type_name VARCHAR;
BEGIN
    -- Skip if user is reacting to their own content
    IF TG_OP = 'INSERT' THEN
        -- Get reactor's info
        SELECT username, CONCAT(first_name, ' ', last_name)
        INTO reactor_username, reactor_name
        FROM users
        WHERE id = NEW.user_id;

        -- Use username if name is not available
        IF reactor_name IS NULL OR reactor_name = ' ' THEN
            reactor_name := reactor_username;
        END IF;

        -- Handle different target types
        IF NEW.target_type = 'GAME_LOG' THEN
            -- Get game log owner and content
            SELECT user_id, notes
            INTO target_owner_id, target_content
            FROM game_logs
            WHERE id = NEW.target_id;

            -- Skip if reacting to own game log
            IF target_owner_id = NEW.user_id THEN
                RETURN NEW;
            END IF;

            target_type_name := 'game log';

        ELSIF NEW.target_type = 'COMMENT' THEN
            -- Get comment owner and content
            SELECT user_id, content
            INTO target_owner_id, target_content
            FROM comments
            WHERE id = NEW.target_id;

            -- Skip if reacting to own comment
            IF target_owner_id = NEW.user_id THEN
                RETURN NEW;
            END IF;

            target_type_name := 'comment';
        END IF;

        -- Create notification for content owner
        INSERT INTO notifications (
            id, user_id, type, title, message, target_id, target_type,
            resolved, created_at, updated_at
        ) VALUES (
            generate_uuid_v7(), target_owner_id, 'reaction_added', 'New Reaction on Your ' || target_type_name,
            reactor_name || ' reacted with ' || NEW.emoji || ' to your ' || target_type_name, NEW.id, 'reaction',
            false, NOW(), NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Friendship user arrays function
CREATE OR REPLACE FUNCTION update_friendship_user_arrays()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Only add to arrays if the friendship is pending
        IF UPPER(NEW.status) = 'PENDING' THEN
            -- Add friendship ID to outbound array for initiator
            UPDATE users
            SET outbound_friendship_ids = array_append(COALESCE(outbound_friendship_ids, ARRAY[]::VARCHAR[]), NEW.id)
            WHERE id = NEW.user_id;

            -- Add friendship ID to inbound array for recipient
            UPDATE users
            SET inbound_friendship_ids = array_append(COALESCE(inbound_friendship_ids, ARRAY[]::VARCHAR[]), NEW.id)
            WHERE id = NEW.friend_id;
        END IF;

    ELSIF TG_OP = 'UPDATE' THEN
        -- If status changed from Pending to something else, remove from arrays
        IF UPPER(OLD.status) = 'PENDING' AND UPPER(NEW.status) != 'PENDING' THEN
            -- Remove friendship ID from outbound array for initiator
            UPDATE users
            SET outbound_friendship_ids = array_remove(COALESCE(outbound_friendship_ids, ARRAY[]::VARCHAR[]), OLD.id)
            WHERE id = OLD.user_id;

            -- Remove friendship ID from inbound array for recipient
            UPDATE users
            SET inbound_friendship_ids = array_remove(COALESCE(inbound_friendship_ids, ARRAY[]::VARCHAR[]), OLD.id)
            WHERE id = OLD.friend_id;
        END IF;

    ELSIF TG_OP = 'DELETE' THEN
        -- If the deleted friendship was pending, remove from arrays
        IF UPPER(OLD.status) = 'PENDING' THEN
            -- Remove friendship ID from outbound array for initiator
            UPDATE users
            SET outbound_friendship_ids = array_remove(COALESCE(outbound_friendship_ids, ARRAY[]::VARCHAR[]), OLD.id)
            WHERE id = OLD.user_id;

            -- Remove friendship ID from inbound array for recipient
            UPDATE users
            SET inbound_friendship_ids = array_remove(COALESCE(inbound_friendship_ids, ARRAY[]::VARCHAR[]), OLD.id)
            WHERE id = OLD.friend_id;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Rebuild user friendship arrays function
CREATE OR REPLACE FUNCTION rebuild_user_friendship_arrays()
RETURNS void AS $$
BEGIN
    UPDATE users u
    SET
        outbound_friendship_ids = COALESCE((
            SELECT array_agg(f.id)
            FROM friendships f
            WHERE f.user_id = u.id AND f.status = 'PENDING'
        ), ARRAY[]::VARCHAR[]),
        inbound_friendship_ids = COALESCE((
            SELECT array_agg(f.id)
            FROM friendships f
            WHERE f.friend_id = u.id AND f.status = 'PENDING'
        ), ARRAY[]::VARCHAR[]);
END;
$$ LANGUAGE plpgsql;

-- Friendship deletion notification function
CREATE OR REPLACE FUNCTION create_friend_removed_notification()
RETURNS TRIGGER AS $$
DECLARE
    remover_username VARCHAR;
    remover_name VARCHAR;
BEGIN
    -- Create notification for the other user when a friendship is deleted
    -- Get the remover's info
    SELECT username, CONCAT(first_name, ' ', last_name)
    INTO remover_username, remover_name
    FROM users
    WHERE id = OLD.user_id;

    -- Use username if name is not available
    IF remover_name IS NULL OR remover_name = ' ' THEN
        remover_name := remover_username;
    END IF;

    -- Create notification for the friend
    INSERT INTO notifications (
        id, user_id, type, title, message, target_id, target_type,
        resolved, created_at, updated_at
    ) VALUES (
        generate_uuid_v7(), OLD.friend_id, 'friend_removed', 'Friend Removed',
        remover_name || ' removed you as a friend', OLD.id, 'friendship',
        false, NOW(), NOW()
    );

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 9.2: DATABASE TRIGGERS
-- ============================================================================

-- Game ratings trigger
CREATE TRIGGER game_logs_ratings_trigger
    AFTER INSERT OR UPDATE OR DELETE ON game_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_game_ratings();

-- Friendship notification trigger
CREATE TRIGGER friendship_notification_trigger
    AFTER INSERT OR UPDATE ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION create_friend_request_notification();

-- Comment notification trigger
CREATE TRIGGER comment_notification_trigger
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION create_comment_notification();

-- Reaction notification trigger
CREATE TRIGGER reaction_notification_trigger
    AFTER INSERT ON reactions
    FOR EACH ROW
    EXECUTE FUNCTION create_reaction_notification();

-- Friendship user arrays triggers
CREATE TRIGGER update_friendship_user_arrays_insert
    AFTER INSERT ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION update_friendship_user_arrays();

CREATE TRIGGER update_friendship_user_arrays_update
    AFTER UPDATE ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION update_friendship_user_arrays();

CREATE TRIGGER update_friendship_user_arrays_delete
    AFTER DELETE ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION update_friendship_user_arrays();

-- Friendship deletion notification trigger
CREATE TRIGGER friendship_deletion_notification_trigger
    AFTER DELETE ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION create_friend_removed_notification();

-- ============================================================================
-- SECTION 10: DOCUMENTATION AND COMMENTS
-- ============================================================================

-- Function documentation
COMMENT ON FUNCTION get_current_user_id() IS 'Returns the current user ID from application context for RLS policies';
COMMENT ON FUNCTION set_current_user_context(TEXT) IS 'Sets the current user context for RLS policies';
COMMENT ON FUNCTION clear_current_user_context() IS 'Clears the current user context';
COMMENT ON FUNCTION generate_uuid_v7() IS 'Generates UUID v7 (time-ordered) for consistent ID generation';
COMMENT ON FUNCTION update_game_ratings() IS 'Automatically updates game ratings when game logs are modified';
COMMENT ON FUNCTION create_friend_request_notification() IS 'Creates notifications for friendship status changes';
COMMENT ON FUNCTION create_comment_notification() IS 'Creates notifications when users comment on content';
COMMENT ON FUNCTION create_reaction_notification() IS 'Creates notifications when users react to content';
COMMENT ON FUNCTION update_friendship_user_arrays() IS 'Maintains friendship ID arrays in users table';
COMMENT ON FUNCTION rebuild_user_friendship_arrays() IS 'Rebuilds friendship arrays for all users';
COMMENT ON FUNCTION create_friend_removed_notification() IS 'Creates notifications when friendships are deleted';

-- View documentation
COMMENT ON VIEW public_user_profiles IS 'Public view of user profiles without sensitive data';

-- Table documentation
COMMENT ON TABLE users IS 'Core user data integrated with Clerk authentication';
COMMENT ON TABLE friendships IS 'User friendship relationships with status tracking';
COMMENT ON TABLE game_logs IS 'User game experiences and ratings';
COMMENT ON TABLE comments IS 'User comments on game logs and other comments (nested)';
COMMENT ON TABLE reactions IS 'User reactions to game logs and comments';
COMMENT ON TABLE notifications IS 'User notifications for social interactions';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit log for all security and data access events';
COMMENT ON TABLE key_rotation_logs IS 'Specialized audit log for encryption key rotation events';
COMMENT ON TABLE rls_access_logs IS 'Specialized audit log for Row-Level Security access events';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Note: This migration creates a complete database schema with:
-- - All tables with proper relationships and constraints
-- - Row-level security for user data protection
-- - Comprehensive audit logging infrastructure
-- - Performance indexes for optimal query performance
-- - UUID v7 standardization for consistent ID generation
-- - Database triggers and functions for automated operations

-- NOTE: Test data for friendship status should use uppercase values: 'PENDING', 'ACCEPTED', 'REJECTED'.
