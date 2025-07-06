-- ============================================================================
-- CONSOLIDATED MIGRATION: INITIAL SCHEMA, CONSTRAINTS, TRIGGERS, FUNCTIONS
-- This file combines all schema, constraints, triggers, and logic for a fresh DB
-- ============================================================================

-- =========================
-- TABLE CREATION
-- =========================

-- Users
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
	"deleted_at" timestamp (6) with time zone
);

-- Friendships
CREATE TABLE "friendships" (
	"friend_id" varchar(255),
	"user_id" varchar(255),
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	CONSTRAINT "friendships_friend_id_user_id_unique" UNIQUE("friend_id","user_id")
);

-- Comments
CREATE TABLE "comments" (
	"user_id" varchar(255),
	"parent_id" varchar(255) NOT NULL,
	"parent_type" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"depth" integer DEFAULT 0 NOT NULL,
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone
);

-- Game Logs
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
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	CONSTRAINT "game_logs_user_id_game_id_unique" UNIQUE("user_id","game_id")
);

-- Game Ratings
CREATE TABLE "game_ratings" (
	"game_id" varchar(255) NOT NULL,
	"average_rating" numeric(4, 2) DEFAULT '0.00' NOT NULL,
	"total_ratings" integer DEFAULT 0 NOT NULL,
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	CONSTRAINT "game_ratings_game_id_unique" UNIQUE("game_id")
);

-- Leagues
CREATE TABLE "leagues" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "leagues_name_unique" UNIQUE("name")
);

-- NBA Games
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
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone
);

-- NBA Players
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

-- Notifications
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

-- Reactions
CREATE TABLE "reactions" (
	"user_id" varchar(255),
	"target_type" varchar(50) NOT NULL,
	"target_id" varchar(255) NOT NULL,
	"emoji" varchar(10) NOT NULL,
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp (6) with time zone,
	CONSTRAINT "reactions_user_id_target_type_target_id_emoji_unique" UNIQUE("user_id","target_type","target_id","emoji")
);

-- Seasons
CREATE TABLE "seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	CONSTRAINT "seasons_year_unique" UNIQUE("year")
);

-- Teams
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

-- =========================
-- FOREIGN KEYS
-- =========================

ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friend_id_users_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "game_logs" ADD CONSTRAINT "game_logs_game_id_nba_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."nba_games"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "game_ratings" ADD CONSTRAINT "game_ratings_game_id_nba_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."nba_games"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- =========================
-- CONSTRAINTS, TRIGGERS, FUNCTIONS, INDEXES
-- =========================

-- SECTION 1: COMMENT DEPTH - Add depth field for nested comments
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "depth" integer NOT NULL DEFAULT 0;
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

CREATE INDEX IF NOT EXISTS "idx_comments_depth" ON "comments" ("depth");
UPDATE "comments" SET "depth" = 0 WHERE "depth" IS NULL;

-- SECTION 2: GAME RATINGS - Auto-update triggers
CREATE OR REPLACE FUNCTION update_game_ratings()
RETURNS TRIGGER AS $$
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
            gen_random_uuid()::text,
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
DROP TRIGGER IF EXISTS game_logs_ratings_trigger ON game_logs;
CREATE TRIGGER game_logs_ratings_trigger
    AFTER INSERT OR UPDATE OR DELETE ON game_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_game_ratings();

-- SECTION 3: FRIENDSHIP NOTIFICATIONS - Auto-notification triggers
CREATE OR REPLACE FUNCTION generate_uuid_v4()
RETURNS VARCHAR AS $$
BEGIN
    RETURN gen_random_uuid()::VARCHAR;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_friend_request_notification()
RETURNS TRIGGER AS $$
DECLARE
    sender_username VARCHAR;
    sender_name VARCHAR;
