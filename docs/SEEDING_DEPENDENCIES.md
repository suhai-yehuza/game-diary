# Seeding Dependencies and Order

## Overview

This document outlines the correct order for seeding data to ensure all foreign key constraints are satisfied and data integrity is maintained.

## Database Dependencies

### Foreign Key Relationships

```
users (id) ←─── friendships (user_id, friend_id)
users (id) ←─── game_logs (user_id)
users (id) ←─── comments (user_id)
users (id) ←─── reactions (user_id)
users (id) ←─── notifications (user_id)

nba_games (id) ←─── game_logs (game_id)
nba_games (id) ←─── game_ratings (game_id)

game_logs (id) ←─── comments (parent_id) [when parent_type = 'GAME_LOG']
comments (id) ←─── comments (parent_id) [when parent_type = 'COMMENT']
game_logs (id) ←─── reactions (target_id) [when target_type = 'GAME_LOG']
comments (id) ←─── reactions (target_id) [when target_type = 'COMMENT']

### Unique Constraints
- `game_logs`: (user_id, game_id) - One game log per user per game
- `reactions`: (user_id, target_type, target_id, emoji) - One reaction per emoji per user per target
```

## Correct Seeding Order

### 1. External API Data (Prerequisites)

**Must be seeded first before user data:**

- `leagues` - No dependencies
- `teams` - No dependencies
- `nba_games` - Depends on `teams.id` (home_team_id, away_team_id)
- `nba_players` - No dependencies
- `seasons` - Depends on `leagues.name`

### 2. User Data (Main Seeding)

**Order matters for foreign key constraints:**

#### Step 1: Users

```typescript
// No dependencies - can be seeded first
await db.insert(schema.users).values(users);
```

#### Step 2: Friendships

```typescript
// Depends on: users.id
await db.insert(schema.friendships).values(friendships);
```

#### Step 3: Game Logs

```typescript
// Depends on: users.id, nba_games.id
await db.insert(schema.game_logs).values(gameLogs);
```

#### Step 4: Comments (By Depth)

```typescript
// Depends on: users.id, game_logs.id, comments.id (for nested comments)
// Must be seeded by depth to ensure parent comments exist before children

const commentsByDepth = new Map<number, SeedComment[]>();
// Group comments by depth (0-5)
for (const comment of comments) {
  if (!commentsByDepth.has(comment.depth)) {
    commentsByDepth.set(comment.depth, []);
  }
  commentsByDepth.get(comment.depth)!.push(comment);
}

// Seed by depth: 0, 1, 2, 3, 4, 5
for (let depth = 0; depth <= 5; depth++) {
  const commentsAtDepth = commentsByDepth.get(depth) || [];
  for (const comment of commentsAtDepth) {
    await db.insert(schema.comments).values(comment);
  }
}
```

#### Step 5: Reactions

```typescript
// Depends on: users.id, game_logs.id, comments.id
await db.insert(schema.reactions).values(reactions);
```

### 3. Auto-Generated Data (Triggers)

**Automatically created by database triggers:**

#### Notifications

- Created when friendships are created/updated
- Created when comments are added
- Created when reactions are added

#### Game Ratings

- Created when game logs are created/updated/deleted
- Automatically calculates average ratings and total counts

## Data Generation Order

### In-Memory Generation (No Dependencies)

```typescript
// Generate all data in memory first
const users = generateUsers(count);
const friendships = generateFriendships(users, config);
const gameLogs = generateGameLogs(users, gameIds, config);
const comments = generateComments(users, gameLogs, config);
const reactions = generateReactions(users, gameLogs, comments, config);
```

### Database Seeding (Dependencies Matter)

```typescript
// Seed in dependency order
await seedUsers(users);
await seedFriendships(friendships);
await seedGameLogs(gameLogs);
await seedCommentsByDepth(comments);
await seedReactions(reactions);
```

## Comment Depth Seeding

### Why Depth Order Matters

Comments can reference other comments as parents (nested comments). To avoid foreign key constraint violations:

1. **Depth 0**: Top-level comments on game logs
2. **Depth 1**: Replies to depth 0 comments
3. **Depth 2**: Replies to depth 1 comments
4. **Depth 3**: Replies to depth 2 comments
5. **Depth 4**: Replies to depth 3 comments
6. **Depth 5**: Replies to depth 4 comments (max depth)

### Example Comment Tree

```
Game Log
├── Comment A (depth 0)
│   ├── Reply A1 (depth 1)
│   │   ├── Reply A1a (depth 2)
│   │   └── Reply A1b (depth 2)
│   └── Reply A2 (depth 1)
└── Comment B (depth 0)
    └── Reply B1 (depth 1)
```

## Data Constraints

### Game Log Uniqueness

- **One game log per user per game**: Users can only create one game log entry per game
- **Constraint**: `UNIQUE(user_id, game_id)`
- **Behavior**: Attempting to create a duplicate game log will fail with a constraint violation
- **Use Case**: Prevents duplicate game log entries and ensures data integrity

### Reaction Uniqueness

- **One reaction per emoji per user per target**: Users can only react once with each emoji to a specific game log or comment
- **Constraint**: `UNIQUE(user_id, target_type, target_id, emoji)`
- **Behavior**: Attempting to add a duplicate reaction will fail with a constraint violation
- **Use Case**: Prevents spam reactions and ensures data integrity

### Comment Depth Limits

- **Maximum depth**: 5 levels of nested comments
- **Constraint**: `CHECK (depth >= 0 AND depth <= 5)`
- **Behavior**: Comments beyond depth 5 will be rejected

## Error Prevention

### Common Issues

1. **Foreign Key Violations**: Seeding child records before parent records exist
2. **Circular Dependencies**: Comments referencing non-existent parent comments
3. **Missing Prerequisites**: Trying to seed user data before external API data

### Validation Checks

```typescript
// Check prerequisites before seeding
const teams = await db.select().from(schema.teams);
const games = await db.select().from(schema.nba_games);
if (teams.length === 0 || games.length === 0) {
  throw new Error('External API data must be seeded first');
}
```

## Clear Order (Reverse Dependencies)

When clearing data, reverse the seeding order:

```typescript
// Clear in reverse dependency order
await db.delete(schema.notifications);
await db.delete(schema.reactions);
await db.delete(schema.comments);
await db.delete(schema.game_logs);
await db.delete(schema.game_ratings);
await db.delete(schema.friendships);
await db.delete(schema.users);
```

## Testing Seeding

### Manual Verification

```sql
-- Check seeding order worked correctly
SELECT
  'users' as table_name, COUNT(*) as count
FROM users
UNION ALL
SELECT 'friendships', COUNT(*) FROM friendships
UNION ALL
SELECT 'game_logs', COUNT(*) FROM game_logs
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'reactions', COUNT(*) FROM reactions
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'game_ratings', COUNT(*) FROM game_ratings;
```

### Dependency Validation

```sql
-- Check for orphaned records
SELECT COUNT(*) as orphaned_friendships
FROM friendships f
LEFT JOIN users u ON f.user_id = u.id
WHERE u.id IS NULL;

SELECT COUNT(*) as orphaned_comments
FROM comments c
LEFT JOIN users u ON c.user_id = u.id
WHERE u.id IS NULL;
```

## Best Practices

1. **Always check prerequisites** before seeding user data
2. **Seed by depth** for nested comments
3. **Use transactions** for atomic seeding operations
4. **Validate foreign keys** after seeding
5. **Clear in reverse order** to avoid constraint violations
6. **Test seeding** in a clean database environment
