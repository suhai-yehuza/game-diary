# Database Migrations

This directory contains SQL migration files for the game diary application.

## Migration Files

1. **000_optimized_triggers_and_constraints.sql** - Comprehensive database setup including:
   - Comment depth field for nested comments (0-5 levels)
   - Game ratings triggers
   - Friendship notification triggers
   - Comment notification triggers
   - Reaction notification triggers
   - Friendship user array triggers
   - Performance indexes

## Applying Migrations

### Automated Migration (Recommended)

Use the built-in migration scripts that track which migrations have been applied:

```bash
# Apply all pending migrations to development database
pnpm db:migrate:dev

# Apply all pending migrations to production database
pnpm db:migrate:prod

# Preview what would be applied without making changes
pnpm db:migrate:dry-run

# Or run directly with tsx
tsx scripts/apply-migrations.ts development
tsx scripts/apply-migrations.ts production --dry-run
```

The migration script:

- Tracks which migrations have been applied in a `migration_versions` table
- Checksums each migration file to detect changes
- Applies migrations in alphabetical order
- Skips already-applied migrations
- Reports any errors without stopping other migrations
- Provides a summary of applied, skipped, and failed migrations

### Manual Migration

If you prefer to apply migrations manually:

```bash
# Using psql
psql -h your-host -U your-user -d your-database -f src/lib/db/migrations/001_base_schema.sql
psql -h your-host -U your-user -d your-database -f src/lib/db/migrations/002_game_ratings_trigger.sql
psql -h your-host -U your-user -d your-database -f src/lib/db/migrations/003_friendship_notification_triggers.sql
psql -h your-host -U your-user -d your-database -f src/lib/db/migrations/004_friendship_user_arrays_triggers.sql
```

## What the New Triggers Do

### 003_friendship_notification_triggers.sql

- Creates notifications when:
  - A friend request is sent (recipient gets notified)
  - A friend request is accepted (sender gets notified)
  - A friend request is rejected (sender gets notified)

### 004_friendship_user_arrays_triggers.sql

- Automatically maintains `inboundFriendshipIds` and `outboundFriendshipIds` arrays on the users table
- Updates these arrays when friendships are created, updated, or deleted
- Includes a rebuild function to populate existing data
- Creates performance indexes on the friendships table

### 000_optimized_triggers_and_constraints.sql

This comprehensive migration includes all triggers and optimizations:

#### Friendship Notifications

- Creates notifications when:
  - A friend request is sent (recipient gets notified)
  - A friend request is accepted (sender gets notified)
  - A friend request is rejected (sender gets notified)

#### Comment Notifications

- Creates notifications when:
  - Someone comments on your game log
  - Someone replies to your comment
- Skips notifications for self-comments

#### Reaction Notifications

- Creates notifications when:
  - Someone reacts to your game log
  - Someone reacts to your comment
- Includes the emoji in the notification message
- Skips notifications for self-reactions

#### Performance Optimizations

- Creates indexes for notification queries
- Optimizes friendship array operations
- Includes game rating triggers

### Comment Depth Support

The migration includes support for nested comments with depth tracking:

- Adds `depth` integer column to comments table (default: 0)
- Adds constraint to limit depth to 0-5 levels
- Creates index on depth for efficient querying
- Updates existing comments to depth 0 (top-level)
- Enables threaded comment conversations up to 5 levels deep
