# Scripts Documentation

## Overview

This directory contains utility scripts for development, testing, and maintenance tasks.

## Directory Structure

### Database Scripts (`db/`)

- Database setup and configuration
- Migration management
- Connection testing
- Schema validation

### Performance Scripts (`performance/`)

- Performance measurement
- Performance reporting
- Optimization analysis

### Utility Scripts (`utils/`)

- Dependency management
- Environment verification
- Type validation and fixing
- Schema combination
- Custom migration handling

### Test Scripts (`test/`)

- Database connection tests
- Migration tests
- Redis connection tests
- Neon Postgres tests

## Usage

### Database Management

```bash
# Setup database
pnpm db:setup

# Run migrations
pnpm db:migrate:dev

# View migrations
pnpm db:view-migrations

# Validate migrations
pnpm db:validate-migrations
```

### Performance Analysis

```bash
# Measure performance
pnpm perf:measure

# Generate performance report
pnpm perf:report
```

### Utility Commands

```bash
# Manage dependencies
pnpm deps:manage

# Verify environment
pnpm verify-env

# Validate types
pnpm validate:types

# Automatically fix type violations
pnpm fix:types

# Combine GraphQL schemas
pnpm schema:combine
```

### Type Management

```bash
# Validate that all types are in the correct location
pnpm validate:types

# Automatically fix type violations
pnpm fix:types

# Combined: validate then fix
pnpm validate:types:fix
```

#### Extensible Type Violation Fixing

The `fix-type-violations.ts` script uses a **configuration-driven** approach that makes it easy to handle new violation patterns without code changes.

**Features**:

- **Configuration-based rules**: Add new fix patterns via `fix-type-violations.config.ts`
- **Multiple fix strategies**: Remove-and-import, move-to-types, rewrite-file, custom handlers
- **Pattern matching**: RegExp or string-based file matching
- **Smart import handling**: Automatically updates import statements
- **Safety limits**: Configurable limits to prevent unintended mass changes
- **Verification**: Optional post-fix validation

**Adding New Fix Rules**:

```typescript
// In fix-type-violations.config.ts
{
  name: 'New Feature Types',
  filePattern: /^src\/components\/new-feature\/.*\.ts$/,
  strategy: 'move-to-types',
  targetTypesFile: 'feature.types.ts',
  importPath: '@src/lib/types/feature.types',
  description: 'Move new feature types to dedicated types file'
}
```

**Available Strategies**:

- `remove-and-import`: Remove duplicate types and add import
- `move-to-types`: Move types to appropriate types file
- `rewrite-file`: Completely rewrite file (for complex reorganization)
- `custom`: Use custom handler function

### Testing

```bash
# Test database connection
pnpm db:test-connection

# Test migrations
pnpm db:test-migrations

# Test Redis connection
pnpm test:redis
```

## Script Categories

### Database Scripts

- `setup-database.ts` - Initial database setup
- `apply-migrations.ts` - Apply database migrations
- `view-migrations.ts` - View migration status
- `validate-migrations.ts` - Validate migration files
- `copy-custom-migrations.ts` - Handle custom migrations

### Performance Scripts

- `performance-measure.ts` - Measure application performance
- `performance-report.ts` - Generate performance reports

### Utility Scripts

- `manage-deps.ts` - Dependency management
- `verify-env.ts` - Environment verification
- `validate-types.ts` - Type location validation
- `fix-type-violations.ts` - **Extensible** automatic type violation fixing
- `fix-type-violations.config.ts` - Configuration for type violation fixes
- `combine-schema.ts` - GraphQL schema combination

### Test Scripts

- `test-db-connection.ts` - Database connection testing
- `test-migrations.ts` - Migration testing
- `test-redis.ts` - Redis connection testing
- `test-neon-postgres.ts` - Neon Postgres testing

## Contributing

When adding new scripts:

1. Place them in the appropriate category directory
2. Update this README with documentation
3. Add corresponding npm scripts in package.json
4. Include proper error handling and logging
5. Add TypeScript types and documentation
