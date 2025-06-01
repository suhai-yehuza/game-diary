-- Function to generate UUID v4
CREATE OR REPLACE FUNCTION generate_uuid_v4()
RETURNS VARCHAR AS $$
BEGIN
    RETURN gen_random_uuid()::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification when a friend request is sent
CREATE OR REPLACE FUNCTION create_friend_request_notification()
RETURNS TRIGGER AS $$
DECLARE
    sender_username VARCHAR;
    sender_name VARCHAR;
BEGIN
    -- Only create notification for new pending friend requests
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
            id,
            "userId",
            type,
            title,
            message,
            "targetId",
            "targetType",
            read,
            "createdAt",
            "updatedAt"
        ) VALUES (
            generate_uuid_v4(),
            NEW."friendId",
            'friend_request',
            'New Friend Request',
            sender_name || ' sent you a friend request',
            NEW.id,
            'friendship',
            false,
            NOW(),
            NOW()
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
            id,
            "userId",
            type,
            title,
            message,
            "targetId",
            "targetType",
            read,
            "createdAt",
            "updatedAt"
        ) VALUES (
            generate_uuid_v4(),
            NEW."userId",
            'friend_request_accepted',
            'Friend Request Accepted',
            sender_name || ' accepted your friend request',
            NEW.id,
            'friendship',
            false,
            NOW(),
            NOW()
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
            id,
            "userId",
            type,
            title,
            message,
            "targetId",
            "targetType",
            read,
            "createdAt",
            "updatedAt"
        ) VALUES (
            generate_uuid_v4(),
            NEW."userId",
            'friend_request_rejected',
            'Friend Request Declined',
            sender_name || ' declined your friend request',
            NEW.id,
            'friendship',
            false,
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification when a friend is removed
CREATE OR REPLACE FUNCTION create_friend_removed_notification()
RETURNS TRIGGER AS $$
DECLARE
    remover_id VARCHAR;
    removed_id VARCHAR;
    remover_name VARCHAR;
BEGIN
    -- Only create notification for accepted friendships being deleted
    IF OLD.status = 'Accepted' THEN
        -- We don't know who initiated the removal, so we could notify both users
        -- For now, we'll skip this notification as it might be unwanted
        -- Uncomment below if you want to notify both users
        
        /*
        -- Get both users' names
        SELECT username, CONCAT("firstName", ' ', "lastName") 
        INTO remover_name
        FROM users 
        WHERE id = OLD."userId";
        
        -- Create notification for friendId
        INSERT INTO notifications (
            id,
            "userId",
            type,
            title,
            message,
            "targetId",
            "targetType",
            read,
            "createdAt",
            "updatedAt"
        ) VALUES (
            generate_uuid_v4(),
            OLD."friendId",
            'friend_removed',
            'Friend Removed',
            remover_name || ' removed you from their friends list',
            OLD.id,
            'friendship',
            false,
            NOW(),
            NOW()
        );
        */
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS friendship_notification_trigger ON friendships;
DROP TRIGGER IF EXISTS friendship_delete_notification_trigger ON friendships;

-- Create triggers
CREATE TRIGGER friendship_notification_trigger
    AFTER INSERT OR UPDATE ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION create_friend_request_notification();

CREATE TRIGGER friendship_delete_notification_trigger
    BEFORE DELETE ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION create_friend_removed_notification();

-- Create index on notifications for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_userId_read 
    ON notifications("userId", read);

CREATE INDEX IF NOT EXISTS idx_notifications_targetId_targetType 
    ON notifications("targetId", "targetType"); 