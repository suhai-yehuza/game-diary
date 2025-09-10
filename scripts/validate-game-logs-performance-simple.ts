#!/usr/bin/env tsx

/**
 * Simple Game Logs Performance Validation Script
 * Validates that the performance optimizations are working correctly
 */

import { db } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

interface PerformanceValidation {
  test: string;
  expected: string;
  actual: string;
  passed: boolean;
  details?: string;
}

async function validateDatabasePerformance(): Promise<PerformanceValidation[]> {
  const validations: PerformanceValidation[] = [];

  logger.info('🔍 Validating database performance...');

  const database = db();
  if (!database) {
    validations.push({
      test: 'Database Connection',
      expected: 'Connected',
      actual: 'Failed to connect',
      passed: false,
      details: 'Database client could not be created',
    });
    return validations;
  }

  // Test 1: Ultra-fast query performance
  try {
    const startTime = Date.now();
    await database.execute(`
      SELECT gl.id, gl.user_id, gl.game_id, gl.rating_for_game, gl.created_at
      FROM game_logs gl
      WHERE gl.deleted_at IS NULL
      ORDER BY gl.created_at DESC
      LIMIT 5
    `);
    const duration = Date.now() - startTime;

    validations.push({
      test: 'Ultra-fast Query (≤5 items)',
      expected: '≤50ms',
      actual: `${duration}ms`,
      passed: duration <= 50,
      details: duration <= 50 ? 'Excellent performance' : 'Query is slower than expected',
    });
  } catch (error) {
    validations.push({
      test: 'Ultra-fast Query',
      expected: 'Success',
      actual: 'Failed',
      passed: false,
      details: error instanceof Error ? error.message : String(error),
    });
  }

  // Test 2: Optimized query performance
  try {
    const startTime = Date.now();
    await database.execute(`
      SELECT gl.id, gl.user_id, gl.game_id, gl.rating_for_game, gl.created_at,
             u.username, u.first_name, u.last_name
      FROM game_logs gl
      LEFT JOIN users u ON gl.user_id = u.id
      WHERE gl.deleted_at IS NULL
      ORDER BY gl.created_at DESC
      LIMIT 10
    `);
    const duration = Date.now() - startTime;

    validations.push({
      test: 'Optimized Query (6-15 items)',
      expected: '≤100ms',
      actual: `${duration}ms`,
      passed: duration <= 100,
      details: duration <= 100 ? 'Good performance' : 'Query needs optimization',
    });
  } catch (error) {
    validations.push({
      test: 'Optimized Query',
      expected: 'Success',
      actual: 'Failed',
      passed: false,
      details: error instanceof Error ? error.message : String(error),
    });
  }

  // Test 3: Minimal query performance
  try {
    const startTime = Date.now();
    await database.execute(`
      SELECT gl.id, gl.user_id, gl.game_id, gl.rating_for_game, gl.created_at
      FROM game_logs gl
      WHERE gl.deleted_at IS NULL
      ORDER BY gl.created_at DESC
      LIMIT 20
    `);
    const duration = Date.now() - startTime;

    validations.push({
      test: 'Minimal Query (>15 items)',
      expected: '≤200ms',
      actual: `${duration}ms`,
      passed: duration <= 200,
      details: duration <= 200 ? 'Acceptable performance' : 'Query is too slow',
    });
  } catch (error) {
    validations.push({
      test: 'Minimal Query',
      expected: 'Success',
      actual: 'Failed',
      passed: false,
      details: error instanceof Error ? error.message : String(error),
    });
  }

  return validations;
}

