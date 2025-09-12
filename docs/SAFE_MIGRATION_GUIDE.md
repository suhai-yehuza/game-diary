# Safe Database Migration Guide

## Problem Solved

Previously, running `pnpm db:generate:dev && pnpm db:migrate:dev` could truncate tables and cause data loss. This was happening because:

1. The migration system was using `drizzle-kit push --force` which can be destructive
2. There was no data preservation logic during schema changes
3. The migrate command was not properly implemented

## New Safe Migration System

### Key Features

- **Data Preservation**: Automatically detects existing data and uses safe migration methods
- **Fallback Protection**: If safe migration fails, requires explicit confirmation before using destructive methods
- **Environment Awareness**: Different behavior for development vs production
- **Comprehensive Logging**: Clear indication of what's happening and whether data is preserved

### Commands

#### Safe Migration (Recommended)

```bash
# Development - preserves data by default
pnpm db:migrate:dev

# Development - explicitly preserve data
pnpm db:migrate:dev:safe

# Production - preserves data by default
pnpm db:migrate:prod
```

#### Dry Run (Test without changes)

```bash
# See what would happen without making changes
pnpm db:migrate:dry-run
```

#### All Commands Are Now Safe

All migration commands now use safe methods by default. The legacy unsafe commands have been removed.

### How It Works

1. **Data Detection**: The system checks if tables exist and contain data
2. **Migration Strategy Selection**:
   - **Safe Mode** (default): Uses `drizzle-kit migrate` which preserves data
   - **Standard Mode**: Uses `drizzle-kit migrate` for empty databases (also safe)
3. **Error Handling**: If migration fails, provides helpful error messages and guidance
4. **Verification**: Reports whether data was preserved or lost

### Migration Flow

```
┌─────────────────┐
│ Start Migration │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Check for Data  │
└─────────┬───────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌───────┐   ┌─────────┐
│ Data  │   │ No Data │
│ Found │   │ Found   │
└───┬───┘   └────┬────┘
    │            │
    ▼            ▼
┌─────────┐  ┌─────────┐
│ Safe    │  │Standard │
│ Migrate │  │ Migrate │
└────┬────┘  └────┬────┘
     │            │
     └────┬───────┘
          │
          ▼
┌─────────────────┐
│ Report Results  │
└─────────────────┘
```

### Safety Features

#### Data Preservation

- Automatically detects existing data in tables
- Uses `drizzle-kit migrate` for all migrations (safe method)
- Provides clear warnings when data might be lost

#### Error Handling

- If migration fails, provides helpful error messages and guidance
- Clear error messages explaining what went wrong
- Option to abort migration to prevent data loss

#### Environment Awareness

- Different behavior for development vs production
- Production migrations require additional safety checks
- Clear logging of which environment is being used

### Best Practices

#### Before Running Migrations

1. **Backup your database** (especially in production)
2. **Test migrations in development first**
3. **Use dry-run mode** to see what will happen

#### During Development

```bash
# Safe approach - preserves data
pnpm db:migrate:dev

# Test what would happen
pnpm db:migrate:dry-run
```

#### In Production

```bash
# Always backup first!
pg_dump your_database > backup.sql

# Then migrate safely
pnpm db:migrate:prod
```

### Troubleshooting

#### Migration Fails with Data Loss Warning

```
⚠️  WARNING: Data may have been lost during migration
⚠️  This should not happen with the safe migration system
```

**Solution**: This indicates a problem with the migration system. Check your migration files and schema for issues.

#### Migration Fails with Error

```
❌ drizzle-kit migrate failed - this is the safe migration method
❌ Please check your migration files and schema for issues
```

**Solution**: Check your migration files in the `drizzle/` directory and ensure they are valid SQL. The migration system now only uses safe methods.

#### Schema Changes Requiring Data Loss

If your schema changes require dropping columns or changing data types that would cause data loss:

1. **Create a data migration script** to preserve important data
2. **Use the canonical reset approach** for major schema changes:
   ```bash
   pnpm db:reset:canonical:dev
   ```
3. **Re-seed your data** after the reset

### Migration Types

#### Safe Migrations (Data Preserved)

- Adding new columns with default values
- Adding new tables
- Adding indexes
- Adding constraints that don't conflict with existing data

#### Potentially Destructive Migrations (Data May Be Lost)

- Dropping columns
- Changing column types
- Adding NOT NULL constraints to existing columns without defaults
- Renaming columns or tables

### Environment Variables

- `NODE_ENV`: Determines which environment configuration to use

### Monitoring

The migration system provides detailed logging:

- ✅ Success indicators
- ⚠️ Warning messages
- ❌ Error messages
- 📊 Data preservation status
- 🔍 Dry-run mode output

Always review the migration output to ensure your data is safe!
