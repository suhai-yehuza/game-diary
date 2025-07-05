-- ============================================================================
-- CONSOLIDATED MIGRATION: Complete Database Schema with Cascade Delete
-- ============================================================================
-- This migration consolidates all previous migrations into a single file
-- with cascade delete constraints already applied.

-- ============================================================================
-- SECTION 1: TABLE CREATION
-- ============================================================================

-- Create users table
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
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
	"external_id" varchar(255),
	"last_active_at" timestamp (6) with time zone,
	"last_sign_in_at" timestamp (6) with time zone,
	"bio" text,
	"timezone" varchar(50),
	"preferred_language" varchar(10) DEFAULT 'en',
	"inbound_friendship_ids" varchar(255)[] DEFAULT '{}' NOT NULL,
	"outbound_friendship_ids" varchar(255)[] DEFAULT '{}' NOT NULL
);

-- Create nba_games table
CREATE TABLE "nba_games" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	"game_type" varchar(50) DEFAULT 'nba' NOT NULL,
	"nba_game_id" varchar(255),
	"date" timestamp NOT NULL,
	"home_team_id" varchar(255) NOT NULL,
	"away_team_id" varchar(255) NOT NULL,
	"home_team_score" integer,
	"away_team_score" integer,
	"status" varchar(50) NOT NULL
);

-- Create teams table
CREATE TABLE "teams" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	"name" varchar(255) NOT NULL,
	"nickname" varchar(100),
	"code" varchar(10),
	"city" varchar(100),
	"logo" text,
	"all_star" boolean DEFAULT false NOT NULL,
	"nba_franchise" boolean DEFAULT false NOT NULL,
	"conference" varchar(100)
);

-- Create nba_players table
CREATE TABLE "nba_players" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"birth" text,
	"nba" text,
	"height" text,
	"weight" text,
	"college" varchar(100),
	"affiliation" varchar(100),
	"teams" text,
	"leagues" text,
	"image_url" text
);

-- Create leagues table
CREATE TABLE "leagues" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "leagues_name_unique" UNIQUE("name")
);

-- Create seasons table
CREATE TABLE "seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	CONSTRAINT "seasons_year_unique" UNIQUE("year")
);

-- Create friendships table
CREATE TABLE "friendships" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	"friend_id" varchar(255),
	"user_id" varchar(255),
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	CONSTRAINT "friendships_friend_id_user_id_unique" UNIQUE("friend_id","user_id")
);

-- Create game_logs table
CREATE TABLE "game_logs" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
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
	CONSTRAINT "game_logs_user_id_game_id_unique" UNIQUE("user_id","game_id")
);

-- Create game_ratings table
CREATE TABLE "game_ratings" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	"game_id" varchar(255) NOT NULL,
	"average_rating" numeric(3, 2) DEFAULT '0.00' NOT NULL,
	"total_ratings" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "game_ratings_game_id_unique" UNIQUE("game_id")
);

-- Create comments table
CREATE TABLE "comments" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	"user_id" varchar(255),
	"parent_id" varchar(255) NOT NULL,
	"parent_type" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"depth" integer DEFAULT 0 NOT NULL
);

-- Create reactions table
CREATE TABLE "reactions" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	"user_id" varchar(255),
	"target_type" varchar(50) NOT NULL,
	"target_id" varchar(255) NOT NULL,
	"emoji" varchar(10) NOT NULL,
	CONSTRAINT "reactions_user_id_target_type_target_id_emoji_unique" UNIQUE("user_id","target_type","target_id","emoji")
);

-- Create notifications table
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

-- ============================================================================
-- SECTION 2: FOREIGN KEY CONSTRAINTS WITH CASCADE DELETE
-- ============================================================================

