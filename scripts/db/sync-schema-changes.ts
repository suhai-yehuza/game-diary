#!/usr/bin/env tsx
/**
 * @fileoverview Schema Synchronization Script
 *
 * This script automatically synchronizes schema changes from Drizzle schema files
 * to the base schema migration file, ensuring consistency between the two systems.
 *
 * Workflow:
 * 1. Generate Drizzle migration from schema changes
 * 2. Extract table definitions from Drizzle migration
 * 3. Update base schema migration with new/changed tables
 * 4. Update performance indexes if needed
 * 5. Validate the synchronization
 */

import { loadEnvironmentVariables } from '@/lib/utils/env-loader';
import { logger } from '@/lib/utils/logger';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

// Load environment variables
loadEnvironmentVariables();

interface TableDefinition {
  name: string;
  definition: string;
  indexes: string[];
  constraints: string[];
}

interface SchemaSyncResult {
  success: boolean;
  changes: string[];
  errors: string[];
}

class SchemaSynchronizer {
  private baseSchemaPath = 'src/lib/db/migrations/000_base_schema.sql';
  private drizzleDir = 'drizzle';
  private performanceIndexesPath = 'src/lib/db/migrations/002_performance_indexes.sql';

  /**
   * Main synchronization method
   */
  async sync(): Promise<SchemaSyncResult> {
    const result: SchemaSyncResult = {
      success: false,
      changes: [],
      errors: [],
    };

    try {
      logger.info('🔄 Starting schema synchronization...');

      // Step 1: Generate Drizzle migration
      logger.info('📝 Step 1: Generating Drizzle migration...');
      await this.generateDrizzleMigration();
      result.changes.push('Generated Drizzle migration');

      // Step 2: Extract table definitions from Drizzle migration
      logger.info('📋 Step 2: Extracting table definitions...');
      const tableDefinitions = await this.extractTableDefinitions();
      result.changes.push(`Extracted ${tableDefinitions.length} table definitions`);

      // Step 3: Update base schema migration
      logger.info('🔧 Step 3: Updating base schema migration...');
      const baseSchemaChanges = await this.updateBaseSchema(tableDefinitions);
      result.changes.push(...baseSchemaChanges);

      // Step 4: Update performance indexes
      logger.info('⚡ Step 4: Updating performance indexes...');
      const indexChanges = await this.updatePerformanceIndexes(tableDefinitions);
      result.changes.push(...indexChanges);

      // Step 5: Validate synchronization
      logger.info('✅ Step 5: Validating synchronization...');
      await this.validateSynchronization();

      result.success = true;
      logger.info('🎉 Schema synchronization completed successfully!');
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error));
      logger.error('❌ Schema synchronization failed:', error);
    }

    return result;
  }

  /**
   * Generate Drizzle migration from schema changes
   */
  private async generateDrizzleMigration(): Promise<void> {
    try {
      // Generate migration in safe mode (backup existing)
      execSync('pnpm db:generate:safe', {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
    } catch (error) {
      throw new Error(`Failed to generate Drizzle migration: ${error}`);
    }
  }

  /**
   * Extract table definitions from the latest Drizzle migration
   */
  private async extractTableDefinitions(): Promise<TableDefinition[]> {
    const migrationFiles = readdirSync(this.drizzleDir)
      .filter(file => file.endsWith('.sql') && !file.includes('meta'))
      .sort()
      .reverse();

    if (migrationFiles.length === 0) {
      throw new Error('No Drizzle migration files found');
    }

    const latestMigration = migrationFiles[0];
    const migrationPath = join(this.drizzleDir, latestMigration);
    const migrationContent = readFileSync(migrationPath, 'utf-8');

    logger.info(`📄 Processing migration file: ${latestMigration}`);

    return this.parseTableDefinitions(migrationContent);
  }

  /**
   * Parse table definitions from Drizzle migration SQL
   */
  private parseTableDefinitions(sqlContent: string): TableDefinition[] {
    const tables: TableDefinition[] = [];
    const statements = sqlContent.split('--> statement-breakpoint');

    let currentTable: TableDefinition | null = null;

    for (const statement of statements) {
      const trimmed = statement.trim();
      if (!trimmed) continue;

      // CREATE TABLE statement
      if (trimmed.startsWith('CREATE TABLE')) {
        if (currentTable) {
          tables.push(currentTable);
        }

        const tableName = this.extractTableName(trimmed);
        currentTable = {
          name: tableName,
          definition: trimmed,
          indexes: [],
          constraints: [],
        };
      }
      // CREATE INDEX statement
      else if (trimmed.startsWith('CREATE INDEX') && currentTable) {
        currentTable.indexes.push(trimmed);
      }
      // ALTER TABLE constraint statement
      else if (trimmed.startsWith('ALTER TABLE') && currentTable) {
        currentTable.constraints.push(trimmed);
      }
    }

    if (currentTable) {
      tables.push(currentTable);
    }

    return tables;
  }

  /**
   * Extract table name from CREATE TABLE statement
   */
  private extractTableName(createTableSql: string): string {
    const match = createTableSql.match(/CREATE TABLE\s+"?(\w+)"?/i);
    return match ? match[1] : '';
  }

  /**
   * Update base schema migration with new table definitions
   */
  private async updateBaseSchema(tableDefinitions: TableDefinition[]): Promise<string[]> {
    const changes: string[] = [];

    if (!existsSync(this.baseSchemaPath)) {
      throw new Error(`Base schema file not found: ${this.baseSchemaPath}`);
    }

    let baseSchemaContent = readFileSync(this.baseSchemaPath, 'utf-8');

    for (const tableDef of tableDefinitions) {
      // Check if table already exists in base schema
      const tableExists = baseSchemaContent.includes(`CREATE TABLE "${tableDef.name}"`);

      if (!tableExists) {
        logger.info(`➕ Adding new table: ${tableDef.name}`);

        // Insert table definition before the audit logging section
        const insertPoint = baseSchemaContent.indexOf(
          '-- ============================================================================'
        );
        if (insertPoint === -1) {
          throw new Error('Could not find insertion point in base schema');
        }

        const tableSql = this.formatTableDefinition(tableDef);
        baseSchemaContent =
          baseSchemaContent.slice(0, insertPoint) +
          tableSql +
          '\n\n' +
          baseSchemaContent.slice(insertPoint);

        // Add to DROP TABLE section
        baseSchemaContent = this.addToDropTableSection(baseSchemaContent, tableDef.name);

        // Add foreign key constraints
        baseSchemaContent = this.addForeignKeyConstraints(baseSchemaContent, tableDef);

        // Add table documentation
        baseSchemaContent = this.addTableDocumentation(baseSchemaContent, tableDef.name);

        changes.push(`Added table: ${tableDef.name}`);
      } else {
        logger.info(`✅ Table already exists: ${tableDef.name}`);
      }
    }

    // Write updated base schema
    writeFileSync(this.baseSchemaPath, baseSchemaContent);
    changes.push('Updated base schema migration file');

    return changes;
  }

  /**
   * Format table definition for base schema
   */
  private formatTableDefinition(tableDef: TableDefinition): string {
    // Convert Drizzle format to base schema format
    let formatted = tableDef.definition;

    // Add comments and constraints
    formatted += '\n\n-- Add any additional constraints here if needed';

    return formatted;
  }

  /**
   * Add table to DROP TABLE section
   */
  private addToDropTableSection(content: string, tableName: string): string {
    const dropTableRegex = /DROP TABLE IF EXISTS\s*\(([\s\S]*?)\)/;
    const match = content.match(dropTableRegex);

    if (match) {
      const existingTables = match[1];
      const tables = existingTables
        .split(',')
        .map(t => t.trim())
        .filter(t => t);

      if (!tables.includes(tableName)) {
        tables.push(tableName);
        const newDropSection = `DROP TABLE IF EXISTS\n  ${tables.join(',\n  ')}\nCASCADE;`;
        content = content.replace(dropTableRegex, newDropSection);
      }
    }

    return content;
  }

  /**
   * Add foreign key constraints
   */
  private addForeignKeyConstraints(content: string, tableDef: TableDefinition): string {
    // Find the foreign key constraints section
    const fkSectionIndex = content.indexOf(
      '-- ============================================================================\n-- SECTION 5: FOREIGN KEY CONSTRAINTS'
    );

    if (fkSectionIndex === -1) {
      return content;
    }

    // Extract foreign key constraints from table definition
    const fkConstraints = tableDef.constraints.filter(
      c => c.includes('FOREIGN KEY') || c.includes('REFERENCES')
    );

    if (fkConstraints.length > 0) {
      const fkSection = fkConstraints
        .map(c => `-- ${tableDef.name} relationships\n${c}`)
        .join('\n\n');
      const insertPoint = content.indexOf('ALTER TABLE "notifications"', fkSectionIndex);

      if (insertPoint !== -1) {
        content = content.slice(0, insertPoint) + fkSection + '\n\n' + content.slice(insertPoint);
      }
    }

    return content;
  }

  /**
   * Add table documentation
   */
  private addTableDocumentation(content: string, tableName: string): string {
    const docSectionIndex = content.indexOf('-- Table documentation');

    if (docSectionIndex === -1) {
      return content;
    }

    const docComment = `COMMENT ON TABLE ${tableName} IS 'Auto-generated table from schema synchronization';`;
    const insertPoint = content.lastIndexOf('COMMENT ON TABLE', docSectionIndex);

    if (insertPoint !== -1) {
      const nextLine = content.indexOf('\n', insertPoint);
      content = content.slice(0, nextLine) + '\n' + docComment + content.slice(nextLine);
    }

    return content;
  }

  /**
   * Update performance indexes
   */
  private async updatePerformanceIndexes(tableDefinitions: TableDefinition[]): Promise<string[]> {
    const changes: string[] = [];

    if (!existsSync(this.performanceIndexesPath)) {
      logger.warn('Performance indexes file not found, skipping index updates');
      return changes;
    }

    let indexContent = readFileSync(this.performanceIndexesPath, 'utf-8');

    for (const tableDef of tableDefinitions) {
      for (const index of tableDef.indexes) {
        const indexName = this.extractIndexName(index);

        if (!indexContent.includes(indexName)) {
          logger.info(`➕ Adding index: ${indexName}`);

          // Add index to performance indexes file
          const insertPoint = indexContent.lastIndexOf('ANALYZE');
          if (insertPoint !== -1) {
            indexContent =
              indexContent.slice(0, insertPoint) + index + ';\n' + indexContent.slice(insertPoint);
          }

          changes.push(`Added index: ${indexName}`);
        }
      }
    }

    // Add ANALYZE statements for new tables
    for (const tableDef of tableDefinitions) {
      const analyzeStatement = `ANALYZE ${tableDef.name};`;
      if (!indexContent.includes(analyzeStatement)) {
        const insertPoint = indexContent.lastIndexOf('ANALYZE');
        if (insertPoint !== -1) {
          const nextLine = indexContent.indexOf('\n', insertPoint);
          indexContent =
            indexContent.slice(0, nextLine) + '\n' + analyzeStatement + content.slice(nextLine);
        }
      }
    }

    writeFileSync(this.performanceIndexesPath, indexContent);
    changes.push('Updated performance indexes file');

    return changes;
  }

  /**
   * Extract index name from CREATE INDEX statement
   */
  private extractIndexName(indexSql: string): string {
    const match = indexSql.match(/CREATE INDEX\s+"?(\w+)"?/i);
    return match ? match[1] : '';
  }

  /**
   * Validate synchronization
   */
  private async validateSynchronization(): Promise<void> {
    // Check if base schema file is valid SQL
    const baseSchemaContent = readFileSync(this.baseSchemaPath, 'utf-8');

    // Basic validation - check for common SQL syntax issues
    if (baseSchemaContent.includes('CREATE TABLE') && !baseSchemaContent.includes(');')) {
      throw new Error('Base schema appears to have syntax issues');
    }

    logger.info('✅ Schema synchronization validation passed');
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    const synchronizer = new SchemaSynchronizer();
    const result = await synchronizer.sync();

    if (result.success) {
      logger.info('🎉 Schema synchronization completed successfully!');
      logger.info('📋 Changes made:');
      result.changes.forEach(change => logger.info(`  • ${change}`));
    } else {
      logger.error('❌ Schema synchronization failed!');
      logger.error('🚨 Errors:');
      result.errors.forEach(error => logger.error(`  • ${error}`));
      process.exit(1);
    }
  } catch (error) {
    logger.error('💥 Fatal error during schema synchronization:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { SchemaSynchronizer };
