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
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_friendship_user_arrays_insert ON friendships;
DROP TRIGGER IF EXISTS update_friendship_user_arrays_update ON friendships;
DROP TRIGGER IF EXISTS update_friendship_user_arrays_delete ON friendships;

-- Create triggers for insert, update, and delete
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_inbound_friendships ON users USING GIN("inboundFriendshipIds");
CREATE INDEX IF NOT EXISTS idx_users_outbound_friendships ON users USING GIN("outboundFriendshipIds");

-- Function to rebuild friendship arrays (only includes PENDING friendships)
-- This can be called manually if needed to fix any inconsistencies
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

-- Note: The arrays will be empty initially. The triggers will populate them as new
-- pending friendships are created. If you need to populate existing pending friendships,
-- you can run: SELECT rebuild_user_friendship_arrays(); 