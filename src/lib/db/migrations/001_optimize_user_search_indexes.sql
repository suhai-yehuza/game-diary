-- Migration: Optimize user search performance
-- Description: Add indexes to improve user search query performance
-- Date: 2024-12-19

-- Add indexes for user search optimization
-- These indexes will significantly improve the performance of ILIKE queries
-- used in the searchUsers GraphQL resolver

-- Index for username search (case-insensitive)
CREATE INDEX IF NOT EXISTS "idx_users_username_ilike" ON "users" USING gin (username gin_trgm_ops);

-- Index for first_name search (case-insensitive)
CREATE INDEX IF NOT EXISTS "idx_users_first_name_ilike" ON "users" USING gin (first_name gin_trgm_ops);

-- Index for last_name search (case-insensitive)
CREATE INDEX IF NOT EXISTS "idx_users_last_name_ilike" ON "users" USING gin (last_name gin_trgm_ops);

-- Index for email_address search (case-insensitive)
CREATE INDEX IF NOT EXISTS "idx_users_email_address_ilike" ON "users" USING gin (email_address gin_trgm_ops);

-- Composite index for common search patterns (deleted_at + created_at)
-- This helps with the most common query pattern: active users ordered by creation date
CREATE INDEX IF NOT EXISTS "idx_users_active_created_at" ON "users" ("deleted_at", "created_at" DESC)
WHERE "deleted_at" IS NULL;

-- Enable the pg_trgm extension if not already enabled
-- This extension provides trigram matching for ILIKE operations
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add comments for documentation
COMMENT ON INDEX "idx_users_username_ilike" IS 'GIN index for case-insensitive username search using trigrams';
COMMENT ON INDEX "idx_users_first_name_ilike" IS 'GIN index for case-insensitive first_name search using trigrams';
COMMENT ON INDEX "idx_users_last_name_ilike" IS 'GIN index for case-insensitive last_name search using trigrams';
COMMENT ON INDEX "idx_users_email_address_ilike" IS 'GIN index for case-insensitive email_address search using trigrams';
COMMENT ON INDEX "idx_users_active_created_at" IS 'Composite index for active users ordered by creation date';
