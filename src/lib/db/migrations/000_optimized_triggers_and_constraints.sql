-- ============================================================================
-- SECTION 1: GAME RATINGS - Auto-update triggers
-- ============================================================================

-- Create function to update game ratings when game logs change
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

-- Create the game ratings trigger
CREATE TRIGGER game_logs_ratings_trigger
    AFTER INSERT OR UPDATE OR DELETE ON game_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_game_ratings();

-- ============================================================================
-- SECTION 2: FRIENDSHIP NOTIFICATIONS - Auto-notification triggers
-- ============================================================================

-- Function to generate UUID v4 (reusable utility)
CREATE OR REPLACE FUNCTION generate_uuid_v4()
RETURNS VARCHAR AS $$
BEGIN
    RETURN gen_random_uuid()::VARCHAR;
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
    IF NEW.status = 'Pending' AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'Pending')) THEN
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
    IF NEW.status = 'Accepted' AND TG_OP = 'UPDATE' AND OLD.status = 'Pending' THEN
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
            generate_uuid_v4(), NEW.user_id, 'friend_request_accepted', 'Friend Request Accepted',
            sender_name || ' accepted your friend request', NEW.id, 'friendship',
            false, NOW(), NOW()
        );
    END IF;

    -- Create notification when friend request is rejected
    IF NEW.status = 'Rejected' AND TG_OP = 'UPDATE' AND OLD.status = 'Pending' THEN
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
            generate_uuid_v4(), NEW.user_id, 'friend_request_rejected', 'Friend Request Declined',
            sender_name || ' declined your friend request', NEW.id, 'friendship',
            false, NOW(), NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create friendship notification triggers
CREATE TRIGGER friendship_notification_trigger
    AFTER INSERT OR UPDATE ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION create_friend_request_notification();

-- ============================================================================
-- SECTION 3: FRIENDSHIP USER ARRAYS - Track pending friendships in user arrays
-- ============================================================================

-- Function to update user friendship arrays (only tracks PENDING friendships)
CREATE OR REPLACE FUNCTION update_friendship_user_arrays()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Only add to arrays if the friendship is pending
        IF NEW.status = 'Pending' THEN
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
        IF OLD.status = 'Pending' AND NEW.status != 'Pending' THEN
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
        IF OLD.status = 'Pending' THEN
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

-- Create friendship user arrays triggers
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
-- SECTION 4: PERFORMANCE INDEXES
-- ============================================================================

-- Notification indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_resolved
    ON notifications(user_id, resolved);

CREATE INDEX IF NOT EXISTS idx_notifications_target_id_target_type
    ON notifications(target_id, target_type);

-- User friendship array indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_inbound_friendships
    ON users USING GIN(inbound_friendship_ids);

CREATE INDEX IF NOT EXISTS idx_users_outbound_friendships
    ON users USING GIN(outbound_friendship_ids);

-- ============================================================================
-- SECTION 5: UTILITY FUNCTIONS
-- ============================================================================

-- Function to rebuild friendship arrays (utility for data consistency)
-- Can be called manually if needed to fix any inconsistencies
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

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- This migration includes:
-- 1. Auto-updating game ratings triggers
-- 2. Friendship notification triggers
-- 3. User friendship array maintenance triggers
-- 4. Performance indexes for all new functionality
-- 5. Utility functions for maintenance
-- ============================================================================
