-- 001_notification_triggers.sql
-- Notification triggers for social interactions
--
-- This file contains triggers for:
-- - Friendship notifications (request, accept, reject, remove)
-- - Comment notifications (on game logs and replies)
-- - Reaction notifications (on game logs and comments)

-- ============================================================================
-- NOTIFICATION TRIGGERS
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
