-- 001_reaction_emojis.sql
-- Reference data for reaction emojis
--
-- This file populates the reaction_emojis table with allowed emojis.
-- The source of truth is src/lib/constants/index.ts REACTION_EMOJIS
--
-- To update emojis:
-- 1. Edit src/lib/constants/index.ts REACTION_EMOJIS
-- 2. Run: pnpm db:ensure-fixes:dev (calls syncReactionEmojis)

-- ============================================================================
-- REACTION EMOJIS REFERENCE DATA
-- ============================================================================

-- Populate allowed emojis (keep in sync with REACTION_EMOJIS in src/lib/constants/index.ts)
-- This is the initial seed data - the syncReactionEmojis() function will keep it updated
INSERT INTO "reaction_emojis" ("emoji") VALUES
    ('👍'), ('👎'), ('❤️'), ('😂'), ('😮'), ('😢'), ('😠'), ('🔥'), ('👏'), ('👀'),
    ('🚀'), ('💪'), ('🐐'), ('🎯'), ('🏀'), ('⚽'), ('🏈'), ('💯'), ('⭐'), ('🎉')
ON CONFLICT (emoji) DO NOTHING;

-- Add comment explaining the constraint
COMMENT ON TABLE "reaction_emojis" IS 'Reference table for allowed reaction emojis. Source of truth is src/lib/constants/index.ts REACTION_EMOJIS. Use syncReactionEmojis() function to keep in sync.';
