-- Add missing reaction indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_reactions_target" ON "reactions" ("target_id", "target_type");
CREATE INDEX IF NOT EXISTS "idx_reactions_user" ON "reactions" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_reactions_emoji" ON "reactions" ("emoji");
CREATE INDEX IF NOT EXISTS "idx_reactions_target_deleted" ON "reactions" ("target_id", "target_type", "deleted_at");
