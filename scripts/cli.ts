#!/usr/bin/env tsx
/**
 * @fileoverview Unified CLI for all script operations
 * Consolidates all script functionality into a single, well-organized CLI
 */

import 'dotenv-flow/config';

import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';

import { logger } from '@lib/core/logger';

const execAsync = promisify(exec);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Run a shell command with logging
 */
async function runCommand(command: string, description: string): Promise<void> {
  logger.info(`\n📌 ${description}...`);
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stdout) logger.info(stdout);
    if (stderr && !stderr.includes('Warning') && !stderr.includes('deprecat')) logger.error(stderr);
    logger.info(`✅ ${description} completed`);
  } catch (error: unknown) {
    logger.error(`❌ Failed: ${description}`);
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error(String(error));
    }
    throw error;
  }
}

/**
 * Parse script arguments
 */
function parseArgs(): { command: string; subcommand: string; args: string[] } {
  const args = process.argv.slice(2);
  const command = args[0] || '';
  const subcommand = args[1] || '';
  const remainingArgs = args.slice(2);

  return { command, subcommand, args: remainingArgs };
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Database operations
 */
async function handleDatabase(subcommand: string, args: string[]): Promise<void> {
  const dbManagerPath = join(process.cwd(), 'scripts/db/database-manager.ts');

  switch (subcommand) {
    case 'migrate':
      await runCommand(
        `tsx ${dbManagerPath} migrate ${args.join(' ')}`,
        'Running database migrations'
      );
      break;
    case 'setup':
      await runCommand(`tsx ${dbManagerPath} setup ${args.join(' ')}`, 'Setting up database');
      break;
    case 'truncate':
      await runCommand(`tsx ${dbManagerPath} truncate ${args.join(' ')}`, 'Truncating tables');
      break;
    case 'view':
      await runCommand(`tsx ${dbManagerPath} view`, 'Viewing migration history');
      break;
    case 'validate':
      await runCommand(`tsx ${dbManagerPath} validate`, 'Validating migrations');
      break;
    case 'copy-migrations':
      await runCommand(`tsx ${dbManagerPath} copy-migrations`, 'Copying custom migrations');
      break;
    default:
      logger.error(`Unknown database subcommand: ${subcommand}`);
      logger.info(
        'Available database commands: migrate, setup, truncate, view, validate, copy-migrations'
      );
      process.exit(1);
  }
}

// ============================================================================
// TESTING OPERATIONS
// ============================================================================

/**
 * Testing operations
 */
async function handleTesting(subcommand: string, args: string[]): Promise<void> {
  switch (subcommand) {
    case 'e2e':
      await runCommand(`./scripts/e2e-run.sh ${args.join(' ')}`, 'Running E2E tests');
      break;
    case 'e2e-compound':
      await runCommand(
        `./scripts/e2e-compound-runner.sh ${args.join(' ')}`,
        'Running compound E2E tests'
      );
      break;
    case 'e2e-debug':
      await runCommand('./scripts/e2e-debug.sh', 'Running E2E debug utilities');
      break;
    case 'e2e-optimize':
      await runCommand(`./scripts/e2e-optimize.sh ${args.join(' ')}`, 'Running E2E optimization');
      break;
    case 'failing':
      await runCommand(`./scripts/run-failing.sh ${args.join(' ')}`, 'Running failing tests');
      break;
    case 'coverage':
      await runCommand(
        `./scripts/e2e-coverage-report.ts ${args.join(' ')}`,
        'Generating coverage report'
      );
      break;
    case 'all-triggers':
      await runCommand(
        `tsx scripts/tests/test-all-triggers.ts ${args.join(' ')}`,
        'Testing all database triggers'
      );
      break;

    default:
      logger.error(`Unknown testing subcommand: ${subcommand}`);
      logger.info(
        'Available testing commands: e2e, e2e-compound, e2e-debug, e2e-optimize, failing, coverage, all-triggers'
      );
      process.exit(1);
  }
}

// ============================================================================
// CI/CD OPERATIONS
// ============================================================================

/**
 * CI/CD operations
 */
async function handleCI(subcommand: string, args: string[]): Promise<void> {
  switch (subcommand) {
    case 'runner':
      await runCommand(`./scripts/ci-runner.sh ${args.join(' ')}`, 'Running CI pipeline');
      break;
    case 'unit-tests':
      await runCommand('./scripts/ci-unit-tests.sh', 'Running CI unit tests');
      break;
    case 'e2e-tests':
      await runCommand(`./scripts/ci-e2e-tests.sh ${args.join(' ')}`, 'Running CI E2E tests');
      break;
    case 'quality-gate':
      await runCommand('./scripts/ci-quality-gate.sh', 'Running CI quality gate');
      break;
    default:
      logger.error(`Unknown CI subcommand: ${subcommand}`);
      logger.info('Available CI commands: runner, unit-tests, e2e-tests, quality-gate');
      process.exit(1);
  }
}

// ============================================================================
// VALIDATION OPERATIONS
// ============================================================================

/**
 * Validation operations
 */
async function handleValidation(subcommand: string, args: string[]): Promise<void> {
  switch (subcommand) {
    case 'run':
      await runCommand(`./scripts/validate.sh ${args.join(' ')}`, 'Running validation pipeline');
      break;
    default:
      logger.error(`Unknown validation subcommand: ${subcommand}`);
      logger.info('Available validation commands: run');
      process.exit(1);
  }
}

// ============================================================================
// UTILITY OPERATIONS
// ============================================================================

/**
 * Utility operations
 */
async function handleUtils(subcommand: string, args: string[]): Promise<void> {
  switch (subcommand) {
    case 'fix-types':
      await runCommand(
        `tsx scripts/utils/fix-type-violations.ts ${args.join(' ')}`,
        'Fixing type violations'
      );
      break;
    case 'validate-types':
      await runCommand(`tsx scripts/utils/validate-types.ts ${args.join(' ')}`, 'Validating types');
      break;
    case 'check-circular':
      await runCommand(
        `tsx scripts/utils/check-circular-deps.ts ${args.join(' ')}`,
        'Checking circular dependencies'
      );
      break;
    case 'check-unused':
      await runCommand(
        `tsx scripts/utils/check-unused-exports.ts ${args.join(' ')}`,
        'Checking unused exports'
      );
      break;
    case 'manage-deps':
      await runCommand(
        `tsx scripts/utils/manage-deps.ts ${args.join(' ')}`,
        'Managing dependencies'
      );
      break;
    case 'verify-env':
      await runCommand(
        `tsx scripts/utils/verify-env.ts ${args.join(' ')}`,
        'Verifying environment'
      );
      break;
    case 'combine-schema':
      await runCommand(`tsx scripts/utils/combine-schema.ts ${args.join(' ')}`, 'Combining schema');
      break;
    default:
      logger.error(`Unknown utils subcommand: ${subcommand}`);
      logger.info(
        'Available utils commands: fix-types, validate-types, check-circular, check-unused, manage-deps, verify-env, combine-schema'
      );
      process.exit(1);
  }
}

// ============================================================================
// PERFORMANCE OPERATIONS
// ============================================================================

/**
 * Performance operations
 */
async function handlePerformance(subcommand: string, args: string[]): Promise<void> {
  switch (subcommand) {
    case 'measure':
      await runCommand(
        `tsx scripts/performance/performance-measure.ts ${args.join(' ')}`,
        'Measuring performance'
      );
      break;
    case 'report':
      await runCommand(
        `tsx scripts/performance/performance-report.ts ${args.join(' ')}`,
        'Generating performance report'
      );
      break;
    default:
      logger.error(`Unknown performance subcommand: ${subcommand}`);
      logger.info('Available performance commands: measure, report');
      process.exit(1);
  }
}

// ============================================================================
// WORKFLOW OPERATIONS
// ============================================================================

/**
 * Workflow operations
 */
async function handleWorkflow(subcommand: string, args: string[]): Promise<void> {
  switch (subcommand) {
    case 'push-merge':
      await runCommand(
        `./scripts/push-and-merge.sh ${args.join(' ')}`,
        'Running push and merge workflow'
      );
      break;
    case 'deploy':
      await runCommand(
        `./scripts/deployment-manager.sh ${args.join(' ')}`,
        'Running deployment manager'
      );
      break;
    case 'soak':
      await runCommand(`./scripts/soak-monitor.sh ${args.join(' ')}`, 'Running soak monitor');
      break;
    case 'timed':
      await runCommand(`./scripts/timed-run.sh ${args.join(' ')}`, 'Running timed execution');
      break;
    case 'generate-results':
      await runCommand(
        `./scripts/generate-test-results.sh ${args.join(' ')}`,
        'Generating test results'
      );
      break;
    case 'rename':
      await runCommand(
        `./scripts/rename-to-kebab-case.sh ${args.join(' ')}`,
        'Renaming files to kebab case'
      );
      break;
    default:
      logger.error(`Unknown workflow subcommand: ${subcommand}`);
      logger.info(
        'Available workflow commands: push-merge, deploy, soak, timed, generate-results, rename'
      );
      process.exit(1);
  }
}

// ============================================================================
// SECURITY OPERATIONS
// ============================================================================

/**
 * Security operations
 */
async function handleSecurity(subcommand: string, args: string[]): Promise<void> {
  switch (subcommand) {
    case 'test-alerting':
      await runCommand(
        'tsx scripts/tests/test-slack-alerting.ts',
        'Testing Slack alerting service'
      );
      break;
    case 'test-encryption':
      await runCommand('tsx scripts/tests/test-encryption.ts', 'Testing encryption utilities');
      break;
    case 'test-rls':
      await runCommand(
        'tsx scripts/tests/test-rls-policies.ts',
        'Testing Row-Level Security policies'
      );
      break;
    case 'key-management':
      await runCommand(
        `tsx scripts/key-management.ts ${args.join(' ')}`,
        'Managing encryption keys'
      );
      break;
    default:
      logger.error(`Unknown security subcommand: ${subcommand}`);
      logger.info(
        'Available security commands: test-alerting, test-encryption, test-rls, key-management'
      );
      process.exit(1);
  }
}

// ============================================================================
// MAIN CLI INTERFACE
// ============================================================================

/**
 * Main CLI interface
 */
async function main(): Promise<void> {
  const { command, subcommand, args } = parseArgs();

  if (!command) {
    showHelp();
    return;
  }

  try {
    switch (command) {
      case 'db':
        await handleDatabase(subcommand, args);
        break;
      case 'test':
        await handleTesting(subcommand, args);
        break;
      case 'ci':
        await handleCI(subcommand, args);
        break;
      case 'validate':
        await handleValidation(subcommand, args);
        break;
      case 'utils':
        await handleUtils(subcommand, args);
        break;
      case 'perf':
        await handlePerformance(subcommand, args);
        break;
      case 'workflow':
        await handleWorkflow(subcommand, args);
        break;
      case 'security':
        await handleSecurity(subcommand, args);
        break;
      default:
        logger.error(`Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    logger.error('Script execution failed:', error);
    process.exit(1);
  }
}

/**
 * Show help information
 */
function showHelp(): void {
  logger.info(`
Scripts CLI - Unified script management

Usage: tsx scripts/cli.ts <command> <subcommand> [options]

Commands:
  db <subcommand>           Database operations
    migrate [options]       Run database migrations
    setup [complete|triggers-only] [options] Setup database
    truncate --scope=<scope> Truncate tables
    view                   View migration history
    validate               Validate migrations
    copy-migrations        Copy custom migrations

  test <subcommand>         Testing operations
    e2e [options]          Run E2E tests
    e2e-compound [options] Run compound E2E tests
    e2e-debug              Run E2E debug utilities
    e2e-optimize [options] Run E2E optimization
    failing [options]      Run failing tests
    coverage [options]     Generate coverage report
    db-connection [options] Test database connection
    migrations [options]   Test migrations
    redis [options]        Test Redis connection
    cascade-delete [options] Test cascade delete
    seeding [options]      Test seeding functions
    seeding-deps [options] Test seeding dependencies
    seeding-cli [options]  Test seeding CLI
    notifications [options] Test notification triggers
    distributions [options] Test statistical distributions
    configurable [options] Test configurable distributions

  ci <subcommand>           CI/CD operations
    runner [environment]   Run CI pipeline
    unit-tests            Run CI unit tests
    e2e-tests [type]      Run CI E2E tests
    quality-gate          Run CI quality gate

  validate <subcommand>     Validation operations
    run [type]            Run validation pipeline
    helpers [options]     Run validation helpers

  utils <subcommand>        Utility operations
    fix-types [options]   Fix type violations
    validate-types [options] Validate types
    check-circular [options] Check circular dependencies
    check-unused [options] Check unused exports
    manage-deps [options] Manage dependencies
    verify-env [options]  Verify environment
    combine-schema [options] Combine schema

  perf <subcommand>         Performance operations
    measure [options]     Measure performance
    report [options]      Generate performance report

  workflow <subcommand>     Workflow operations
    push-merge [options]  Run push and merge workflow
    deploy [options]      Run deployment manager
    soak [options]        Run soak monitor
    timed [options]       Run timed execution
    generate-results [options] Generate test results
    rename [options]      Rename files to kebab case

  security <subcommand>    Security operations
    test-alerting          Test Slack alerting service
    test-encryption       Test encryption utilities
    test-rls              Test Row-Level Security policies
    key-management [options] Manage encryption keys

Examples:
  tsx scripts/cli.ts db migrate
  tsx scripts/cli.ts db setup complete
  tsx scripts/cli.ts test e2e basic
  tsx scripts/cli.ts ci runner staging
  tsx scripts/cli.ts utils fix-types
  tsx scripts/cli.ts perf measure
  tsx scripts/cli.ts workflow deploy auto-deploy

For detailed help on specific commands, run:
  tsx scripts/cli.ts <command> --help
  `);
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logger.error('CLI failed:', error);
    process.exit(1);
  });
}

export { main as runCLI };
