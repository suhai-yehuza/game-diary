#!/usr/bin/env tsx
/**
 * @fileoverview Schema Consistency Checker
 *
 * This script ensures that the Drizzle schema files and the base schema migration
 * are in sync. It's a simpler, more focused approach than full synchronization.
 */

import { loadEnvironmentVariables } from '@/lib/utils/env-loader';
import { logger } from '@/lib/utils/logger';
import { execSync } from 'child_process';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

// Load environment variables
loadEnvironmentVariables();

interface SchemaCheckResult {
  success: boolean;
  issues: string[];
  recommendations: string[];
}

class SchemaConsistencyChecker {
  private baseSchemaPath = 'src/lib/db/migrations/000_base_schema.sql';
  private drizzleDir = 'drizzle';

  /**
   * Check schema consistency
   */
  async check(): Promise<SchemaCheckResult> {
    const result: SchemaCheckResult = {
      success: true,
      issues: [],
      recommendations: [],
    };

    try {
      logger.info('🔍 Checking schema consistency...');

      // Step 1: Check if Drizzle migration exists
      const drizzleTables = await this.getDrizzleTables();
      logger.info(`📋 Found ${drizzleTables.length} tables in Drizzle migration`);

      // Step 2: Check if base schema exists
      if (!existsSync(this.baseSchemaPath)) {
        result.issues.push('Base schema migration file not found');
        result.success = false;
        return result;
      }

      // Step 3: Check base schema tables
      const baseSchemaTables = await this.getBaseSchemaTables();
      logger.info(`📋 Found ${baseSchemaTables.length} tables in base schema`);

      // Step 4: Compare tables
      const missingInBase = drizzleTables.filter(table => !baseSchemaTables.includes(table));
      const missingInDrizzle = baseSchemaTables.filter(table => !drizzleTables.includes(table));

      if (missingInBase.length > 0) {
        result.issues.push(
          `Tables in Drizzle but missing in base schema: ${missingInBase.join(', ')}`
        );
        result.recommendations.push('Run: pnpm db:sync-schema to sync missing tables');
        result.success = false;
      }

      if (missingInDrizzle.length > 0) {
        result.issues.push(
          `Tables in base schema but missing in Drizzle: ${missingInDrizzle.join(', ')}`
        );
        result.recommendations.push('Check if these tables should be removed from base schema');
      }

      // Step 5: Check for specific known issues
      await this.checkSpecificIssues(result);

      if (result.success) {
        logger.info('✅ Schema consistency check passed!');
      } else {
        logger.warn('⚠️  Schema consistency issues found');
      }
    } catch (error) {
      result.issues.push(
        `Error during consistency check: ${error instanceof Error ? error.message : String(error)}`
      );
      result.success = false;
    }

    return result;
  }

  /**
   * Get tables from Drizzle migration
   */
  private async getDrizzleTables(): Promise<string[]> {
    const migrationFiles = readdirSync(this.drizzleDir)
      .filter(file => file.endsWith('.sql') && !file.includes('meta'))
      .sort()
      .reverse();

    if (migrationFiles.length === 0) {
      return [];
    }

    const latestMigration = migrationFiles[0];
    const migrationPath = join(this.drizzleDir, latestMigration);
    const migrationContent = readFileSync(migrationPath, 'utf-8');

    const tables: string[] = [];
    const statements = migrationContent.split('--> statement-breakpoint');

    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed.startsWith('CREATE TABLE')) {
        const match = trimmed.match(/CREATE TABLE\s+"?(\w+)"?/i);
        if (match) {
          tables.push(match[1]);
        }
      }
    }

    return tables;
  }

  /**
   * Get tables from base schema
   */
  private async getBaseSchemaTables(): Promise<string[]> {
    const baseSchemaContent = readFileSync(this.baseSchemaPath, 'utf-8');
    const tables: string[] = [];

    // Find all CREATE TABLE statements (including IF NOT EXISTS)
    const createTableRegex = /CREATE TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?(\w+)["`]?/gi;
    let match;
    while ((match = createTableRegex.exec(baseSchemaContent)) !== null) {
      tables.push(match[1]);
    }

    return tables;
  }

  /**
   * Check for specific known issues
   */
  private async checkSpecificIssues(result: SchemaCheckResult): Promise<void> {
    // Check for public_comments and public_reactions specifically
    const baseSchemaContent = readFileSync(this.baseSchemaPath, 'utf-8');

    if (!baseSchemaContent.includes('CREATE TABLE "public_comments"')) {
      result.issues.push('public_comments table missing from base schema');
      result.recommendations.push('Add public_comments table definition to base schema');
      result.success = false;
    }

    if (!baseSchemaContent.includes('CREATE TABLE "public_reactions"')) {
      result.issues.push('public_reactions table missing from base schema');
      result.recommendations.push('Add public_reactions table definition to base schema');
      result.success = false;
    }

    // Check for proper foreign key constraints
    if (!baseSchemaContent.includes('public_comments_user_id_users_id_fk')) {
      result.issues.push('Missing foreign key constraint for public_comments.user_id');
      result.recommendations.push('Add foreign key constraint for public_comments.user_id');
    }

    if (!baseSchemaContent.includes('public_reactions_user_id_users_id_fk')) {
      result.issues.push('Missing foreign key constraint for public_reactions.user_id');
      result.recommendations.push('Add foreign key constraint for public_reactions.user_id');
    }
  }

  /**
   * Generate a quick fix for common issues
   */
  async generateQuickFix(): Promise<void> {
    logger.info('🔧 Generating quick fix for schema consistency...');

    try {
      // Generate Drizzle migration
      execSync('pnpm db:generate:safe', { stdio: 'inherit' });
      logger.info('✅ Generated Drizzle migration');

      // The user can then manually review and apply the changes
      logger.info('📋 Next steps:');
      logger.info('  1. Review the generated Drizzle migration');
      logger.info('  2. Update base schema migration if needed');
      logger.info('  3. Run: pnpm db:reset:canonical:dev to apply changes');
    } catch (error) {
      logger.error('❌ Failed to generate quick fix:', error);
      throw error;
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    const checker = new SchemaConsistencyChecker();
    const result = await checker.check();

    if (result.success) {
      logger.info('🎉 Schema consistency check passed!');
      process.exit(0);
    } else {
      logger.warn('⚠️  Schema consistency issues found:');
      result.issues.forEach(issue => logger.warn(`  • ${issue}`));

      if (result.recommendations.length > 0) {
        logger.info('💡 Recommendations:');
        result.recommendations.forEach(rec => logger.info(`  • ${rec}`));
      }

      // Ask if user wants to generate a quick fix
      logger.info(
        '\n🔧 Would you like to generate a quick fix? (This will create a new Drizzle migration)'
      );
      logger.info('Run: pnpm db:ensure-schema-consistency --fix to generate a quick fix');

      process.exit(1);
    }
  } catch (error) {
    logger.error('💥 Fatal error during schema consistency check:', error);
    process.exit(1);
  }
}

// Handle --fix flag
if (process.argv.includes('--fix')) {
  const checker = new SchemaConsistencyChecker();
  checker
    .generateQuickFix()
    .then(() => {
      logger.info('✅ Quick fix generated successfully!');
      process.exit(0);
    })
    .catch(error => {
      logger.error('❌ Failed to generate quick fix:', error);
      process.exit(1);
    });
} else {
  main();
}

export { SchemaConsistencyChecker };
