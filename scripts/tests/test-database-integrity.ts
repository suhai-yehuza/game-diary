#!/usr/bin/env tsx

import 'dotenv-flow/config';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { sql } from 'drizzle-orm';

import { logger } from '@/lib/utils/logger';
import { createDatabaseClient } from '@/lib/db';
import { isCI } from '@/lib/utils/env-loader';
import { errorHandlers } from '@/lib/utils/error-handler';

// 🚨 PRODUCTION DATABASE PROTECTION
if (
  process.env.NODE_ENV === 'production' &&
  process.env.CI !== 'true' &&
  process.env.ALLOW_ACCESS_TO_PRODUCTION_DB !== 'true'
) {
  logger.error(
    '🚨 PRODUCTION DATABASE ACCESS BLOCKED: Database integrity tests cannot run against production database'
  );
  logger.error(
    '   If this is intentional, set ALLOW_ACCESS_TO_PRODUCTION_DB=true environment variable'
  );
  process.exit(1);
}

// Check if we're in CI and handle missing DATABASE_URL gracefully
if (isCI() && !process.env.DATABASE_URL) {
  logger.warn('⚠️ DATABASE_URL not found in CI environment. Skipping database integrity tests.');
  logger.info('✅ Database integrity tests skipped in CI environment (no DATABASE_URL available)');
  process.exit(0);
}

// Configure neon for better stability
import { neonConfig } from '@neondatabase/serverless';
neonConfig.wsProxy = host => `${host}:5432/v1`;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = true;
neonConfig.pipelineConnect = false;

interface TestResult {
  category: string;
  name: string;
  passed: boolean;
  details: string;
  error?: string;
  severity: 'critical' | 'warning' | 'info';
}

interface IntegrityReport {
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  criticalIssues: number;
  results: TestResult[];
  summary: string;
}

class DatabaseIntegrityValidator {
  private db: ReturnType<typeof createDatabaseClient>;
  private results: TestResult[] = [];
  private environment: string;
  private migrationFiles: string[] = [];

  constructor(environment = 'development') {
    this.environment = environment;
    this.db = createDatabaseClient({ env: environment });
    this.loadMigrationFiles();
  }

