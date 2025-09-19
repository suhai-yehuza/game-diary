-- ============================================================================
-- CONSOLIDATED TRIGGERS - Game Diary Database
-- ============================================================================
-- Last Updated: 2024-12-19
-- Purpose: All database triggers consolidated and optimized
-- Dependencies: Base schema (000_base_schema.sql), Functions (001_consolidated_functions.sql)
--
-- This file consolidates:
-- - Game rating calculation triggers
-- - Notification triggers (optimized with rate limiting)
-- - Friendship management triggers
-- - All trigger definitions in one place
-- ============================================================================

-- ============================================================================
-- GAME RATING TRIGGERS
-- ============================================================================

-- Game ratings trigger - automatically updates game_ratings table when game_logs change
CREATE TRIGGER game_logs_ratings_trigger
    AFTER INSERT OR UPDATE OR DELETE ON game_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_game_ratings();

-- ============================================================================
-- NOTIFICATION TRIGGERS
-- ============================================================================

-- Friendship notification trigger - creates notifications for friendship status changes
CREATE TRIGGER friendship_notification_trigger
    AFTER INSERT OR UPDATE ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION create_friend_request_notification();

-- Comment notification trigger - creates notifications for new comments
CREATE TRIGGER comment_notification_trigger
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION create_comment_notification();

-- Reaction notification trigger - creates notifications for new reactions
CREATE TRIGGER reaction_notification_trigger
    AFTER INSERT ON reactions
    FOR EACH ROW
    EXECUTE FUNCTION create_reaction_notification();

-- Friendship deletion notification trigger - creates notifications when friendships are removed
CREATE TRIGGER friendship_deletion_notification_trigger
    AFTER DELETE ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION create_friend_removed_notification();

-- ============================================================================
-- FRIENDSHIP MANAGEMENT TRIGGERS
-- ============================================================================

-- Friendship user arrays triggers - maintain user friendship arrays for efficient queries
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
-- TEAM AND PLAYER RATING TRIGGERS
-- ============================================================================

-- Team ratings triggers
DROP TRIGGER IF EXISTS trigger_update_team_ratings_on_game_logs ON game_logs;
CREATE TRIGGER trigger_update_team_ratings_on_game_logs
    AFTER INSERT OR UPDATE OR DELETE ON game_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_team_ratings();

-- Team ratings triggers for public comments
DROP TRIGGER IF EXISTS trigger_update_team_ratings_on_public_comments ON public_comments;
CREATE TRIGGER trigger_update_team_ratings_on_public_comments
    AFTER INSERT OR UPDATE OR DELETE ON public_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_team_ratings_on_public_comments();

-- Team ratings triggers for public reactions
DROP TRIGGER IF EXISTS trigger_update_team_ratings_on_public_reactions ON public_reactions;
CREATE TRIGGER trigger_update_team_ratings_on_public_reactions
    AFTER INSERT OR UPDATE OR DELETE ON public_reactions
    FOR EACH ROW
    EXECUTE FUNCTION update_team_ratings_on_public_reactions();

-- Player ratings triggers for public comments
DROP TRIGGER IF EXISTS trigger_update_player_ratings_on_public_comments ON public_comments;
CREATE TRIGGER trigger_update_player_ratings_on_public_comments
    AFTER INSERT OR UPDATE OR DELETE ON public_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_player_ratings_on_public_comments();

-- Player ratings triggers for public reactions
DROP TRIGGER IF EXISTS trigger_update_player_ratings_on_public_reactions ON public_reactions;
CREATE TRIGGER trigger_update_player_ratings_on_public_reactions
    AFTER INSERT OR UPDATE OR DELETE ON public_reactions
    FOR EACH ROW
    EXECUTE FUNCTION update_player_ratings_on_public_reactions();

-- ============================================================================
-- INITIAL DATA POPULATION
-- ============================================================================

-- Create initial team rating records for all teams
INSERT INTO team_ratings (id, team_id, last_calculated_at)
SELECT
    'team_' || t.id,
    t.id,
    now()
FROM basketball_teams t
WHERE t.deleted_at IS NULL
ON CONFLICT (id) DO NOTHING;

