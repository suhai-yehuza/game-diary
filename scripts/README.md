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

# Combine GraphQL schemas
pnpm schema:combine
```

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
