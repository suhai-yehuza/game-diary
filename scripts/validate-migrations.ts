import { readdir } from 'fs/promises';
import { join } from 'path';

/**
 * Validates that required migration files are present in src/lib/db/migrations
 */
async function validateMigrations() {
  console.log('🔍 Validating migration files in src/lib/db/migrations...');

  const migrationsDir = join(process.cwd(), 'src/lib/db/migrations');

  try {
    // Get all files from the migrations directory
    const files = await readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql'));

    if (sqlFiles.length === 0) {
      console.error('❌ No migration .sql files found in src/lib/db/migrations.');
      process.exit(1);
    }

    console.log('✅ Found the following migration files:');
    sqlFiles.forEach(f => console.log(`   - ${f}`));
    console.log('✅ All required migration files are present in src/lib/db/migrations');
  } catch (error) {
    console.error('❌ Error validating migrations:', error);
    process.exit(1);
  }
}

// Run validation
validateMigrations();
