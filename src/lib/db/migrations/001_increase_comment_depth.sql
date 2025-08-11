-- Migration: Increase comment depth limit from 5 to 10 levels
-- This allows for deeper nested comment threads

-- Drop the existing depth constraint
ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "comments_depth_check";

-- Add the new depth constraint with increased limit
ALTER TABLE "comments" ADD CONSTRAINT "comments_depth_check"
    CHECK (depth >= 0 AND depth <= 10);

-- Update the schema comment to reflect the new limit
COMMENT ON COLUMN "comments"."depth" IS 'Track comment nesting depth (0-10 levels)';
