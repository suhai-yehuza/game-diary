# Database Management Scripts

This directory contains scripts for managing your Game Diary database, including ensuring all fixes are applied and testing triggers.

## 🚀 Quick Start - After Creating a New Database

When you create a new database (either by dropping and recreating, or setting up a fresh instance), run this command to ensure all fixes are applied:

```bash
# For development database
pnpm db:ensure-fixes:dev

# For production database
pnpm db:ensure-fixes:prod

# For any environment (defaults to development)
pnpm db:ensure-fixes
```

## 🔧 What the Script Does

The `ensure-database-fixes.ts` script automatically applies and verifies all critical database fixes:

### 1. **pgcrypto Extension**

- Ensures the PostgreSQL `pgcrypto` extension is available
- Required for `gen_random_bytes()` function used in UUID generation

### 2. **Notifications Unique Constraint**

- Adds unique constraint on `(user_id, target_id, target_type, type)`
- Prevents duplicate notifications for the same event

### 3. **RLS Helper Functions**

- `get_current_user_id()` - Gets current user context
- `set_current_user_context(user_id)` - Sets user context for RLS policies
- `clear_current_user_context()` - Clears user context

### 4. **UUID Generation Function**

- `generate_uuid_v7()` - Creates UUID v7 format with timestamp
- Used by triggers for generating notification IDs

### 5. **Reaction Emojis**

- Populates `reaction_emojis` table with 17 common emojis
- Required for foreign key constraints on reactions

### 6. **Database Triggers**

- Sets up all notification triggers for:
  - Game ratings (insert/update/delete)
  - Comments (on game logs, replies, self-comments)
  - Reactions (on game logs, comments, self-reactions)
  - Friendships (request, accept, reject, remove)

## 📋 Available Commands

```bash
# Ensure all fixes are applied
pnpm db:ensure-fixes:dev      # Development database
pnpm db:ensure-fixes:prod     # Production database

# Test all triggers after fixes
pnpm db:test:all-triggers     # Development
pnpm db:test:all-triggers:prod # Production

# Traditional database commands
pnpm db:migrate:dev           # Run migrations (development)
pnpm db:migrate:prod          # Run migrations (production)
pnpm db:triggers              # Setup triggers only
```

## 🔄 Workflow for New Database Setup

1. **Create new database** (or drop and recreate existing one)
2. **Run the fixes script**:
   ```bash
   pnpm db:ensure-fixes:dev    # or :prod for production
   ```
3. **Verify everything works**:
   ```bash
   pnpm db:test:all-triggers   # or :prod for production
   ```

## 🛡️ Safety Features

- **Idempotent**: Safe to run multiple times
- **Verification**: Each fix is verified after application
- **Error Handling**: Graceful failure with detailed logging
- **Environment Aware**: Automatically detects and uses correct environment

## 🚨 Troubleshooting

If some fixes fail:

1. **Check the logs** for specific error messages
2. **Verify database connection** and permissions
3. **Run individual commands** to isolate issues:

   ```bash
   # Check if pgcrypto extension exists
   psql -c "SELECT * FROM pg_extension WHERE extname = 'pgcrypto';"

   # Check if functions exist
   psql -c "SELECT proname FROM pg_proc WHERE proname LIKE '%user_context%';"
   ```

## 📁 File Structure

```
scripts/db/
├── ensure-database-fixes.ts    # Main fixes script
├── database-manager.ts         # Traditional database management
├── README.md                   # This file
└── migrations/                 # SQL migration files
```

## 🎯 Why This Approach?

Instead of manually running individual SQL commands, this script:

- ✅ **Automates** the entire setup process
- ✅ **Verifies** each fix was applied correctly
- ✅ **Documents** what needs to be done
- ✅ **Prevents** forgetting critical fixes
- ✅ **Standardizes** the setup across environments
- ✅ **Tests** everything works after setup

Your database will be fully functional with all features working correctly after running this script! 🎉
