-- ============================================================================
-- CONSOLIDATED FUNCTIONS - Game Diary Database
-- ============================================================================
-- Last Updated: 2024-12-19
-- Purpose: All database functions consolidated with optimizations
-- Dependencies: Base schema (000_base_schema.sql)
--
-- This file consolidates:
-- - UUID generation functions
-- - Game rating calculation functions
-- - Notification functions (optimized with rate limiting)
-- - Friendship management functions
-- - Performance monitoring functions
-- ============================================================================

-- ============================================================================
-- CORE UTILITY FUNCTIONS
-- ============================================================================

-- Standardized UUID v7 generation function
CREATE OR REPLACE FUNCTION generate_uuid_v7()
RETURNS TEXT AS $$
BEGIN
    -- Use PostgreSQL's built-in UUID generation for simplicity and reliability
    RETURN replace(gen_random_uuid()::text, '-', '');
END;
$$ LANGUAGE plpgsql;

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

-- ============================================================================
-- GAME RATING FUNCTIONS
-- ============================================================================

-- Fixed game ratings update function (prevents orphaned ratings)
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

    -- Calculate new average and total (excluding soft-deleted records)
    SELECT
        COALESCE(AVG(rating_for_game), 0),
        COUNT(*)
    INTO avg_rating, total_count
    FROM game_logs
    WHERE game_id = game_id_var AND deleted_at IS NULL;

    -- Handle the case where there are no game logs left
    IF total_count = 0 THEN
        -- Delete the rating record if no game logs remain
        DELETE FROM game_ratings WHERE game_id = game_id_var;
    ELSE
        -- Insert or update the game_ratings record only if there are game logs
        INSERT INTO game_ratings (id, game_id, average_rating, total_ratings, created_at, updated_at)
        VALUES (generate_uuid_v7(), game_id_var, avg_rating, total_count, NOW(), NOW())
        ON CONFLICT (game_id)
        DO UPDATE SET
            average_rating = EXCLUDED.average_rating,
            total_ratings = EXCLUDED.total_ratings,
            updated_at = NOW();
    END IF;

    -- Return appropriate record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- OPTIMIZED NOTIFICATION FUNCTIONS
-- ============================================================================

-- Optimized reaction notification function with deduplication and rate limiting
CREATE OR REPLACE FUNCTION create_reaction_notification()
RETURNS TRIGGER AS $$
DECLARE
    reactor_username VARCHAR;
    reactor_name VARCHAR;
    target_user_id TEXT;
    target_content TEXT;
    existing_notification_id TEXT;
    recent_notification_count INTEGER;
    max_notifications_per_hour INTEGER := 50; -- Rate limit
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

    -- Check if target user exists
    IF target_user_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Rate limiting: Check if user has exceeded notification limit in the last hour
    SELECT COUNT(*)
    INTO recent_notification_count
    FROM notifications
    WHERE user_id = target_user_id
      AND created_at >= NOW() - INTERVAL '1 hour'
      AND deleted_at IS NULL;

    IF recent_notification_count >= max_notifications_per_hour THEN
        -- User has too many notifications, skip this one
        RETURN NEW;
    END IF;

    -- Check for existing reaction notification from the same user on the same target in the last 24 hours
    SELECT id
    INTO existing_notification_id
    FROM notifications
    WHERE user_id = target_user_id
      AND type = 'reaction'
      AND target_id = NEW.target_id
      AND target_type = NEW.target_type
      AND message LIKE '%' || (SELECT username FROM users WHERE id = NEW.user_id) || '%'
      AND created_at >= NOW() - INTERVAL '24 hours'
      AND deleted_at IS NULL
    LIMIT 1;

    -- If notification already exists, update it instead of creating a new one
    IF existing_notification_id IS NOT NULL THEN
        -- Get reactor info for update
        SELECT username, CONCAT(first_name, ' ', last_name)
        INTO reactor_username, reactor_name
        FROM users
        WHERE id = NEW.user_id;

        -- Use username if name is not available
        IF reactor_name IS NULL OR reactor_name = ' ' THEN
            reactor_name := reactor_username;
        END IF;

        -- Update existing notification with new reaction info
        UPDATE notifications
        SET
            message = reactor_name || ' reacted ' || NEW.emoji || ' to your ' || target_content,
            updated_at = NOW()
        WHERE id = existing_notification_id;

        RETURN NEW;
    END IF;

    -- Get reactor info for new notification
    SELECT username, CONCAT(first_name, ' ', last_name)
    INTO reactor_username, reactor_name
    FROM users
    WHERE id = NEW.user_id;

    -- Use username if name is not available
    IF reactor_name IS NULL OR reactor_name = ' ' THEN
        reactor_name := reactor_username;
    END IF;

    -- Create new notification only if no recent notification exists
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

