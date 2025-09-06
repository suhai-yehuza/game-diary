# Test User Interactions Seeding Script

This script creates a comprehensive test user interaction ecosystem for the Game Diary application, including friendships, game logs, reactions, and comments.

## Overview

The script creates realistic user interactions by:

- Loading test users from environment-specific JSON files
- Creating bidirectional friendships between all test users
- Generating random game logs (10-100 per user)
- Creating reactions and comments on 1-2% of game logs
- Adding external user interactions for engagement depth
- Creating child comments with reactions for realistic engagement patterns

## Features

- **Idempotent Operations**: Safe to run multiple times without conflicts
- **Environment-Specific**: Loads users from dev/prod JSON files
- **Clean Mode**: Removes existing test data before seeding
- **Deterministic Mode**: Generates consistent data for testing
- **Dry Run Mode**: Preview actions without database changes
- **Comprehensive Logging**: Detailed progress and error reporting
- **Graceful Degradation**: Handles cases with no external users

## Prerequisites

### Required Files

- `src/lib/db/seed/test-users/test-users.dev.json` - Development user data
- `src/lib/db/seed/test-users/test-users.prod.json` - Production user data

### Database Requirements

- Existing NBA games data in the database
- Proper users table schema
- Database connection configured in environment variables

### Environment Variables

- `DATABASE_URL` or `POSTGRES_URL` - Database connection string
- Environment-specific `.env.development` or `.env.production` files

## Usage

### Basic Commands

```bash
# Development seeding (default)
pnpm seed:test-user-interactions:dev

# Production seeding
pnpm seed:test-user-interactions:prod

# Preview what would be created (dry run)
pnpm seed:test-user-interactions:dry-run
```

### Advanced Commands

```bash
# Clean reset before seeding
pnpm seed:test-user-interactions:clean:dev
pnpm seed:test-user-interactions:clean:prod

# Generate consistent test data
pnpm seed:test-user-interactions:deterministic:dev
pnpm seed:test-user-interactions:deterministic:prod

# Clean reset with consistent data
pnpm seed:test-user-interactions:clean:deterministic:dev
pnpm seed:test-user-interactions:clean:deterministic:prod
```

### All Available Scripts

| Script                                                   | Description                 |
| -------------------------------------------------------- | --------------------------- |
| `seed:test-user-interactions`                            | Default development seeding |
| `seed:test-user-interactions:dev`                        | Development environment     |
| `seed:test-user-interactions:prod`                       | Production environment      |
| `seed:test-user-interactions:clean`                      | Clean + seed development    |
| `seed:test-user-interactions:clean:dev`                  | Clean + seed development    |
| `seed:test-user-interactions:clean:prod`                 | Clean + seed production     |
| `seed:test-user-interactions:deterministic`              | Deterministic development   |
| `seed:test-user-interactions:deterministic:dev`          | Deterministic development   |
| `seed:test-user-interactions:deterministic:prod`         | Deterministic production    |
| `seed:test-user-interactions:clean:deterministic`        | Clean + deterministic dev   |
| `seed:test-user-interactions:clean:deterministic:dev`    | Clean + deterministic dev   |
| `seed:test-user-interactions:clean:deterministic:prod`   | Clean + deterministic prod  |
| `seed:test-user-interactions:dry-run`                    | Preview development         |
| `seed:test-user-interactions:dry-run:dev`                | Preview development         |
| `seed:test-user-interactions:dry-run:prod`               | Preview production          |
| `seed:test-user-interactions:clean:dry-run`              | Preview clean + seed dev    |
| `seed:test-user-interactions:clean:dry-run:dev`          | Preview clean + seed dev    |
| `seed:test-user-interactions:clean:dry-run:prod`         | Preview clean + seed prod   |
| `seed:test-user-interactions:deterministic:dry-run`      | Preview deterministic dev   |
| `seed:test-user-interactions:deterministic:dry-run:dev`  | Preview deterministic dev   |
| `seed:test-user-interactions:deterministic:dry-run:prod` | Preview deterministic prod  |

## Command Line Options

### Direct Script Usage

```bash
# Basic usage
pnpm tsx scripts/seed-test-user-interactions.ts --env=development
pnpm tsx scripts/seed-test-user-interactions.ts --env=production

# With options
pnpm tsx scripts/seed-test-user-interactions.ts --env=development --dry-run
pnpm tsx scripts/seed-test-user-interactions.ts --env=production --clean
pnpm tsx scripts/seed-test-user-interactions.ts --env=development --deterministic
pnpm tsx scripts/seed-test-user-interactions.ts --env=production --clean --deterministic

# Show help
pnpm tsx scripts/seed-test-user-interactions.ts --help
```

### Available Flags

| Flag                | Description                              | Example             |
| ------------------- | ---------------------------------------- | ------------------- |
| `--env=development` | Target development environment           | `--env=development` |
| `--env=production`  | Target production environment            | `--env=production`  |
| `--dry-run`         | Preview actions without database changes | `--dry-run`         |
| `--clean`           | Remove existing test data before seeding | `--clean`           |
| `--deterministic`   | Generate consistent data for testing     | `--deterministic`   |
| `--help`            | Show usage information                   | `--help`            |

## Data Flow

The script follows this sequence:

1. **Load Environment**: Load `.env.development` or `.env.production`
2. **Load Test Users**: Read user data from JSON file
3. **Insert Users**: Add test users to database (idempotent)
4. **Clean Data** (if `--clean`): Remove existing test user data
5. **Create Friendships**: Make all test users friends with each other
6. **Generate Game Logs**: Create 10-100 random game logs per user
7. **Create Interactions**: Add reactions and comments on 1-2% of game logs
8. **Add External Interactions**: Include external users if available

