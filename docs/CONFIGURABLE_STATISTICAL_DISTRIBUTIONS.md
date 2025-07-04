# Configurable Statistical Distributions

This document explains how to configure and use the statistical distribution system for different seeding scenarios in the Game Diary application.

## Overview

The statistical distribution system is now fully configurable, allowing you to choose which distribution types to use for different data types and scenarios. This provides flexibility for:

- **Development**: Fast, predictable data generation
- **Testing**: Comprehensive, realistic data patterns
- **Performance**: High-volume data for performance testing
- **Demo**: Engaging data for presentations
- **Custom**: Tailored distributions for specific needs

## Configuration Structure

### Distribution Types

The system supports multiple distribution types:

```typescript
type DistributionType =
  | 'pareto' // 80/20 rule, power law
  | 'normal' // Bell curve, Gaussian
  | 'exponential' // Time-based events
  | 'power-law' // Social media patterns
  | 'poisson' // Rare events
  | 'beta' // Bounded values (0-1)
  | 'uniform' // Random distribution
  | 'custom'; // Custom function
```

### Configuration Interface

```typescript
interface IDistributionConfig {
  type: DistributionType;
  parameters: {
    [key: string]: number;
  };
  customFunction?: () => number;
}

interface IStatisticalSeedingConfig {
  // User-related distributions
  userEngagement: IDistributionConfig;
  userActivityFrequency: IDistributionConfig;
  userFriendCount: IDistributionConfig;
  userContentQuality: IDistributionConfig;
  userActivityAge: IDistributionConfig;

  // Content-related distributions
  gameRating: IDistributionConfig;
  commentCount: IDistributionConfig;
  reactionCount: IDistributionConfig;
  contentViralProbability: IDistributionConfig;

  // Time-related distributions
  activityAge: IDistributionConfig;
  responseTime: IDistributionConfig;
  sessionDuration: IDistributionConfig;

  // Game log distributions
  gameLogsPerUser: IDistributionConfig;
  gameLogClassification: IDistributionConfig;
  gameLogTags: IDistributionConfig;

  // Social distributions
  friendshipStatus: IDistributionConfig;
  notificationFrequency: IDistributionConfig;

  // Advanced settings
  enableRealisticPatterns: boolean;
  enableViralContent: boolean;
  enablePowerUsers: boolean;
  enableTimeDecay: boolean;
}
```

## Predefined Configurations

### 1. REALISTIC (Default)

- **Purpose**: Realistic social media patterns
- **Features**: All realistic patterns enabled
- **Use Case**: Production-like testing, comprehensive validation

```typescript
{
  enableRealisticPatterns: true,
  enableViralContent: true,
  enablePowerUsers: true,
  enableTimeDecay: true,
  userEngagement: { type: 'pareto', parameters: { min: 0.1, max: 1.0, alpha: 1.5 } },
  gameRating: { type: 'beta', parameters: { alpha: 2.5, beta: 2.5, min: 1, max: 10 } },
  commentCount: { type: 'poisson', parameters: { lambda: 3 } },
  reactionCount: { type: 'pareto', parameters: { min: 0, max: 50, alpha: 1.2 } }
}
```

### 2. UNIFORM

- **Purpose**: Predictable, uniform distributions
- **Features**: All distributions set to uniform
- **Use Case**: Development, debugging, predictable testing

```typescript
{
  enableRealisticPatterns: false,
  enableViralContent: false,
  enablePowerUsers: false,
  enableTimeDecay: false,
  userEngagement: { type: 'uniform', parameters: { min: 0.1, max: 1.0 } },
  gameRating: { type: 'uniform', parameters: { min: 1, max: 10 } },
  commentCount: { type: 'uniform', parameters: { min: 0, max: 20 } },
  reactionCount: { type: 'uniform', parameters: { min: 0, max: 50 } }
}
```

### 3. HIGH_ENGAGEMENT

- **Purpose**: High user engagement patterns
- **Features**: Elevated engagement levels
- **Use Case**: Demo environments, engagement testing

```typescript
{
  userEngagement: { type: 'normal', parameters: { mean: 0.8, stdDev: 0.15, min: 0.5, max: 1.0 } },
  commentCount: { type: 'poisson', parameters: { lambda: 8 } },
  reactionCount: { type: 'pareto', parameters: { min: 10, max: 100, alpha: 1.0 } },
  enableViralContent: true
}
```

### 4. LOW_ENGAGEMENT

- **Purpose**: Low user engagement patterns
- **Features**: Reduced engagement levels
- **Use Case**: Edge case testing, low-activity scenarios

