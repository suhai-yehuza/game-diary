# User Data Seeding Guide

This document describes the memory-optimized user data seeding system for the Game Diary application.

## 🚀 Overview

The user data seeding system has been completely rewritten to handle large datasets without memory issues. It uses streaming generators, progressive database insertion, and real-time memory monitoring to ensure optimal performance regardless of dataset size.

## ✨ Key Features

- **Memory-Efficient**: Constant memory footprint regardless of dataset size
- **Streaming Processing**: Data is generated and inserted progressively
- **Real-time Monitoring**: Memory usage and progress tracking
- **Configurable Batching**: Optimized batch sizes for different data types
- **Multiple Scenarios**: Predefined configurations for common use cases
- **Command Line Interface**: Easy-to-use CLI with help and validation

## 🛠️ Available Scripts

### Package.json Scripts

```bash
# Basic seeding
pnpm run seed:user-data                    # Seed with 100 users (default)
pnpm run seed:user-data:small             # Seed with 100 users
pnpm run seed:user-data:medium            # Seed with 1000 users
pnpm run seed:user-data:large             # Seed with 10000 users
pnpm run seed:user-data:custom 500        # Seed with 500 custom users

# Distribution-based seeding
pnpm run seed:user-data:pareto            # Use Pareto distribution (80/20 rule)
pnpm run seed:user-data:realistic         # Use realistic social media patterns
pnpm run seed:user-data:uniform           # Use uniform distribution for testing
pnpm run seed:user-data:normal            # Use normal distribution (bell curve)
pnpm run seed:user-data:exponential       # Use exponential distribution
pnpm run seed:user-data:poisson           # Use Poisson distribution for rare events
pnpm run seed:user-data:high-engagement  # Use high engagement patterns
pnpm run seed:user-data:low-engagement   # Use low engagement patterns
pnpm run seed:user-data:performance      # Use performance testing patterns
pnpm run seed:user-data:large-pareto     # Large dataset with Pareto distribution
pnpm run seed:user-data:large-realistic  # Large dataset with realistic patterns

# Memory optimization
pnpm run seed:user-data:memory-optimized  # Low memory usage (4GB heap)
pnpm run seed:user-data:high-memory       # High memory usage (8GB heap)

# Utility
pnpm run seed:user-data:clear             # Clear all user data
pnpm run seed:user-data:shell             # Use shell script wrapper
```

### Shell Script Wrapper

```bash
# Basic usage
./scripts/seed-user-data.sh                    # Default (100 users)
./scripts/seed-user-data.sh --scenario medium  # 1000 users
./scripts/seed-user-data.sh --scenario large   # 10000 users

# Custom user count
./scripts/seed-user-data.sh --scenario custom --users 500

# Clear data only
./scripts/seed-user-data.sh --clear

# Help
./scripts/seed-user-data.sh --help
```

## 📊 Seeding Scenarios

### Small (100 users)

- **Use Case**: Development, testing, quick validation
- **Estimated Records**: ~1,500 total
- **Memory Usage**: <100MB
- **Duration**: ~30 seconds

### Medium (1,000 users)

- **Use Case**: Staging, demo environments
- **Estimated Records**: ~15,000 total
- **Memory Usage**: <200MB
- **Duration**: ~5 minutes

### Large (10,000 users)

- **Use Case**: Performance testing, production-like data
- **Estimated Records**: ~150,000 total
- **Memory Usage**: <500MB
- **Duration**: ~30 minutes

### Custom

- **Use Case**: Specific testing requirements
- **User Count**: Configurable (1 - 100,000+)
- **Memory Usage**: Scales linearly
- **Duration**: Scales linearly

## 📊 Distribution Presets

The seeding system supports various statistical distribution presets to create realistic data patterns:

### Available Presets

#### Core Statistical Distributions

- **UNIFORM**: Uniform distribution for testing and baseline comparisons
- **NORMAL**: Normal distribution (bell curve) for balanced, realistic data
- **PARETO**: Pareto distribution (80/20 rule) for power law phenomena
- **EXPONENTIAL**: Exponential distribution for time-based events and decay
- **POISSON**: Poisson distribution for rare events and counting processes

#### Specialized Patterns

- **REALISTIC**: Realistic social media patterns with viral content and power users
- **HIGH_ENGAGEMENT**: High user engagement patterns with active communities
- **LOW_ENGAGEMENT**: Low user engagement patterns for testing edge cases
- **PERFORMANCE**: Performance testing patterns with optimized data generation

### Usage Examples

````bash
# Use Pareto distribution (80/20 rule)
pnpm run seed:user-data --distribution pareto

# Large dataset with realistic patterns
pnpm run seed:user-data --scenario large --distribution realistic

# Custom user count with normal distribution
pnpm run seed:user-data --users 500 --distribution normal