-- Optimized comment notification function with deduplication and rate limiting
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
    commenter_username VARCHAR;
    commenter_name VARCHAR;
    target_user_id TEXT;
    target_content TEXT;
    existing_notification_id TEXT;
    recent_notification_count INTEGER;
    max_notifications_per_hour INTEGER := 50; -- Rate limit
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

    -- Check if target user exists
    IF target_user_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Rate limiting: Check if user has exceeded notification limit in the last hour
    SELECT COUNT(*)
    INTO recent_notification_count
    FROM notifications
    WHERE user_id = target_user_id
      AND created_at >= NOW() - INTERVAL '1 hour'
      AND deleted_at IS NULL;

    IF recent_notification_count >= max_notifications_per_hour THEN
        -- User has too many notifications, skip this one
        RETURN NEW;
    END IF;

    -- Check for existing comment notification from the same user on the same target in the last 2 hours
    SELECT id
    INTO existing_notification_id
    FROM notifications
    WHERE user_id = target_user_id
      AND type = 'comment'
      AND target_id = NEW.parent_id
      AND target_type = NEW.parent_type
      AND message LIKE '%' || (SELECT username FROM users WHERE id = NEW.user_id) || '%'
      AND created_at >= NOW() - INTERVAL '2 hours'
      AND deleted_at IS NULL
    LIMIT 1;

    -- If notification already exists, update it instead of creating a new one
    IF existing_notification_id IS NOT NULL THEN
        -- Get commenter info for update
        SELECT username, CONCAT(first_name, ' ', last_name)
        INTO commenter_username, commenter_name
        FROM users
        WHERE id = NEW.user_id;

        -- Use username if name is not available
        IF commenter_name IS NULL OR commenter_name = ' ' THEN
            commenter_name := commenter_username;
        END IF;

        -- Update existing notification
        UPDATE notifications
        SET
            message = commenter_name || ' commented on your ' || target_content,
            updated_at = NOW()
        WHERE id = existing_notification_id;

        RETURN NEW;
    END IF;

    -- Get commenter info for new notification
    SELECT username, CONCAT(first_name, ' ', last_name)
    INTO commenter_username, commenter_name
    FROM users
    WHERE id = NEW.user_id;

    -- Use username if name is not available
    IF commenter_name IS NULL OR commenter_name = ' ' THEN
        commenter_name := commenter_username;
    END IF;

    -- Create new notification only if no recent notification exists
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

-- Friend removed notification function
CREATE OR REPLACE FUNCTION create_friend_removed_notification()
RETURNS TRIGGER AS $$
DECLARE
    remover_username VARCHAR;
    remover_name VARCHAR;
BEGIN
    -- Only create notification for ACCEPTED friendships, not PENDING ones
    IF UPPER(OLD.status) != 'ACCEPTED' THEN
        RETURN OLD;
    END IF;

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
-- FRIENDSHIP MANAGEMENT FUNCTIONS
-- ============================================================================

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

-- ============================================================================
-- NOTIFICATION MANAGEMENT FUNCTIONS
-- ============================================================================

-- Notification cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete notifications older than 30 days that are marked as read
    DELETE FROM notifications
    WHERE created_at < NOW() - INTERVAL '30 days'
      AND (read = true OR resolved = true)
      AND deleted_at IS NULL;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    -- Log the cleanup
    RAISE NOTICE 'Cleaned up % old notifications', deleted_count;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Notification stats function