async function validateOptimizations(): Promise<PerformanceValidation[]> {
  const validations: PerformanceValidation[] = [];

  logger.info('🔍 Validating optimization implementations...');

  // Test 1: Check if optimized component exists
  try {
    const fs = await import('fs');
    const optimizedComponentPath = 'src/app/components/game-logs/OptimizedGameLogsTable.tsx';
    const optimizedHookPath = 'src/hooks/use-game-logs-tabs.ts';

    const componentExists = fs.existsSync(optimizedComponentPath);
    const hookExists = fs.existsSync(optimizedHookPath);

    validations.push({
      test: 'Optimized Components',
      expected: 'Both exist',
      actual: componentExists && hookExists ? 'Both exist' : 'Missing files',
      passed: componentExists && hookExists,
      details: `Component: ${componentExists ? '✓' : '✗'}, Hook: ${hookExists ? '✓' : '✗'}`,
    });
  } catch (error) {
    validations.push({
      test: 'Optimized Components',
      expected: 'Success',
      actual: 'Failed to check',
      passed: false,
      details: error instanceof Error ? error.message : String(error),
    });
  }

  // Test 2: Check if main page uses optimized component
  try {
    const fs = await import('fs');
    const mainPagePath = 'src/app/protected/user/page.tsx';
    const mainPageContent = fs.readFileSync(mainPagePath, 'utf-8');

    const usesOptimizedComponent = mainPageContent.includes('OptimizedGameLogsTable');
    const usesOldComponent = mainPageContent.includes('GameLogsTable');

    validations.push({
      test: 'Main Page Integration',
      expected: 'Uses OptimizedGameLogsTable',
      actual: usesOptimizedComponent ? 'Uses OptimizedGameLogsTable' : 'Uses GameLogsTable',
      passed: usesOptimizedComponent,
      details: usesOptimizedComponent
        ? 'Optimized component is active'
        : 'Still using old component',
    });
  } catch (error) {
    validations.push({
      test: 'Main Page Integration',
      expected: 'Success',
      actual: 'Failed to check',
      passed: false,
      details: error instanceof Error ? error.message : String(error),
    });
  }

  // Test 3: Check if performance indexes exist
  try {
    const fs = await import('fs');
    const indexFile = 'src/lib/db/migrations/0001_performance_indexes.sql';
    const indexExists = fs.existsSync(indexFile);

    validations.push({
      test: 'Performance Indexes',
      expected: 'Index file exists',
      actual: indexExists ? 'Index file exists' : 'Index file missing',
      passed: indexExists,
      details: indexExists
        ? 'Performance indexes are available'
        : 'Performance indexes may not be applied',
    });
  } catch (error) {
    validations.push({
      test: 'Performance Indexes',
      expected: 'Success',
      actual: 'Failed to check',
      passed: false,
      details: error instanceof Error ? error.message : String(error),
    });
  }

  return validations;
}

async function runSimplePerformanceValidation(): Promise<void> {
  logger.info('🚀 Starting Simple Game Logs Performance Validation...\n');

  const allValidations: PerformanceValidation[] = [];

  // Run all validation tests
  const [dbValidations, optimizationValidations] = await Promise.all([
    validateDatabasePerformance(),
    validateOptimizations(),
  ]);

  allValidations.push(...dbValidations, ...optimizationValidations);

  // Calculate results
  const totalTests = allValidations.length;
  const passedTests = allValidations.filter(v => v.passed).length;
  const failedTests = totalTests - passedTests;

  // Print results
  logger.info('\n📊 Performance Validation Results:');
  logger.info('='.repeat(60));

  // Summary
  const overall = failedTests === 0 ? 'PASS' : failedTests <= 2 ? 'WARNING' : 'FAIL';
  const statusIcon = overall === 'PASS' ? '✅' : overall === 'WARNING' ? '⚠️' : '❌';

  logger.info(`${statusIcon} Overall Status: ${overall}`);
  logger.info(`📈 Tests: ${passedTests}/${totalTests} passed`);

  if (overall === 'PASS') {
    logger.info(
      '🎉 All performance validations passed! Game Logs optimizations are working correctly.'
    );
  } else if (overall === 'WARNING') {
    logger.info('⚠️  Most validations passed, but some issues need attention.');
  } else {
    logger.info(
      '❌ Multiple validation failures detected. Performance optimizations may not be working correctly.'
    );
  }

  // Detailed results
  logger.info('\n📋 Detailed Results:');
  allValidations.forEach((validation, index) => {
    const icon = validation.passed ? '✅' : '❌';
    logger.info(`${icon} ${index + 1}. ${validation.test}`);
    logger.info(`   Expected: ${validation.expected}`);
    logger.info(`   Actual: ${validation.actual}`);
    if (validation.details) {
      logger.info(`   Details: ${validation.details}`);
    }
    logger.info('');
  });

  // Recommendations
  if (overall !== 'PASS') {
    logger.info('🔧 Recommendations:');
    const failedValidations = allValidations.filter(v => !v.passed);

    failedValidations.forEach(validation => {
      logger.info(`   • ${validation.test}: ${validation.details || 'Review implementation'}`);
    });
  }

  logger.info('\n✨ Validation complete!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSimplePerformanceValidation().catch(error => {
    logger.error('Performance validation failed:', error);
    process.exit(1);
  });
}

export { runSimplePerformanceValidation };
