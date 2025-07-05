# Command-Line Seeding Configuration

The Game Diary seeding system now supports comprehensive command-line configuration for both seeding scenarios and statistical distribution patterns.

## 🚀 Quick Start

```bash
# Basic seeding with default settings
pnpm run seed

# Small dataset with realistic patterns
pnpm run seed -- --scenario=small --distribution=realistic

# Large dataset optimized for performance
pnpm run seed -- --scenario=large --distribution=performance

# Custom dataset with specific user count
pnpm run seed -- --scenario=custom --users=100 --distribution=demo
```

## 📊 Seeding Scenarios

Scenarios control the volume and complexity of generated data:

### Available Scenarios

| Scenario | Users | Game Logs/User | Comments/Game Log | Description                              |
| -------- | ----- | -------------- | ----------------- | ---------------------------------------- |
| `small`  | 20    | 2-5            | 1-3               | Small dataset for development/testing    |
| `medium` | 100   | 3-10           | 1-5               | Medium dataset for staging/demo          |
| `large`  | 500   | 5-20           | 2-8               | Large dataset for performance testing    |
| `custom` | \*    | 3-15           | 1-5               | Custom dataset with specified parameters |

### Using Scenarios

```bash
# Use predefined scenario
pnpm run seed -- --scenario=small

# Custom scenario with specific user count
pnpm run seed -- --scenario=custom --users=75
```

## 🌍 Environment Configuration

The seeding system supports different environments that affect performance optimization and data patterns:

### Available Environments

| Environment   | Use Case          | Performance | Data Patterns | Description                   |
| ------------- | ----------------- | ----------- | ------------- | ----------------------------- |
| `development` | Local development | Balanced    | Development   | Default for local development |
| `staging`     | Staging/QA        | Optimized   | Realistic     | Pre-production testing        |
| `production`  | Production        | High        | Realistic     | Production environment        |
| `test`        | Testing           | Fast        | Controlled    | Automated testing             |

### Using Environments

```bash
# Development environment (default)
pnpm run seed -- --env=development

# Staging environment
pnpm run seed -- --env=staging --scenario=medium

# Production environment
pnpm run seed -- --env=production --scenario=large --distribution=realistic

# Test environment
pnpm run seed -- --env=test --scenario=small --distribution=uniform
```

**Important**: The `--env` flag loads the corresponding `.env` file:

- `--env=development` → loads `.env.development`
- `--env=staging` → loads `.env.staging`
- `--env=production` → loads `.env.production`
- `--env=test` → loads `.env.test`

This ensures you're seeding the correct database for each environment!

## 🗄️ Environment-Specific Database Seeding

The `--env` flag provides true environment isolation by loading the correct environment file:

### Database Connection

Each environment uses its own database connection from the corresponding `.env` file:

- **Development**: Uses `DATABASE_URL` from `.env.development`
- **Staging**: Uses `DATABASE_URL` from `.env.staging`
- **Production**: Uses `DATABASE_URL` from `.env.production`
- **Test**: Uses `DATABASE_URL` from `.env.test`

### Environment Variables

All environment variables are loaded from the specified environment file:

- API keys and endpoints
- Database connections
- External service configurations
- Feature flags and settings

### Safety Features

- **Fallback**: If the specified `.env` file doesn't exist, falls back to `.env`
- **Validation**: Clear logging shows which environment file was loaded
- **Isolation**: Each environment is completely isolated from others

### Example Usage

```bash
# Seed staging database with staging environment variables
pnpm run seed -- --env=staging --scenario=medium

# Seed production database with production environment variables
pnpm run seed -- --env=production --scenario=large --distribution=realistic

# Seed development database (default)
pnpm run seed -- --scenario=small
```

## 📈 Statistical Distribution Presets

Distribution presets control how realistic the generated data patterns are:

### Available Presets