```typescript
{
  userEngagement: { type: 'normal', parameters: { mean: 0.2, stdDev: 0.1, min: 0.1, max: 0.5 } },
  commentCount: { type: 'poisson', parameters: { lambda: 1 } },
  reactionCount: { type: 'poisson', parameters: { lambda: 2 } },
  enableViralContent: false
}
```

### 5. PERFORMANCE

- **Purpose**: High-volume performance testing
- **Features**: Large data volumes, simplified distributions
- **Use Case**: Performance testing, load testing

```typescript
{
  userEngagement: { type: 'uniform', parameters: { min: 0.5, max: 1.0 } },
  gameLogsPerUser: { type: 'normal', parameters: { mean: 20, stdDev: 10, min: 10, max: 50 } },
  commentCount: { type: 'poisson', parameters: { lambda: 5 } },
  reactionCount: { type: 'poisson', parameters: { lambda: 10 } },
  enableRealisticPatterns: false
}
```

## Usage Examples

### Basic Usage

```typescript
import { getDistributionConfig } from '@src/lib/db/seed/statistical-distributions';

// Get predefined configuration
const config = getDistributionConfig('REALISTIC');

// Use in seeding
const userEngagement = generateUserEngagementWithConfig(config);
const gameRating = generateGameRatingWithConfig(config);
const commentCount = generateCommentCountWithConfig(config);
```

### Environment-Based Configuration

```typescript
import { getConfigByEnvironment } from '@src/lib/db/seed/distribution-config-examples';

// Automatically select configuration based on environment
const config = getConfigByEnvironment(process.env.NODE_ENV || 'development');

// Different configurations for different environments
// - development: Fast, uniform distributions
// - testing: Realistic patterns
// - performance: High volume
// - demo: High engagement
```

### Custom Configuration

```typescript
import { createCustomDistributionConfig } from '@src/lib/db/seed/statistical-distributions';

// Create custom configuration with overrides
const customConfig = createCustomDistributionConfig({
  userEngagement: {
    type: 'custom',
    parameters: {},
    customFunction: () => {
      const isPowerUser = Math.random() < 0.3; // 30% power users
      return isPowerUser
        ? Math.random() * 0.3 + 0.7 // 0.7-1.0
        : Math.random() * 0.4 + 0.1; // 0.1-0.5
    },
  },
  gameRating: {
    type: 'beta',
    parameters: { alpha: 3.0, beta: 2.0, min: 1, max: 10 },
  },
  enableViralContent: true,
});
```

### Configuration Merging

```typescript
import { mergeDistributionConfig } from '@src/lib/db/seed/statistical-distributions';

// Start with base configuration
const baseConfig = getDistributionConfig('REALISTIC');

// Override specific settings
const customConfig = mergeDistributionConfig(baseConfig, {
  userEngagement: { type: 'uniform', parameters: { min: 0.5, max: 1.0 } },
  enableRealisticPatterns: false,
});
```

## Distribution Parameters

### Pareto Distribution

```typescript
{
  type: 'pareto',
  parameters: {
    min: 0,        // Minimum value
    max: 100,      // Maximum value
    alpha: 1.16    // Shape parameter (1.16 for 80/20 rule)
  }
}
```

### Normal Distribution

```typescript
{
  type: 'normal',
  parameters: {
    mean: 50,      // Central value
    stdDev: 15,    // Standard deviation
    min: 0,        // Minimum bound
    max: 100       // Maximum bound
  }
}
```

### Exponential Distribution

```typescript
{
  type: 'exponential',
  parameters: {
    lambda: 0.1,   // Rate parameter
    min: 0,        // Minimum bound
    max: 100       // Maximum bound
  }
}
```

### Power Law Distribution

```typescript
{
  type: 'power-law',
  parameters: {
    min: 0,        // Minimum value
    max: 100,      // Maximum value
    alpha: 2.5     // Power law exponent
  }
}
```

### Poisson Distribution

```typescript
{
  type: 'poisson',
  parameters: {
    lambda: 3      // Average rate of events
  }
}
```

### Beta Distribution

```typescript
{
  type: 'beta',
  parameters: {
    alpha: 2.5,    // Shape parameter alpha
    beta: 2.5,     // Shape parameter beta
    min: 0,        // Minimum bound
    max: 1         // Maximum bound
  }
}
```

### Uniform Distribution

```typescript
{
  type: 'uniform',
  parameters: {
    min: 0,        // Minimum value
    max: 100       // Maximum value
  }
}
```

