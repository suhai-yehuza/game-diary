# Statistical Distributions for Realistic Data Generation

This document explains the statistical distribution system used to generate realistic data that mimics real-world patterns in the Placeholder application.

## Overview

The seeding system uses various statistical distributions to create data that follows real-world patterns:

- **Pareto Principle (80/20 rule)** for user engagement and content popularity
- **Normal Distribution (Bell Curve)** for ratings and user behavior metrics
- **Exponential Distribution** for time-based events and activity frequency
- **Power Law Distribution** for social media engagement and viral content
- **Poisson Distribution** for rare events like comment counts
- **Beta Distribution** for bounded values like ratings

## Core Distribution Functions

### Pareto Distribution (80/20 Rule)

Used for: User engagement, game popularity, content virality

```typescript
paretoDistribution(min: number, max: number, alpha: number = 1.16): number
```

- **Purpose**: Models the 80/20 rule where 20% of users generate 80% of activity
- **Parameters**:
  - `min/max`: Range of values
  - `alpha`: Shape parameter (1.16 for classic 80/20 rule)
- **Real-world examples**:
  - User engagement levels
  - Game popularity
  - Content virality

### Normal Distribution (Bell Curve)

Used for: Ratings, completion times, user behavior metrics

```typescript
normalDistribution(mean: number, stdDev: number, min: number, max: number): number
```

- **Purpose**: Models natural variation around a central tendency
- **Parameters**:
  - `mean`: Central value
  - `stdDev`: Standard deviation
  - `min/max`: Bounds
- **Real-world examples**:
  - Game ratings (most games get average ratings)
  - User session durations
  - Content quality scores

### Exponential Distribution

Used for: Time between events, decay patterns

```typescript
exponentialDistribution(lambda: number, min: number, max: number): number
```

- **Purpose**: Models time between independent events
- **Parameters**:
  - `lambda`: Rate parameter
  - `min/max`: Bounds
- **Real-world examples**:
  - Time between user activities
  - Response times
  - Activity frequency

### Power Law Distribution

Used for: Social media engagement, content popularity

```typescript
powerLawDistribution(min: number, max: number, alpha: number = 2.5): number
```

- **Purpose**: Models viral content and social network effects
- **Parameters**:
  - `min/max`: Range
  - `alpha`: Power law exponent
- **Real-world examples**:
  - Social media engagement
  - Friend counts in social networks
  - Viral content metrics

### Poisson Distribution

Used for: Rare events, comment counts, reaction counts

```typescript
poissonDistribution(lambda: number): number
```

- **Purpose**: Models count of rare events in fixed intervals
- **Parameters**:
  - `lambda`: Average rate of events
- **Real-world examples**:
  - Comment counts on posts
  - Reaction counts
  - Notification frequency

### Beta Distribution

Used for: Ratings, percentages, bounded metrics

```typescript
betaDistribution(alpha: number, beta: number, min: number, max: number): number
```

- **Purpose**: Models bounded values with flexible shapes
- **Parameters**:
  - `alpha/beta`: Shape parameters
  - `min/max`: Bounds
- **Real-world examples**:
  - Game ratings (1-10 scale)
  - User satisfaction scores
  - Completion percentages

## Real-World Data Patterns

### User Engagement Pattern

Combines Pareto and Normal distributions:

```typescript
generateUserEngagement(): number
```

- **20% Power Users**: High engagement (Pareto distribution)
- **80% Regular Users**: Moderate engagement (Normal distribution)
- **Result**: Realistic user activity levels

### Game Rating Distribution

Uses Beta distribution for realistic rating patterns:

```typescript
generateGameRating(): number
```

- **Most games**: Average ratings (6-8)
- **Few games**: Very high (9-10) or very low (1-3) ratings
- **Mimics**: Real rating systems like IMDb, Steam

### Comment Count Distribution

Combines Poisson and Power Law:

```typescript
generateCommentCount(): number
```

- **95% Regular Content**: Few comments (Poisson distribution)
- **5% Viral Content**: Many comments (Power Law distribution)
- **Result**: Realistic social media engagement patterns

### Reaction Count Distribution

Uses Pareto distribution:

```typescript
generateReactionCount(): number
```

- **Most content**: Few reactions
- **Popular content**: Many reactions
- **Long tail**: Some content gets viral-level engagement

## Specialized Generators

### User Behavior Patterns

```typescript
generateUserBehavior() {
  return {
    engagement: generateUserEngagement(),
    activityFrequency: generateActivityFrequency(),
    friendCount: generateFriendCount(),
    contentQuality: generateContentQuality(),
    lastActivityAge: generateActivityAge(),
  };
}
```

### Content Engagement Patterns

```typescript
generateContentEngagement() {
  return {
    commentCount: generateCommentCount(),
    reactionCount: generateReactionCount(),
    rating: generateGameRating(),
    viralProbability: Math.random() < 0.05, // 5% chance of going viral
  };
}
```