| Preset            | Pattern Type      | Use Case            | Description                       |
| ----------------- | ----------------- | ------------------- | --------------------------------- |
| `realistic`       | Pareto, Power Law | Production          | Realistic social media patterns   |
| `uniform`         | Uniform Random    | Testing             | Predictable, uniform distribution |
| `high-engagement` | High Activity     | Demo                | High user engagement patterns     |
| `low-engagement`  | Low Activity      | Testing             | Low user engagement patterns      |
| `performance`     | Optimized         | Performance Testing | Optimized for speed               |
| `development`     | Simple            | Development         | Development-friendly patterns     |
| `testing`         | Controlled        | Testing             | Testing-optimized patterns        |
| `demo`            | Engaging          | Presentations       | Demo-optimized patterns           |

### Using Distribution Presets

```bash
# Use specific distribution preset
pnpm run seed -- --distribution=realistic

# Combine scenario and distribution
pnpm run seed -- --scenario=large --distribution=performance
```

## 🔧 Command-Line Options

### Basic Options

```bash
--help, -h                    # Show help message
--external, -e                # Seed only external API data (NBA data)
--user, -u                    # Seed only user data
--all, -a                     # Seed both external API and user data (default)
--clear-user, -c              # Clear all user data before seeding
--dry-run                     # Show what would be seeded without actually seeding
```

### Configuration Options

```bash
--scenario <scenario>         # Use predefined seeding scenario
--users <count>               # Number of users to generate (for custom scenario)
--distribution <preset>       # Use predefined statistical distribution preset
--env <environment>           # Set environment (development, staging, production, test)
```

### Argument Format Support

The seeding system supports both formats for options with values:

```bash
# Space-separated format (traditional)
pnpm run seed -- --scenario small --users 100

# Equals format (modern)
pnpm run seed -- --scenario=small --users=100

# Mixed format (both work together)
pnpm run seed -- --scenario=small --users 100 --distribution=realistic
```

## 📝 Usage Examples

### Development Scenarios

```bash
# Quick development setup
pnpm run seed -- --scenario=small --distribution=development

# Testing with uniform patterns
pnpm run seed -- --scenario=medium --distribution=uniform

# Performance testing
pnpm run seed -- --scenario=large --distribution=performance
```

### Production Scenarios

```bash
# Realistic production data
pnpm run seed -- --env=production --scenario=large --distribution=realistic

# High engagement demo
pnpm run seed -- --env=staging --scenario=medium --distribution=high-engagement

# Demo presentation
pnpm run seed -- --env=production --scenario=custom --users=200 --distribution=demo
```

### Testing Scenarios

```bash
# Controlled testing environment
pnpm run seed -- --env=test --scenario=small --distribution=testing

# Low engagement testing
pnpm run seed -- --env=test --scenario=medium --distribution=low-engagement

# Custom testing setup
pnpm run seed -- --env=test --scenario=custom --users=50 --distribution=uniform
```

## 🔍 Dry Run Mode

Preview what would be seeded without actually running the seeding:

```bash
# Preview small realistic dataset
pnpm run seed -- --scenario=small --distribution=realistic --dry-run

# Preview large performance dataset
pnpm run seed -- --scenario=large --distribution=performance --dry-run

# Preview custom dataset
pnpm run seed -- --env=staging --scenario=custom --users=100 --distribution=demo --dry-run
```

Example dry run output:

```
🔍 DRY RUN - What would be seeded:
🌍 Environment: STAGING
📊 Scenario: SMALL
📝 Description: Small dataset for development/testing
👥 Users: 20
📝 Game Logs per User: 2-5
💬 Comments per Game Log: 1-3
📈 Distribution Preset: REALISTIC

📈 Estimated Totals:
   Game Logs: ~70
   Comments: ~140
   Reactions: ~350
   Notifications: ~200
   Friendships: ~100
```

## 🎯 Distribution Pattern Details

### Realistic Patterns