BEGIN
    IF NEW.status = 'Pending' AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'Pending')) THEN
        SELECT username, CONCAT(first_name, ' ', last_name)
        INTO sender_username, sender_name
        FROM users
        WHERE id = NEW.user_id;
        IF sender_name IS NULL OR sender_name = ' ' THEN
            sender_name := sender_username;
        END IF;
        INSERT INTO notifications (
            id, user_id, type, title, message, target_id, target_type,
            resolved, created_at, updated_at
        ) VALUES (
            generate_uuid_v4(), NEW.friend_id, 'friend_request', 'New Friend Request',
            sender_name || ' sent you a friend request', NEW.id, 'friendship',
            false, NOW(), NOW()
        );
    END IF;
    IF NEW.status = 'Accepted' AND TG_OP = 'UPDATE' AND OLD.status = 'Pending' THEN
        SELECT username, CONCAT(first_name, ' ', last_name)
        INTO sender_username, sender_name
        FROM users
        WHERE id = NEW.friend_id;
        IF sender_name IS NULL OR sender_name = ' ' THEN
            sender_name := sender_username;
        END IF;
        INSERT INTO notifications (
            id, user_id, type, title, message, target_id, target_type,
            resolved, created_at, updated_at
        ) VALUES (
            generate_uuid_v4(), NEW.user_id, 'friend_request_accepted', 'Friend Request Accepted',
            sender_name || ' accepted your friend request', NEW.id, 'friendship',
            false, NOW(), NOW()
        );
    END IF;
    IF NEW.status = 'Rejected' AND TG_OP = 'UPDATE' AND OLD.status = 'Pending' THEN
        SELECT username, CONCAT(first_name, ' ', last_name)
        INTO sender_username, sender_name
        FROM users
        WHERE id = NEW.friend_id;
        IF sender_name IS NULL OR sender_name = ' ' THEN
            sender_name := sender_username;
        END IF;
        INSERT INTO notifications (
            id, user_id, type, title, message, target_id, target_type,
            resolved, created_at, updated_at
        ) VALUES (
            generate_uuid_v4(), NEW.user_id, 'friend_request_rejected', 'Friend Request Declined',
            sender_name || ' declined your friend request', NEW.id, 'friendship',
            false, NOW(), NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER friendship_notification_trigger
    AFTER INSERT OR UPDATE ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION create_friend_request_notification();

-- SECTION 4: COMMENT NOTIFICATIONS - Auto-notification triggers
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
    commenter_username VARCHAR;
    commenter_name VARCHAR;
    target_owner_id VARCHAR;
    target_title VARCHAR;
    target_content VARCHAR;
BEGIN
    IF TG_OP = 'INSERT' THEN
        SELECT username, CONCAT(first_name, ' ', last_name)
        INTO commenter_username, commenter_name
        FROM users
        WHERE id = NEW.user_id;
        IF commenter_name IS NULL OR commenter_name = ' ' THEN
            commenter_name := commenter_username;
        END IF;
        IF NEW.parent_type = 'GAME_LOG' THEN
            SELECT user_id, notes
            INTO target_owner_id, target_content
            FROM game_logs
            WHERE id = NEW.parent_id;
            IF target_owner_id = NEW.user_id THEN
                RETURN NEW;
            END IF;
            INSERT INTO notifications (
                id, user_id, type, title, message, target_id, target_type,
                resolved, created_at, updated_at
            ) VALUES (
                generate_uuid_v4(), target_owner_id, 'comment_added', 'New Comment on Your Game Log',
                commenter_name || ' commented on your game log', NEW.id, 'comment',
                false, NOW(), NOW()
            );
        ELSIF NEW.parent_type = 'COMMENT' THEN
            SELECT user_id, content
            INTO target_owner_id, target_content
            FROM comments
            WHERE id = NEW.parent_id;
            IF target_owner_id = NEW.user_id THEN
                RETURN NEW;
            END IF;
            INSERT INTO notifications (
                id, user_id, type, title, message, target_id, target_type,
                resolved, created_at, updated_at
            ) VALUES (
                generate_uuid_v4(), target_owner_id, 'comment_reply', 'New Reply to Your Comment',
                commenter_name || ' replied to your comment', NEW.id, 'comment',
                false, NOW(), NOW()
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER comment_notification_trigger
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION create_comment_notification();

-- SECTION 5: REACTION NOTIFICATIONS - Auto-notification triggers
CREATE OR REPLACE FUNCTION create_reaction_notification()
RETURNS TRIGGER AS $$
DECLARE
    reactor_username VARCHAR;
    reactor_name VARCHAR;
    target_owner_id VARCHAR;
    target_content VARCHAR;
    target_type_name VARCHAR;
BEGIN
    IF TG_OP = 'INSERT' THEN
        SELECT username, CONCAT(first_name, ' ', last_name)
        INTO reactor_username, reactor_name
        FROM users
        WHERE id = NEW.user_id;
        IF reactor_name IS NULL OR reactor_name = ' ' THEN
            reactor_name := reactor_username;
        END IF;
        IF NEW.target_type = 'GAME_LOG' THEN
            SELECT user_id, notes
            INTO target_owner_id, target_content
            FROM game_logs
            WHERE id = NEW.target_id;
            IF target_owner_id = NEW.user_id THEN
                RETURN NEW;
            END IF;
            target_type_name := 'game log';
        ELSIF NEW.target_type = 'COMMENT' THEN
            SELECT user_id, content
            INTO target_owner_id, target_content
            FROM comments
            WHERE id = NEW.target_id;
            IF target_owner_id = NEW.user_id THEN
                RETURN NEW;
            END IF;
            target_type_name := 'comment';
        END IF;
        INSERT INTO notifications (
            id, user_id, type, title, message, target_id, target_type,
            resolved, created_at, updated_at
        ) VALUES (
            generate_uuid_v4(), target_owner_id, 'reaction_added', 'New Reaction on Your ' || target_type_name,
            reactor_name || ' reacted with ' || NEW.emoji || ' to your ' || target_type_name, NEW.id, 'reaction',
            false, NOW(), NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER reaction_notification_trigger
    AFTER INSERT ON reactions
    FOR EACH ROW
    EXECUTE FUNCTION create_reaction_notification();

-- SECTION 6: FRIENDSHIP USER ARRAYS - Track pending friendships in user arrays
CREATE OR REPLACE FUNCTION update_friendship_user_arrays()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'Pending' THEN
            UPDATE users
            SET outbound_friendship_ids = array_append(COALESCE(outbound_friendship_ids, ARRAY[]::VARCHAR[]), NEW.id)
            WHERE id = NEW.user_id;
            UPDATE users
            SET inbound_friendship_ids = array_append(COALESCE(inbound_friendship_ids, ARRAY[]::VARCHAR[]), NEW.id)
            WHERE id = NEW.friend_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'Pending' AND NEW.status != 'Pending' THEN
            UPDATE users
            SET outbound_friendship_ids = array_remove(COALESCE(outbound_friendship_ids, ARRAY[]::VARCHAR[]), OLD.id)
            WHERE id = OLD.user_id;
            UPDATE users
            SET inbound_friendship_ids = array_remove(COALESCE(inbound_friendship_ids, ARRAY[]::VARCHAR[]), OLD.id)
            WHERE id = OLD.friend_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.status = 'Pending' THEN
            UPDATE users
            SET outbound_friendship_ids = array_remove(COALESCE(outbound_friendship_ids, ARRAY[]::VARCHAR[]), OLD.id)
            WHERE id = OLD.user_id;
            UPDATE users
            SET inbound_friendship_ids = array_remove(COALESCE(inbound_friendship_ids, ARRAY[]::VARCHAR[]), OLD.id)
            WHERE id = OLD.friend_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
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

-- SECTION 7: PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_resolved
    ON notifications(user_id, resolved);
CREATE INDEX IF NOT EXISTS idx_notifications_target_id_target_type
    ON notifications(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_users_inbound_friendships
    ON users USING GIN(inbound_friendship_ids);
CREATE INDEX IF NOT EXISTS idx_users_outbound_friendships
    ON users USING GIN(outbound_friendship_ids);

-- SECTION 5: UTILITY FUNCTIONS
CREATE OR REPLACE FUNCTION rebuild_user_friendship_arrays()
RETURNS void AS $$
BEGIN
    UPDATE users u
    SET
        outbound_friendship_ids = COALESCE((
            SELECT array_agg(f.id)
            FROM friendships f
            WHERE f.user_id = u.id AND f.status = 'Pending'
        ), ARRAY[]::VARCHAR[]),
        inbound_friendship_ids = COALESCE((
            SELECT array_agg(f.id)
            FROM friendships f
            WHERE f.friend_id = u.id AND f.status = 'Pending'
        ), ARRAY[]::VARCHAR[]);
END;
$$ LANGUAGE plpgsql;