## Database Tables Affected

| Table         | Operation | Description                                  |
| ------------- | --------- | -------------------------------------------- |
| `users`       | INSERT    | Test user insertion (idempotent)             |
| `friendships` | INSERT    | Bidirectional friendships between test users |
| `game_logs`   | INSERT    | Random game logs for each test user          |
| `reactions`   | INSERT    | Reactions on game logs and comments          |
| `comments`    | INSERT    | Top-level and child comments on game logs    |

## Idempotency

All operations are designed to be idempotent:

- **User insertion**: `onConflictDoNothing()` - skips existing users
- **Friendships**: `onConflictDoNothing()` - skips existing friendships
- **Game logs**: `onConflictDoNothing()` - skips existing game logs
- **Reactions**: `onConflictDoNothing()` - skips existing reactions
- **Comments**: `onConflictDoNothing()` - skips existing comments

## Error Handling

The script handles various error scenarios:

- **File system errors**: JSON file loading failures
- **Database errors**: Connection and query failures
- **Validation errors**: Missing required data or constraints
- **No external users**: Gracefully continues with test users only
- **Missing NBA games**: Clear error message with guidance

## Logging

The script provides comprehensive logging:

```
🌱 Starting test user interactions seeding...
🌍 Environment: DEVELOPMENT
👥 Test users: 6
👥 Inserting test users into database...
✅ Inserted 6 test users (idempotent)
🤝 Creating friendships between test users...
✅ Created 30 friendships
📝 Creating game logs for test users...
✅ Created 350 game logs
👍 Creating reactions and comments on selected game logs...
📊 Found 10000 external users, selected 14 for interactions
✅ Created 259 reactions on game logs
✅ Created 85 comments on game logs
✅ Created 161 child comments
✅ Created 186 reactions on comments
✅ Test user interactions seeding completed successfully!
```

## Common Use Cases

### Development Setup

```bash
# First time setup
pnpm seed:test-user-interactions:clean:dev

# Regular development seeding
pnpm seed:test-user-interactions:dev
```

### Testing

```bash
# Consistent test data
pnpm seed:test-user-interactions:deterministic:dev

# Clean test environment
pnpm seed:test-user-interactions:clean:deterministic:dev
```

### Production Deployment

```bash
# Production seeding
pnpm seed:test-user-interactions:prod

# Production with clean reset
pnpm seed:test-user-interactions:clean:prod
```

### Debugging

```bash
# Preview what would happen
pnpm seed:test-user-interactions:dry-run

# Preview with clean
pnpm seed:test-user-interactions:clean:dry-run
```

## Troubleshooting

### Common Issues

#### 1. Missing JSON Files

```
Error: ENOENT: no such file or directory, open 'test-users.dev.json'
```

**Solution**: Ensure the JSON files exist in `src/lib/db/seed/test-users/`

#### 2. No NBA Games

```
Error: No games found in database. Please seed NBA data first.
```

**Solution**: Run the NBA data seeding script first

#### 3. Database Connection

```
Error: DATABASE_URL or POSTGRES_URL environment variable is required
```

**Solution**: Ensure environment variables are properly configured

#### 4. No External Users

```
📊 No external users found - will only create interactions between test users
```

**Note**: This is normal and expected in fresh databases

### Debug Mode

For detailed debugging, you can run the script directly:

```bash
# Enable debug logging
DEBUG=* pnpm tsx scripts/seed-test-user-interactions.ts --env=development --dry-run
```

## File Structure

```
scripts/
├── seed-test-user-interactions.ts    # Main script
└── README-seed-test-user-interactions.md  # This file

src/lib/db/seed/test-users/
├── test-users.dev.json              # Development user data
└── test-users.prod.json             # Production user data
```

## JSON File Format

The test user JSON files should contain an array of user objects with the following structure:

```json
[
  {
    "id": "user_32FnFkaqymedPCaWzMqkD3vfUL7",
    "object": "user",
    "username": "sports-data",
    "first_name": "Sports",
    "last_name": "Data",
    "image_url": "https://...",
    "has_image": true,
    "profile_image_url": "https://...",
    "primary_email_address_id": "idn_...",
    "primary_phone_number_id": "",
    "email_address": "{\"iv\":\"...\",\"content\":\"...\",\"tag\":\"...\"}",
    "phone_number": null,
    "external_id": "",
    "last_active_at": "2025-09-04 22:31:26.622+00",
    "last_sign_in_at": "2025-09-04 22:31:26.641+00",
    "bio": null,
    "timezone": null,
    "preferred_language": "en",
    "isAdmin": true,
    "inbound_friendship_ids": [],
    "outbound_friendship_ids": [],
    "created_at": "2025-09-04 22:31:27.581393",
    "updated_at": "2025-09-04 22:38:06.886",
    "deleted_at": null
  }
]
```

## Best Practices

1. **Always use dry-run first** to preview changes
2. **Use clean mode** for fresh starts
3. **Use deterministic mode** for consistent testing
4. **Check logs** for any warnings or errors
5. **Verify data** after seeding completes
6. **Use appropriate environment** (dev vs prod)

## Support

For issues or questions:

1. Check the logs for error messages
2. Verify all prerequisites are met
3. Try running with `--dry-run` first
4. Check the script documentation in the source code
5. Review this README for common solutions

---

**Version**: 1.0.0
**Last Updated**: 2025-09-05
**Author**: Game Diary Team
