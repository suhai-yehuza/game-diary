-- 001_notification_functions.sql
-- Notification functions for social interactions
--
-- This file contains functions for:
-- - Game rating calculations
-- - Friendship notifications
-- - Comment notifications
-- - Reaction notifications
-- - Friendship array management

-- ============================================================================
-- NOTIFICATION FUNCTIONS
-- ============================================================================

-- UUID v7 generation function
CREATE OR REPLACE FUNCTION generate_uuid_v7()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Game ratings update function
CREATE OR REPLACE FUNCTION update_game_ratings()
RETURNS TRIGGER AS $$
DECLARE
    game_id_var TEXT;
    avg_rating DECIMAL(4,2);
    total_count INTEGER;
BEGIN
    -- Determine the game_id based on the operation
    IF TG_OP = 'DELETE' THEN
        game_id_var := OLD.game_id;
    ELSE
        game_id_var := NEW.game_id;
    END IF;

    -- Calculate new average and total
    SELECT
        COALESCE(AVG(rating_for_game), 0),
        COUNT(*)
    INTO avg_rating, total_count
    FROM game_logs
    WHERE game_id = game_id_var;

    -- Insert or update the game_ratings record
    INSERT INTO game_ratings (id, game_id, average_rating, total_ratings, created_at, updated_at)
    VALUES (generate_uuid_v7(), game_id_var, avg_rating, total_count, NOW(), NOW())
    ON CONFLICT (game_id)
    DO UPDATE SET
        average_rating = EXCLUDED.average_rating,
        total_ratings = EXCLUDED.total_ratings,
        updated_at = NOW();

    -- Return appropriate record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Friend request notification function
CREATE OR REPLACE FUNCTION create_friend_request_notification()
RETURNS TRIGGER AS $$
DECLARE
    requester_username VARCHAR;
    requester_name VARCHAR;
    recipient_username VARCHAR;
    recipient_name VARCHAR;
BEGIN
    -- Only create notifications for status changes
    IF TG_OP = 'INSERT' AND NEW.status = 'PENDING' THEN
        -- Get requester info
        SELECT username, CONCAT(first_name, ' ', last_name)
        INTO requester_username, requester_name
        FROM users
        WHERE id = NEW.user_id;

        -- Use username if name is not available
        IF requester_name IS NULL OR requester_name = ' ' THEN
            requester_name := requester_username;
        END IF;

        -- Create notification for the recipient
        INSERT INTO notifications (
            id, user_id, type, title, message, target_id, target_type,
            resolved, created_at, updated_at
        ) VALUES (
            generate_uuid_v7(), NEW.friend_id, 'friend_request', 'Friend Request',
            requester_name || ' sent you a friend request', NEW.id, 'friendship',
            false, NOW(), NOW()
        );

    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes
        IF OLD.status = 'PENDING' AND NEW.status = 'ACCEPTED' THEN
            -- Get recipient info (the one who accepted)
            SELECT username, CONCAT(first_name, ' ', last_name)
            INTO recipient_username, recipient_name
            FROM users
            WHERE id = NEW.friend_id;

            -- Use username if name is not available
            IF recipient_name IS NULL OR recipient_name = ' ' THEN
                recipient_name := recipient_username;
            END IF;

            -- Create notification for the original requester
            INSERT INTO notifications (
                id, user_id, type, title, message, target_id, target_type,
                resolved, created_at, updated_at
            ) VALUES (
                generate_uuid_v7(), NEW.user_id, 'friend_accepted', 'Friend Request Accepted',
                recipient_name || ' accepted your friend request', NEW.id, 'friendship',
                false, NOW(), NOW()
            );

        ELSIF OLD.status = 'PENDING' AND NEW.status = 'REJECTED' THEN
            -- Get recipient info (the one who rejected)
            SELECT username, CONCAT(first_name, ' ', last_name)
            INTO recipient_username, recipient_name
            FROM users
            WHERE id = NEW.friend_id;

            -- Use username if name is not available
            IF recipient_name IS NULL OR recipient_name = ' ' THEN
                recipient_name := recipient_username;
            END IF;

            -- Create notification for the original requester
            INSERT INTO notifications (
                id, user_id, type, title, message, target_id, target_type,
                resolved, created_at, updated_at
            ) VALUES (
                generate_uuid_v7(), NEW.user_id, 'friend_rejected', 'Friend Request Rejected',
                recipient_name || ' rejected your friend request', NEW.id, 'friendship',
                false, NOW(), NOW()
            );
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Comment notification function
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
    commenter_username VARCHAR;
    commenter_name VARCHAR;
    target_user_id TEXT;
    target_type_var TEXT;
    target_content TEXT;