- **User Engagement**: Pareto distribution (80/20 rule)
- **Game Ratings**: Beta distribution (realistic rating patterns)
- **Comment Counts**: Poisson + Power Law (viral content)
- **Reaction Counts**: Pareto distribution (popular content)
- **Activity Age**: Exponential + Normal (recent vs older activity)

### Uniform Patterns

- **All Metrics**: Uniform random distribution
- **Predictable**: Same probability for all values
- **Testing**: Ideal for deterministic testing

### High Engagement Patterns

- **User Activity**: Higher baseline engagement
- **Content Creation**: More game logs per user
- **Social Interaction**: More comments and reactions
- **Viral Content**: Higher chance of viral posts

### Performance Patterns

- **Optimized**: Minimal complex calculations
- **Fast**: Reduced statistical complexity
- **Large Datasets**: Designed for bulk data generation

## ⚡ Environment-Specific Optimizations

Each environment has different performance characteristics:

### Development Environment

- **Concurrency**: Moderate database and API concurrency
- **Batch Sizes**: Balanced for development speed
- **Error Handling**: Verbose logging and error reporting
- **Data Patterns**: Development-friendly patterns

### Staging Environment

- **Concurrency**: Optimized for staging performance
- **Batch Sizes**: Larger batches for efficiency
- **Error Handling**: Production-like error handling
- **Data Patterns**: Realistic production patterns

### Production Environment

- **Concurrency**: High concurrency for large datasets
- **Batch Sizes**: Maximum batch sizes for speed
- **Error Handling**: Minimal logging, robust error handling
- **Data Patterns**: Realistic production patterns

### Test Environment

- **Concurrency**: Fast execution for testing
- **Batch Sizes**: Small batches for predictable behavior
- **Error Handling**: Detailed error reporting
- **Data Patterns**: Controlled, predictable patterns

## 🔧 Environment Variables

Required environment variables:

```bash
DATABASE_URL                  # Database connection URL
NEXT_PUBLIC_RAPID_API_KEY     # RapidAPI key for NBA data
NEXT_PUBLIC_RAPID_API_HOST    # RapidAPI host
```

## 🚨 Error Handling

The system provides clear error messages for invalid options:

```bash
# Invalid scenario
pnpm run seed -- --scenario invalid
# ❌ Unknown scenario: invalid
# Available scenarios: small, medium, large, custom

# Invalid distribution
pnpm run seed -- --distribution invalid
# ❌ Unknown distribution preset: invalid
# Available presets: realistic, uniform, high-engagement, low-engagement, performance, development, testing, demo

# Invalid user count
pnpm run seed -- --users -5
# ❌ User count must be a positive number
```

## 📊 Performance Considerations

### Scenario Performance Impact

| Scenario | Estimated Time | Memory Usage | Database Load |
| -------- | -------------- | ------------ | ------------- |
| `small`  | ~30 seconds    | Low          | Minimal       |
| `medium` | ~2 minutes     | Medium       | Moderate      |
| `large`  | ~10 minutes    | High         | High          |
| `custom` | Variable       | Variable     | Variable      |

### Distribution Performance Impact

| Distribution  | Performance | Complexity | Realism |
| ------------- | ----------- | ---------- | ------- |
| `uniform`     | Fastest     | Low        | Low     |
| `performance` | Fast        | Low        | Medium  |
| `development` | Medium      | Medium     | Medium  |
| `realistic`   | Slower      | High       | High    |
| `demo`        | Medium      | High       | High    |

## 🎉 Summary

The command-line seeding system provides:

✅ **Flexible Scenarios**: Choose data volume and complexity
✅ **Statistical Patterns**: Control data realism and distribution
✅ **Easy Configuration**: Simple command-line interface
✅ **Dry Run Mode**: Preview before execution
✅ **Error Handling**: Clear feedback for invalid options
✅ **Performance Options**: Optimize for different use cases

This makes the seeding system adaptable to any environment, from quick development testing to production-ready realistic data generation.

# Command Line Seeding

> **Note:** Seeding and test scripts are now managed via the unified CLI or pnpm scripts. See the main README for details.