-- Create initial player rating records for all players
INSERT INTO player_ratings (id, player_id, last_calculated_at)
SELECT
    'player_' || p.id,
    p.id,
    now()
FROM basketball_players p
WHERE p.deleted_at IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TRIGGER DOCUMENTATION
-- ============================================================================

-- Game rating triggers
COMMENT ON TRIGGER game_logs_ratings_trigger ON game_logs IS 'Automatically updates game_ratings table when game_logs are inserted, updated, or deleted';

-- Notification triggers
COMMENT ON TRIGGER friendship_notification_trigger ON friendships IS 'Creates notifications for friendship status changes (request, accept, reject)';
COMMENT ON TRIGGER comment_notification_trigger ON comments IS 'Creates notifications for new comments on game logs and replies';
COMMENT ON TRIGGER reaction_notification_trigger ON reactions IS 'Creates notifications for new reactions on game logs and comments';
COMMENT ON TRIGGER friendship_deletion_notification_trigger ON friendships IS 'Creates notifications when friendships are removed';

-- Friendship management triggers
COMMENT ON TRIGGER update_friendship_user_arrays_insert ON friendships IS 'Updates user friendship arrays when new friendships are created';
COMMENT ON TRIGGER update_friendship_user_arrays_update ON friendships IS 'Updates user friendship arrays when friendship status changes';
COMMENT ON TRIGGER update_friendship_user_arrays_delete ON friendships IS 'Updates user friendship arrays when friendships are deleted';

-- Team and player rating triggers
COMMENT ON TRIGGER trigger_update_team_ratings_on_game_logs ON game_logs IS 'Updates team ratings when game logs are inserted, updated, or deleted';
COMMENT ON TRIGGER trigger_update_team_ratings_on_public_comments ON public_comments IS 'Updates team ratings when public comments on teams are inserted, updated, or deleted';
COMMENT ON TRIGGER trigger_update_team_ratings_on_public_reactions ON public_reactions IS 'Updates team ratings when public reactions on teams are inserted, updated, or deleted';
COMMENT ON TRIGGER trigger_update_player_ratings_on_public_comments ON public_comments IS 'Updates player ratings when public comments on players are inserted, updated, or deleted';
COMMENT ON TRIGGER trigger_update_player_ratings_on_public_reactions ON public_reactions IS 'Updates player ratings when public reactions on players are inserted, updated, or deleted';

-- Table documentation
COMMENT ON TABLE team_ratings IS 'Optimized team engagement and rating data with automatic updates via triggers';
COMMENT ON TABLE player_ratings IS 'Optimized player engagement and rating data with automatic updates via triggers';

-- Function documentation
COMMENT ON FUNCTION update_team_ratings() IS 'Trigger function to update team ratings when game logs change';
COMMENT ON FUNCTION update_team_ratings_on_comments() IS 'Trigger function to update team ratings when comments change';
COMMENT ON FUNCTION update_team_ratings_on_reactions() IS 'Trigger function to update team ratings when reactions change';
COMMENT ON FUNCTION update_player_ratings_on_comments() IS 'Trigger function to update player ratings when comments change';
COMMENT ON FUNCTION update_player_ratings_on_reactions() IS 'Trigger function to update player ratings when reactions change';
COMMENT ON FUNCTION recalculate_team_ratings(varchar) IS 'Function to manually recalculate team ratings';
COMMENT ON FUNCTION recalculate_player_ratings(varchar) IS 'Function to manually recalculate player ratings using only public comments and reactions';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Note: This consolidated triggers file replaces:
-- - All triggers from 001_notification_triggers.sql
-- - All triggers from triggers.sql
-- - Team and player ratings data population and documentation
--
-- All triggers are optimized and use the consolidated functions from:
-- - 001_consolidated_functions.sql
--
-- Trigger behavior:
-- - Game ratings are automatically maintained
-- - Team and player ratings are automatically maintained
-- - Notifications are created with rate limiting and deduplication
-- - Friendship arrays are automatically maintained for efficient queries
-- - All triggers include proper error handling and logging
--
-- This file also includes:
-- - Initial data population for team_ratings and player_ratings tables
-- - Complete documentation for all triggers, tables, and functions