-- Add CASCADE DELETE constraints for user-related tables
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friend_id_users_id_fk"
FOREIGN KEY ("friend_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_user_id_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Add CASCADE DELETE constraints for game-related tables
ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_game_id_nba_games_id_fk"
FOREIGN KEY ("game_id") REFERENCES "nba_games"("id") ON DELETE CASCADE;

ALTER TABLE "game_ratings" ADD CONSTRAINT "game_ratings_game_id_nba_games_id_fk"
FOREIGN KEY ("game_id") REFERENCES "nba_games"("id") ON DELETE CASCADE;

-- ============================================================================
-- SECTION 3: ADDITIONAL CONSTRAINTS AND INDEXES
-- ============================================================================

-- Add constraints for comments depth
ALTER TABLE "comments" ADD CONSTRAINT "comments_depth_check" CHECK (depth >= 0 AND depth <= 5);

-- Add constraints for game_logs watched settings
ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_watched_setting_check"
CHECK (watched_setting IN ('TV', 'ARENA', 'PHONE', 'LAPTOP', 'BAR', 'HOME', 'OTHER'));

ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_watched_scope_check"
CHECK (watched_scope IN ('FULL_GAME', 'HALF_GAME', 'HIGHLIGHTS', 'PRE_GAME', 'POST_GAME', 'SHORTS', 'OTHER'));

-- Add constraints for friendships status
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_status_check"
CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED'));

-- Add constraints for reactions target types and emojis
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_target_type_check"
CHECK (target_type IN ('game_log', 'comment', 'user'));

ALTER TABLE "reactions" ADD CONSTRAINT "reactions_emoji_check"
CHECK (emoji IN ('👍', '👎', '❤️', '🔥', '😄', '😢', '😡', '🤔'));

-- Add constraints for comments parent types
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_type_check"
CHECK (parent_type IN ('game_log', 'comment', 'user'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_comments_depth" ON "comments" ("depth");
CREATE INDEX IF NOT EXISTS "idx_comments_parent" ON "comments" ("parent_id", "parent_type");
CREATE INDEX IF NOT EXISTS "idx_comments_user" ON "comments" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_comments_created" ON "comments" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_comments_deleted_at" ON "comments" ("deleted_at");

CREATE INDEX IF NOT EXISTS "idx_reactions_target" ON "reactions" ("target_id", "target_type");
CREATE INDEX IF NOT EXISTS "idx_reactions_user" ON "reactions" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_reactions_emoji" ON "reactions" ("emoji");

CREATE INDEX IF NOT EXISTS "idx_notifications_user_id_resolved" ON "notifications" ("user_id", "resolved");
CREATE INDEX IF NOT EXISTS "idx_notifications_target_id_target_type" ON "notifications" ("target_id", "target_type");

CREATE INDEX IF NOT EXISTS "idx_users_inbound_friendships" ON "users" USING GIN ("inbound_friendship_ids");
CREATE INDEX IF NOT EXISTS "idx_users_outbound_friendships" ON "users" USING GIN ("outbound_friendship_ids");

-- ============================================================================
-- SECTION 4: TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to generate UUID v4
CREATE OR REPLACE FUNCTION generate_uuid_v4()
RETURNS VARCHAR AS $$
BEGIN
    RETURN gen_random_uuid()::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- Function to update game ratings when game logs change
CREATE OR REPLACE FUNCTION update_game_ratings()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle DELETE operations
    IF (TG_OP = 'DELETE') THEN
        -- Delete the game rating if no logs remain
        IF NOT EXISTS (SELECT 1 FROM game_logs WHERE game_id = OLD.game_id) THEN
            DELETE FROM game_ratings WHERE game_id = OLD.game_id;
        ELSE
            -- Update the average rating and total count
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

    -- Handle INSERT operations
    IF (TG_OP = 'INSERT') THEN
        -- Insert or update the game rating
        INSERT INTO game_ratings (game_id, average_rating, total_ratings, created_at, updated_at)
        SELECT
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

    -- Handle UPDATE operations
    IF (TG_OP = 'UPDATE') THEN
        -- Update the game rating
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

-- Function to create notifications for friendship events
CREATE OR REPLACE FUNCTION create_friend_request_notification()
RETURNS TRIGGER AS $$
DECLARE
    sender_username VARCHAR;
    sender_name VARCHAR;
BEGIN
    -- Create notification for new pending friend requests
    IF NEW.status = 'PENDING' AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'PENDING')) THEN
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
            generate_uuid_v4(), NEW.friend_id, 'friend_request', 'New Friend Request',
            sender_name || ' sent you a friend request', NEW.id, 'friendship',
            false, NOW(), NOW()
        );
    END IF;

    -- Create notification when friend request is accepted
    IF NEW.status = 'ACCEPTED' AND TG_OP = 'UPDATE' AND OLD.status = 'PENDING' THEN
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
            generate_uuid_v4(), NEW.user_id, 'friend_accepted', 'Friend Request Accepted',
            sender_name || ' accepted your friend request', NEW.id, 'friendship',
            false, NOW(), NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notifications for comments
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
    commenter_username VARCHAR;
    commenter_name VARCHAR;
    target_owner_id VARCHAR;
