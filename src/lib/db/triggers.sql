-- ============================================================================
-- DATABASE TRIGGERS AND FUNCTIONS
-- ============================================================================
-- This file contains all trigger functions and definitions
-- Used by both migrations and setup scripts for consistency

-- UUID v7 generation function
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

-- ============================================================================
-- RLS HELPER FUNCTIONS
-- ============================================================================

-- RLS helper functions
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

-- Game ratings update function
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

        BEGIN
            -- Create notification for the recipient
            INSERT INTO notifications (
                id, user_id, type, title, message, target_id, target_type,
                resolved, created_at, updated_at
            ) VALUES (
                generate_uuid_v7(), NEW.friend_id, 'friend_request', 'New Friend Request',
                sender_name || ' sent you a friend request', NEW.id, 'friendship',
                false, NOW(), NOW()
            );
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Friend request notification insert failed: %', SQLERRM;
        END;
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

        BEGIN
            -- Create notification for the original sender
            INSERT INTO notifications (
                id, user_id, type, title, message, target_id, target_type,
                resolved, created_at, updated_at
            ) VALUES (
                generate_uuid_v7(), NEW.user_id, 'friend_request_accepted', 'Friend Request Accepted',
                sender_name || ' accepted your friend request', NEW.id, 'friendship',
                false, NOW(), NOW()
            );
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Friend request acceptance notification insert failed: %', SQLERRM;
        END;
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

        BEGIN
            -- Create notification for the original sender
            INSERT INTO notifications (
                id, user_id, type, title, message, target_id, target_type,
                resolved, created_at, updated_at
            ) VALUES (
                generate_uuid_v7(), NEW.user_id, 'friend_request_rejected', 'Friend Request Declined',
                sender_name || ' declined your friend request', NEW.id, 'friendship',
                false, NOW(), NOW()
            );
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Friend request rejection notification insert failed: %', SQLERRM;
        END;
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

            -- Create notification for game log owner
            INSERT INTO notifications (
                id, user_id, type, title, message, target_id, target_type,
                resolved, created_at, updated_at
            ) VALUES (
                generate_uuid_v7(), target_owner_id, 'reaction_added', 'New Reaction on Your Game Log',
                reactor_name || ' reacted with ' || NEW.emoji || ' to your game log', NEW.id, 'reaction',
                false, NOW(), NOW()
            );

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

            -- Create notification for comment owner
            INSERT INTO notifications (
                id, user_id, type, title, message, target_id, target_type,
                resolved, created_at, updated_at
            ) VALUES (
                generate_uuid_v7(), target_owner_id, 'reaction_added', 'New Reaction on Your comment',
                reactor_name || ' reacted with ' || NEW.emoji || ' to your comment', NEW.id, 'reaction',
                false, NOW(), NOW()
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Friendship user arrays update function
CREATE OR REPLACE FUNCTION update_friendship_user_arrays()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT operations
    IF TG_OP = 'INSERT' THEN
        -- Add friend_id to user's outbound_friendship_ids array
        UPDATE users
        SET outbound_friendship_ids = array_append(outbound_friendship_ids, NEW.friend_id)
        WHERE id = NEW.user_id;

        -- Add user_id to friend's inbound_friendship_ids array
        UPDATE users
        SET inbound_friendship_ids = array_append(inbound_friendship_ids, NEW.user_id)
        WHERE id = NEW.friend_id;
    END IF;

    -- Handle UPDATE operations
    IF TG_OP = 'UPDATE' THEN
        -- If status changed from PENDING to ACCEPTED, update arrays accordingly
        IF UPPER(OLD.status) = 'PENDING' AND UPPER(NEW.status) = 'ACCEPTED' THEN
            -- The arrays remain the same, just the status changes
            -- No array updates needed for this transition
        END IF;

        -- If status changed from PENDING to REJECTED, remove from arrays
        IF UPPER(OLD.status) = 'PENDING' AND UPPER(NEW.status) = 'REJECTED' THEN
            -- Remove friend_id from user's outbound_friendship_ids array
            UPDATE users
            SET outbound_friendship_ids = array_remove(outbound_friendship_ids, NEW.friend_id)
            WHERE id = NEW.user_id;

            -- Remove user_id from friend's inbound_friendship_ids array
            UPDATE users
            SET inbound_friendship_ids = array_remove(inbound_friendship_ids, NEW.user_id)
            WHERE id = NEW.friend_id;
        END IF;
    END IF;

    -- Handle DELETE operations
    IF TG_OP = 'DELETE' THEN
        -- Remove friend_id from user's outbound_friendship_ids array
        UPDATE users
        SET outbound_friendship_ids = array_remove(outbound_friendship_ids, OLD.friend_id)
        WHERE id = OLD.user_id;

        -- Remove user_id from friend's inbound_friendship_ids array
        UPDATE users
        SET inbound_friendship_ids = array_remove(inbound_friendship_ids, OLD.user_id)
        WHERE id = OLD.friend_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Rebuild user friendship arrays function
CREATE OR REPLACE FUNCTION rebuild_user_friendship_arrays()
RETURNS void AS $$
BEGIN
    -- Clear all friendship arrays
    UPDATE users SET
        inbound_friendship_ids = '{}',
        outbound_friendship_ids = '{}';

    -- Rebuild outbound friendship arrays (friendships initiated by this user)
    UPDATE users u SET
        outbound_friendship_ids = (
            SELECT array_agg(f.friend_id)
            FROM friendships f
            WHERE f.user_id = u.id
        );

    -- Rebuild inbound friendship arrays (friendships received by this user)
    UPDATE users u SET
        inbound_friendship_ids = (
            SELECT array_agg(f.user_id)
            FROM friendships f
            WHERE f.friend_id = u.id
        );
END;
$$ LANGUAGE plpgsql;

-- Friend removal notification function
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

    BEGIN
        -- Create notification for the friend
        INSERT INTO notifications (
            id, user_id, type, title, message, target_id, target_type,
            resolved, created_at, updated_at
        ) VALUES (
            generate_uuid_v7(), OLD.friend_id, 'friend_removed', 'Friend Removed',
            remover_name || ' removed you as a friend', OLD.id, 'friendship',
            false, NOW(), NOW()
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Friend removal notification insert failed: %', SQLERRM;
    END;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER DEFINITIONS
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