# Shell script with distribution
./scripts/seed-user-data.sh --scenario medium --distribution pareto

# Performance testing with uniform distribution
pnpm run seed:user-data --scenario large --distribution uniform

### Quick Reference Table

| Distribution | Use Case | Characteristics | Example Command |
|--------------|----------|-----------------|-----------------|
| **UNIFORM** | Testing & Baseline | Even distribution | `--distribution uniform` |
| **NORMAL** | Realistic Data | Bell curve | `--distribution normal` |
| **PARETO** | Power Law | 80/20 rule | `--distribution pareto` |
| **EXPONENTIAL** | Time Events | Rapid decay | `--distribution exponential` |
| **POISSON** | Rare Events | Discrete counts | `--distribution poisson` |
| **REALISTIC** | Social Media | Authentic patterns | `--distribution realistic` |
| **HIGH_ENGAGEMENT** | Active Users | High interaction | `--distribution high-engagement` |
| **LOW_ENGAGEMENT** | Edge Cases | Minimal activity | `--distribution low-engagement` |
| **PERFORMANCE** | Load Testing | Optimized patterns | `--distribution performance` |

### When to Use Each Distribution

#### **UNIFORM** - Testing & Baseline
- **Use for**: Unit testing, baseline comparisons, debugging
- **Characteristics**: Even distribution across all values
- **Example**: `pnpm run seed:user-data --distribution uniform`

#### **NORMAL** - Realistic Data
- **Use for**: Production-like data, realistic user behavior
- **Characteristics**: Bell curve distribution with natural clustering
- **Example**: `pnpm run seed:user-data --distribution normal`

#### **PARETO** - Power Law Phenomena
- **Use for**: Social media patterns, viral content, power users
- **Characteristics**: 80/20 rule, long tail distribution
- **Example**: `pnpm run seed:user-data --distribution pareto`

#### **EXPONENTIAL** - Time-Based Events
- **Use for**: Session durations, response times, decay patterns
- **Characteristics**: Rapid initial drop, long tail
- **Example**: `pnpm run seed:user-data --distribution exponential`

#### **POISSON** - Rare Events
- **Use for**: Comment counts, reaction counts, notification frequency
- **Characteristics**: Discrete events with low probability
- **Example**: `pnpm run seed:user-data --distribution poisson`

#### **REALISTIC** - Social Media Patterns
- **Use for**: Production environments, realistic user engagement
- **Characteristics**: Combines multiple distributions for authenticity
- **Example**: `pnpm run seed:user-data --distribution realistic`

#### **HIGH_ENGAGEMENT** - Active Communities
- **Use for**: Testing high-activity scenarios, power user features
- **Characteristics**: High comment/reaction rates, active users
- **Example**: `pnpm run seed:user-data --distribution high-engagement`

#### **LOW_ENGAGEMENT** - Edge Cases
- **Use for**: Testing low-activity scenarios, performance edge cases
- **Characteristics**: Minimal user interaction, sparse data
- **Example**: `pnpm run seed:user-data --distribution low-engagement`

#### **PERFORMANCE** - Load Testing
- **Use for**: Performance testing, stress testing, capacity planning
- **Characteristics**: Optimized for large datasets, consistent patterns
- **Example**: `pnpm run seed:user-data --distribution performance`

## 🔧 Configuration

### Memory Optimization Settings

```typescript
MEMORY_OPTIMIZATION: {
  BATCH_SIZE: 1000,                    // Default batch size
  USER_BATCH_SIZE: 500,                // User insertion batches
  FRIENDSHIP_BATCH_SIZE: 2000,         // Friendship insertion batches
  GAME_LOG_BATCH_SIZE: 1500,           // Game log insertion batches
  COMMENT_BATCH_SIZE: 2000,            // Comment insertion batches
  REACTION_BATCH_SIZE: 3000,           // Reaction insertion batches
  MEMORY_WARNING_THRESHOLD: 100000,    // Memory warning threshold
  GARBAGE_COLLECTION_HINT_THRESHOLD: 50000, // GC hint threshold
}
````

### Custom Configuration

```typescript
import { seedUserData } from '@/lib/db/seed/user-data-seed';

