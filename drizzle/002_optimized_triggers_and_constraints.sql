-- ============================================================================
-- SECTION 1: GAME LOGS - Unique constraint and cleanup
-- ============================================================================

-- Remove any duplicate game logs that might exist
-- Keep only the most recent game log for each user-game combination
WITH ranked_logs AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "userId", "gameId" 
      ORDER BY "createdAt" DESC
    ) as rn
  FROM game_logs
  WHERE "userId" IS NOT NULL 
    AND "gameId" IS NOT NULL
    AND "deletedAt" IS NULL
)
DELETE FROM game_logs 
WHERE id IN (
  SELECT id 
  FROM ranked_logs 
  WHERE rn > 1
);

-- Add unique constraint to ensure one game log per user per game (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'game_logs_user_game_unique' 
    AND table_name = 'game_logs'
  ) THEN
    ALTER TABLE game_logs 
    ADD CONSTRAINT game_logs_user_game_unique 
    UNIQUE ("userId", "gameId");
  END IF;
END $$;

-- Create performance index for game logs
CREATE INDEX IF NOT EXISTS idx_game_logs_user_game 
ON game_logs ("userId", "gameId") 
WHERE "deletedAt" IS NULL;

-- ============================================================================
-- SECTION 2: GAME RATINGS - Auto-update triggers
-- ============================================================================

-- Drop existing function and trigger if they exist
DROP FUNCTION IF EXISTS update_game_ratings() CASCADE;

-- Create function to update game ratings when game logs change
CREATE OR REPLACE FUNCTION update_game_ratings()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle DELETE operations
    IF (TG_OP = 'DELETE') THEN
        -- Delete the game rating if no logs remain
        IF NOT EXISTS (SELECT 1 FROM game_logs WHERE "gameId" = OLD."gameId") THEN
            DELETE FROM game_ratings WHERE "gameId" = OLD."gameId";
        ELSE
            -- Update the average rating and total count
            UPDATE game_ratings
            SET 
                "averageRating" = (
                    SELECT ROUND(AVG("ratingForGame")::numeric, 2)
                    FROM game_logs
                    WHERE "gameId" = OLD."gameId"
                ),
                "totalRatings" = (
                    SELECT COUNT(*)
                    FROM game_logs
                    WHERE "gameId" = OLD."gameId"
                ),
                "updatedAt" = NOW()
            WHERE "gameId" = OLD."gameId";
        END IF;
        RETURN OLD;
    END IF;

    -- Handle INSERT operations
    IF (TG_OP = 'INSERT') THEN
        -- Insert or update the game rating
        INSERT INTO game_ratings ("gameId", "averageRating", "totalRatings", "createdAt", "updatedAt")
        SELECT 
            NEW."gameId",
            ROUND(AVG("ratingForGame")::numeric, 2),
            COUNT(*),
            NOW(),
            NOW()
        FROM game_logs
        WHERE "gameId" = NEW."gameId"
        ON CONFLICT ("gameId") DO UPDATE
        SET 
            "averageRating" = EXCLUDED."averageRating",
            "totalRatings" = EXCLUDED."totalRatings",
            "updatedAt" = NOW();
        RETURN NEW;
    END IF;

    -- Handle UPDATE operations
    IF (TG_OP = 'UPDATE') THEN
        -- Update the game rating
        UPDATE game_ratings
        SET 
            "averageRating" = (
                SELECT ROUND(AVG("ratingForGame")::numeric, 2)
                FROM game_logs
                WHERE "gameId" = NEW."gameId"
            ),
            "totalRatings" = (
                SELECT COUNT(*)
                FROM game_logs
                WHERE "gameId" = NEW."gameId"
            ),
            "updatedAt" = NOW()
        WHERE "gameId" = NEW."gameId";
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the game ratings trigger
DROP TRIGGER IF EXISTS game_logs_ratings_trigger ON game_logs;
CREATE TRIGGER game_logs_ratings_trigger
    AFTER INSERT OR UPDATE OR DELETE ON game_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_game_ratings();

