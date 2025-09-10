-- ============================================================================
-- CONSOLIDATED INDEXES - Game Diary Database
-- ============================================================================
-- Last Updated: 2024-12-19
-- Purpose: All database indexes consolidated and optimized
-- Dependencies: Base schema (000_base_schema.sql), Functions (001_consolidated_functions.sql)
--
-- This file consolidates and optimizes:
-- - User search and performance indexes
-- - Game logs performance indexes (most critical)
-- - Comments and reactions indexes
-- - Basketball data indexes
-- - Friendship indexes
-- - Public content indexes
-- - Audit and security indexes
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable required extensions for advanced indexing
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS TABLE INDEXES
-- ============================================================================

-- User search optimization indexes (GIN indexes for case-insensitive search)
CREATE INDEX IF NOT EXISTS "idx_users_username_ilike" ON "users" USING gin (username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_users_first_name_ilike" ON "users" USING gin (first_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_users_last_name_ilike" ON "users" USING gin (last_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_users_email_address_ilike" ON "users" USING gin (email_address gin_trgm_ops);

-- User performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email_address ON users (email_address);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users (deleted_at) WHERE deleted_at IS NULL;

-- Composite index for common search patterns (deleted_at + created_at)
CREATE INDEX IF NOT EXISTS "idx_users_active_created_at" ON "users" ("deleted_at", "created_at" DESC)
WHERE "deleted_at" IS NULL;

-- Full-text search indexes for user names
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_first_name_gin
ON users USING gin (to_tsvector('english', first_name))
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_last_name_gin
ON users USING gin (to_tsvector('english', last_name))
WHERE deleted_at IS NULL;

-- ============================================================================
-- GAME LOGS TABLE INDEXES (Most Critical for Performance)
-- ============================================================================

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

-- Additional game logs indexes for filtering and sorting
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_watched_setting
ON game_logs (watched_setting)
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_watched_scope
ON game_logs (watched_scope)
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_rating_for_game
ON game_logs (rating_for_game)
WHERE deleted_at IS NULL;

-- Full-text search indexes for notes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_notes_gin
ON game_logs USING gin (to_tsvector('english', notes))
WHERE deleted_at IS NULL AND notes IS NOT NULL;

-- Composite indexes for common Game Logs query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_user_classification_rating
ON game_logs (user_id, classification, rating_for_game, created_at DESC)
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_classification_rating_created
ON game_logs (classification, rating_for_game, created_at DESC)
WHERE deleted_at IS NULL;

-- Index for date range filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_watched_date_range
ON game_logs (watched_date, created_at DESC)
WHERE deleted_at IS NULL;

-- ============================================================================
-- COMMENTS TABLE INDEXES
-- ============================================================================

-- Comments performance indexes
CREATE INDEX IF NOT EXISTS idx_comments_parent_type_parent_id ON comments (parent_type, parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_type_parent_id_created ON comments (parent_type, parent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user_id_created ON comments (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments (deleted_at) WHERE deleted_at IS NULL;

-- Enhanced comments indexes for efficient count queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_parent_id_parent_type_deleted
ON comments (parent_id, parent_type, deleted_at)
WHERE deleted_at IS NULL;

-- Index for childComments JSONB array operations
CREATE INDEX IF NOT EXISTS "idx_comments_child_comments" ON "comments" USING gin ("childComments");

-- ============================================================================
-- REACTIONS TABLE INDEXES
-- ============================================================================

-- Reactions performance indexes
CREATE INDEX IF NOT EXISTS idx_reactions_target_type_target_id ON reactions (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reactions_target_type_target_id_created ON reactions (target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id_created ON reactions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reactions_deleted_at ON reactions (deleted_at) WHERE deleted_at IS NULL;

-- Enhanced reactions indexes for efficient count queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reactions_target_id_target_type_deleted
ON reactions (target_id, target_type, deleted_at)
WHERE deleted_at IS NULL;

-- Optimized partial index for non-deleted reactions
CREATE INDEX IF NOT EXISTS "idx_reactions_target_deleted" ON "reactions" ("target_id", "target_type", "deleted_at")
WHERE "deleted_at" IS NULL;
COMMENT ON INDEX "idx_reactions_target_deleted" IS 'Partial index for non-deleted reactions - improves query performance by excluding soft-deleted records';

-- ============================================================================
-- BASKETBALL GAMES TABLE INDEXES
-- ============================================================================

-- Games performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_basketball_games_date_desc ON basketball_games (date DESC);
CREATE INDEX IF NOT EXISTS idx_basketball_games_status ON basketball_games (status);
CREATE INDEX IF NOT EXISTS idx_basketball_games_season ON basketball_games (season);
CREATE INDEX IF NOT EXISTS idx_basketball_games_deleted_at ON basketball_games (deleted_at) WHERE deleted_at IS NULL;

-- Index for game date filtering (through basketball_games join)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_basketball_games_date_status
ON basketball_games (date, status)
WHERE deleted_at IS NULL;

-- Basketball games indexes for team name filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_basketball_games_teams_gin
ON basketball_games USING gin (teams)
WHERE deleted_at IS NULL;

-- ============================================================================
-- BASKETBALL TEAMS TABLE INDEXES
-- ============================================================================

-- Teams performance indexes
CREATE INDEX IF NOT EXISTS idx_basketball_teams_conference ON basketball_teams (conference);
CREATE INDEX IF NOT EXISTS idx_basketball_teams_nba_franchise ON basketball_teams (nba_franchise);
CREATE INDEX IF NOT EXISTS idx_basketball_teams_code ON basketball_teams (code);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_basketball_teams_name ON basketball_teams (name);

-- ============================================================================
-- BASKETBALL PLAYERS TABLE INDEXES
-- ============================================================================

-- Players performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_basketball_players_first_name ON basketball_players (first_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_basketball_players_last_name ON basketball_players (last_name);
CREATE INDEX IF NOT EXISTS idx_basketball_players_height ON basketball_players (height);
CREATE INDEX IF NOT EXISTS idx_basketball_players_weight ON basketball_players (weight);
CREATE INDEX IF NOT EXISTS idx_basketball_players_deleted_at ON basketball_players (deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- FRIENDSHIPS TABLE INDEXES
-- ============================================================================

-- Core performance indexes for friendships
CREATE INDEX IF NOT EXISTS "idx_friendships_status_users" ON "friendships" ("status", "user_id", "friend_id");
CREATE INDEX IF NOT EXISTS "idx_friendships_bidirectional" ON "friendships" ("user_id", "friend_id", "status");

-- Individual column indexes for filtering
CREATE INDEX IF NOT EXISTS "idx_friendships_status" ON "friendships" ("status");
CREATE INDEX IF NOT EXISTS "idx_friendships_user_id" ON "friendships" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_friendships_friend_id" ON "friendships" ("friend_id");

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "idx_friendships_user_friend_status" ON "friendships" ("user_id", "friend_id", "status");
CREATE INDEX IF NOT EXISTS "idx_friendships_friend_user_status" ON "friendships" ("friend_id", "user_id", "status");

-- Friendship performance indexes (additional to existing ones)
CREATE INDEX IF NOT EXISTS idx_friendships_user_status_created ON friendships (user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_status_created ON friendships (friend_id, status, created_at DESC);

-- ============================================================================
-- PUBLIC COMMENTS TABLE INDEXES
-- ============================================================================

-- Public Comments performance indexes
CREATE INDEX IF NOT EXISTS idx_public_comments_parent_id_parent_type ON public_comments (parent_id, parent_type);
CREATE INDEX IF NOT EXISTS idx_public_comments_parent_id_parent_type_created ON public_comments (parent_id, parent_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_comments_user_id ON public_comments (user_id);
CREATE INDEX IF NOT EXISTS idx_public_comments_anonymous_name ON public_comments (anonymous_name);
CREATE INDEX IF NOT EXISTS idx_public_comments_is_approved ON public_comments (is_approved);
CREATE INDEX IF NOT EXISTS idx_public_comments_created_at ON public_comments (created_at);
CREATE INDEX IF NOT EXISTS idx_public_comments_content_gin ON public_comments USING gin (to_tsvector('english', content));

-- ============================================================================
-- PUBLIC REACTIONS TABLE INDEXES
-- ============================================================================

-- Public Reactions performance indexes
CREATE INDEX IF NOT EXISTS idx_public_reactions_target_id_target_type ON public_reactions (target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_public_reactions_user_id ON public_reactions (user_id);
CREATE INDEX IF NOT EXISTS idx_public_reactions_anonymous_name ON public_reactions (anonymous_name);
CREATE INDEX IF NOT EXISTS idx_public_reactions_emoji ON public_reactions (emoji);
CREATE INDEX IF NOT EXISTS idx_public_reactions_is_approved ON public_reactions (is_approved);
CREATE INDEX IF NOT EXISTS idx_public_reactions_created_at ON public_reactions (created_at);

-- ============================================================================
-- NOTIFICATIONS TABLE INDEXES
-- ============================================================================

-- Notification indexes
CREATE INDEX IF NOT EXISTS "idx_notifications_user_resolved" ON "notifications" ("user_id", "resolved");
CREATE INDEX IF NOT EXISTS "idx_notifications_target" ON "notifications" ("target_id", "target_type");
CREATE INDEX IF NOT EXISTS "idx_notifications_created_at" ON "notifications" ("created_at");

-- ============================================================================
-- AUDIT LOGGING TABLE INDEXES
-- ============================================================================

-- Audit log indexes
CREATE INDEX IF NOT EXISTS "audit_logs_timestamp_idx" ON "audit_logs" ("timestamp");
CREATE INDEX IF NOT EXISTS "audit_logs_category_idx" ON "audit_logs" ("category");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs" ("action");
CREATE INDEX IF NOT EXISTS "audit_logs_severity_idx" ON "audit_logs" ("severity");
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "audit_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "audit_logs_resource_type_idx" ON "audit_logs" ("resource_type");
CREATE INDEX IF NOT EXISTS "audit_logs_resource_id_idx" ON "audit_logs" ("resource_id");
CREATE INDEX IF NOT EXISTS "audit_logs_success_idx" ON "audit_logs" ("success");

-- Key rotation log indexes
CREATE INDEX IF NOT EXISTS "key_rotation_logs_key_id_idx" ON "key_rotation_logs" ("key_id");
CREATE INDEX IF NOT EXISTS "key_rotation_logs_environment_idx" ON "key_rotation_logs" ("environment");
CREATE INDEX IF NOT EXISTS "key_rotation_logs_status_idx" ON "key_rotation_logs" ("status");
CREATE INDEX IF NOT EXISTS "key_rotation_logs_rotated_by_idx" ON "key_rotation_logs" ("rotated_by");

-- RLS access log indexes
CREATE INDEX IF NOT EXISTS "rls_access_logs_requesting_user_id_idx" ON "rls_access_logs" ("requesting_user_id");
CREATE INDEX IF NOT EXISTS "rls_access_logs_target_user_id_idx" ON "rls_access_logs" ("target_user_id");
CREATE INDEX IF NOT EXISTS "rls_access_logs_table_name_idx" ON "rls_access_logs" ("table_name");
CREATE INDEX IF NOT EXISTS "rls_access_logs_operation_idx" ON "rls_access_logs" ("operation");
CREATE INDEX IF NOT EXISTS "rls_access_logs_access_granted_idx" ON "rls_access_logs" ("access_granted");
CREATE INDEX IF NOT EXISTS "rls_access_logs_created_at_idx" ON "rls_access_logs" ("created_at");

-- ============================================================================
-- INDEX COMMENTS FOR DOCUMENTATION
-- ============================================================================

-- User search indexes
COMMENT ON INDEX "idx_users_username_ilike" IS 'GIN index for case-insensitive username search using trigrams';
COMMENT ON INDEX "idx_users_first_name_ilike" IS 'GIN index for case-insensitive first_name search using trigrams';
COMMENT ON INDEX "idx_users_last_name_ilike" IS 'GIN index for case-insensitive last_name search using trigrams';
COMMENT ON INDEX "idx_users_email_address_ilike" IS 'GIN index for case-insensitive email_address search using trigrams';
COMMENT ON INDEX "idx_users_active_created_at" IS 'Composite index for active users ordered by creation date';

-- Game logs indexes
COMMENT ON INDEX "idx_game_logs_created_at_desc" IS 'Primary index for game logs ordered by creation date (most important)';
COMMENT ON INDEX "idx_game_logs_user_created_at" IS 'Index for user-specific game logs queries';
COMMENT ON INDEX "idx_game_logs_classification_created_at" IS 'Index for classification-based game logs queries';
COMMENT ON INDEX "idx_game_logs_cursor_pagination" IS 'Index for cursor-based pagination in game logs';

-- Friendships index comments
COMMENT ON INDEX "idx_friendships_status_users" IS 'Optimizes friendship status queries';
COMMENT ON INDEX "idx_friendships_bidirectional" IS 'Optimizes bidirectional friendship lookups';
COMMENT ON INDEX "idx_friendships_user_id" IS 'Optimizes user-specific friendship lookups';
COMMENT ON INDEX "idx_friendships_friend_id" IS 'Optimizes friend-specific friendship lookups';
COMMENT ON INDEX "idx_friendships_status" IS 'Optimizes status filtering';
COMMENT ON INDEX "idx_friendships_user_friend_status" IS 'Optimizes user-friend-status queries';
COMMENT ON INDEX "idx_friendships_friend_user_status" IS 'Optimizes friend-user-status queries';

-- NBA games index comments
COMMENT ON INDEX "idx_basketball_games_season" IS 'Optimizes season-based game queries';
COMMENT ON INDEX "idx_basketball_games_date" IS 'Optimizes date-based game queries';
COMMENT ON INDEX "idx_basketball_games_status" IS 'Optimizes status-based game filtering';
COMMENT ON INDEX "idx_basketball_games_season_date" IS 'Optimizes season and date range queries';
COMMENT ON INDEX "idx_basketball_games_game_id" IS 'Optimizes external API ID lookups';

-- NBA players index comments
COMMENT ON INDEX "idx_basketball_players_first_name" IS 'Optimizes first name searches';
COMMENT ON INDEX "idx_basketball_players_last_name" IS 'Optimizes last name searches';
COMMENT ON INDEX "idx_basketball_players_teams" IS 'Optimizes JSON team data searches using GIN index';

-- ============================================================================
-- ANALYZE TABLES TO UPDATE STATISTICS
-- ============================================================================

-- Update table statistics for optimal query planning
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
ANALYZE notifications;
ANALYZE audit_logs;
ANALYZE key_rotation_logs;
ANALYZE rls_access_logs;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Note: This consolidated indexes file replaces:
-- - All indexes from 000_base_schema.sql
-- - All indexes from 001_performance_indexes.sql
-- - All indexes from triggers.sql
--
-- All indexes are optimized for:
-- - Game logs queries (highest priority)
-- - User search and authentication
-- - Social features (comments, reactions, friendships)
-- - Basketball data queries
-- - Public content queries
-- - Audit and security monitoring
--
-- Indexes use CONCURRENTLY where possible to avoid blocking operations
-- and include proper WHERE clauses for partial indexes to improve performance.

-- Additional composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_user_classification_created
ON game_logs (user_id, classification, created_at DESC)
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_game_user_rating
ON game_logs (game_id, user_id, rating_for_game)
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_basketball_games_date_status_season
ON basketball_games (date DESC, status, season)
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_parent_created
ON comments (parent_id, created_at DESC)
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reactions_target_emoji_created
ON reactions (target_id, emoji, created_at DESC)
WHERE deleted_at IS NULL;

-- JSONB indexes for frequently queried fields
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_basketball_games_teams_gin
ON basketball_games USING GIN (teams)
WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_basketball_games_scores_gin
ON basketball_games USING GIN (scores)
WHERE deleted_at IS NULL;

-- Partial indexes for active content
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_logs_active_user_date
ON game_logs (user_id, watched_date DESC)
WHERE deleted_at IS NULL AND classification = 'PUBLIC';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread
ON notifications (user_id, created_at DESC)
WHERE deleted_at IS NULL AND read = false;
