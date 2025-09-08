-- Performance optimization indexes for Game Diary
-- These indexes are designed to improve query performance for common access patterns

-- Game logs performance indexes (comprehensive optimization)
-- Primary index for game_logs table (most important)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_created_at_desc
ON game_logs (created_at DESC)
WHERE deleted_at IS NULL;

-- User-specific game logs (for "My Logs" tab)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_user_created_at
ON game_logs (user_id, created_at DESC)
WHERE deleted_at IS NULL;

-- Classification-based queries (for "Public Logs" and "Friends Logs" tabs)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_classification_created_at
ON game_logs (classification, created_at DESC)
WHERE deleted_at IS NULL;

-- Combined user and classification (for "Friends Logs" tab)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_user_classification_created_at
ON game_logs (user_id, classification, created_at DESC)
WHERE deleted_at IS NULL;

-- Rating-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_rating_created_at
ON game_logs (rating_for_game, created_at DESC)
WHERE deleted_at IS NULL;

-- Game-specific queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_game_created_at
ON game_logs (game_id, created_at DESC)
WHERE deleted_at IS NULL;

-- Watched setting queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_watched_setting_created_at
ON game_logs (watched_setting, created_at DESC)
WHERE deleted_at IS NULL;

-- Notes-based queries (for hasNotes filter)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_notes_created_at
ON game_logs (created_at DESC)
WHERE deleted_at IS NULL AND notes IS NOT NULL AND notes != '';

-- Composite index for common filter combinations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_composite_common
ON game_logs (classification, user_id, rating_for_game, created_at DESC)
WHERE deleted_at IS NULL;

-- Partial index for active game logs only (excludes deleted)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_active_only
ON game_logs (created_at DESC, user_id, classification)
WHERE deleted_at IS NULL;

-- Index for cursor-based pagination
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_cursor_pagination
ON game_logs (created_at DESC, id)
WHERE deleted_at IS NULL;

-- Index for date range queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_watched_date
ON game_logs (watched_date DESC, created_at DESC)
WHERE deleted_at IS NULL;

-- Index for tags queries (if using array operations)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_tags_gin
ON game_logs USING GIN (tags)
WHERE deleted_at IS NULL;

-- Comments performance indexes
CREATE INDEX IF NOT EXISTS idx_comments_parent_type_parent_id ON comments (parent_type, parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_type_parent_id_created ON comments (parent_type, parent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user_id_created ON comments (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments (deleted_at) WHERE deleted_at IS NULL;

-- Reactions performance indexes
CREATE INDEX IF NOT EXISTS idx_reactions_target_type_target_id ON reactions (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reactions_target_type_target_id_created ON reactions (target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id_created ON reactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reactions_deleted_at ON reactions (deleted_at) WHERE deleted_at IS NULL;

-- Games performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_basketball_games_date_desc ON basketball_games (date DESC);
CREATE INDEX IF NOT EXISTS idx_basketball_games_status ON basketball_games (status);
CREATE INDEX IF NOT EXISTS idx_basketball_games_season ON basketball_games (season);
CREATE INDEX IF NOT EXISTS idx_basketball_games_deleted_at ON basketball_games (deleted_at) WHERE deleted_at IS NULL;

-- Teams performance indexes
CREATE INDEX IF NOT EXISTS idx_basketball_teams_conference ON basketball_teams (conference);
CREATE INDEX IF NOT EXISTS idx_basketball_teams_nba_franchise ON basketball_teams (nba_franchise);
CREATE INDEX IF NOT EXISTS idx_basketball_teams_code ON basketball_teams (code);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_basketball_teams_name ON basketball_teams (name);

-- Players performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_basketball_players_first_name ON basketball_players (first_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_basketball_players_last_name ON basketball_players (last_name);
CREATE INDEX IF NOT EXISTS idx_basketball_players_height ON basketball_players (height);
CREATE INDEX IF NOT EXISTS idx_basketball_players_weight ON basketball_players (weight);
CREATE INDEX IF NOT EXISTS idx_basketball_players_deleted_at ON basketball_players (deleted_at) WHERE deleted_at IS NULL;

-- Users performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email_address ON users (email_address);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users (deleted_at) WHERE deleted_at IS NULL;

-- Friendship performance indexes (additional to existing ones)
CREATE INDEX IF NOT EXISTS idx_friendships_user_status_created ON friendships (user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_status_created ON friendships (friend_id, status, created_at DESC);

-- Public Comments performance indexes
CREATE INDEX IF NOT EXISTS idx_public_comments_parent_id_parent_type ON public_comments (parent_id, parent_type);
CREATE INDEX IF NOT EXISTS idx_public_comments_parent_id_parent_type_created ON public_comments (parent_id, parent_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_comments_user_id ON public_comments (user_id);
CREATE INDEX IF NOT EXISTS idx_public_comments_anonymous_name ON public_comments (anonymous_name);
CREATE INDEX IF NOT EXISTS idx_public_comments_is_approved ON public_comments (is_approved);
CREATE INDEX IF NOT EXISTS idx_public_comments_created_at ON public_comments (created_at);
CREATE INDEX IF NOT EXISTS idx_public_comments_content_gin ON public_comments USING gin (to_tsvector('english', content));

-- Public Reactions performance indexes
CREATE INDEX IF NOT EXISTS idx_public_reactions_target_id_target_type ON public_reactions (target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_public_reactions_user_id ON public_reactions (user_id);
CREATE INDEX IF NOT EXISTS idx_public_reactions_anonymous_name ON public_reactions (anonymous_name);
CREATE INDEX IF NOT EXISTS idx_public_reactions_emoji ON public_reactions (emoji);
CREATE INDEX IF NOT EXISTS idx_public_reactions_is_approved ON public_reactions (is_approved);
CREATE INDEX IF NOT EXISTS idx_public_reactions_created_at ON public_reactions (created_at);

-- Additional composite indexes for complex queries (complementing the comprehensive game logs indexes above)
-- These provide additional optimization for specific query patterns

-- Analyze tables to update statistics
ANALYZE game_logs;
ANALYZE comments;
ANALYZE reactions;
ANALYZE basketball_games;
ANALYZE basketball_teams;
ANALYZE basketball_players;
ANALYZE users;
ANALYZE friendships;
ANALYZE public_comments;
ANALYZE public_reactions;
