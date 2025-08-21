-- Migration: Optimize reactions index with partial index
-- This migration creates a partial index for better performance on reactions queries

-- Drop the existing index
DROP INDEX IF EXISTS idx_reactions_target_deleted;

-- Create the optimized partial index
CREATE INDEX IF NOT EXISTS idx_reactions_target_deleted
ON reactions (target_id, target_type, deleted_at)
WHERE deleted_at IS NULL;

-- Add a comment explaining the optimization
COMMENT ON INDEX idx_reactions_target_deleted IS 'Partial index for non-deleted reactions - improves query performance by excluding soft-deleted records';
