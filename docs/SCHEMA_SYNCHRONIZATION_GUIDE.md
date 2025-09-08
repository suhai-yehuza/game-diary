# Schema Synchronization Guide

This guide explains how to ensure that schema changes are automatically propagated between Drizzle schema files and the base schema migration files.

## 🎯 **Problem Solved**

Previously, when you made changes to schema files in `src/lib/db/schema/*.ts`, those changes were only reflected in the Drizzle-generated migration (`drizzle/0000_*.sql`) but not in the custom base schema migration (`src/lib/db/migrations/000_base_schema.sql`). This led to inconsistencies where:

- Tables existed in the Drizzle schema but not in the base migration
- Database resets would fail because tables were missing
- Drizzle Studio would show relation errors

## 🔧 **Solution: Automated Schema Synchronization**

We've created a comprehensive system to automatically sync schema changes:

### **New Scripts Available**

#### **Standalone Schema Management**

```bash
# Check schema consistency
pnpm db:check-consistency

# Generate quick fix for consistency issues
pnpm db:fix-consistency

# Full schema workflow (check → sync → validate)
pnpm db:workflow:full

# Quick schema sync
pnpm db:workflow:sync

# Check only
pnpm db:workflow:check
```

#### **Integrated Database Operations**

```bash
# Database reset with automatic schema consistency checks
pnpm db:reset:canonical:dev
pnpm db:reset:canonical:dev:skip-schema-check  # Skip schema checks

# Database migration with automatic schema consistency checks
pnpm db:migrate:dev
pnpm db:migrate:dev:skip-schema-check  # Skip schema checks

# Production variants
pnpm db:reset:canonical:prod
pnpm db:migrate:prod
```

## 📋 **Workflow for Schema Changes**

### **Option A: Integrated Workflow (Recommended)**

The easiest way is to use the integrated database operations that automatically handle schema consistency:

```bash
# 1. Make schema changes in src/lib/db/schema/*.ts
# 2. Run database reset (automatically checks and fixes schema consistency)
pnpm db:reset:canonical:dev

# Or run migrations (automatically checks and fixes schema consistency)
pnpm db:migrate:dev
```

### **Option B: Manual Schema Workflow**

For more control over the process:

```bash
# 1. Make schema changes in src/lib/db/schema/*.ts
# 2. Check for consistency issues
pnpm db:check-consistency

# 3. Fix issues if found
pnpm db:fix-consistency

# 4. Apply changes
pnpm db:reset:canonical:dev
```

### **Option C: Full Schema Workflow**

For comprehensive schema management:

```bash
# 1. Make schema changes in src/lib/db/schema/*.ts
# 2. Run full workflow (check → sync → validate)
pnpm db:workflow:full

# 3. Apply changes
pnpm db:reset:canonical:dev
```

### **Schema Change Example**

Edit schema files in `src/lib/db/schema/*.ts`:

```typescript
// src/lib/db/schema/game-schemas.ts
export const newTable = pgTable('new_table', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  // ... other fields
});
```

## 🔍 **What the Scripts Do**

### **Schema Consistency Checker** (`ensure-schema-consistency.ts`)

- Compares tables between Drizzle migration and base schema
- Identifies missing tables, indexes, and constraints
- Provides specific recommendations for fixes
- Checks for known issues (like missing public tables)

### **Schema Workflow** (`schema-workflow.ts`)

- Orchestrates the entire synchronization process
- Generates Drizzle migrations when needed
- Validates schema changes with typecheck and lint
- Provides different levels of automation (check, sync, full)

### **Schema Synchronizer** (`sync-schema-changes.ts`)

- Advanced synchronization that can automatically update base schema
- Extracts table definitions from Drizzle migrations
- Updates base schema with new tables, indexes, and constraints
- Maintains proper SQL formatting and documentation

## 🚨 **Common Issues and Solutions**

### **Issue: "Invalid relation for table" in Drizzle Studio**

**Cause**: Tables exist in Drizzle schema but not in base migration

**Solution**:

```bash
pnpm db:workflow:full
pnpm db:reset:canonical:dev
```

### **Issue: Tables missing after database reset**

**Cause**: Tables not included in base schema migration

**Solution**:

```bash
pnpm db:check-consistency  # Identify missing tables
pnpm db:fix-consistency    # Generate migration
# Manually add tables to base schema if needed
pnpm db:reset:canonical:dev
```

### **Issue: Foreign key constraint errors**

**Cause**: Missing foreign key constraints in base schema

**Solution**:

```bash
pnpm db:workflow:full  # This will sync constraints too
```

## 📁 **File Structure**

```
src/lib/db/
├── schema/                    # ← Edit these files
│   ├── game-schemas.ts
│   ├── user-schemas.ts
│   └── relations.ts
└── migrations/               # ← Auto-updated by scripts
    ├── 000_base_schema.sql   # ← Base table structure
    ├── 001_optimize_*.sql    # ← Performance indexes
    └── 002_performance_*.sql # ← Additional indexes

drizzle/                      # ← Drizzle-generated
└── 0000_*.sql               # ← Generated from schema files

scripts/db/                   # ← New automation scripts
├── ensure-schema-consistency.ts
├── schema-workflow.ts
└── sync-schema-changes.ts
```

## 🔄 **Integration with Existing Workflow**

The new scripts integrate seamlessly with your existing database workflow:

```bash
# Your existing workflow still works
pnpm db:generate:dev
pnpm db:migrate:dev

# But now you can also use the automated workflow
pnpm db:workflow:full  # Handles everything automatically
```

## 🎯 **Best Practices**

1. **Always run consistency check after schema changes**:

   ```bash
   pnpm db:workflow:check
   ```

2. **Use full workflow for major changes**:

   ```bash
   pnpm db:workflow:full
   ```

3. **Use quick sync for minor changes**:

   ```bash
   pnpm db:workflow:sync
   ```

4. **Verify changes with Drizzle Studio**:

   ```bash
   pnpm db:studio
   ```

5. **Test with database reset**:
   ```bash
   pnpm db:reset:canonical:dev
   ```

## 🚀 **Future Enhancements**

The system is designed to be extensible. Future enhancements could include:

- Automatic detection of schema changes via file watching
- Integration with pre-commit hooks
- Automated testing of schema changes
- Rollback capabilities for failed synchronizations
- Integration with CI/CD pipelines

## 📞 **Support**

If you encounter issues with schema synchronization:

1. Run `pnpm db:check-consistency` to identify the problem
2. Check the error messages and recommendations
3. Use `pnpm db:workflow:full` for comprehensive resolution
4. If issues persist, check the generated migration files manually

The scripts provide detailed logging to help diagnose any issues that arise.
