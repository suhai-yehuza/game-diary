# Consolidated Migration

## Overview

This document describes the consolidated migration file that combines all previous migrations into a single, comprehensive database setup with cascade delete constraints already applied.

## Migration File

**File:** `drizzle/000_schema_with_cascade.sql`

This single migration file includes:

### 1. Table Creation

- All tables with proper structure and constraints
- Correct data types and default values
- Primary keys and unique constraints

### 2. Foreign Key Constraints with CASCADE DELETE

- **User-related cascades:**

  - `friendships.friend_id` → `users.id` (CASCADE)
  - `friendships.user_id` → `users.id` (CASCADE)
  - `game_logs.user_id` → `users.id` (CASCADE)
  - `comments.user_id` → `users.id` (CASCADE)
  - `reactions.user_id` → `users.id` (CASCADE)
  - `notifications.user_id` → `users.id` (CASCADE)

- **Game-related cascades:**
  - `game_logs.game_id` → `nba_games.id` (CASCADE)
  - `game_ratings.game_id` → `nba_games.id` (CASCADE)

### 3. Additional Constraints

- Comment depth validation (0-5)
- Game log watched settings validation
- Game log watched scope validation
- Friendship status validation
- Reaction target types and emojis validation
- Comment parent types validation

### 4. Performance Indexes

- Comments: depth, parent, user, created, deleted_at
- Reactions: target, user, emoji
- Notifications: user_id + resolved, target_id + target_type
- Users: inbound/outbound friendship arrays (GIN indexes)

### 5. Triggers and Functions

- **Game ratings auto-update:** Maintains average ratings when game logs change
- **Friendship notifications:** Creates notifications for friend requests and acceptances
- **Comment notifications:** Notifies users when their content is commented on
- **Reaction notifications:** Notifies users when their content receives reactions
- **Friendship arrays:** Maintains friendship ID arrays in users table

## Usage

### For Fresh Database Setup

1. **Reset your database** (if needed):

   ```bash
   pnpm tsx -r dotenv/config scripts/db/truncate-internal-tables.ts
   ```

2. **Apply the consolidated migration**:

   ```bash
   pnpm tsx -r dotenv/config scripts/db/apply-consolidated-migration.ts
   ```

3. **Verify the setup**:
   ```bash
   pnpm tsx -r dotenv/config scripts/test-cascade-delete.ts
   ```

### For Production Deployment

The consolidated migration can be used for:

- Fresh production database setup
- Development environment reset
- Testing environment setup

## Benefits

1. **Single Migration:** All schema setup in one file
2. **Cascade Delete Ready:** All foreign keys have proper cascade delete constraints
3. **Complete Setup:** Includes all triggers, functions, and indexes
4. **Consistent State:** Ensures database is in a known, consistent state
5. **Easy Reset:** Can be used to completely reset the database

## Cascade Delete Behavior

When a user is deleted:

- All their friendships are deleted
- All their game logs are deleted
- All their comments are deleted
- All their reactions are deleted
- All their notifications are deleted

When a game is deleted:

- All related game logs are deleted
- All related game ratings are deleted

## Related Files

- `drizzle/000_schema_with_cascade.sql` - The consolidated migration
- `scripts/db/apply-consolidated-migration.ts` - Script to apply the migration
- `scripts/db/truncate-internal-tables.ts` - Script to reset internal tables
- `scripts/test-cascade-delete.ts` - Script to test cascade delete functionality

## Migration History

This consolidated migration replaces the following individual migrations:

- `0000_clear_chamber.sql` - Initial table creation
- `000_optimized_triggers_and_constraints.sql` - Triggers and constraints
- `001_add_cascade_delete_constraints.sql` - User cascade deletes
- `002_fix_cascade_delete_constraints.sql` - Fixed cascade deletes
- `003_cascade_delete_games.sql` - Game cascade deletes

## Notes

- This migration is designed for fresh database setup
- It includes all cascade delete constraints from the start
- All triggers and functions are created with proper error handling
- The migration is idempotent and can be run multiple times safely