// Custom configuration
await seedUserData({
  userCount: 5000,
  gameLogsPerUser: { min: 5, max: 20 },
  commentsPerGameLog: { min: 2, max: 8 },
  friendshipsPerUser: { min: 3, max: 10 },
  reactionsPerGameLog: { min: 1, max: 6 },
  reactionsPerComment: { min: 0, max: 3 },
  childCommentChance: 0.4,
});
```

## 📈 Performance Characteristics

### Memory Usage

- **Constant Footprint**: Memory usage remains stable regardless of dataset size
- **Batch Processing**: Data is processed in configurable batches
- **Garbage Collection**: Automatic cleanup after each batch
- **Real-time Monitoring**: Memory usage tracked and reported

### Processing Speed

- **Streaming Generation**: Data generated on-demand
- **Progressive Insertion**: Database operations happen as data is generated
- **Optimized Batches**: Batch sizes tuned for each data type
- **Parallel Processing**: Multiple operations can run concurrently

### Scalability

- **Linear Scaling**: Performance scales linearly with dataset size
- **No Memory Bottlenecks**: Eliminates memory-related failures
- **Configurable Limits**: Safety limits prevent resource exhaustion
- **Progress Tracking**: Real-time progress indicators for long operations

## 🚨 Safety Features

### Memory Limits

- **Automatic Warnings**: Memory usage warnings at configurable thresholds
- **Garbage Collection Hints**: Suggestions for manual GC when beneficial
- **Progress Monitoring**: Regular progress updates for long operations
- **Resource Validation**: Pre-execution resource requirement checks

### Data Validation

- **Configuration Validation**: Pre-execution configuration validation
- **Safety Limits**: Hard limits on maximum record counts
- **Dependency Checks**: Ensures required data exists before seeding
- **Error Handling**: Comprehensive error handling and recovery

## 🔍 Monitoring and Debugging

### Real-time Monitoring

```bash
# Memory usage tracking
📊 Memory usage: 45MB increase, 5000 records processed

# Progress indicators
📊 Progress: 10000 reactions generated

# Performance metrics
✅ Generate and insert users completed in 1250ms
✅ Generate and insert friendships completed in 890ms
```

### Debug Information

```bash
# Configuration summary
📊 Estimated data volume:
   Users: 1000
   Game Logs: ~5000
   Comments: ~25000
   Reactions: ~75000
   Total records: ~115000

# Safety warnings
⚠️  Configuration warnings detected
```

## 🧪 Testing and Validation

### Dry Run Mode

```bash
# Test configuration without execution
pnpm run seed:user-data --dry-run

# Validate configuration
pnpm run seed:user-data --help
```

### Data Verification

```bash
# Check generated data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM game_logs;
SELECT COUNT(*) FROM comments;
SELECT COUNT(*) FROM reactions;
```

## 🚀 Best Practices

### For Development

- Use `small` or `medium` scenarios for quick testing
- Monitor memory usage during development
- Use `--dry-run` to validate configurations

### For Staging

- Use `medium` or `large` scenarios for realistic testing
- Monitor performance metrics
- Validate data quality and relationships

### For Production

- Use `custom` scenarios with specific requirements
- Monitor resource usage carefully
- Test with production-like data volumes
- Use memory-optimized scripts for large datasets

### For Performance Testing

- Start with `medium` scenarios and scale up
- Monitor memory usage and processing time
- Use `large` scenarios for stress testing
- Validate database performance under load

## 🔧 Troubleshooting

### Common Issues

#### Memory Issues

```bash
# Use memory-optimized scripts
pnpm run seed:user-data:memory-optimized

# Reduce batch sizes in configuration
MEMORY_OPTIMIZATION: {
  BATCH_SIZE: 500,  # Reduce from 1000
  USER_BATCH_SIZE: 250,  # Reduce from 500
}
```

#### Performance Issues

```bash
# Use smaller scenarios for testing
pnpm run seed:user-data:small

# Monitor progress and memory usage
# Check database connection and performance
```

#### Data Quality Issues

```bash
# Use dry-run mode to validate
pnpm run seed:user-data --dry-run

# Check configuration parameters
# Validate statistical distribution settings
```

### Getting Help

```bash
# Show help information
pnpm run seed:user-data --help
./scripts/seed-user-data.sh --help

# Check script documentation
cat docs/USER_DATA_SEEDING.md

# Review configuration examples
cat src/lib/db/seed/user-data-seed.ts
```

## 📚 Related Documentation

- [Database Schema](../lib/db/schema.md)
- [Statistical Distributions](../lib/db/seed/statistical-distributions.md)
- [Database Management](../scripts/db/README.md)
- [Testing Guide](../tests/README.md)

## 🤝 Contributing

When modifying the seeding system:

1. **Maintain Memory Efficiency**: Always use streaming generators for large datasets
2. **Add Configuration Options**: Make new features configurable
3. **Update Documentation**: Keep this guide current
4. **Add Tests**: Include tests for new functionality
5. **Performance Testing**: Validate performance with large datasets

## 📝 Changelog

### v2.0.0 - Memory Optimization

- Complete rewrite with streaming generators
- Progressive database insertion
- Real-time memory monitoring
- Configurable batch processing
- Multiple seeding scenarios
- Command line interface
- Shell script wrapper

### v1.0.0 - Initial Release

- Basic seeding functionality
- Memory-intensive processing
- Limited scalability
- Basic configuration options
