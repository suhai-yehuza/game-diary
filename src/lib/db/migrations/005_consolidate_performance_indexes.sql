-- Consolidated Performance Indexes Migration
-- This migration consolidates all performance indexes for game_logs and friendships tables
-- It removes duplicates and ensures all necessary indexes are present

-- ============================================================================
-- GAME_LOGS TABLE INDEXES
-- ============================================================================

-- Core performance indexes for game logs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_user_created
ON game_logs(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_classification_created
ON game_logs(classification, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_user_classification_created
ON game_logs(user_id, classification, created_at DESC);

-- Individual column indexes for filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_user_id
ON game_logs(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_classification
ON game_logs(classification);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_game_id
ON game_logs(game_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_created_at
ON game_logs(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_deleted_at
ON game_logs(deleted_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_rating
ON game_logs(rating_for_game);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_watched_date
ON game_logs(watched_date);

-- ============================================================================
-- FRIENDSHIPS TABLE INDEXES
-- ============================================================================

-- Core performance indexes for friendships
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friendships_status_users
ON friendships(status, user_id, friend_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friendships_bidirectional
ON friendships(user_id, friend_id, status);

-- Individual column indexes for filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friendships_user_id
ON friendships(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friendships_friend_id
ON friendships(friend_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friendships_status
ON friendships(status);

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friendships_user_friend_status
ON friendships(user_id, friend_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friendships_friend_user_status
ON friendships(friend_id, user_id, status);

-- ============================================================================
-- INDEX COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON INDEX idx_game_logs_user_created IS 'Optimizes queries for user''s game logs ordered by creation date';
COMMENT ON INDEX idx_game_logs_classification_created IS 'Optimizes queries for public/protected game logs';
COMMENT ON INDEX idx_game_logs_user_classification_created IS 'Optimizes friends game logs queries';
COMMENT ON INDEX idx_game_logs_user_id IS 'Optimizes user-specific game log lookups';
COMMENT ON INDEX idx_game_logs_classification IS 'Optimizes classification filtering';
COMMENT ON INDEX idx_game_logs_game_id IS 'Optimizes game-specific game log lookups';
COMMENT ON INDEX idx_game_logs_created_at IS 'Optimizes chronological ordering';
COMMENT ON INDEX idx_game_logs_deleted_at IS 'Optimizes soft delete filtering';
COMMENT ON INDEX idx_game_logs_rating IS 'Optimizes rating range queries';
COMMENT ON INDEX idx_game_logs_watched_date IS 'Optimizes watched date queries';

COMMENT ON INDEX idx_friendships_status_users IS 'Optimizes friendship status queries';
COMMENT ON INDEX idx_friendships_bidirectional IS 'Optimizes bidirectional friendship lookups';
COMMENT ON INDEX idx_friendships_user_id IS 'Optimizes user-specific friendship lookups';
COMMENT ON INDEX idx_friendships_friend_id IS 'Optimizes friend-specific friendship lookups';
COMMENT ON INDEX idx_friendships_status IS 'Optimizes status filtering';
COMMENT ON INDEX idx_friendships_user_friend_status IS 'Optimizes user-friend-status queries';
COMMENT ON INDEX idx_friendships_friend_user_status IS 'Optimizes friend-user-status queries';

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- This query can be run to verify all indexes are created
-- SELECT
--     indexname,
--     tablename,
--     indexdef
-- FROM pg_indexes
-- WHERE tablename IN ('game_logs', 'friendships')
-- AND indexname LIKE 'idx_%'
-- ORDER BY tablename, indexname;
