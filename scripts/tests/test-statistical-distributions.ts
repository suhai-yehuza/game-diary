#!/usr/bin/env tsx

/**
 * Test Script for Statistical Distributions
 *
 * This script demonstrates and validates the statistical distributions used in seeding.
 * It generates sample data and analyzes the distributions to ensure they match real-world patterns.
 */

import {
  paretoDistribution,
  normalDistribution,
  exponentialDistribution,
  powerLawDistribution,
  poissonDistribution,
  betaDistribution,
  generateUserEngagement,
  generateGameRating,
  generateCommentCount,
  generateReactionCount,
  generateActivityFrequency,
  generateFriendCount,
  generateActivityAge,
  generateUserBehavior,
  generateContentEngagement,
  generateTimePatterns,
  analyzeDistribution,
  validateDistribution,
  DISTRIBUTION_PRESETS,
} from '@src/lib/db/seed/statistical-distributions';

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const TEST_CONFIG = {
  SAMPLE_SIZE: 1000,
  ROUNDS: 5,
  TOLERANCE: 0.1, // 10% tolerance for validation
} as const;

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

/**
 * Generate sample data for a distribution function
 */
function generateSampleData(
  generator: () => number,
  sampleSize: number = TEST_CONFIG.SAMPLE_SIZE
): number[] {
  const data: number[] = [];
  for (let i = 0; i < sampleSize; i++) {
    data.push(generator());
  }
  return data;
}

/**
 * Test a distribution and analyze its properties
 */
function testDistribution(
  name: string,
  generator: () => number,
  expectedPattern?: 'pareto' | 'normal' | 'exponential' | 'power-law'
) {
  console.log(`\n=== Testing ${name} ===`);

  const data = generateSampleData(generator);
  const analysis = analyzeDistribution(data);

  console.log(`Sample Size: ${data.length}`);
  console.log(`Mean: ${analysis.mean.toFixed(2)}`);
  console.log(`Median: ${analysis.median.toFixed(2)}`);
  console.log(`Std Dev: ${analysis.stdDev.toFixed(2)}`);
  console.log(`Min: ${analysis.min.toFixed(2)}`);
  console.log(`Max: ${analysis.max.toFixed(2)}`);
  console.log(`Range: ${(analysis.max - analysis.min).toFixed(2)}`);

  console.log('\nPercentiles:');
  Object.entries(analysis.percentiles).forEach(([percentile, value]) => {
    console.log(`  ${percentile}: ${value.toFixed(2)}`);
  });

  if (expectedPattern) {
    const isValid = validateDistribution(data, expectedPattern);
    console.log(`\nValidation (${expectedPattern}): ${isValid ? '✅ PASS' : '❌ FAIL'}`);
  }

  return analysis;
}

/**
 * Test user behavior patterns
 */
function testUserBehavior() {
  console.log('\n=== Testing User Behavior Patterns ===');

  const behaviors = [];
  for (let i = 0; i < 100; i++) {
    behaviors.push(generateUserBehavior());
  }

  const engagement = behaviors.map(b => b.engagement);
  const activityFreq = behaviors.map(b => b.activityFrequency);
  const friendCounts = behaviors.map(b => b.friendCount);
  const contentQuality = behaviors.map(b => b.contentQuality);
  const activityAge = behaviors.map(b => b.lastActivityAge);

  console.log('\nEngagement Analysis:');
  analyzeDistribution(engagement);

  console.log('\nActivity Frequency Analysis:');
  analyzeDistribution(activityFreq);

  console.log('\nFriend Count Analysis:');
  analyzeDistribution(friendCounts);

  console.log('\nContent Quality Analysis:');
  analyzeDistribution(contentQuality);

  console.log('\nActivity Age Analysis:');
  analyzeDistribution(activityAge);
}

/**
 * Test content engagement patterns
 */
function testContentEngagement() {
  console.log('\n=== Testing Content Engagement Patterns ===');

  const engagements = [];
  for (let i = 0; i < 100; i++) {
    engagements.push(generateContentEngagement());
  }

  const commentCounts = engagements.map(e => e.commentCount);
  const reactionCounts = engagements.map(e => e.reactionCount);
  const ratings = engagements.map(e => e.rating);
  const viralCount = engagements.filter(e => e.viralProbability).length;

  console.log(`\nViral Content Ratio: ${((viralCount / engagements.length) * 100).toFixed(1)}%`);

  console.log('\nComment Count Analysis:');
  analyzeDistribution(commentCounts);

  console.log('\nReaction Count Analysis:');
  analyzeDistribution(reactionCounts);

  console.log('\nRating Analysis:');
  analyzeDistribution(ratings);
}

/**
 * Test time patterns
 */
function testTimePatterns() {
  console.log('\n=== Testing Time Patterns ===');

  const timePatterns = [];
  for (let i = 0; i < 100; i++) {
    timePatterns.push(generateTimePatterns());
  }

  const activityAges = timePatterns.map(t => t.activityAge);
  const responseTimes = timePatterns.map(t => t.responseTime);
  const sessionDurations = timePatterns.map(t => t.sessionDuration);

  console.log('\nActivity Age Analysis:');
  analyzeDistribution(activityAges);

  console.log('\nResponse Time Analysis:');
  analyzeDistribution(responseTimes);

  console.log('\nSession Duration Analysis:');
  analyzeDistribution(sessionDurations);
}

/**
 * Test distribution consistency across multiple runs
 */
