# Redis Testing Scripts

This directory contains comprehensive Redis testing scripts for the game-diary application.

## Script Overview

### 🆕 `test-redis.ts` (Recommended)

**Command**: `pnpm test:redis` or `pnpm test:redis:comprehensive`

**Features**:

- **Environment-aware**: Automatically detects and uses the correct environment (dev/staging/prod)
- **Comprehensive testing**: 5 different test categories covering all aspects of Redis functionality
- **Professional logging**: Uses the application's logger system with proper error handling
- **CI/CD ready**: Exits with proper error codes for automated testing
- **Timeout protection**: All operations have individual timeouts to prevent hanging
- **Detailed reporting**: Comprehensive test summary with pass/fail status

**Test Categories**:

1. **Redis Service Statistics** - Basic service availability and configuration
2. **Redis Connection Health** - Connection testing with timing measurements
3. **Basic Cache Operations** - Set, get, delete operations with verification
4. **Memory Cache Behavior** - In-memory cache functionality testing
5. **Error Handling** - Edge cases and invalid input handling

### 🔄 `test-redis-connection.ts` (Legacy)

**Command**: `pnpm test:redis:legacy`

**Features**:

- Simple, focused Redis connection testing
- Basic service statistics
- Quick health check
- Uses console.log for output

**Use Case**: Quick Redis connectivity check when you don't need comprehensive testing.

### 📝 `test-redis.ts` (Deprecated)

**Command**: No longer available

**Features**:

- Used the old cache system (`getCache()`)
- Placeholder implementation
- Basic connection testing only

**Status**: Deprecated - functionality has been consolidated into the comprehensive test script.

## Usage

### Basic Redis Testing

```bash
# Run the recommended comprehensive test suite
pnpm test:redis

# Same as above
pnpm test:redis:comprehensive
```

### Legacy Testing

```bash
# Run the simple connection test (legacy)
pnpm test:redis:legacy
```

### Environment-Specific Testing

```bash
# Test in development environment
NODE_ENV=development pnpm test:redis

# Test in staging environment
NODE_ENV=staging pnpm test:redis

# Test in production environment
NODE_ENV=production pnpm test:redis
```

## Test Output

### Comprehensive Test Output

```
🧪 Comprehensive Redis Testing Suite (development environment)
==========================================================

📊 Test 1: Redis Service Statistics
-----------------------------------
Memory cache size: 0
Redis available: true
Redis service instance: true

🔍 Test 2: Redis Connection Health
-----------------------------------
Testing Redis connection...
Connection test completed in 45ms

💾 Test 3: Basic Cache Operations
----------------------------------
Testing cache set operation...
✅ Cache set operation successful
Testing cache get operation...
✅ Cache get operation successful - value matches
Testing cache delete operation...
✅ Cache delete operation successful
✅ Cache deletion verified - key no longer exists

🧠 Test 4: Memory Cache Behavior
----------------------------------
Memory cache max size: 1000
Current memory cache size: 0
✅ Memory cache operations working correctly

⚠️ Test 5: Error Handling and Edge Cases
-------------------------------------------
Testing with invalid namespace...
✅ Invalid namespace handled gracefully
Testing with null values...
✅ Null values handled gracefully

📋 Test Summary
================
Test Results:
- Redis Available: ✅ Yes
- Connection Test: ✅ Passed
- Connection Time: 45ms
- Basic Operations: ✅ Passed
- Memory Cache Size: 0
- Environment: development

🎉 All Redis tests passed successfully!
✅ Redis service is working correctly

🏁 Comprehensive Redis testing completed
```

### Legacy Test Output

```
🧪 Testing Redis connection...

📊 Redis service stats:
Memory cache size: 0
Redis available: true
Redis service instance: true

🔍 Testing Redis connection...
Connection test result: true

✅ Redis is working correctly!

🏁 Test completed
```

## Migration Guide

### From `test-redis.ts` (Deprecated)

- **Replace**: `pnpm test:redis` (old command)
- **With**: `pnpm test:redis` (new consolidated command)
- **Benefits**: More comprehensive testing, better error handling, environment awareness

### From `test-redis-connection.ts` (Legacy)

- **Replace**: Direct script execution
- **With**: `pnpm test:redis` for comprehensive testing
- **Keep**: `pnpm test:redis:legacy` for quick health checks

## Configuration

### Environment Variables

The consolidated test script automatically detects the environment using:

- `NODE_ENV` environment variable
- `dotenv-flow` for environment-specific configuration
- Automatic fallback to development environment

### Timeout Settings

- **Connection tests**: 5 seconds
- **Cache operations**: 5 seconds
- **Service initialization**: 2 seconds wait

## Error Handling

### Comprehensive Error Handling

- **Centralized error handling** using `errorHandlers.api`
- **Proper exit codes** for CI/CD pipelines
- **Detailed error logging** with stack traces
- **Graceful degradation** when individual tests fail

### Exit Codes

- **0**: All tests passed successfully
- **1**: One or more tests failed or errors occurred

## Best Practices

1. **Use the consolidated script** (`pnpm test:redis`) for comprehensive testing
2. **Use legacy script** (`pnpm test:redis:legacy`) for quick health checks
3. **Set NODE_ENV** for environment-specific testing
4. **Check exit codes** in CI/CD pipelines
5. **Review logs** for detailed test results and error information

## Future Enhancements

Potential improvements for the consolidated test script:

- **Performance benchmarking** with timing metrics
- **Load testing** with concurrent operations
- **Configuration validation** testing
- **Integration testing** with other services
- **Custom test scenarios** via command-line arguments
