# Database Setup Guide

This guide explains how to set up the database for the Game Diary application.

## Quick Start

To set up the database with all tables and triggers:

```bash
# For development environment (default)
pnpm db:setup:test  # With automatic tests
pnpm db:setup:dev   # Without tests
pnpm db:setup       # Defaults to dev

# For production environment
pnpm db:setup:prod
```

**Note:** These commands run non-interactively and will automatically approve all database changes using the `--force` flag.

## What the Setup Does

The `db:setup` command performs the following operations in order:

1. **Cleans the database** - Drops all existing tables and custom types
2. **Generates migrations** - Creates Drizzle migration files
3. **Copies custom migrations** - Copies SQL migration files
4. **Creates tables** - Pushes the schema to create all tables (with --force flag)
5. **Creates triggers** - Sets up two important triggers:
   - `update_rating_stars_trigger` - Automatically generates star ratings (⭐) based on numeric ratings
   - `game_logs_ratings_trigger` - Automatically calculates and updates game ratings
6. **Creates migration tracking** - Sets up a table to track migration history
7. **Runs tests** (optional) - Verifies triggers are working correctly

## Available Commands

### Complete Setup Commands

- `pnpm db:setup` - Complete database setup for development (non-interactive)
- `pnpm db:setup:dev` - Same as above, explicitly for development
- `pnpm db:setup:prod` - Complete database setup for production
- `pnpm db:setup:test` - Setup with automatic trigger testing

### Individual Commands

If you need to run specific parts of the setup:

- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:push` - Create/update tables from schema (interactive)
- `pnpm db:push:force` - Create/update tables from schema (non-interactive)
- `pnpm db:studio` - Opens Drizzle Studio to inspect database

### Seeding Commands

- `pnpm db:seed:dev` - Seed database with sample data (development)
- `pnpm db:seed:fast` - Fast seeding with larger batches
- `pnpm db:seed:prod` - Production seeding with optimized settings
- `pnpm db:seed:test` - Test seeding with minimal data
- `pnpm db:seed:monitor` - Seed with monitoring enabled

### Testing Commands

- `pnpm test:triggers` - Test database triggers
- `pnpm test:databases` - Test database connections

## Troubleshooting

### If setup fails

1. Check your database connection in `.env`:

   ```
   DATABASE_URL="your-neon-database-url"
   ```

2. Try cleaning and starting fresh:

   ```bash
   pnpm clean          # Clean all artifacts
   pnpm db:setup       # Full setup
   ```

3. Check if tables were created:
   ```bash
   pnpm db:studio      # Opens Drizzle Studio to inspect database
   ```

### Manual trigger creation

If triggers fail to create automatically, you can run:

```bash
pnpm db:triggers
```

This will attempt to create just the triggers without resetting the database.

## Database Triggers

### Rating Stars Trigger

Automatically sets the `ratingStars` field with star emojis based on `ratingForGame`:

- Rating 1: ⭐
- Rating 2: ⭐⭐
- Rating 3: ⭐⭐⭐
- Rating 4: ⭐⭐⭐⭐
- Rating 5: ⭐⭐⭐⭐⭐

### Game Ratings Trigger

Automatically maintains the `game_ratings` table:

- Calculates average rating when game logs are added
- Updates average when ratings change
- Removes rating entry when all game logs are deleted

## Next Steps

After setup:

1. **Seed the database** (optional):

   ```bash
   pnpm db:seed:dev
   ```

2. **Start the application**:

   ```bash
   pnpm dev
   ```

3. **View the database**:
   ```bash
   pnpm db:studio
   ```
