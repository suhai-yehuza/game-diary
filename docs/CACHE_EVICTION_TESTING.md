# Cache Eviction and Deletion Testing

This document describes the enhanced cache consistency validation system that now includes comprehensive testing of cache eviction and deletion mechanisms.

## Overview

The cache validation system has been extended beyond basic consistency testing to include thorough validation of:

- Individual key deletion
- Namespace clearing
- Memory cache LRU eviction
- TTL-based expiration

## Test Components

### 1. Enhanced API Endpoint

**Endpoint**: `POST /api/cache/validate-cache-consistency`

**New Features**:

- **Test 1**: Basic cache consistency (existing)
- **Test 2**: getWithFallback functionality (existing)
- **Test 3**: Cache eviction and deletion mechanisms (new)

### 2. Standalone Test Script

**Command**: `pnpm cache:test-eviction`

**Purpose**: Run cache eviction tests independently without the full API overhead.

## Test Coverage

### Individual Key Deletion

- Sets a test value in cache
- Verifies the value exists
- Deletes the value
- Verifies the value is completely removed
- Tests both memory and Redis cache layers

### Namespace Clearing

- Sets multiple values in the same namespace
- Verifies all values exist
- Clears the entire namespace
- Verifies all values are removed
- Tests bulk deletion operations

### Memory Cache LRU Eviction

- Fills memory cache beyond its maximum capacity
- Triggers LRU (Least Recently Used) eviction
- Verifies cache size remains within limits
- Tests memory management under load
- Cleans up test data after testing

### TTL-based Expiration

- Sets values with short TTL (Time To Live)
- Waits for natural expiration
- Verifies automatic cleanup
- Tests time-based cache management
- Simulates real-world expiration scenarios

## Usage

### Running the Full Test Suite

```bash
# Test the complete cache validation API
curl -X POST http://localhost:3000/api/cache/validate-cache-consistency
```

### Running Individual Eviction Tests

```bash
# Run only the cache eviction tests
pnpm cache:test-eviction
```

### Running Redis Health Check

```bash
# Check Redis connection health
curl http://localhost:3000/api/cache/health
```

## Test Results

The enhanced API now returns detailed results for all three test categories:

```json
{
  "success": true,
  "results": {
    "test1": {
      /* Basic consistency test results */
    },
    "test2": {
      /* getWithFallback test results */
    },
    "test3": {
      "description": "Cache eviction and deletion mechanisms test",
      "individualDeletion": {
        /* Individual deletion results */
      },
      "namespaceClearing": {
        /* Namespace clearing results */
      },
      "memoryEviction": {
        /* Memory eviction results */
      },
      "ttlExpiration": {
        /* TTL expiration results */
      }
    }
  }
}
```

## Timeout Protection

All cache operations are protected with individual timeouts:

- **Set operations**: 5 seconds
- **Get operations**: 5 seconds
- **Delete operations**: 5 seconds
- **Namespace clearing**: 10 seconds
- **getWithFallback calls**: 5-10 seconds (depending on expected behavior)

## Error Handling

- **Graceful degradation**: Tests continue even if individual operations fail
- **Detailed logging**: Each operation logs success/failure with context
- **Fallback mechanisms**: Memory cache fallback when Redis is unavailable
- **Comprehensive cleanup**: All test data is cleaned up regardless of test outcome

## Performance Considerations

- **Memory eviction test**: May temporarily increase memory usage
- **TTL expiration test**: Includes a 2-minute wait for natural expiration
- **Bulk operations**: Namespace clearing may take longer with many keys
- **Timeout protection**: Prevents hanging operations from blocking the system

## Monitoring and Debugging

### Logs

Each test operation logs detailed information:

- ✅ Success operations
- ⚠️ Warning messages for failed operations
- 🔍 Diagnostic information
- 🧹 Cleanup operations

### Health Checks

Use the health endpoint to monitor Redis status:

- Connection availability
- Response times
- Memory cache size
- Overall service health

## Best Practices

1. **Run tests in development/staging** before production
2. **Monitor memory usage** during eviction tests
3. **Check Redis connectivity** before running tests
4. **Review logs** for any failed operations
5. **Clean up test data** after testing (handled automatically)

## Troubleshooting

### Common Issues

1. **Redis connection failures**: Check environment variables and Redis service
2. **Timeout errors**: Increase timeout values for slower environments
3. **Memory pressure**: Reduce test data size in memory-constrained environments
4. **Cleanup failures**: Check Redis permissions and connection stability

### Debug Commands

```bash
# Check Redis health
pnpm test:redis

# Run specific eviction tests
pnpm cache:test-eviction

# Monitor Redis service
curl http://localhost:3000/api/cache/health
```

## Future Enhancements

Potential areas for future improvement:

- **Stress testing**: Load testing with high concurrent operations
- **Metrics collection**: Performance metrics and benchmarking
- **Custom TTL testing**: Configurable expiration time testing
- **Cross-namespace testing**: Testing interactions between different namespaces
- **Recovery testing**: Testing cache recovery after failures
