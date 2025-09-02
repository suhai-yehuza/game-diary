# 🗄️ Database Setup Guide - Game Diary

This guide ensures your database is always set up correctly with all fixes applied, whether you're creating a new database or recreating an existing one.

## 🚀 **Quick Setup (After Creating New Database)**

### **Option 1: Complete Setup - Everything in One Command (Recommended)**

```bash
# For development database
pnpm db:setup-complete:dev

# For production database
pnpm db:setup-complete:prod

# For any environment (defaults to development)
pnpm db:setup-complete
```

### **Option 2: Apply Fixes Only (If Tables Already Exist)**

```bash
# For development database
pnpm db:ensure-fixes:dev

# For production database
pnpm db:ensure-fixes:prod

# For any environment (defaults to development)
pnpm db:ensure-fixes
```

### **Option 3: Traditional Migration + Fixes (Manual Two-Step)**

```bash
# Step 1: Run migrations (creates tables)
pnpm db:migrate:dev    # Development
pnpm db:migrate:prod   # Production

# Step 2: Apply fixes (ensures everything works)
pnpm db:ensure-fixes:dev    # Development
pnpm db:ensure-fixes:prod   # Production
```

## 🔧 **What Gets Fixed Automatically**

The `setup-complete-database` script automatically applies and verifies:

1. ✅ **pgcrypto Extension** - Required for UUID generation
2. ✅ **Notifications Unique Constraint** - Prevents duplicate notifications
3. ✅ **RLS Helper Functions** - Row Level Security context management
4. ✅ **UUID Generation Function** - Creates UUIDs for notifications
5. ✅ **Reaction Emojis** - Populates emoji reference table
6. ✅ **Database Triggers** - All notification and rating triggers

## 📋 **Complete Workflow for New Database**

### **Step 1: Create New Database**

- Create fresh database in your database provider
- Or drop and recreate existing database

### **Step 2: Complete Setup (One Command)**

```bash
# Development
pnpm db:setup-complete:dev

# Production
pnpm db:setup-complete:prod
```

**This single command will:**

- ✅ Run all migrations (creates tables and schema)
- ✅ Apply all critical fixes
- ✅ Set up all triggers and functions
- ✅ Test everything to ensure it works

### **Step 3: Verify Everything Works (Optional)**

The setup script automatically tests everything, but you can also run:

```bash
# Test all triggers manually
pnpm db:test:all-triggers     # Development
pnpm db:test:all-triggers:prod # Production
```

## 🎯 **Expected Results**

After running the setup script, you should see:

```
🎯 Results: 6/6 fixes successful
🎉 All database fixes are now applied and verified!
Your database is ready for use with all features working correctly.

🧪 Testing all database triggers...
🎯 Summary: 13/13 tests passed (0 failed)
🎉 All triggers are working correctly!
```

## 🛡️ **Safety Features**

- **Idempotent**: Safe to run multiple times
- **Verification**: Each fix is verified after application
- **Error Handling**: Graceful failure with detailed logging
- **Environment Aware**: Automatically uses correct environment

## 🔄 **When to Use This Script**

Use `pnpm db:setup-complete` whenever you:

- ✅ **Create a new database** from scratch
- ✅ **Drop and recreate** an existing database
- ✅ **Set up a staging** or test database
- ✅ **Migrate to a new** database provider
- ✅ **Want to verify** all fixes are applied
- ✅ **Need to troubleshoot** database issues

## 🚨 **Troubleshooting**

### **If Some Fixes Fail:**

1. Check the logs for specific error messages
2. Verify database connection and permissions
3. Run individual commands to isolate issues

### **Common Issues:**

- **Permission Errors**: Ensure database user has appropriate permissions
- **Connection Issues**: Check DATABASE_URL and network connectivity
- **Extension Errors**: Some providers may require manual extension enablement

### **Manual Verification:**

```bash
# Check if pgcrypto extension exists
psql -c "SELECT * FROM pg_extension WHERE extname = 'pgcrypto';"

# Check if functions exist
psql -c "SELECT proname FROM pg_proc WHERE proname LIKE '%user_context%';"

# Check if emojis exist
psql -c "SELECT COUNT(*) FROM reaction_emojis;"
```

## 📁 **Available Commands**

```bash
# Database fixes and setup
pnpm db:ensure-fixes:dev      # Apply all fixes (development)
pnpm db:ensure-fixes:prod     # Apply all fixes (production)

# Test triggers
pnpm db:test:all-triggers     # Test all triggers (development)
pnpm db:test:all-triggers:prod # Test all triggers (production)

# Traditional database commands
pnpm db:migrate:dev           # Run migrations (development)
pnpm db:migrate:prod          # Run migrations (production)
pnpm db:triggers              # Setup triggers only
```

## 🎉 **Benefits**

This approach ensures:

- ✅ **No more manual fixes** - Everything is automated
- ✅ **Consistent setup** - Same process across all environments
- ✅ **Verification** - Each fix is tested after application
- ✅ **Documentation** - Clear record of what was applied
- ✅ **Reliability** - Database works correctly every time
- ✅ **Time savings** - One command instead of manual steps

## 🔮 **Future-Proof**

The script automatically handles:

- New database providers
- Updated PostgreSQL versions
- Additional fixes and constraints
- Environment-specific requirements

Your database will always be set up correctly with all features working! 🎮✨
