#!/usr/bin/env tsx
/**
 * @fileoverview Schema Workflow Automation
 *
 * This script provides a comprehensive workflow for managing schema changes
 * and ensuring consistency between Drizzle schema files and migration files.
 *
 * Usage:
 *   pnpm db:workflow:check     - Check current schema consistency
 *   pnpm db:workflow:sync      - Sync schema changes
 *   pnpm db:workflow:validate  - Validate schema after changes
 */

import { loadEnvironmentVariables } from '@/lib/utils/env-loader';
import { logger } from '@/lib/utils/logger';
import { execSync } from 'child_process';
import { SchemaConsistencyChecker } from './ensure-schema-consistency';

// Load environment variables
loadEnvironmentVariables();

interface WorkflowResult {
  success: boolean;
  steps: string[];
  errors: string[];
}

class SchemaWorkflow {
  private checker = new SchemaConsistencyChecker();

  /**
   * Complete schema workflow
   */
  async runWorkflow(): Promise<WorkflowResult> {
    const result: WorkflowResult = {
      success: false,
      steps: [],
      errors: [],
    };

    try {
      logger.info('🚀 Starting schema workflow...');

      // Step 1: Check current consistency
      logger.info('📋 Step 1: Checking schema consistency...');
      const consistencyResult = await this.checker.check();

      if (!consistencyResult.success) {
        result.steps.push('Found schema consistency issues');
        result.errors.push(...consistencyResult.issues);

        // Step 2: Generate Drizzle migration
        logger.info('📝 Step 2: Generating Drizzle migration...');
        await this.generateDrizzleMigration();
        result.steps.push('Generated Drizzle migration');

        // Step 3: Check consistency again
        logger.info('🔄 Step 3: Re-checking consistency...');
        const recheckResult = await this.checker.check();

        if (recheckResult.success) {
          result.steps.push('Schema consistency restored');
        } else {
          result.errors.push('Schema consistency issues persist after migration generation');
        }
      } else {
        result.steps.push('Schema consistency check passed');
      }

      // Step 4: Validate schema
      logger.info('✅ Step 4: Validating schema...');
      await this.validateSchema();
      result.steps.push('Schema validation completed');

      result.success = true;
      logger.info('🎉 Schema workflow completed successfully!');
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error));
      logger.error('❌ Schema workflow failed:', error);
    }

    return result;
  }

  /**
   * Generate Drizzle migration
   */
  private async generateDrizzleMigration(): Promise<void> {
    try {
      execSync('pnpm db:generate:safe', {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
    } catch (error) {
      throw new Error(`Failed to generate Drizzle migration: ${error}`);
    }
  }

  /**
   * Validate schema
   */
  private async validateSchema(): Promise<void> {
    try {
      // Run typecheck to ensure schema types are valid
      execSync('pnpm typecheck', {
        stdio: 'inherit',
        cwd: process.cwd(),
      });

      // Run lint to ensure code quality
      execSync('pnpm lint', {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
    } catch (error) {
      throw new Error(`Schema validation failed: ${error}`);
    }
  }

  /**
   * Quick sync workflow for immediate fixes
   */
  async quickSync(): Promise<void> {
    logger.info('⚡ Running quick schema sync...');

    try {
      // Generate migration
      await this.generateDrizzleMigration();

      // Check consistency
      const result = await this.checker.check();

      if (result.success) {
        logger.info('✅ Quick sync completed successfully!');
      } else {
        logger.warn('⚠️  Schema issues remain after quick sync');
        logger.info('💡 Consider running: pnpm db:workflow:full for complete resolution');
      }
    } catch (error) {
      logger.error('❌ Quick sync failed:', error);
      throw error;
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  const workflow = new SchemaWorkflow();

  const command = process.argv[2];

  try {
    switch (command) {
      case 'check':
        logger.info('🔍 Running schema consistency check...');
        const result = await workflow.checker.check();
        if (result.success) {
          logger.info('✅ Schema consistency check passed!');
          process.exit(0);
        } else {
          logger.warn('⚠️  Schema consistency issues found');
          result.issues.forEach(issue => logger.warn(`  • ${issue}`));
          process.exit(1);
        }
        break;

      case 'sync':
        logger.info('🔄 Running quick schema sync...');
        await workflow.quickSync();
        break;

      case 'full':
        logger.info('🚀 Running full schema workflow...');
        const workflowResult = await workflow.runWorkflow();
        if (workflowResult.success) {
          logger.info('🎉 Full schema workflow completed successfully!');
          process.exit(0);
        } else {
          logger.error('❌ Full schema workflow failed');
          workflowResult.errors.forEach(error => logger.error(`  • ${error}`));
          process.exit(1);
        }
        break;

      default:
        logger.info('📋 Schema Workflow Commands:');
        logger.info('  pnpm db:workflow:check  - Check schema consistency');
        logger.info('  pnpm db:workflow:sync   - Quick schema sync');
        logger.info('  pnpm db:workflow:full   - Full schema workflow');
        break;
    }
  } catch (error) {
    logger.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { SchemaWorkflow };
