-- Migration: Update reaction emoji constraints to match single source of truth
-- This migration updates the CHECK constraints to allow all emojis from constant.types.ts
-- Generated from: src/lib/types/constant.types.ts

-- Drop the existing emoji check constraint
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS reactions_emoji_check;

-- Add the new emoji check constraint with all valid emojis from single source of truth
ALTER TABLE reactions ADD CONSTRAINT reactions_emoji_check
CHECK (emoji IN ('👍', '👎', '❤️', '😂', '😮', '😢', '😠', '🔥', '👏', '👀', '🚀', '💪', '🐐', '🎯', '🏀', '⚽', '🏈', '⚾', '🎾', '⛳'));

-- Add a comment explaining the constraint
COMMENT ON CONSTRAINT reactions_emoji_check ON reactions IS 'Ensures only valid reaction emojis are stored - from single source of truth in constant.types.ts';
