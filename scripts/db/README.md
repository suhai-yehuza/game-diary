# Database Management System

This directory contains a unified database management system that consolidates all database operations into a single, well-organized module.

## Overview

The database management system has been consolidated from multiple separate scripts into a unified `database-manager.ts` that provides:

- **Shared utilities**: Common database connection, SQL parsing, and error handling
- **Consistent patterns**: Unified approach to migrations, setup, and maintenance
- **Reduced duplication**: Eliminates code duplication across multiple files
- **Better maintainability**: Single source of truth for database operations

## Files

### Core Files

- **`database-manager.ts`** - Main unified database management system
- **`migrate.ts`** - Backward compatibility wrapper for migrations
- **`README.md`** - This documentation

### Legacy Files (Deprecated)

The following files are now deprecated and will be removed in future versions:

- `apply-migrations.ts` - Replaced by `database-manager.ts migrate`
- `apply-consolidated-migration.ts` - Replaced by `database-manager.ts migrate-file`
- `apply-cascade-delete-migration.ts` - Replaced by `database-manager.ts migrate-file`
- `drizzle-migrate.ts` - Replaced by `database-manager.ts migrate`
- `setup-database.ts` - Replaced by `database-manager.ts setup`
- `validate-migrations.ts` - Replaced by `database-manager.ts validate`
- `view-migrations.ts` - Replaced by `database-manager.ts view`
- `copy-custom-migrations.ts` - Replaced by `database-manager.ts copy-migrations`
- `truncate-tables.ts` - Replaced by `database-manager.ts truncate`

## Usage

### Basic Commands

```bash
# Apply all pending migrations
tsx scripts/db/database-manager.ts migrate

# Apply migrations with dry run
tsx scripts/db/database-manager.ts migrate --dry-run

# Apply a specific migration file
tsx scripts/db/database-manager.ts migrate-file drizzle/000_schema_with_cascade.sql

# View migration history
tsx scripts/db/database-manager.ts view

# Validate migration files
tsx scripts/db/database-manager.ts validate

# Setup database (complete)
tsx scripts/db/database-manager.ts setup complete

# Setup database (triggers only)
tsx scripts/db/database-manager.ts setup triggers-only

# Copy custom migrations
tsx scripts/db/database-manager.ts copy-migrations

# Truncate tables
tsx scripts/db/database-manager.ts truncate --scope=internal
tsx scripts/db/database-manager.ts truncate --scope=external
tsx scripts/db/database-manager.ts truncate --scope=all
```

### Environment Options

```bash
# Specify environment
tsx scripts/db/database-manager.ts migrate --env=production
tsx scripts/db/database-manager.ts setup complete --env=staging

# Run tests after setup
tsx scripts/db/database-manager.ts setup complete --test
```

### Backward Compatibility

For existing scripts and CI/CD pipelines, the following wrappers maintain backward compatibility:

```bash
# Old way (still works)
tsx scripts/db/apply-migrations.ts
tsx scripts/db/setup-database.ts

# New way (recommended)
tsx scripts/db/database-manager.ts migrate
tsx scripts/db/database-manager.ts setup
```

## Features

### Shared Database Connection

All operations use a single, optimized database connection with:

- Automatic retry logic
- Connection pooling
- Timeout handling
- Error recovery

### Unified SQL Parsing

Consistent SQL statement parsing that handles:

- Dollar-quoted strings (functions, triggers)
- Comments and empty lines
- Multi-statement files
- Transaction safety

### Migration Management

Comprehensive migration system with:

- Automatic migration tracking
- Checksum verification
- Rollback support
- Dry-run capabilities
- Verification reporting

### Error Handling

Consistent error handling across all operations:

- Detailed error messages
- Automatic rollback on failure
- Graceful degradation
- Logging and reporting

## Migration from Old Scripts

### Step 1: Update Package.json Scripts

Replace old script references:

```json
{
  "scripts": {
    // Old
    "db:migrate": "tsx scripts/db/apply-migrations.ts",
    "db:setup": "tsx scripts/db/setup-database.ts",

    // New
    "db:migrate": "tsx scripts/db/database-manager.ts migrate",
    "db:setup": "tsx scripts/db/database-manager.ts setup complete"
  }
}
```

### Step 2: Update CI/CD Pipelines

Update any CI/CD scripts to use the new commands:

```bash
# Old
tsx scripts/db/apply-migrations.ts production

# New
tsx scripts/db/database-manager.ts migrate --env=production
```

### Step 3: Update Documentation

Update any documentation that references the old script names.

## Benefits of Consolidation

1. **Reduced Maintenance**: Single codebase to maintain instead of 9 separate files
2. **Consistent Behavior**: All operations use the same patterns and error handling
3. **Better Testing**: Easier to test unified functionality
4. **Improved Performance**: Shared connection pooling and optimized utilities
5. **Enhanced Debugging**: Centralized logging and error reporting
6. **Future-Proof**: Easier to add new features and maintain backward compatibility

## Troubleshooting

### Common Issues

1. **Connection Timeouts**: The system automatically retries connections with exponential backoff
2. **Migration Conflicts**: Use `--dry-run` to preview changes before applying
3. **Permission Errors**: Ensure database user has appropriate permissions
4. **File Not Found**: Verify migration files exist in `src/lib/db/migrations`

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
DEBUG=true tsx scripts/db/database-manager.ts migrate
```

### Getting Help

For issues or questions:

1. Check the logs for detailed error messages
2. Use `--dry-run` to preview operations
3. Verify database connectivity and permissions
4. Review migration file syntax and structure