BEGIN
    -- Get commenter's username and name
    SELECT username, CONCAT(first_name, ' ', last_name)
    INTO commenter_username, commenter_name
    FROM users
    WHERE id = NEW.user_id;

    -- Use username if name is not available
    IF commenter_name IS NULL OR commenter_name = ' ' THEN
        commenter_name := commenter_username;
    END IF;

    -- Get target owner based on parent type
    IF NEW.parent_type = 'game_log' THEN
        SELECT user_id INTO target_owner_id
        FROM game_logs
        WHERE id = NEW.parent_id;
    ELSIF NEW.parent_type = 'comment' THEN
        SELECT user_id INTO target_owner_id
        FROM comments
        WHERE id = NEW.parent_id;
    END IF;

    -- Create notification if target owner exists and is different from commenter
    IF target_owner_id IS NOT NULL AND target_owner_id != NEW.user_id THEN
        INSERT INTO notifications (
            id, user_id, type, title, message, target_id, target_type,
            resolved, created_at, updated_at
        ) VALUES (
            generate_uuid_v4(), target_owner_id, 'comment', 'New Comment',
            commenter_name || ' commented on your ' || NEW.parent_type, NEW.id, 'comment',
            false, NOW(), NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notifications for reactions
CREATE OR REPLACE FUNCTION create_reaction_notification()
RETURNS TRIGGER AS $$
DECLARE
    reactor_username VARCHAR;
    reactor_name VARCHAR;
    target_owner_id VARCHAR;
BEGIN
    -- Get reactor's username and name
    SELECT username, CONCAT(first_name, ' ', last_name)
    INTO reactor_username, reactor_name
    FROM users
    WHERE id = NEW.user_id;

    -- Use username if name is not available
    IF reactor_name IS NULL OR reactor_name = ' ' THEN
        reactor_name := reactor_username;
    END IF;

    -- Get target owner based on target type
    IF NEW.target_type = 'game_log' THEN
        SELECT user_id INTO target_owner_id
        FROM game_logs
        WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'comment' THEN
        SELECT user_id INTO target_owner_id
        FROM comments
        WHERE id = NEW.target_id;
    END IF;

    -- Create notification if target owner exists and is different from reactor
    IF target_owner_id IS NOT NULL AND target_owner_id != NEW.user_id THEN
        INSERT INTO notifications (
            id, user_id, type, title, message, target_id, target_type,
            resolved, created_at, updated_at
        ) VALUES (
            generate_uuid_v4(), target_owner_id, 'reaction', 'New Reaction',
            reactor_name || ' reacted to your ' || NEW.target_type, NEW.id, 'reaction',
            false, NOW(), NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update friendship arrays in users table
CREATE OR REPLACE FUNCTION update_friendship_user_arrays()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF (TG_OP = 'INSERT') THEN
        -- Add to user's outbound friendships
        UPDATE users
        SET outbound_friendship_ids = array_append(outbound_friendship_ids, NEW.id)
        WHERE id = NEW.user_id;

        -- Add to friend's inbound friendships
        UPDATE users
        SET inbound_friendship_ids = array_append(inbound_friendship_ids, NEW.id)
        WHERE id = NEW.friend_id;
    END IF;

    -- Handle UPDATE
    IF (TG_OP = 'UPDATE') THEN
        -- Remove from old friend's inbound friendships
        UPDATE users
        SET inbound_friendship_ids = array_remove(inbound_friendship_ids, OLD.id)
        WHERE id = OLD.friend_id;

        -- Add to new friend's inbound friendships
        UPDATE users
        SET inbound_friendship_ids = array_append(inbound_friendship_ids, NEW.id)
        WHERE id = NEW.friend_id;
    END IF;

    -- Handle DELETE
    IF (TG_OP = 'DELETE') THEN
        -- Remove from user's outbound friendships
        UPDATE users
        SET outbound_friendship_ids = array_remove(outbound_friendship_ids, OLD.id)
        WHERE id = OLD.user_id;

        -- Remove from friend's inbound friendships
        UPDATE users
        SET inbound_friendship_ids = array_remove(inbound_friendship_ids, OLD.id)
        WHERE id = OLD.friend_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 5: CREATE TRIGGERS
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

-- Friendship arrays update triggers
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

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- This consolidated migration includes:
-- 1. All table creation with proper structure
-- 2. All foreign key constraints with CASCADE DELETE
-- 3. All additional constraints and indexes
-- 4. All triggers and functions for notifications and data consistency
-- 5. Complete cascade delete setup for user and game deletions