### Time Patterns

```typescript
generateTimePatterns() {
  return {
    activityAge: generateActivityAge(),
    responseTime: exponentialDistribution(0.1, 0, 24), // Hours
    sessionDuration: normalDistribution(30, 15, 5, 120), // Minutes
  };
}
```

## Configuration Presets

The system includes predefined configurations for different scenarios:

```typescript
export const DISTRIBUTION_PRESETS = {
  USER_ENGAGEMENT: {
    powerUserRatio: 0.2,
    engagementParetoAlpha: 1.5,
    engagementNormalMean: 0.4,
    engagementNormalStdDev: 0.15,
  },

  CONTENT_POPULARITY: {
    viralContentRatio: 0.05,
    commentPoissonLambda: 3,
    reactionParetoAlpha: 1.2,
    ratingBetaAlpha: 2.5,
    ratingBetaBeta: 2.5,
  },

  SOCIAL_NETWORK: {
    friendCountPowerLawAlpha: 2.0,
    activityFrequencyLambda: 0.3,
    responseTimeLambda: 0.1,
  },

  TIME_PATTERNS: {
    recentActivityRatio: 0.7,
    activityAgeExponentialLambda: 0.5,
    activityAgeNormalMean: 60,
    activityAgeNormalStdDev: 30,
  },
};
```

## Analysis and Validation Tools

### Distribution Analysis

```typescript
analyzeDistribution(data: number[]): {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  percentiles: { [key: string]: number };
}
```

Provides comprehensive statistics for generated data.

### Distribution Validation

```typescript
validateDistribution(
  data: number[],
  expectedPattern: 'pareto' | 'normal' | 'exponential' | 'power-law'
): boolean
```

Validates that generated data follows expected statistical patterns.

## Usage in Seeding

### Game Logs

```typescript
// Use user engagement to determine activity level
const userBehavior = generateUserBehavior();
const engagementMultiplier = userBehavior.engagement;

// Adjust game log count based on user engagement (Pareto distribution)
const baseGameLogCount = faker.number.int({ min: 3, max: 15 });
const gameLogCount = Math.round(baseGameLogCount * engagementMultiplier);

// Generate realistic activity age (most recent, some older)
const activityAge = generateActivityAge();
const watchedDate = new Date(Date.now() - activityAge * 24 * 60 * 60 * 1000);

// Generate realistic game rating using beta distribution
const rating = generateGameRating();
```

### Comments

```typescript
// Use realistic comment count distribution (Poisson + Power Law for viral content)
const commentCount = generateCommentCount();

// Limit to available users and reasonable bounds
const maxComments = Math.min(commentCount, users.length, 20);
const actualCommentCount = Math.max(0, maxComments);
```

### Reactions

```typescript
// Use realistic reaction count distribution (Pareto distribution)
const reactionCount = generateReactionCount();
```

## Real-World Examples

### Social Media Patterns

- **Instagram**: Most posts get few likes, some go viral (Power Law)
- **Twitter**: Most users have few followers, some have many (Pareto)
- **YouTube**: Most videos get few views, some get millions (Power Law)

### Gaming Patterns

- **Steam Ratings**: Most games get average ratings, few are exceptional (Beta)
- **Player Activity**: Most players play occasionally, few play daily (Exponential)
- **Game Popularity**: Most games are niche, few are blockbusters (Pareto)

### User Behavior Patterns

- **Engagement**: 20% of users generate 80% of content (Pareto)
- **Session Duration**: Most sessions are moderate length (Normal)
- **Activity Frequency**: Most users are active occasionally (Exponential)

## Benefits

1. **Realistic Data**: Generated data matches real-world patterns
2. **Better Testing**: Edge cases and realistic scenarios are covered
3. **Performance Insights**: Helps identify performance bottlenecks
4. **User Experience**: UI/UX testing with realistic data volumes
5. **Analytics**: Realistic data for analytics and reporting features

## Future Enhancements

1. **Seasonal Patterns**: Add time-based variations
2. **Geographic Patterns**: Regional user behavior differences
3. **Demographic Patterns**: Age/gender-based behavior variations
4. **Event-Driven Patterns**: Special events affecting engagement
5. **Machine Learning**: Adaptive distributions based on real data

## Configuration

The distributions can be tuned by modifying the preset configurations or creating custom parameters for specific scenarios. This allows for:

- **Development**: Fast, minimal data for quick iteration
- **Testing**: Comprehensive data for thorough testing
- **Performance**: Large datasets for performance testing
- **Demo**: Realistic data for demonstrations

## Monitoring

The system includes tools to monitor and validate generated data:

- Distribution analysis to ensure realistic patterns
- Validation against expected statistical properties
- Performance metrics for seeding operations
- Quality checks for data integrity

This statistical approach ensures that the Placeholder application has realistic, high-quality test data that accurately represents real-world usage patterns.
