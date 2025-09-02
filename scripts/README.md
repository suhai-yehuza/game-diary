# Scripts Directory

This directory contains various utility scripts for the game-diary application.

## Redis Testing Scripts

### 🆕 Consolidated Redis Testing (Recommended)

**Command**: `pnpm test:redis`

**Script**: `scripts/tests/test-redis.ts`

**Features**:

- Environment-aware testing (dev/staging/prod)
- Comprehensive 5-category test suite
- Professional logging and error handling
- CI/CD ready with proper exit codes
- Timeout protection for all operations

**Test Categories**:

1. Redis Service Statistics
2. Redis Connection Health
3. Basic Cache Operations
4. Memory Cache Behavior
5. Error Handling and Edge Cases

### 🔄 Legacy Redis Testing

**Command**: `pnpm test:redis:legacy`

**Script**: `scripts/test-redis-connection.ts`

**Features**:

- Simple Redis connectivity check
- Quick health assessment
- Basic service statistics

**Use Case**: Quick health checks when comprehensive testing isn't needed.

## Cache Testing Scripts

### Cache Eviction Testing

**Command**: `pnpm cache:test-eviction`

**Script**: `scripts/tests/test-cache-eviction.ts`

**Features**:

- Individual key deletion testing
- Namespace clearing validation
- Memory cache LRU eviction testing
- TTL-based expiration testing
- Comprehensive cleanup

## Database Scripts

### Database Management

**Command**: `pnpm db:*`

**Scripts**: `scripts/db/*`

**Features**:

- Database migrations
- Schema management
- Trigger setup
- Connection testing
- Data encryption

## Git Management Scripts

### Git Operations

**Scripts**: `scripts/git/*`

**Features**:

- Branch creation and protection
- Commit message validation
- Git hooks setup
- Deployment branch management

## Performance Scripts

### Performance Testing

**Scripts**: `scripts/performance/*`

**Features**:

- Performance measurement
- Benchmarking
- Resource monitoring

## Validation Scripts

### System Validation

**Scripts**: `scripts/validation/*`

**Features**:

- Environment validation
- Configuration checks
- System health monitoring

## Testing Scripts

### Testing Infrastructure

**Scripts**: `scripts/testing/*`

**Features**:

- Playwright browser installation
- Integration testing setup
- Mock data management

## Utility Scripts

### General Utilities

**Scripts**: `scripts/utils/*`

**Features**:

- Environment synchronization
- Dependency management
- Code quality checks
- Circular dependency detection

## Server Management

### Development Server

**Scripts**: `server-manager.sh`

**Features**:

- Development server startup/shutdown
- Port management
- Log monitoring

## Deployment Scripts

### Deployment Management

**Scripts**: Various deployment-related scripts

**Features**:

- Release creation
- Deployment tracking
- Rollback procedures
- Preview deployments

## Usage Examples

### Redis Testing

```bash
# Comprehensive Redis testing
pnpm test:redis

# Quick Redis health check
pnpm test:redis:legacy

# Cache eviction testing
pnpm cache:test-eviction
```

### Database Operations

```bash
# Test database connection
pnpm db:test-connection

# Run migrations
pnpm db:migrate:dev

# View migrations
pnpm db:view-migrations
```

### Development

```bash
# Start development server
./scripts/server-manager.sh start

# Toggle mock mode
./scripts/toggle-mock-mode.sh

# Check environment
pnpm check-env
```

## Script Consolidation

### Redis Testing Consolidation

**Before**: Two separate Redis testing scripts with overlapping functionality

- `scripts/tests/test-redis.ts` (deprecated - used old cache system)
- `scripts/test-redis-connection.ts` (legacy - simple testing)

**After**: Single comprehensive Redis testing script

- `scripts/tests/test-redis.ts` (recommended - full-featured)

**Benefits**:

- **Eliminated duplication**: Single source of truth for Redis testing
- **Enhanced functionality**: More comprehensive test coverage
- **Better error handling**: Professional logging and CI/CD support
- **Environment awareness**: Automatic environment detection
- **Maintainability**: Easier to maintain and extend

### Redis Implementation Consolidation

**Before**: Two separate Redis implementations with overlapping functionality

- `src/lib/cache/redis-client.ts` - Basic Redis client wrapper
- `src/lib/cache/redis-service.ts` - Advanced Redis service with memory cache

**After**: Single consolidated Redis service with enhanced functionality

- `src/lib/cache/redis-service.ts` - Comprehensive Redis service (enhanced)
- `src/lib/cache/redis-client.ts` - **REMOVED** (consolidated)

**Benefits**:

- **Eliminated duplication**: Single source of truth for Redis operations
- **Enhanced functionality**: Combined best features from both implementations
- **Better maintainability**: Single file to maintain instead of two
- **Improved performance**: Memory cache integration for all operations
- **Unified API**: Consistent interface for all Redis functionality

## Best Practices

1. **Use consolidated scripts** when available for comprehensive testing
2. **Use legacy scripts** for quick health checks
3. **Set NODE_ENV** for environment-specific operations
4. **Check exit codes** in automated environments
5. **Review documentation** in individual script directories

## Contributing

When adding new scripts:

1. **Follow naming conventions**: Use descriptive names with clear purposes
2. **Add to package.json**: Include appropriate npm scripts for easy access
3. **Document usage**: Provide clear examples and documentation
4. **Consider consolidation**: Avoid duplicating functionality across multiple scripts
5. **Test thoroughly**: Ensure scripts work in all target environments