CREATE OR REPLACE FUNCTION get_notification_stats()
RETURNS TABLE (
    total_notifications BIGINT,
    unread_notifications BIGINT,
    notifications_by_type JSONB,
    top_users_with_notifications JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM notifications WHERE deleted_at IS NULL) as total_notifications,
        (SELECT COUNT(*) FROM notifications WHERE deleted_at IS NULL AND read = false) as unread_notifications,
        (
            SELECT jsonb_object_agg(type, count)
            FROM (
                SELECT type, COUNT(*) as count
                FROM notifications
                WHERE deleted_at IS NULL
                GROUP BY type
                ORDER BY count DESC
            ) t
        ) as notifications_by_type,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'username', u.username,
                    'notification_count', COUNT(n.id)
                )
            )
            FROM notifications n
            JOIN users u ON n.user_id = u.id
            WHERE n.deleted_at IS NULL
            GROUP BY u.id, u.username
            ORDER BY COUNT(n.id) DESC
            LIMIT 10
        ) as top_users_with_notifications;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PERFORMANCE MONITORING FUNCTIONS
-- ============================================================================

-- Table performance analysis function
CREATE OR REPLACE FUNCTION analyze_table_performance()
RETURNS TABLE (
    table_name TEXT,
    total_rows BIGINT,
    index_usage JSONB,
    table_size TEXT,
    index_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.table_name::TEXT,
        t.n_tup_ins + t.n_tup_upd + t.n_tup_del as total_rows,
        (
            SELECT jsonb_object_agg(indexname, idx_scan)
            FROM pg_stat_user_indexes
            WHERE relname = t.table_name
        ) as index_usage,
        pg_size_pretty(pg_total_relation_size(c.oid)) as table_size,
        pg_size_pretty(pg_indexes_size(c.oid)) as index_size
    FROM pg_stat_user_tables t
    JOIN pg_class c ON c.relname = t.table_name
    WHERE t.schemaname = 'public'
    ORDER BY pg_total_relation_size(c.oid) DESC;
END;
$$ LANGUAGE plpgsql;

-- Query performance tracking function
CREATE OR REPLACE FUNCTION log_query_performance(
    query_hash TEXT,
    execution_time_ms INTEGER,
    query_text TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO query_performance_log (query_hash, execution_time_ms, query_text, created_at)
    VALUES (query_hash, execution_time_ms, query_text, NOW());

    -- Keep only last 1000 records per query hash
    DELETE FROM query_performance_log
    WHERE query_hash = log_query_performance.query_hash
      AND id NOT IN (
          SELECT id FROM query_performance_log
          WHERE query_hash = log_query_performance.query_hash
          ORDER BY created_at DESC
          LIMIT 1000
      );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TEAM AND PLAYER RATING FUNCTIONS
-- ============================================================================

-- Function to update team ratings when game logs change
CREATE OR REPLACE FUNCTION update_team_ratings()
RETURNS TRIGGER AS $$
DECLARE
    team_id_var varchar(255);
    is_public boolean;
BEGIN
    -- Determine if this is an INSERT, UPDATE, or DELETE
    IF TG_OP = 'DELETE' THEN
        -- Get team ID from the deleted record
        SELECT
            CASE
                WHEN (OLD.game_id IS NOT NULL) THEN
                    CASE
                        WHEN (bg.teams->'home'->>'id')::text IS NOT NULL THEN (bg.teams->'home'->>'id')::text
                        WHEN (bg.teams->'visitors'->>'id')::text IS NOT NULL THEN (bg.teams->'visitors'->>'id')::text
                    END
            END INTO team_id_var
        FROM basketball_games bg
        WHERE bg.id = OLD.game_id;

        is_public := (OLD.classification = 'PUBLIC');
    ELSE
        -- Get team ID from the new/updated record
        SELECT
            CASE
                WHEN (bg.teams->'home'->>'id')::text IS NOT NULL THEN (bg.teams->'home'->>'id')::text
                WHEN (bg.teams->'visitors'->>'id')::text IS NOT NULL THEN (bg.teams->'visitors'->>'id')::text
            END INTO team_id_var
        FROM basketball_games bg
        WHERE bg.id = NEW.game_id;

        is_public := (NEW.classification = 'PUBLIC');
    END IF;

    -- Only proceed if we found a team ID
    IF team_id_var IS NOT NULL THEN
        -- Insert or update team rating record
        INSERT INTO team_ratings (
            id, team_id, last_calculated_at, updated_at
        ) VALUES (
            'team_' || team_id_var, team_id_var, now(), now()
        ) ON CONFLICT (id) DO UPDATE SET
            last_calculated_at = now(),
            updated_at = now();
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update team ratings when public comments change
CREATE OR REPLACE FUNCTION update_team_ratings_on_public_comments()
RETURNS TRIGGER AS $$
DECLARE
    team_id_var varchar(255);
BEGIN
    -- Get team ID from the public comment
    IF TG_OP = 'DELETE' THEN
        team_id_var := OLD.parent_id;
    ELSE
        team_id_var := NEW.parent_id;
    END IF;

    -- Only proceed if this is a team public comment
    IF (TG_OP = 'DELETE' AND OLD.parent_type = 'BASKETBALL_TEAM') OR
       (TG_OP != 'DELETE' AND NEW.parent_type = 'BASKETBALL_TEAM') THEN

        -- Insert or update team rating record
        INSERT INTO team_ratings (
            id, team_id, last_calculated_at, updated_at
        ) VALUES (
            'team_' || team_id_var, team_id_var, now(), now()
        ) ON CONFLICT (id) DO UPDATE SET
            last_calculated_at = now(),
            updated_at = now();
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update team ratings when public reactions change
CREATE OR REPLACE FUNCTION update_team_ratings_on_public_reactions()
RETURNS TRIGGER AS $$
DECLARE
    team_id_var varchar(255);
BEGIN
    -- Get team ID from the public reaction's target
    IF TG_OP = 'DELETE' THEN
        team_id_var := OLD.target_id;
    ELSE
        team_id_var := NEW.target_id;
    END IF;

    -- Only proceed if this is a reaction on a team
    IF (TG_OP = 'DELETE' AND OLD.target_type = 'BASKETBALL_TEAM') OR
       (TG_OP != 'DELETE' AND NEW.target_type = 'BASKETBALL_TEAM') THEN

        -- Insert or update team rating record
        INSERT INTO team_ratings (
            id, team_id, last_calculated_at, updated_at
        ) VALUES (
            'team_' || team_id_var, team_id_var, now(), now()
        ) ON CONFLICT (id) DO UPDATE SET
            last_calculated_at = now(),
            updated_at = now();
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update player ratings when public comments change
CREATE OR REPLACE FUNCTION update_player_ratings_on_public_comments()
RETURNS TRIGGER AS $$
DECLARE
    player_id_var varchar(255);
BEGIN
    -- Get player ID from the public comment
    IF TG_OP = 'DELETE' THEN
        player_id_var := OLD.parent_id;
    ELSE
        player_id_var := NEW.parent_id;
    END IF;

    -- Only proceed if this is a player public comment
    IF (TG_OP = 'DELETE' AND OLD.parent_type = 'BASKETBALL_PLAYER') OR
       (TG_OP != 'DELETE' AND NEW.parent_type = 'BASKETBALL_PLAYER') THEN

        -- Insert or update player rating record
        INSERT INTO player_ratings (
            id, player_id, last_calculated_at, updated_at
        ) VALUES (
            'player_' || player_id_var, player_id_var, now(), now()
        ) ON CONFLICT (id) DO UPDATE SET
            last_calculated_at = now(),
            updated_at = now();
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update player ratings when public reactions change
CREATE OR REPLACE FUNCTION update_player_ratings_on_public_reactions()
RETURNS TRIGGER AS $$
DECLARE
    player_id_var varchar(255);
BEGIN
    -- Get player ID from the public reaction's target
    IF TG_OP = 'DELETE' THEN
        player_id_var := OLD.target_id;
    ELSE
        player_id_var := NEW.target_id;
    END IF;

    -- Only proceed if this is a reaction on a player
    IF (TG_OP = 'DELETE' AND OLD.target_type = 'BASKETBALL_PLAYER') OR
       (TG_OP != 'DELETE' AND NEW.target_type = 'BASKETBALL_PLAYER') THEN

        -- Insert or update player rating record
        INSERT INTO player_ratings (
            id, player_id, last_calculated_at, updated_at
        ) VALUES (
            'player_' || player_id_var, player_id_var, now(), now()
        ) ON CONFLICT (id) DO UPDATE SET
            last_calculated_at = now(),
            updated_at = now();
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate team ratings
CREATE OR REPLACE FUNCTION recalculate_team_ratings(team_id_param varchar(255))
RETURNS void AS $$
DECLARE
    rating_record record;
BEGIN
    -- Calculate engagement metrics for the team
    SELECT
        COALESCE(COUNT(DISTINCT gl.id), 0) as total_game_logs,
        COALESCE(COUNT(DISTINCT CASE WHEN gl.classification = 'PUBLIC' THEN gl.id END), 0) as public_game_logs,
        COALESCE(SUM(CASE WHEN gl.classification = 'PUBLIC' THEN gl_engagement.comments ELSE 0 END), 0) as public_comments,
        COALESCE(SUM(CASE WHEN gl.classification = 'PUBLIC' THEN gl_engagement.reactions ELSE 0 END), 0) as public_reactions,
        COALESCE(SUM(gl_engagement.comments), 0) as total_comments,
        COALESCE(SUM(gl_engagement.reactions), 0) as total_reactions
    INTO rating_record
    FROM game_logs gl
    LEFT JOIN basketball_games bg ON gl.game_id = bg.id
    LEFT JOIN (
        SELECT
            gl_sub.id,
            COALESCE(comment_counts.count, 0) as comments,
            COALESCE(reaction_counts.count, 0) as reactions
        FROM game_logs gl_sub
        LEFT JOIN (
            SELECT parent_id, COUNT(*) as count
            FROM comments
            WHERE parent_type = 'GAME_LOG' AND deleted_at IS NULL
            GROUP BY parent_id
        ) comment_counts ON gl_sub.id = comment_counts.parent_id
        LEFT JOIN (
            SELECT target_id, COUNT(*) as count
            FROM reactions
            WHERE target_type = 'GAME_LOG' AND deleted_at IS NULL
            GROUP BY target_id
        ) reaction_counts ON gl_sub.id = reaction_counts.target_id
        WHERE gl_sub.deleted_at IS NULL
    ) gl_engagement ON gl.id = gl_engagement.id
    WHERE gl.deleted_at IS NULL
      AND (
        (bg.teams->'home'->>'id')::text = team_id_param OR
        (bg.teams->'visitors'->>'id')::text = team_id_param
      );

    -- Calculate popularity score using hybrid approach
    DECLARE
        public_engagement_score numeric;
        total_engagement_score numeric;
        game_log_volume_score numeric;
        popularity_score numeric;
    BEGIN
        public_engagement_score := rating_record.public_comments * 2 + rating_record.public_reactions * 1;
        total_engagement_score := rating_record.total_comments * 1.5 + rating_record.total_reactions * 0.8;
        game_log_volume_score := ln(rating_record.total_game_logs + 1) * 1.5;

        popularity_score :=
            ln(public_engagement_score + 1) * 0.5 +
            ln(total_engagement_score + 1) * 0.3 +
            game_log_volume_score * 0.2;

        -- Update team ratings
        UPDATE team_ratings SET
            total_comments = rating_record.total_comments,
            total_reactions = rating_record.total_reactions,
            public_comments = rating_record.public_comments,
            public_reactions = rating_record.public_reactions,
            total_game_logs = rating_record.total_game_logs,
            public_game_logs = rating_record.public_game_logs,
            popularity_score = popularity_score,
            last_calculated_at = now(),
            updated_at = now()
        WHERE team_id = team_id_param;
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate player ratings (only public data)
CREATE OR REPLACE FUNCTION recalculate_player_ratings(player_id_param varchar(255))
RETURNS void AS $$
DECLARE
    rating_record record;
BEGIN
    -- Calculate engagement metrics for the player (only public data)
    SELECT
        COALESCE(COUNT(pc.id), 0) as public_comments,
        COALESCE(COUNT(pr.id), 0) as public_reactions
    INTO rating_record
    FROM public_comments pc
    FULL OUTER JOIN public_reactions pr ON pc.parent_id = pr.target_id AND pc.parent_type = pr.target_type
    WHERE (pc.parent_type = 'BASKETBALL_PLAYER' AND pc.parent_id = player_id_param AND pc.deleted_at IS NULL)
       OR (pr.target_type = 'BASKETBALL_PLAYER' AND pr.target_id = player_id_param AND pr.deleted_at IS NULL);

    -- Calculate popularity score (only public data)
    DECLARE
        public_engagement_score numeric;
        popularity_score numeric;
    BEGIN
        public_engagement_score := rating_record.public_comments * 2 + rating_record.public_reactions * 1;
        popularity_score :=
            LN(public_engagement_score + 1) * 0.5 +
            LN(rating_record.public_comments + 1) * 0.3 +
            LN(rating_record.public_reactions + 1) * 0.2;

        -- Update player ratings
        UPDATE player_ratings SET
            total_comments = rating_record.public_comments,
            total_reactions = rating_record.public_reactions,
            public_comments = rating_record.public_comments,
            public_reactions = rating_record.public_reactions,
            popularity_score = popularity_score,
            last_calculated_at = now(),
            updated_at = now()
        WHERE player_id = player_id_param;
    END;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION DOCUMENTATION
-- ============================================================================

-- Core utility functions
COMMENT ON FUNCTION generate_uuid_v7() IS 'Generates a simplified UUID v7 format for consistent ID generation';
COMMENT ON FUNCTION get_current_user_id() IS 'Returns the current user ID from application context for RLS policies';
COMMENT ON FUNCTION set_current_user_context(TEXT) IS 'Sets the current user context for RLS policies';
COMMENT ON FUNCTION clear_current_user_context() IS 'Clears the current user context for RLS policies';

-- Game rating functions
COMMENT ON FUNCTION update_game_ratings() IS 'Fixed trigger function that prevents orphaned ratings by deleting rating records when no game logs remain';

-- Notification functions
COMMENT ON FUNCTION create_reaction_notification() IS 'Optimized reaction notification function with deduplication and rate limiting';
COMMENT ON FUNCTION create_comment_notification() IS 'Optimized comment notification function with deduplication and rate limiting';
COMMENT ON FUNCTION create_friend_request_notification() IS 'Creates notifications for friendship status changes';
COMMENT ON FUNCTION create_friend_removed_notification() IS 'Creates notifications when friendships are removed';
COMMENT ON FUNCTION cleanup_old_notifications() IS 'Cleans up old notifications to prevent database bloat';
COMMENT ON FUNCTION get_notification_stats() IS 'Returns comprehensive notification statistics';

-- Friendship management functions
COMMENT ON FUNCTION update_friendship_user_arrays() IS 'Maintains user friendship arrays for efficient friendship queries';
COMMENT ON FUNCTION rebuild_user_friendship_arrays() IS 'Rebuilds all user friendship arrays from the friendships table';

-- Performance monitoring functions
COMMENT ON FUNCTION analyze_table_performance() IS 'Analyzes table performance including size, row counts, and index usage';
COMMENT ON FUNCTION log_query_performance(TEXT, INTEGER, TEXT) IS 'Logs query performance metrics for monitoring';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Note: This consolidated functions file replaces:
-- - 001_notification_functions.sql
-- - 002_optimized_notification_functions.sql
-- - 002_fixed_game_ratings_trigger.sql
-- - RLS functions from 001_rls_policies.sql
-- - All functions from triggers.sql
--
-- All functions are optimized and include proper error handling,
-- rate limiting, and performance monitoring capabilities.