### Custom Distribution

```typescript
{
  type: 'custom',
  parameters: {},
  customFunction: () => {
    // Your custom logic here
    return Math.random() * 100;
  }
}
```

## Advanced Features

### Realistic Pattern Toggles

The configuration includes toggles for realistic patterns:

```typescript
{
  enableRealisticPatterns: true,  // Use complex realistic patterns
  enableViralContent: true,       // Enable viral content generation
  enablePowerUsers: true,         // Enable power user patterns
  enableTimeDecay: true           // Enable time-based decay
}
```

### Configuration Validation

```typescript
import { validateDistributionConfig } from '@src/lib/db/seed/statistical-distributions';

const isValid = validateDistributionConfig(config);
if (!isValid) {
  throw new Error('Invalid distribution configuration');
}
```

### Configuration Comparison

```typescript
import { compareConfigurations } from '@src/lib/db/seed/distribution-config-examples';

const comparison = compareConfigurations();
console.table(comparison);
```

## Integration with Seeding

### Update Seeding Functions

To use the configurable system in your seeding functions:

```typescript
import {
  generateUserEngagementWithConfig,
  generateGameRatingWithConfig,
  generateCommentCountWithConfig,
  generateReactionCountWithConfig,
  generateActivityAgeWithConfig,
  type IStatisticalSeedingConfig,
} from '@src/lib/db/seed/statistical-distributions';

export async function seedUserData(
  config?: Partial<ISeedingConfig>,
  distributionConfig?: IStatisticalSeedingConfig
) {
  // Use default distribution config if none provided
  const distConfig = distributionConfig || getDistributionConfig('REALISTIC');

  // Generate data using configuration
  const userEngagement = generateUserEngagementWithConfig(distConfig);
  const gameRating = generateGameRatingWithConfig(distConfig);
  const commentCount = generateCommentCountWithConfig(distConfig);
  const reactionCount = generateReactionCountWithConfig(distConfig);
  const activityAge = generateActivityAgeWithConfig(distConfig);

  // ... rest of seeding logic
}
```

### Environment-Specific Seeding

```typescript
import { getConfigByEnvironment } from '@src/lib/db/seed/distribution-config-examples';

export async function seedData() {
  const environment = process.env.NODE_ENV || 'development';
  const distributionConfig = getConfigByEnvironment(environment);

  console.log(`Seeding with ${environment} configuration`);
  console.log(`Realistic patterns: ${distributionConfig.enableRealisticPatterns}`);
  console.log(`Viral content: ${distributionConfig.enableViralContent}`);

  await seedUserData(undefined, distributionConfig);
}
```

## Best Practices

### 1. Environment-Specific Configurations

- Use different configurations for different environments
- Development: Fast, predictable data
- Testing: Realistic, comprehensive data
- Performance: High volume, simplified data

### 2. Configuration Validation

- Always validate configurations before use
- Test configurations with small datasets first
- Monitor performance impact of complex distributions

### 3. Custom Distributions

- Use custom distributions sparingly
- Document custom distribution logic
- Test custom distributions thoroughly

### 4. Performance Considerations

- Complex distributions (Pareto, Power Law) are slower
- Uniform distributions are fastest
- Disable realistic patterns for performance testing

### 5. Configuration Management

- Store configurations in version control
- Document configuration purposes and use cases
- Use meaningful configuration names

## Troubleshooting

### Common Issues

1. **Configuration Not Applied**

   - Ensure configuration is passed to generation functions
   - Check that configuration structure matches interface
   - Validate configuration before use

2. **Performance Issues**

   - Use uniform distributions for large datasets
   - Disable realistic patterns for performance testing
   - Consider using simpler distributions

3. **Unrealistic Data**

   - Enable realistic patterns
   - Use appropriate distribution types
   - Adjust distribution parameters

4. **Type Errors**
   - Ensure all required configuration fields are present
   - Check distribution parameter types
   - Validate custom function return types

### Debug Configuration

```typescript
import { analyzeDistribution } from '@src/lib/db/seed/statistical-distributions';

// Test configuration with sample data
function testConfiguration(config: IStatisticalSeedingConfig) {
  const samples = [];
  for (let i = 0; i < 1000; i++) {
    samples.push(generateUserEngagementWithConfig(config));
  }

  const analysis = analyzeDistribution(samples);
  console.log('Configuration test results:', analysis);
}
```

This configurable system provides the flexibility to generate appropriate data for any scenario while maintaining the statistical rigor of realistic patterns.
