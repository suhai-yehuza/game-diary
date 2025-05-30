import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Validates that required migration files are present
 */
async function validateMigrations() {
  console.log('🔍 Validating migration files...');

  // Check if all required migration files are present
  const drizzleDir = join(process.cwd(), 'drizzle');
  const customMigrationsDir = join(process.cwd(), 'custom-migrations');

  try {
    // Get all files from both directories
    const drizzleFiles = await readdir(drizzleDir);
    const customFiles = await readdir(customMigrationsDir);

    // Filter for SQL files
    const drizzleSqlFiles = drizzleFiles.filter(f => f.endsWith('.sql'));
    const customSqlFiles = customFiles.filter(f => f.endsWith('.sql'));

    // Check if all custom migrations exist in drizzle directory
    const missingInDrizzle = customSqlFiles.filter(f => !drizzleSqlFiles.includes(f));
    if (missingInDrizzle.length > 0) {
      console.error('❌ The following custom migrations are missing in the drizzle directory:');
      missingInDrizzle.forEach(f => console.error(`   - ${f}`));
      process.exit(1);
    }

    // Check content consistency for each custom migration
    for (const file of customSqlFiles) {
      const drizzleContent = await readFile(join(drizzleDir, file), 'utf-8');
      const customContent = await readFile(join(customMigrationsDir, file), 'utf-8');

      if (drizzleContent !== customContent) {
        console.error(`❌ Content mismatch in file: ${file}`);
        console.error('The content in drizzle/ and custom-migrations/ directories are different.');
        process.exit(1);
      }
    }

    console.log('✅ All required migration files are present and consistent');
  } catch (error) {
    console.error('❌ Error validating migrations:', error);
    process.exit(1);
  }
}

// Run validation
validateMigrations();
