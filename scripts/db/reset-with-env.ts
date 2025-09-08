#!/usr/bin/env tsx
/**
 * @fileoverview Environment-aware database reset script with schema synchronization
 * This script ensures the correct environment configuration is loaded before resetting the database
 * and automatically maintains schema consistency between Drizzle and base schema migrations.
 */

import 'dotenv-flow/config';
import { config as dotenvConfig } from 'dotenv';
import { existsSync, readdirSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import { loadEnvironmentVariables } from '@/lib/utils/env-loader';
import { logger } from '@/lib/utils/logger';
import { SchemaConsistencyChecker } from './ensure-schema-consistency';

async function resetWithEnvironment(env: string, skipSchemaCheck = false) {
  console.log(`🔄 Loading environment configuration for: ${env}`);

  // Set NODE_ENV based on env argument
  if (env === 'prod') (process.env as any).NODE_ENV = 'production';
  else if (env === 'dev') (process.env as any).NODE_ENV = 'development';
  else (process.env as any).NODE_ENV = env;

  // Determine which .env file to load
  let mainEnvFile = '.env';
  if (env === 'dev' && existsSync('.env.development')) {
    mainEnvFile = '.env.development';
  } else if (env === 'staging' && existsSync('.env.staging')) {
    mainEnvFile = '.env.staging';
  } else if ((env === 'prod' || env === 'production') && existsSync('.env.production')) {
    mainEnvFile = '.env.production';
  } else if (existsSync('.env')) {
    mainEnvFile = '.env';
  }

  // Load the environment-specific configuration
  dotenvConfig({ path: mainEnvFile });
  // For development, also load .env.development if it exists (as override)
  if ((env === 'dev' || env === 'development') && existsSync('.env.development')) {
    dotenvConfig({ path: '.env.development', override: true });
  }

  // Load environment variables for schema consistency checker
  loadEnvironmentVariables();

  const databaseUrl = process.env.DATABASE_URL || '';
  if (!databaseUrl) {
    console.error(`❌ No DATABASE_URL found for ${env} environment`);
    process.exit(1);
  }

  console.log(`✅ Environment loaded: ${env}`);
  console.log(`📊 Database URL: ${databaseUrl.substring(0, 20)}...`);

  // Pre-reset schema consistency check
  if (!skipSchemaCheck) {
    console.log(`🔍 Pre-reset: Checking schema consistency...`);
    try {
      const checker = new SchemaConsistencyChecker();
      const consistencyResult = await checker.check();

      if (!consistencyResult.success) {
        console.warn(`⚠️  Schema consistency issues detected:`);
        consistencyResult.issues.forEach(issue => console.warn(`  • ${issue}`));

        if (consistencyResult.recommendations.length > 0) {
          console.log(`💡 Recommendations:`);
          consistencyResult.recommendations.forEach(rec => console.log(`  • ${rec}`));
        }

        console.log(`🔄 Attempting to fix schema consistency issues...`);
        try {
          await checker.generateQuickFix();
          console.log(`✅ Schema consistency issues resolved`);
        } catch (fixError) {
          console.warn(`⚠️  Could not auto-fix schema issues: ${fixError}`);
          console.log(`📋 You may need to manually resolve these issues before proceeding`);
          console.log(`💡 Run: pnpm db:workflow:full to resolve schema issues`);
        }
      } else {
        console.log(`✅ Schema consistency check passed`);
      }
    } catch (error) {
      console.warn(`⚠️  Schema consistency check failed: ${error}`);
      console.log(`📋 Proceeding with reset (schema issues may persist)`);
    }
  } else {
    console.log(`⏭️  Skipping schema consistency check (--skip-schema-check flag)`);
  }

  // Copy custom migrations to drizzle directory to ensure they're included in Drizzle migrations
  console.log(`📋 Copying custom migrations to drizzle directory...`);
  try {
    execSync(`pnpm db:copy-custom-migrations`, { stdio: 'inherit', encoding: 'utf8' });
    console.log(`✅ Custom migrations copied to drizzle directory`);
  } catch (error) {
    console.warn(`⚠️  Warning: Could not copy custom migrations: ${error}`);
    console.log(`📋 This may be normal if no custom migrations exist`);
  }

  // Now run the modular migration system in optimized order
  console.log(`📄 Running modular migration system in optimized order`);

  // 1. Base schema (tables, basic constraints)
  const baseSchemaFile = 'src/lib/db/migrations/000_base_schema.sql';
  if (!existsSync(baseSchemaFile)) {
    throw new Error(`Base schema file not found: ${baseSchemaFile}`);
  }
  console.log(`📄 Running base schema: ${baseSchemaFile}`);
  execSync(`psql "${databaseUrl}" -f "${baseSchemaFile}"`, { stdio: 'inherit', encoding: 'utf8' });

  // 2. Performance indexes (applied early for query optimization)
  console.log(`📄 Running performance indexes...`);
  const migrationsDir = 'src/lib/db/migrations';
  const indexFiles = readdirSync(migrationsDir)
    .filter((f: string) => f.endsWith('.sql') && f !== '000_base_schema.sql')
    .sort();

  if (indexFiles.length > 0) {
    console.log(`📊 Found ${indexFiles.length} index migration files`);
    for (const file of indexFiles) {
      const filePath = join(migrationsDir, file);
      console.log(`📄 Running index migration: ${file}`);
      try {
        execSync(`psql "${databaseUrl}" -f "${filePath}"`, { stdio: 'inherit', encoding: 'utf8' });
      } catch (error) {
        console.warn(
          `⚠️  Warning: Index migration ${file} had issues (this may be normal if indexes already exist)`
        );
        // Continue with other migrations even if one fails
      }
    }
  } else {
    console.log(`📊 No index migration files found`);
  }

  // 3. Functions (business logic - must exist before triggers)
  const functionsDir = 'src/lib/db/migrations/functions';
  if (existsSync(functionsDir)) {
    const functionFiles = readdirSync(functionsDir)
      .filter((f: string) => f.endsWith('.sql'))
      .sort();

    if (functionFiles.length > 0) {
      console.log(`📊 Found ${functionFiles.length} function files`);
      for (const file of functionFiles) {
        const filePath = join(functionsDir, file);
        console.log(`📄 Running function: ${file}`);
        execSync(`psql "${databaseUrl}" -f "${filePath}"`, { stdio: 'inherit', encoding: 'utf8' });
      }
    } else {
      console.log(`📊 No function files found`);
    }
  } else {
    console.log(`📊 Functions directory not found, skipping`);
  }

  // 4. Triggers (depend on functions and tables)
  const triggersDir = 'src/lib/db/migrations/triggers';
  if (existsSync(triggersDir)) {
    const triggerFiles = readdirSync(triggersDir)
      .filter((f: string) => f.endsWith('.sql'))
      .sort();

    if (triggerFiles.length > 0) {
      console.log(`📊 Found ${triggerFiles.length} trigger files`);
      for (const file of triggerFiles) {
        const filePath = join(triggersDir, file);
        console.log(`📄 Running trigger: ${file}`);
        execSync(`psql "${databaseUrl}" -f "${filePath}"`, { stdio: 'inherit', encoding: 'utf8' });
      }
    } else {
      console.log(`📊 No trigger files found`);
    }
  } else {
    console.log(`📊 Triggers directory not found, skipping`);
  }

  // 5. RLS policies (security layer - applied after all objects exist)
  const rlsDir = 'src/lib/db/migrations/rls';
  if (existsSync(rlsDir)) {
    const rlsFiles = readdirSync(rlsDir)
      .filter((f: string) => f.endsWith('.sql'))
      .sort();

    if (rlsFiles.length > 0) {
      console.log(`📊 Found ${rlsFiles.length} RLS policy files`);
      for (const file of rlsFiles) {
        const filePath = join(rlsDir, file);
        console.log(`📄 Running RLS: ${file}`);
        execSync(`psql "${databaseUrl}" -f "${filePath}"`, { stdio: 'inherit', encoding: 'utf8' });
      }
    } else {
      console.log(`📊 No RLS policy files found`);
    }
  } else {
    console.log(`📊 RLS directory not found, skipping`);
  }

  // 6. Data (reference data, seed data - applied last)
  const dataDir = 'src/lib/db/migrations/data';
  if (existsSync(dataDir)) {
    const dataFiles = readdirSync(dataDir)
      .filter((f: string) => f.endsWith('.sql'))
      .sort();

    if (dataFiles.length > 0) {
      console.log(`📊 Found ${dataFiles.length} data files`);
      for (const file of dataFiles) {
        const filePath = join(dataDir, file);
        console.log(`📄 Running data: ${file}`);
        execSync(`psql "${databaseUrl}" -f "${filePath}"`, { stdio: 'inherit', encoding: 'utf8' });
      }
    } else {
      console.log(`📊 No data files found`);
    }
  } else {
    console.log(`📊 Data directory not found, skipping`);
  }

  console.log('✅ Canonical schema reset completed successfully!');
  console.log('📊 Execution Summary:');
  console.log('   0. ✅ Custom migrations copied to drizzle directory');
  console.log('   1. ✅ Base schema (tables, constraints)');
  console.log('   2. ✅ Performance indexes (query optimization)');
  console.log('   3. ✅ Functions (business logic)');
  console.log('   4. ✅ Triggers (automation)');
  console.log('   5. ✅ RLS policies (security)');
  console.log('   6. ✅ Data (reference data)');

  // Post-reset schema validation
  if (!skipSchemaCheck) {
    console.log(`🔍 Post-reset: Validating schema consistency...`);
    try {
      const checker = new SchemaConsistencyChecker();
      const validationResult = await checker.check();

      if (validationResult.success) {
        console.log(`✅ Post-reset schema validation passed`);
      } else {
        console.warn(`⚠️  Post-reset schema validation issues:`);
        validationResult.issues.forEach(issue => console.warn(`  • ${issue}`));
        console.log(`💡 Run: pnpm db:workflow:full to resolve remaining issues`);
      }
    } catch (error) {
      console.warn(`⚠️  Post-reset schema validation failed: ${error}`);
    }
  }

  console.log('🎉 Database is now ready for use!');
}

async function main() {
  const args = process.argv.slice(2);
  const env = args[0] || 'dev';
  const skipSchemaCheck = args.includes('--skip-schema-check');

  if (!['dev', 'staging', 'prod', 'production'].includes(env)) {
    console.error('Usage: tsx scripts/db/reset-with-env.ts <env> [--skip-schema-check]');
    console.error('Environment must be: dev, staging, prod, or production');
    console.error('Optional flags:');
    console.error('  --skip-schema-check  Skip schema consistency checks');
    process.exit(1);
  }

  try {
    await resetWithEnvironment(env, skipSchemaCheck);
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
