import { copyFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';

async function copyCustomMigrations() {
  console.log('📋 Copying custom migrations to drizzle directory...');

  const drizzleDir = join(process.cwd(), 'drizzle');
  const customMigrationsDir = join(process.cwd(), 'custom-migrations');

  try {
    // Ensure drizzle directory exists
    await mkdir(drizzleDir, { recursive: true });

    // Copy each custom migration file
    const files = await readdir(customMigrationsDir);
    const sqlFiles = files.filter((f: string) => f.endsWith('.sql'));

    for (const file of sqlFiles) {
      const sourcePath = join(customMigrationsDir, file);
      const targetPath = join(drizzleDir, file);
      await copyFile(sourcePath, targetPath);
      console.log(`✅ Copied: ${file}`);
    }

    console.log('✅ All custom migrations copied successfully');
  } catch (error) {
    console.error('❌ Error copying migrations:', error);
    process.exit(1);
  }
}

copyCustomMigrations(); 