# Database Migrations - Hybrid Single Source of Truth

This directory contains a hybrid migration system that provides both **single source of truth** for schema changes and **flexible complex SQL** management.

## 🎯 **Architecture Overview**

```
📁 Migration System:
├── 000_base_schema.sql              # ← Base table structure only
├── 001_optimize_user_search_indexes.sql # ← User search optimization
├── 0001_performance_indexes.sql # ← Comprehensive performance indexes
├── functions/                       # ← Complex functions
│   └── 001_notification_functions.sql
├── triggers/                        # ← Database triggers
│   └── 001_notification_triggers.sql
├── rls/                            # ← Row-Level Security
│   └── 001_rls_policies.sql
├── data/                           # ← Reference data
│   └── 001_reaction_emojis.sql
└── README.md                       # ← This file

📁 Schema Files (Single Source of Truth):
└── src/lib/db/schema/*.ts          # ← Edit these for schema changes
```

## 🔄 **Workflow for Different Types of Changes**

### **For Table Schema Changes (Recommended)**

```bash
# 1. Edit schema files in src/lib/db/schema/*.ts
# 2. Generate new Drizzle migration
pnpm db:generate:dev

# 3. Apply migration
pnpm db:migrate:dev
```

### **For Complex SQL (Triggers, Functions, RLS)**

```bash
# 1. Edit files in src/lib/db/migrations/functions/, triggers/, rls/
# 2. Apply using database manager
pnpm db:migrate:dev
```

### **For Reference Data (Reaction Emojis)**

```bash
# 1. Edit src/lib/constants/index.ts REACTION_EMOJIS
# 2. Sync with database
pnpm db:ensure-fixes:dev
```

### **For Complete Database Reset**

```bash
# Uses the base schema + all complex SQL
pnpm db:reset:canonical:dev
```

## 📋 **Migration Files Explained**

### **000_base_schema.sql**

- **Purpose**: Base table structure only
- **Contains**: Tables, indexes, foreign keys, constraints
- **When to edit**: Only for complex table changes that Drizzle can't handle
- **For schema changes**: Use `src/lib/db/schema/*.ts` files instead

### **001_optimize_user_search_indexes.sql**

- **Purpose**: User search performance optimization
- **Contains**: Indexes for user search functionality
- **When to edit**: When user search requirements change

### **0001_performance_indexes.sql**

- **Purpose**: Comprehensive performance optimization for all tables
- **Contains**: Critical indexes for game logs, comments, reactions, NBA games, teams, users, and friendships
- **When to edit**: When query patterns change or new performance bottlenecks are identified
- **Performance Impact**: Reduces query times by 50-80% across all major tables
- **Applied via**: `npx tsx scripts/db/reset-with-env.ts --env=development`

### **functions/001_notification_functions.sql**

- **Purpose**: Database functions for business logic
- **Contains**:
  - `generate_uuid_v7()` - UUID generation
  - `update_game_ratings()` - Game rating calculations
  - `create_friend_request_notification()` - Friendship notifications
  - `create_comment_notification()` - Comment notifications
  - `create_reaction_notification()` - Reaction notifications
  - `update_friendship_user_arrays()` - Friendship array management
  - `rebuild_user_friendship_arrays()` - Array rebuild utility
  - `create_friend_removed_notification()` - Friend removal notifications

### **triggers/001_notification_triggers.sql**

- **Purpose**: Database triggers that call the functions
- **Contains**:
  - `game_logs_ratings_trigger` - Updates game ratings on log changes
  - `friendship_notification_trigger` - Creates friendship notifications
  - `comment_notification_trigger` - Creates comment notifications
  - `reaction_notification_trigger` - Creates reaction notifications
  - `update_friendship_user_arrays_*` - Maintains friendship arrays
  - `friendship_deletion_notification_trigger` - Friend removal notifications

### **rls/001_rls_policies.sql**

- **Purpose**: Row-Level Security policies and helper functions
- **Contains**:
  - RLS helper functions (`get_current_user_id`, `set_current_user_context`, etc.)
  - RLS policies for users table
  - Public user profiles view

### **data/001_reaction_emojis.sql**

- **Purpose**: Reference data for reaction emojis
- **Contains**: Initial seed data for allowed emojis
- **Source of Truth**: `src/lib/constants/index.ts` REACTION_EMOJIS
- **Sync Method**: Use `syncReactionEmojis()` function or `pnpm db:ensure-fixes:dev`

## 🛠️ **Best Practices**

### **✅ DO:**

- **Schema changes**: Edit `src/lib/db/schema/*.ts` files and use `pnpm db:generate:dev`
- **Complex SQL**: Edit files in `functions/`, `triggers/`, `rls/` directories
- **Test changes**: Run `pnpm db:test:all-triggers` after changes
- **Document functions**: Add comments explaining complex business logic

### **❌ DON'T:**

- **Don't edit** `000_base_schema.sql` for simple schema changes
- **Don't mix** table structure and complex SQL in the same file
- **Don't skip** testing after making trigger/function changes

## 🧪 **Testing Your Changes**

```bash
# Test all triggers and functions
pnpm db:test:all-triggers

# Test specific functionality
pnpm db:setup-complete:dev --skip-redundant-tests=false

# Dry run migrations
pnpm db:migrate:dry-run
```

## 🔧 **Migration Management**

### **View Applied Migrations**

```bash
pnpm db:view-migrations
```

### **Validate Migration Integrity**

```bash
pnpm db:validate-migrations
```

### **Reset Database (Development Only)**

```bash
pnpm db:reset:canonical:dev
```

## 📚 **Migration Order**

Migrations are applied in this order:

1. `000_base_schema.sql` - Base table structure
2. `001_optimize_user_search_indexes.sql` - User search optimization
3. `0001_performance_indexes.sql` - Comprehensive performance indexes
4. `functions/*.sql` - Database functions (alphabetical)
5. `triggers/*.sql` - Database triggers (alphabetical)
6. `rls/*.sql` - RLS policies (alphabetical)
7. `data/*.sql` - Reference data (alphabetical)

## 🚨 **Important Notes**

- **Production Safety**: The system includes production database protection
- **Migration Tracking**: All migrations are tracked in `migration_versions` table
- **Rollback Support**: Migration system supports rollback scripts
- **Checksum Validation**: Migrations are checksummed to detect changes

## 🔍 **Troubleshooting**

### **Trigger Tests Failing**

1. Check if functions are properly created
2. Verify trigger syntax
3. Ensure proper function signatures
4. Check database permissions

### **Schema Mismatch**

1. Use `pnpm db:generate:dev` to sync schema files
2. Reset database with `pnpm db:reset:canonical:dev`
3. Verify schema files match database structure

### **Migration Conflicts**

1. Check `migration_versions` table for applied migrations
2. Use `pnpm db:view-migrations` to see status
3. Consider manual cleanup if needed

## 📖 **Related Documentation**

- [Database Schema Guide](../schema/README.md)
- [Trigger Testing Guide](../../../tests/README.md)
- [RLS Implementation Guide](../rls-context.ts)