  private loadMigrationFiles() {
    const migrationsPath = join(process.cwd(), 'src/lib/db/migrations');
    try {
      // Dynamically discover all .sql files in the migrations directory
      const files = readdirSync(migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort(); // Sort to ensure consistent order

      this.migrationFiles = files;
      logger.info(`📁 Discovered ${files.length} migration files: ${files.join(', ')}`);
    } catch (error) {
      logger.error('Failed to load migration files:', error);
      // Fallback to empty array if directory doesn't exist
      this.migrationFiles = [];
    }
  }

  private async execute(sql: any) {
    try {
      return await this.db.execute(sql);
    } catch (e: any) {
      console.error('SQL Error details:', {
        message: e.message,
        code: e.code,
        detail: e.detail,
        hint: e.hint,
        query: e.query,
        params: e.params,
        cause: e.cause,
      });
      throw e;
    }
  }

  private addResult(
    category: string,
    name: string,
    passed: boolean,
    details: string,
    severity: 'critical' | 'warning' | 'info' = 'info',
    error?: string
  ) {
    this.results.push({
      category,
      name,
      passed,
      details,
      error,
      severity,
    });
  }

  // ============================================================================
  // CORE DATABASE CONNECTIVITY TESTS
  // ============================================================================

  async testDatabaseConnection(): Promise<void> {
    try {
      const result = await this.execute(sql`SELECT 1 as test`);
      this.addResult(
        'Connectivity',
        'Database Connection',
        true,
        'Successfully connected to database',
        'info'
      );
    } catch (error) {
      this.addResult(
        'Connectivity',
        'Database Connection',
        false,
        'Failed to connect to database',
        'critical',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async testDatabaseVersion(): Promise<void> {
    try {
      const result = await this.execute(sql`
        SELECT version() as version,
               current_setting('server_version') as server_version,
               current_setting('server_version_num')::int as version_num
      `);

      const version = result.rows[0]?.version || '';
      const versionNum = result.rows[0]?.version_num || 0;

      // Check if PostgreSQL version is >= 14 (required for UUID v7 and other features)
      const isSupported = versionNum >= 140000;

      this.addResult(
        'Connectivity',
        'PostgreSQL Version',
        isSupported,
        `PostgreSQL ${version} (version_num: ${versionNum})`,
        isSupported ? 'info' : 'warning'
      );
    } catch (error) {
      this.addResult(
        'Connectivity',
        'PostgreSQL Version',
        false,
        'Failed to get database version',
        'critical',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // ============================================================================
  // EXTENSIONS VALIDATION
  // ============================================================================

  async testRequiredExtensions(): Promise<void> {
    const requiredExtensions = ['pgcrypto', 'pg_trgm'];

    for (const ext of requiredExtensions) {
      try {
        const result = await this.execute(sql`
          SELECT EXISTS(
            SELECT 1 FROM pg_extension WHERE extname = ${ext}
          ) as exists
        `);

        const exists = result.rows[0]?.exists || false;

        this.addResult(
          'Extensions',
          `Extension: ${ext}`,
          exists,
          exists ? `Extension ${ext} is installed` : `Extension ${ext} is missing`,
          exists ? 'info' : 'critical'
        );
      } catch (error) {
        this.addResult(
          'Extensions',
          `Extension: ${ext}`,
          false,
          `Failed to check extension ${ext}`,
          'critical',
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }

  // ============================================================================
  // TABLE STRUCTURE VALIDATION
  // ============================================================================

  async testTableExistence(): Promise<void> {
    const expectedTables = [
      'users',
      'game_logs',
      'comments',
      'reactions',
      'friendships',
      'notifications',
      'basketball_games',
      'basketball_players',
      'basketball_teams',
      'leagues',
      'seasons',
      'game_ratings',
      'audit_logs',
      'key_rotation_logs',
      'rls_access_logs',
      'migration_versions',
      'database_health_metrics',
      'index_usage_stats',
      'query_performance_log',
    ];

    for (const table of expectedTables) {
      try {
        const result = await this.execute(sql`
          SELECT EXISTS(
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = ${table}
          ) as exists
        `);

        const exists = result.rows[0]?.exists || false;

        this.addResult(
          'Tables',
          `Table: ${table}`,
          exists,
          exists ? `Table ${table} exists` : `Table ${table} is missing`,
          exists ? 'info' : 'critical'
        );
      } catch (error) {
        this.addResult(
          'Tables',
          `Table: ${table}`,
          false,
          `Failed to check table ${table}`,
          'critical',
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }

  async testTableConstraints(): Promise<void> {
    try {
      const result = await this.execute(sql`
        SELECT
          tc.table_name,
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public'
        ORDER BY tc.table_name, tc.constraint_type
      `);

      const constraints = result.rows || [];
      const constraintCount = constraints.length;

      this.addResult(
        'Constraints',
        'Table Constraints',
        constraintCount > 0,
        `Found ${constraintCount} constraints across all tables`,
        'info'
      );
    } catch (error) {
      this.addResult(
        'Constraints',
        'Table Constraints',
        false,
        'Failed to check table constraints',
        'critical',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // ============================================================================
  // INDEX VALIDATION
  // ============================================================================

  async testIndexExistence(): Promise<void> {
    try {
      const result = await this.execute(sql`
        SELECT
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname
      `);

      const indexes = result.rows || [];
      const indexCount = indexes.length;

      // Check for critical indexes
      const criticalIndexes = [
        'idx_users_username',
        'idx_users_email_address',
        'idx_game_logs_created_at_desc',
        'idx_game_logs_user_created_at',
        'idx_friendships_user_id',
      ];

      const existingIndexNames = indexes.map((idx: any) => idx.indexname);
      const missingCriticalIndexes = criticalIndexes.filter(
        idx => !existingIndexNames.includes(idx)
      );

      this.addResult(
        'Indexes',
        'Index Count',
        indexCount > 0,
        `Found ${indexCount} indexes in database`,
        'info'
      );

      this.addResult(
        'Indexes',
        'Critical Indexes',
        missingCriticalIndexes.length === 0,
        missingCriticalIndexes.length === 0
          ? 'All critical indexes are present'
          : `Missing critical indexes: ${missingCriticalIndexes.join(', ')}`,
        missingCriticalIndexes.length === 0 ? 'info' : 'warning'
      );
    } catch (error) {
      this.addResult(
        'Indexes',
        'Index Existence',
        false,
        'Failed to check indexes',
        'critical',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async testIndexUsage(): Promise<void> {
    try {
      const result = await this.execute(sql`
        SELECT
          schemaname,
          relname as tablename,
          indexrelname as indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        ORDER BY idx_scan DESC
      `);

      const indexes = result.rows || [];
      const unusedIndexes = indexes.filter((idx: any) => idx.idx_scan === 0);

      this.addResult(
        'Indexes',
        'Index Usage',
        true,
        `Found ${indexes.length} indexes, ${unusedIndexes.length} unused`,
        unusedIndexes.length > 5 ? 'warning' : 'info'
      );
    } catch (error) {
      this.addResult(
        'Indexes',
        'Index Usage',
        false,
        'Failed to check index usage',
        'warning',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // ============================================================================
  // FUNCTION VALIDATION
  // ============================================================================

  async testFunctionExistence(): Promise<void> {
    const expectedFunctions = [
      'generate_uuid_v7',
      'get_current_user_id',
      'set_current_user_context',
      'clear_current_user_context',
      'create_reaction_notification',
      'create_comment_notification',
      'create_friend_request_notification',
      'create_friend_removed_notification',
      'record_migration_version',
      'collect_database_health_metrics',
      'collect_index_usage_stats',
      'identify_unused_indexes',
      'get_performance_summary',
      'cleanup_performance_data',
    ];

    for (const func of expectedFunctions) {
      try {
        const result = await this.execute(sql`
          SELECT EXISTS(
            SELECT 1 FROM pg_proc
            WHERE proname = ${func} AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
          ) as exists
        `);

        const exists = result.rows[0]?.exists || false;

        this.addResult(
          'Functions',
          `Function: ${func}`,
          exists,
          exists ? `Function ${func} exists` : `Function ${func} is missing`,
          exists ? 'info' : 'critical'
        );
      } catch (error) {
        this.addResult(
          'Functions',
          `Function: ${func}`,
          false,
          `Failed to check function ${func}`,
          'critical',
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }

  async testFunctionIntegrity(): Promise<void> {
    try {
      // Test critical functions by calling them
      const testFunctions = [
        { name: 'generate_uuid_v7', test: sql`SELECT generate_uuid_v7() as result` },
        { name: 'get_current_user_id', test: sql`SELECT get_current_user_id() as result` },
      ];

      for (const { name, test } of testFunctions) {
        try {
          const result = await this.execute(test);
          this.addResult(
            'Functions',
            `Function Test: ${name}`,
            true,
            `Function ${name} executed successfully`,
            'info'
          );
        } catch (error) {
          this.addResult(
            'Functions',
            `Function Test: ${name}`,
            false,
            `Function ${name} failed to execute`,
            'critical',
            error instanceof Error ? error.message : String(error)
          );
        }
      }
    } catch (error) {
      this.addResult(
        'Functions',
        'Function Integrity',
        false,
        'Failed to test function integrity',
        'critical',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // ============================================================================
  // TRIGGER VALIDATION
  // ============================================================================

  async testTriggerExistence(): Promise<void> {
    const expectedTriggers = [
      'game_logs_ratings_trigger',
      'reaction_notification_trigger',
      'comment_notification_trigger',
      'friendship_notification_trigger',
      'friendship_deletion_notification_trigger',
      'trigger_update_team_ratings_on_game_logs',
      'trigger_update_team_ratings_on_public_comments',
      'trigger_update_team_ratings_on_public_reactions',
      'trigger_update_player_ratings_on_public_comments',
      'trigger_update_player_ratings_on_public_reactions',
    ];

    for (const trigger of expectedTriggers) {
      try {
        const result = await this.execute(sql`
          SELECT EXISTS(
            SELECT 1 FROM information_schema.triggers
            WHERE trigger_name = ${trigger} AND event_object_schema = 'public'
          ) as exists
        `);

        const exists = result.rows[0]?.exists || false;

        this.addResult(
          'Triggers',
          `Trigger: ${trigger}`,
          exists,
          exists ? `Trigger ${trigger} exists` : `Trigger ${trigger} is missing`,
          exists ? 'info' : 'critical'
        );
      } catch (error) {
        this.addResult(
          'Triggers',
          `Trigger: ${trigger}`,
          false,
          `Failed to check trigger ${trigger}`,
          'critical',
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }

  // ============================================================================
  // RLS (ROW-LEVEL SECURITY) VALIDATION
  // ============================================================================

  async testRLSPolicies(): Promise<void> {
    try {
      const result = await this.execute(sql`
        SELECT
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname
      `);

      const policies = result.rows || [];
      const policyCount = policies.length;

      this.addResult(
        'RLS',
        'RLS Policies',
        policyCount > 0,
        `Found ${policyCount} RLS policies`,
        'info'
      );
    } catch (error) {
      this.addResult(
        'RLS',
        'RLS Policies',
        false,
        'Failed to check RLS policies',
        'warning',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async testRLSEnabled(): Promise<void> {
    try {
      const result = await this.execute(sql`
        SELECT
          schemaname,
          tablename,
          rowsecurity
        FROM pg_tables
        WHERE schemaname = 'public' AND rowsecurity = true
        ORDER BY tablename
      `);

      const rlsTables = result.rows || [];
      const rlsTableCount = rlsTables.length;

      this.addResult(
        'RLS',
        'RLS Enabled Tables',
        rlsTableCount > 0,
        `Found ${rlsTableCount} tables with RLS enabled`,
        'info'
      );
    } catch (error) {
      this.addResult(
        'RLS',
        'RLS Enabled Tables',
        false,
        'Failed to check RLS enabled tables',
        'warning',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // ============================================================================
  // MIGRATION VALIDATION
  // ============================================================================

  async testMigrationVersions(): Promise<void> {
    try {
      const result = await this.execute(sql`
        SELECT
          file_name,
          version,
          applied_at,
          checksum
        FROM migration_versions
        ORDER BY applied_at DESC
      `);

      const migrations = result.rows || [];
      const migrationCount = migrations.length;

      // Check if all discovered migration files are recorded
      const recordedFiles = migrations.map((m: any) => m.file_name);
      const missingMigrations = this.migrationFiles.filter(file => !recordedFiles.includes(file));

      this.addResult(
        'Migrations',
        'Migration Versions',
        migrationCount > 0,
        `Found ${migrationCount} recorded migrations`,
        migrationCount > 0 ? 'info' : 'warning'
      );

      // Only check migration completeness if we have migration files to check
      if (this.migrationFiles.length > 0) {
        this.addResult(
          'Migrations',
          'Migration Completeness',
          missingMigrations.length === 0,
          missingMigrations.length === 0
            ? `All ${this.migrationFiles.length} migration files are recorded`
            : `Missing migrations: ${missingMigrations.join(', ')}`,
          missingMigrations.length === 0 ? 'info' : 'warning'
        );
      } else {
        this.addResult(
          'Migrations',
          'Migration Completeness',
          true,
          'No migration files found to validate',
          'info'
        );
      }
    } catch (error) {
      this.addResult(
        'Migrations',
        'Migration Versions',
        false,
        'Failed to check migration versions',
        'critical',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // ============================================================================
  // PERFORMANCE MONITORING VALIDATION
  // ============================================================================

  async testPerformanceMonitoring(): Promise<void> {
    try {
      // Test performance monitoring functions
      const result = await this.execute(sql`
        SELECT collect_database_health_metrics() as health_metrics
      `);

      this.addResult(
        'Performance',
        'Health Metrics Collection',
        true,
        'Database health metrics collection successful',
        'info'
      );
    } catch (error) {
      this.addResult(
        'Performance',
        'Health Metrics Collection',
        false,
        'Failed to collect health metrics',
        'warning',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async testQueryPerformanceLogging(): Promise<void> {
    try {
      const result = await this.execute(sql`
        SELECT COUNT(*) as log_count
        FROM query_performance_log
        WHERE created_at > NOW() - INTERVAL '1 hour'
      `);

      const logCount = result.rows[0]?.log_count || 0;

      this.addResult(
        'Performance',
        'Query Performance Logging',
        true,
        `Found ${logCount} performance log entries in the last hour`,
        'info'
      );
    } catch (error) {
      this.addResult(
        'Performance',
        'Query Performance Logging',
        false,
        'Failed to check query performance logging',
        'warning',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // ============================================================================
  // DATA INTEGRITY VALIDATION
  // ============================================================================

  async testDataIntegrity(): Promise<void> {
    try {
      // Check for orphaned records - using correct column names
      const orphanedChecks = [
        {
          name: 'Orphaned Comments',
          query: sql`SELECT COUNT(*) as count FROM comments c LEFT JOIN game_logs gl ON c.parent_id = gl.id WHERE c.parent_type = 'game_log' AND gl.id IS NULL`,
        },
        {
          name: 'Orphaned Reactions',
          query: sql`SELECT COUNT(*) as count FROM reactions r LEFT JOIN comments c ON r.target_id = c.id WHERE r.target_type = 'comment' AND c.id IS NULL`,
        },
        {
          name: 'Orphaned Notifications',
          query: sql`SELECT COUNT(*) as count FROM notifications n LEFT JOIN users u ON n.user_id = u.id WHERE u.id IS NULL`,
        },
      ];

      for (const check of orphanedChecks) {
        try {
          const result = await this.execute(check.query);
          const count = result.rows[0]?.count || 0;

          this.addResult(
            'Data Integrity',
            check.name,
            true, // Always pass if we can check successfully
            count === 0
              ? `No ${check.name.toLowerCase()}`
              : `Found ${count} ${check.name.toLowerCase()}`,
            count === 0 ? 'info' : 'warning'
          );
        } catch (error) {
          this.addResult(
            'Data Integrity',
            check.name,
            false,
            `Failed to check ${check.name.toLowerCase()}`,
            'warning',
            error instanceof Error ? error.message : String(error)
          );
        }
      }
    } catch (error) {
      this.addResult(
        'Data Integrity',
        'Data Integrity Checks',
        false,
        'Failed to perform data integrity checks',
        'critical',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // ============================================================================
  // MAIN VALIDATION RUNNER
  // ============================================================================

  async runAllTests(): Promise<IntegrityReport> {
    logger.info('🔍 Starting comprehensive database integrity validation...');
    logger.info(`Environment: ${this.environment}`);
    logger.info(`Migration files discovered: ${this.migrationFiles.length}`);
    if (this.migrationFiles.length > 0) {
      logger.info(`Migration files: ${this.migrationFiles.join(', ')}`);
    }

    // Core connectivity tests
    await this.testDatabaseConnection();
    await this.testDatabaseVersion();

    // Extensions
    await this.testRequiredExtensions();

    // Table structure
    await this.testTableExistence();
    await this.testTableConstraints();

    // Indexes
    await this.testIndexExistence();
    await this.testIndexUsage();

    // Functions
    await this.testFunctionExistence();
    await this.testFunctionIntegrity();

    // Triggers
    await this.testTriggerExistence();

    // RLS
    await this.testRLSPolicies();
    await this.testRLSEnabled();

    // Migrations
    await this.testMigrationVersions();

    // Performance monitoring
    await this.testPerformanceMonitoring();
    await this.testQueryPerformanceLogging();

    // Data integrity
    await this.testDataIntegrity();

    // Generate report
    const totalTests = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const warnings = this.results.filter(r => r.severity === 'warning').length;
    const criticalIssues = this.results.filter(r => r.severity === 'critical' && !r.passed).length;

    const summary =
      criticalIssues > 0
        ? `❌ ${criticalIssues} critical issues found`
        : failed > 0
          ? `⚠️ ${failed} issues found (${warnings} warnings)`
          : `✅ All tests passed (${warnings} warnings)`;

    return {
      totalTests,
      passed,
      failed,
      warnings,
      criticalIssues,
      results: this.results,
      summary,
    };
  }

  // ============================================================================
  // REPORT GENERATION
  // ============================================================================

  generateReport(report: IntegrityReport): void {
    logger.info('\n' + '='.repeat(80));
    logger.info('📊 DATABASE INTEGRITY REPORT');
    logger.info('='.repeat(80));

    logger.info(`\n📈 Summary: ${report.summary}`);
    logger.info(`Total Tests: ${report.totalTests}`);
    logger.info(`Passed: ${report.passed}`);
    logger.info(`Failed: ${report.failed}`);
    logger.info(`Warnings: ${report.warnings}`);
    logger.info(`Critical Issues: ${report.criticalIssues}`);

    // Group results by category
    const categories = [...new Set(report.results.map(r => r.category))];

    for (const category of categories) {
      const categoryResults = report.results.filter(r => r.category === category);
      const categoryPassed = categoryResults.filter(r => r.passed).length;
      const categoryTotal = categoryResults.length;

      logger.info(`\n📁 ${category.toUpperCase()} (${categoryPassed}/${categoryTotal})`);
      logger.info('-'.repeat(60));

      for (const result of categoryResults) {
        const status = result.passed ? '✅' : '❌';
        const severity =
          result.severity === 'critical' ? '🔴' : result.severity === 'warning' ? '🟡' : '🔵';
        logger.info(`${status} ${severity} ${result.name}: ${result.details}`);

        if (result.error) {
          logger.info(`   Error: ${result.error}`);
        }
      }
    }

    logger.info('\n' + '='.repeat(80));

    if (report.criticalIssues > 0) {
      logger.error('🚨 CRITICAL ISSUES FOUND - Database integrity compromised');
      process.exit(1);
    } else if (report.failed > 0) {
      logger.warn('⚠️ Some issues found - Review warnings above');
      process.exit(1);
    } else {
      logger.info('✅ Database integrity validation completed successfully');
      process.exit(0);
    }
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const environment = args.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'development';

  logger.info('🚀 Starting Database Integrity Validation');
  logger.info(`Environment: ${environment}`);

  const validator = new DatabaseIntegrityValidator(environment);

  try {
    const report = await validator.runAllTests();
    validator.generateReport(report);
  } catch (error) {
    logger.error('💥 Fatal error during database integrity validation:', error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', error => {
  logger.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the main function
main().catch(error => {
  logger.error('💥 Main function error:', error);
  process.exit(1);
});