-- ============================================================================
-- SECTION 3: FRIENDSHIP NOTIFICATIONS - Auto-notification triggers
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
        SELECT username, CONCAT("firstName", ' ', "lastName") 
        INTO sender_username, sender_name
        FROM users 
        WHERE id = NEW."userId";
        
        -- Use username if name is not available
        IF sender_name IS NULL OR sender_name = ' ' THEN
            sender_name := sender_username;
        END IF;
        
        -- Create notification for the recipient
        INSERT INTO notifications (
            id, "userId", type, title, message, "targetId", "targetType", 
            resolved, "createdAt", "updatedAt"
        ) VALUES (
            generate_uuid_v4(), NEW."friendId", 'friend_request', 'New Friend Request',
            sender_name || ' sent you a friend request', NEW.id, 'friendship',
            false, NOW(), NOW()
        );
    END IF;
    
    -- Create notification when friend request is accepted
    IF NEW.status = 'Accepted' AND TG_OP = 'UPDATE' AND OLD.status = 'Pending' THEN
        -- Get acceptor's username and name
        SELECT username, CONCAT("firstName", ' ', "lastName") 
        INTO sender_username, sender_name
        FROM users 
        WHERE id = NEW."friendId";
        
        -- Use username if name is not available
        IF sender_name IS NULL OR sender_name = ' ' THEN
            sender_name := sender_username;
        END IF;
        
        -- Create notification for the original sender
        INSERT INTO notifications (
            id, "userId", type, title, message, "targetId", "targetType",
            resolved, "createdAt", "updatedAt"
        ) VALUES (
            generate_uuid_v4(), NEW."userId", 'friend_request_accepted', 'Friend Request Accepted',
            sender_name || ' accepted your friend request', NEW.id, 'friendship',
            false, NOW(), NOW()
        );
    END IF;
    
    -- Create notification when friend request is rejected
    IF NEW.status = 'Rejected' AND TG_OP = 'UPDATE' AND OLD.status = 'Pending' THEN
        -- Get rejector's username and name
        SELECT username, CONCAT("firstName", ' ', "lastName") 
        INTO sender_username, sender_name
        FROM users 
        WHERE id = NEW."friendId";
        
        -- Use username if name is not available
        IF sender_name IS NULL OR sender_name = ' ' THEN
            sender_name := sender_username;
        END IF;
        
        -- Create notification for the original sender
        INSERT INTO notifications (
            id, "userId", type, title, message, "targetId", "targetType",
            resolved, "createdAt", "updatedAt"
        ) VALUES (
            generate_uuid_v4(), NEW."userId", 'friend_request_rejected', 'Friend Request Declined',
            sender_name || ' declined your friend request', NEW.id, 'friendship',
            false, NOW(), NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create friendship notification triggers
DROP TRIGGER IF EXISTS friendship_notification_trigger ON friendships;
CREATE TRIGGER friendship_notification_trigger
    AFTER INSERT OR UPDATE ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION create_friend_request_notification();

-- ============================================================================
-- SECTION 4: FRIENDSHIP USER ARRAYS - Track pending friendships in user arrays
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
            SET "outboundFriendshipIds" = array_append(COALESCE("outboundFriendshipIds", ARRAY[]::VARCHAR[]), NEW.id)
            WHERE id = NEW."userId";
            
            -- Add friendship ID to inbound array for recipient
            UPDATE users 
            SET "inboundFriendshipIds" = array_append(COALESCE("inboundFriendshipIds", ARRAY[]::VARCHAR[]), NEW.id)
            WHERE id = NEW."friendId";
        END IF;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- If status changed from Pending to something else, remove from arrays
        IF OLD.status = 'Pending' AND NEW.status != 'Pending' THEN
            -- Remove friendship ID from outbound array for initiator
            UPDATE users 
            SET "outboundFriendshipIds" = array_remove(COALESCE("outboundFriendshipIds", ARRAY[]::VARCHAR[]), OLD.id)
            WHERE id = OLD."userId";
            
            -- Remove friendship ID from inbound array for recipient
            UPDATE users 
            SET "inboundFriendshipIds" = array_remove(COALESCE("inboundFriendshipIds", ARRAY[]::VARCHAR[]), OLD.id)
            WHERE id = OLD."friendId";
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        -- If the deleted friendship was pending, remove from arrays
        IF OLD.status = 'Pending' THEN
            -- Remove friendship ID from outbound array for initiator
            UPDATE users 
            SET "outboundFriendshipIds" = array_remove(COALESCE("outboundFriendshipIds", ARRAY[]::VARCHAR[]), OLD.id)
            WHERE id = OLD."userId";
            
            -- Remove friendship ID from inbound array for recipient
            UPDATE users 
            SET "inboundFriendshipIds" = array_remove(COALESCE("inboundFriendshipIds", ARRAY[]::VARCHAR[]), OLD.id)
            WHERE id = OLD."friendId";
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create friendship user arrays triggers
DROP TRIGGER IF EXISTS update_friendship_user_arrays_insert ON friendships;
DROP TRIGGER IF EXISTS update_friendship_user_arrays_update ON friendships;
DROP TRIGGER IF EXISTS update_friendship_user_arrays_delete ON friendships;

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
-- SECTION 5: PERFORMANCE INDEXES
-- ============================================================================

-- Notification indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_userId_resolved 
    ON notifications("userId", resolved);

CREATE INDEX IF NOT EXISTS idx_notifications_targetId_targetType 
    ON notifications("targetId", "targetType");

-- User friendship array indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_inbound_friendships 
    ON users USING GIN("inboundFriendshipIds");

CREATE INDEX IF NOT EXISTS idx_users_outbound_friendships 
    ON users USING GIN("outboundFriendshipIds");

-- ============================================================================
-- SECTION 6: UTILITY FUNCTIONS
-- ============================================================================

-- Function to rebuild friendship arrays (utility for data consistency)
-- Can be called manually if needed to fix any inconsistencies
CREATE OR REPLACE FUNCTION rebuild_user_friendship_arrays()
RETURNS void AS $$
BEGIN
    UPDATE users u
    SET 
        "outboundFriendshipIds" = COALESCE((
            SELECT array_agg(f.id)
            FROM friendships f
            WHERE f."userId" = u.id AND f.status = 'Pending'
        ), ARRAY[]::VARCHAR[]),
        "inboundFriendshipIds" = COALESCE((
            SELECT array_agg(f.id)
            FROM friendships f
            WHERE f."friendId" = u.id AND f.status = 'Pending'
        ), ARRAY[]::VARCHAR[]);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- This migration includes:
-- 1. Game log unique constraints and deduplication
-- 2. Auto-updating game ratings triggers
-- 3. Friendship notification triggers  
-- 4. User friendship array maintenance triggers
-- 5. Performance indexes for all new functionality
-- 6. Utility functions for maintenance
-- ============================================================================ 