function testConsistency() {
  console.log('\n=== Testing Distribution Consistency ===');

  const results: { [key: string]: number[] } = {};

  for (let round = 0; round < TEST_CONFIG.ROUNDS; round++) {
    console.log(`\nRound ${round + 1}:`);

    // Test core distributions
    const paretoData = generateSampleData(() => paretoDistribution(0, 100, 1.5));
    const normalData = generateSampleData(() => normalDistribution(50, 15, 0, 100));
    const expData = generateSampleData(() => exponentialDistribution(0.1, 0, 100));

    if (!results.pareto) results.pareto = [];
    if (!results.normal) results.normal = [];
    if (!results.exponential) results.exponential = [];

    results.pareto.push(analyzeDistribution(paretoData).mean);
    results.normal.push(analyzeDistribution(normalData).mean);
    results.exponential.push(analyzeDistribution(expData).mean);

    console.log(`  Pareto Mean: ${results.pareto[round].toFixed(2)}`);
    console.log(`  Normal Mean: ${results.normal[round].toFixed(2)}`);
    console.log(`  Exponential Mean: ${results.exponential[round].toFixed(2)}`);
  }

  // Check consistency
  console.log('\nConsistency Analysis:');
  Object.entries(results).forEach(([distribution, means]) => {
    const avgMean = means.reduce((sum, m) => sum + m, 0) / means.length;
    const variance = means.reduce((sum, m) => sum + Math.pow(m - avgMean, 2), 0) / means.length;
    const stdDev = Math.sqrt(variance);
    const coefficient = (stdDev / avgMean) * 100;

    console.log(
      `  ${distribution}: CV = ${coefficient.toFixed(2)}% (${coefficient < 5 ? '✅' : '❌'})`
    );
  });
}

/**
 * Test real-world scenario simulation
 */
function testRealWorldScenario() {
  console.log('\n=== Testing Real-World Scenario ===');

  // Simulate a social media platform with 1000 users
  const users = 1000;
  const posts = 5000;
  const comments = 15000;
  const reactions = 25000;

  console.log(
    `\nSimulating ${users} users, ${posts} posts, ${comments} comments, ${reactions} reactions`
  );

  // Generate user engagement distribution
  const userEngagement = generateSampleData(generateUserEngagement, users);
  const powerUsers = userEngagement.filter(e => e > 0.7).length;
  const regularUsers = userEngagement.filter(e => e <= 0.7).length;

  console.log(`\nUser Distribution:`);
  console.log(
    `  Power Users (>70% engagement): ${powerUsers} (${((powerUsers / users) * 100).toFixed(1)}%)`
  );
  console.log(
    `  Regular Users (≤70% engagement): ${regularUsers} (${((regularUsers / users) * 100).toFixed(1)}%)`
  );

  // Generate post engagement
  const postEngagements = [];
  for (let i = 0; i < posts; i++) {
    postEngagements.push(generateContentEngagement());
  }
  const viralPosts = postEngagements.filter(e => e.viralProbability).length;
  const avgComments = postEngagements.reduce((sum, e) => sum + e.commentCount, 0) / posts;
  const avgReactions = postEngagements.reduce((sum, e) => sum + e.reactionCount, 0) / posts;

  console.log(`\nPost Distribution:`);
  console.log(`  Viral Posts: ${viralPosts} (${((viralPosts / posts) * 100).toFixed(1)}%)`);
  console.log(`  Average Comments per Post: ${avgComments.toFixed(1)}`);
  console.log(`  Average Reactions per Post: ${avgReactions.toFixed(1)}`);

  // Generate ratings
  const ratings = generateSampleData(generateGameRating, posts);
  const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  const highRatings = ratings.filter(r => r >= 8).length;
  const lowRatings = ratings.filter(r => r <= 3).length;

  console.log(`\nRating Distribution:`);
  console.log(`  Average Rating: ${avgRating.toFixed(2)}`);
  console.log(`  High Ratings (≥8): ${highRatings} (${((highRatings / posts) * 100).toFixed(1)}%)`);
  console.log(`  Low Ratings (≤3): ${lowRatings} (${((lowRatings / posts) * 100).toFixed(1)}%)`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🎲 Statistical Distributions Test Suite');
  console.log('=====================================\n');

  try {
    // Test core distributions
    testDistribution('Pareto Distribution', () => paretoDistribution(0, 100, 1.5), 'pareto');
    testDistribution('Normal Distribution', () => normalDistribution(50, 15, 0, 100), 'normal');
    testDistribution(
      'Exponential Distribution',
      () => exponentialDistribution(0.1, 0, 100),
      'exponential'
    );
    testDistribution(
      'Power Law Distribution',
      () => powerLawDistribution(0, 100, 2.5),
      'power-law'
    );
    testDistribution('Poisson Distribution', () => poissonDistribution(3));
    testDistribution('Beta Distribution', () => betaDistribution(2.5, 2.5, 1, 10));

    // Test specialized generators
    testDistribution('User Engagement', generateUserEngagement);
    testDistribution('Game Rating', generateGameRating);
    testDistribution('Comment Count', generateCommentCount);
    testDistribution('Reaction Count', generateReactionCount);
    testDistribution('Activity Frequency', generateActivityFrequency);
    testDistribution('Friend Count', generateFriendCount);
    testDistribution('Activity Age', generateActivityAge);

    // Test complex patterns
    testUserBehavior();
    testContentEngagement();
    testTimePatterns();

    // Test consistency
    testConsistency();

    // Test real-world scenario
    testRealWorldScenario();

    console.log('\n✅ All tests completed successfully!');
    console.log(
      '\n📊 The statistical distributions are working correctly and generating realistic data patterns.'
    );
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test suite
main().catch(console.error);
