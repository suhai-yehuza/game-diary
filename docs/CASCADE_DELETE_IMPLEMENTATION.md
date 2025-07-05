# Cascade Delete Implementation

## Overview

This document describes the implementation of cascade delete functionality for user-related data. When a user is hard deleted from the `users` table, all their related data in other tables is automatically deleted to maintain referential integrity and prevent orphaned records.

## Tables Affected

The following tables now have CASCADE DELETE constraints that reference the `users.id` field:

1. **`game_logs`** - User's game logs and ratings
2. **`friendships`** - User's friendships (both as user and friend)
3. **`comments`** - User's comments on various content
4. **`reactions`** - User's reactions (likes, etc.)
5. **`notifications`** - User's notifications

## Implementation Details

### Database Migration

A new migration file was created: `drizzle/001_add_cascade_delete_constraints.sql`

This migration:

1. Drops existing foreign key constraints that reference `users.id`
2. Recreates them with `ON DELETE CASCADE` option
3. Ensures all user-related data is automatically deleted when a user is deleted

### Schema Updates

The following schema files were updated to include CASCADE DELETE options:

- `src/lib/db/schema/user-schemas.ts`
- `src/lib/db/schema/game-schemas.ts`
- `src/lib/db/schema/notification-schemas.ts`

### Example Schema Changes

```typescript
// Before
user_id: varchar('user_id', { length: 255 }).references(() => users.id),

// After
user_id: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }),
```

## Usage

### Applying the Migration

To apply the cascade delete migration:

```bash
# Run the migration script
pnpm tsx scripts/db/apply-cascade-delete-migration.ts
```

### Testing the Implementation

To test that cascade delete works correctly:

```bash
# Run the test script
pnpm tsx scripts/test-cascade-delete.ts
```

The test script will:

1. Create test data (users, game logs, friendships, comments, reactions, notifications)
2. Delete a test user
3. Verify that all related records are automatically deleted
4. Clean up any remaining test data

### Manual Verification

You can manually verify the constraints are in place by running this SQL query:

```sql
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND rc.unique_constraint_name = (
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'users'
        AND constraint_type = 'PRIMARY KEY'
    )
ORDER BY tc.table_name, tc.constraint_name;
```

All constraints should show `delete_rule = 'CASCADE'`.

## Behavior

When a user is deleted from the `users` table:

1. **Game Logs**: All game logs created by the user are deleted
2. **Friendships**: All friendships where the user is either the `user_id` or `friend_id` are deleted
3. **Comments**: All comments created by the user are deleted
4. **Reactions**: All reactions created by the user are deleted
5. **Notifications**: All notifications belonging to the user are deleted

## Benefits

1. **Data Integrity**: Prevents orphaned records in the database
2. **Automatic Cleanup**: No need to manually delete related data
3. **Consistency**: Ensures all user data is properly removed
4. **Performance**: Database-level constraints are more efficient than application-level cleanup

## Considerations

1. **Irreversible**: Once a user is deleted, all their data is permanently removed
2. **No Soft Delete**: This implementation is for hard deletes only
3. **Cascade Depth**: Only direct relationships are affected (not nested relationships)
4. **Performance**: Large amounts of related data may slow down the delete operation

## Rollback

If you need to rollback the cascade delete constraints, you can:

1. Drop the CASCADE constraints
2. Recreate them without the CASCADE option
3. Implement application-level cleanup instead

However, this is not recommended as it would require manual cleanup of orphaned records.

## Related Files

- `drizzle/001_add_cascade_delete_constraints.sql` - Database migration
- `scripts/db/apply-cascade-delete-migration.ts` - Migration application script
- `scripts/test-cascade-delete.ts` - Test script
- `src/lib/db/schema/user-schemas.ts` - Updated user schemas
- `src/lib/db/schema/game-schemas.ts` - Updated game schemas
- `src/lib/db/schema/notification-schemas.ts` - Updated notification schemas