BEGIN
    -- Don't create notifications for self-comments
    IF NEW.user_id = (
        CASE
            WHEN NEW.parent_type = 'GAME_LOG' THEN
                (SELECT user_id FROM game_logs WHERE id = NEW.parent_id)
            WHEN NEW.parent_type = 'COMMENT' THEN
                (SELECT user_id FROM comments WHERE id = NEW.parent_id)
        END
    ) THEN
        RETURN NEW;
    END IF;

    -- Get commenter info
    SELECT username, CONCAT(first_name, ' ', last_name)
    INTO commenter_username, commenter_name
    FROM users
    WHERE id = NEW.user_id;

    -- Use username if name is not available
    IF commenter_name IS NULL OR commenter_name = ' ' THEN
        commenter_name := commenter_username;
    END IF;

    -- Determine target user and content
    IF NEW.parent_type = 'GAME_LOG' THEN
        SELECT user_id, 'game log'
        INTO target_user_id, target_content
        FROM game_logs
        WHERE id = NEW.parent_id;
    ELSIF NEW.parent_type = 'COMMENT' THEN
        SELECT user_id, 'comment'
        INTO target_user_id, target_content
        FROM comments
        WHERE id = NEW.parent_id;
    END IF;

    -- Create notification
    INSERT INTO notifications (
        id, user_id, type, title, message, target_id, target_type,
        resolved, created_at, updated_at
    ) VALUES (
        generate_uuid_v7(), target_user_id, 'comment', 'New Comment',
        commenter_name || ' commented on your ' || target_content, NEW.id, 'comment',
        false, NOW(), NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Reaction notification function
CREATE OR REPLACE FUNCTION create_reaction_notification()
RETURNS TRIGGER AS $$
DECLARE
    reactor_username VARCHAR;
    reactor_name VARCHAR;
    target_user_id TEXT;
    target_type_var TEXT;
    target_content TEXT;
BEGIN
    -- Don't create notifications for self-reactions
    IF NEW.user_id = (
        CASE
            WHEN NEW.target_type = 'GAME_LOG' THEN
                (SELECT user_id FROM game_logs WHERE id = NEW.target_id)
            WHEN NEW.target_type = 'COMMENT' THEN
                (SELECT user_id FROM comments WHERE id = NEW.target_id)
        END
    ) THEN
        RETURN NEW;
    END IF;

    -- Get reactor info
    SELECT username, CONCAT(first_name, ' ', last_name)
    INTO reactor_username, reactor_name
    FROM users
    WHERE id = NEW.user_id;

    -- Use username if name is not available
    IF reactor_name IS NULL OR reactor_name = ' ' THEN
        reactor_name := reactor_username;
    END IF;

    -- Determine target user and content
    IF NEW.target_type = 'GAME_LOG' THEN
        SELECT user_id, 'game log'
        INTO target_user_id, target_content
        FROM game_logs
        WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'COMMENT' THEN
        SELECT user_id, 'comment'
        INTO target_user_id, target_content
        FROM comments
        WHERE id = NEW.target_id;
    END IF;

    -- Create notification
    INSERT INTO notifications (
        id, user_id, type, title, message, target_id, target_type,
        resolved, created_at, updated_at
    ) VALUES (
        generate_uuid_v7(), target_user_id, 'reaction', 'New Reaction',
        reactor_name || ' reacted ' || NEW.emoji || ' to your ' || target_content, NEW.id, 'reaction',
        false, NOW(), NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Friendship user arrays update function
CREATE OR REPLACE FUNCTION update_friendship_user_arrays()
RETURNS TRIGGER AS $$
DECLARE
    user_id_var TEXT;
    friend_id_var TEXT;
    friendship_id_var TEXT;
BEGIN
    -- Determine the operation and get the relevant IDs
    IF TG_OP = 'DELETE' THEN
        user_id_var := OLD.user_id;
        friend_id_var := OLD.friend_id;
        friendship_id_var := OLD.id;

        -- Remove from both users' arrays
        UPDATE users
        SET outbound_friendship_ids = array_remove(outbound_friendship_ids, friendship_id_var),
            updated_at = NOW()
        WHERE id = user_id_var;

        UPDATE users
        SET inbound_friendship_ids = array_remove(inbound_friendship_ids, friendship_id_var),
            updated_at = NOW()
        WHERE id = friend_id_var;

        RETURN OLD;
    ELSE
        user_id_var := NEW.user_id;
        friend_id_var := NEW.friend_id;
        friendship_id_var := NEW.id;

        -- Add to both users' arrays
        UPDATE users
        SET outbound_friendship_ids = array_append(
            COALESCE(outbound_friendship_ids, ARRAY[]::TEXT[]),
            friendship_id_var
        ),
        updated_at = NOW()
        WHERE id = user_id_var;

        UPDATE users
        SET inbound_friendship_ids = array_append(
            COALESCE(inbound_friendship_ids, ARRAY[]::TEXT[]),
            friendship_id_var
        ),
        updated_at = NOW()
        WHERE id = friend_id_var;

        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Rebuild friendship arrays function
CREATE OR REPLACE FUNCTION rebuild_user_friendship_arrays()
RETURNS VOID AS $$
BEGIN
    -- Clear all friendship arrays
    UPDATE users SET
        inbound_friendship_ids = ARRAY[]::TEXT[],
        outbound_friendship_ids = ARRAY[]::TEXT[],
        updated_at = NOW();

    -- Rebuild arrays from friendships table
    UPDATE users SET
        outbound_friendship_ids = (
            SELECT array_agg(id)
            FROM friendships
            WHERE user_id = users.id
        ),
        updated_at = NOW();

    UPDATE users SET
        inbound_friendship_ids = (
            SELECT array_agg(id)
            FROM friendships
            WHERE friend_id = users.id
        ),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Friend removed notification function
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
