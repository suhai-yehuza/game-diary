-- Function to update user friendship arrays when a friendship is created or deleted
CREATE OR REPLACE FUNCTION update_user_friendship_arrays()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Add friendship ID to initiator's outboundFriendshipIds
        UPDATE users
        SET "outboundFriendshipIds" = 
            CASE 
                WHEN "outboundFriendshipIds" IS NULL THEN ARRAY[NEW.id]
                WHEN NOT (NEW.id = ANY("outboundFriendshipIds")) THEN array_append("outboundFriendshipIds", NEW.id)
                ELSE "outboundFriendshipIds"
            END,
            "updatedAt" = NOW()
        WHERE id = NEW."userId";
        
        -- Add friendship ID to recipient's inboundFriendshipIds
        UPDATE users
        SET "inboundFriendshipIds" = 
            CASE 
                WHEN "inboundFriendshipIds" IS NULL THEN ARRAY[NEW.id]
                WHEN NOT (NEW.id = ANY("inboundFriendshipIds")) THEN array_append("inboundFriendshipIds", NEW.id)
                ELSE "inboundFriendshipIds"
            END,
            "updatedAt" = NOW()
        WHERE id = NEW."friendId";
        
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Remove friendship ID from initiator's outboundFriendshipIds
        UPDATE users
        SET "outboundFriendshipIds" = array_remove("outboundFriendshipIds", OLD.id),
            "updatedAt" = NOW()
        WHERE id = OLD."userId" AND OLD.id = ANY("outboundFriendshipIds");
        
        -- Remove friendship ID from recipient's inboundFriendshipIds
        UPDATE users
        SET "inboundFriendshipIds" = array_remove("inboundFriendshipIds", OLD.id),
            "updatedAt" = NOW()
        WHERE id = OLD."friendId" AND OLD.id = ANY("inboundFriendshipIds");
        
        RETURN OLD;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle case where userId or friendId changes (shouldn't happen in normal operation, but just in case)
        IF OLD."userId" != NEW."userId" OR OLD."friendId" != NEW."friendId" THEN
            -- Remove from old users
            UPDATE users
            SET "outboundFriendshipIds" = array_remove("outboundFriendshipIds", OLD.id),
                "updatedAt" = NOW()
            WHERE id = OLD."userId" AND OLD.id = ANY("outboundFriendshipIds");
            
            UPDATE users
            SET "inboundFriendshipIds" = array_remove("inboundFriendshipIds", OLD.id),
                "updatedAt" = NOW()
            WHERE id = OLD."friendId" AND OLD.id = ANY("inboundFriendshipIds");
            
            -- Add to new users
            UPDATE users
            SET "outboundFriendshipIds" = 
                CASE 
                    WHEN "outboundFriendshipIds" IS NULL THEN ARRAY[NEW.id]
                    WHEN NOT (NEW.id = ANY("outboundFriendshipIds")) THEN array_append("outboundFriendshipIds", NEW.id)
                    ELSE "outboundFriendshipIds"
                END,
                "updatedAt" = NOW()
            WHERE id = NEW."userId";
            
            UPDATE users
            SET "inboundFriendshipIds" = 
                CASE 
                    WHEN "inboundFriendshipIds" IS NULL THEN ARRAY[NEW.id]
                    WHEN NOT (NEW.id = ANY("inboundFriendshipIds")) THEN array_append("inboundFriendshipIds", NEW.id)
                    ELSE "inboundFriendshipIds"
                END,
                "updatedAt" = NOW()
            WHERE id = NEW."friendId";
        END IF;
        
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_friendship_arrays_trigger ON friendships;

-- Create trigger for insert, update, and delete operations
CREATE TRIGGER update_user_friendship_arrays_trigger
    AFTER INSERT OR UPDATE OR DELETE ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION update_user_friendship_arrays();

-- Function to rebuild friendship arrays for all users (useful for initial population or fixing data)
CREATE OR REPLACE FUNCTION rebuild_all_user_friendship_arrays()
RETURNS void AS $$
BEGIN
    -- Reset all arrays to empty
    UPDATE users
    SET "outboundFriendshipIds" = ARRAY[]::VARCHAR[],
        "inboundFriendshipIds" = ARRAY[]::VARCHAR[];
    
    -- Rebuild outboundFriendshipIds
    UPDATE users u
    SET "outboundFriendshipIds" = (
        SELECT COALESCE(array_agg(f.id ORDER BY f."createdAt"), ARRAY[]::VARCHAR[])
        FROM friendships f
        WHERE f."userId" = u.id
    ),
    "updatedAt" = NOW();
    
    -- Rebuild inboundFriendshipIds
    UPDATE users u
    SET "inboundFriendshipIds" = (
        SELECT COALESCE(array_agg(f.id ORDER BY f."createdAt"), ARRAY[]::VARCHAR[])
        FROM friendships f
        WHERE f."friendId" = u.id
    ),
    "updatedAt" = NOW();
END;
$$ LANGUAGE plpgsql;

-- Run the rebuild function to populate existing data
SELECT rebuild_all_user_friendship_arrays();

-- Create indexes for better performance when querying friendships
CREATE INDEX IF NOT EXISTS idx_friendships_userId ON friendships("userId");
CREATE INDEX IF NOT EXISTS idx_friendships_friendId ON friendships("friendId");
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status); 